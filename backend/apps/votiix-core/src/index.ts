import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { z } from 'zod';
import Redis from 'ioredis';
import { PrismaClient } from '@votiix/db';
import { Kafka } from 'kafkajs';
import { Client as MinioClient } from 'minio';
import multer from 'multer';
import { loadSecretsFromVault } from '@votiix/utils';

// UUID v4 regex for parameter validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

function generateRsaKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

async function main() {
  // Step 1: Load secrets from Vault into process.env
  await loadSecretsFromVault();

  // Step 2: Initialize clients
  const app = express();
  const PORT = process.env.PORT || 3003;

  const prisma = new PrismaClient();
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  redis.on('error', (err) => console.warn('[Redis] Connection error (non-fatal):', err.message));

  const upload = multer({ storage: multer.memoryStorage() });

  const kafka = new Kafka({
    clientId: 'core-service',
    brokers: [process.env.KAFKA_BROKER || 'kafka:29092'],
  });
  const producer = kafka.producer();
  let producerConnected = false;

  // Best-effort Kafka publish — never let Kafka failures crash API requests
  async function publishEvent(topic: string, message: object): Promise<void> {
    if (!producerConnected) return;
    try {
      await producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
    } catch (err: any) {
      console.warn(`[Kafka] Failed to publish to ${topic}: ${err.message}`);
    }
  }

  // MinIO Client
  const minioClient = new MinioClient({
    endPoint: process.env.MINIO_ENDPOINT || 'minio',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  });
  const MINIO_BUCKET = process.env.MINIO_BUCKET || 'votiix-assets';

  // Ensure bucket exists on startup
  async function ensureBucket() {
    const exists = await minioClient.bucketExists(MINIO_BUCKET);
    if (!exists) {
      await minioClient.makeBucket(MINIO_BUCKET);
      const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`],
        }],
      });
      await minioClient.setBucketPolicy(MINIO_BUCKET, policy);
    }
  }

  app.use(express.json());
  app.use(cors());

  app.get('/health', async (_req: Request, res: Response) => {
    try {
      // Validate database connectivity beyond just "service is up"
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', service: 'votiix-core', db: 'connected' });
    } catch {
      res.json({ status: 'ok', service: 'votiix-core', db: 'disconnected' });
    }
  });

  // ============ ELECTION MANAGEMENT ============

  // Valid state transitions
  const VALID_TRANSITIONS: Record<string, string> = {
    'Draft': 'Active',
    'Active': 'Closed',
    'Closed': 'Tallying',
    'Tallying': 'Archived',
  };

  /**
   * POST /elections — Create a new election
   * Auto-generates RSA-2048 keypair if none provided.
   */
  app.post('/elections', async (req: Request, res: Response) => {
    const schema = z.object({
      title: z.string().min(1),
      start_date: z.string(),
      end_date: z.string(),
      rsa_public_key: z.string().optional(),
      rsa_private_key: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      // Auto-generate RSA keypair if not provided
      let rsaPublicKey = parsed.data.rsa_public_key || null;
      let rsaPrivateKey = parsed.data.rsa_private_key || null;
      if (!rsaPublicKey || !rsaPrivateKey) {
        const keys = generateRsaKeyPair();
        rsaPublicKey = keys.publicKey;
        rsaPrivateKey = keys.privateKey;
      }

      const election = await prisma.election.create({
        data: {
          title: parsed.data.title,
          startDate: new Date(parsed.data.start_date),
          endDate: new Date(parsed.data.end_date),
          status: 'Draft',
          rsaPublicKey,
          rsaPrivateKey,
        },
      });
      res.status(201).json(election);
    } catch (error: any) {
      console.error('Create election error:', error);
      res.status(500).json({ error: 'Failed to create election' });
    }
  });

  /**
   * GET /elections — List all elections
   */
  app.get('/elections', async (_req: Request, res: Response) => {
    try {
      const elections = await prisma.election.findMany({
        orderBy: { startDate: 'desc' },
      });
      res.json(elections);
    } catch (error) {
      console.error('List elections error:', error);
      res.status(500).json({ error: 'Failed to fetch elections' });
    }
  });

  /**
   * GET /elections/active — Get currently active election
   */
  app.get('/elections/active', async (_req: Request, res: Response) => {
    try {
      const election = await prisma.election.findFirst({
        where: { status: 'Active' },
        include: {
          contests: {
            include: {
              candidates: {
                include: { party: true }
              }
            }
          }
        }
      });
      if (!election) {
        return res.status(404).json({ error: 'No active election found' });
      }
      res.json(election);
    } catch (error) {
      console.error('Active election error:', error);
      res.status(500).json({ error: 'Failed to fetch active election' });
    }
  });

  /**
   * GET /elections/:id — Get single election by ID
   */
  app.get('/elections/:id', async (req: Request, res: Response) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(404).json({ error: 'Election not found' });
    }
    try {
      const election = await prisma.election.findUnique({
        where: { id: req.params.id },
        include: {
          contests: {
            include: {
              candidates: {
                include: { party: true, tallyResult: true }
              }
            }
          },
          retentionPolicy: true,
        }
      });
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }
      res.json(election);
    } catch (error) {
      console.error('Get election error:', error);
      res.status(500).json({ error: 'Failed to fetch election' });
    }
  });

  /**
   * POST /elections/:id/transition — Push election state forward
   * Body: { "target_status": "Active" }
   */
  app.post('/elections/:id/transition', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return res.status(404).json({ error: 'Election not found' });
    }
    const { target_status } = req.body;

    try {
      const election = await prisma.election.findUnique({ where: { id } });
      if (!election) return res.status(404).json({ error: 'Election not found' });

      // Validate transition
      const expectedNext = VALID_TRANSITIONS[election.status];
      if (target_status !== expectedNext) {
        return res.status(400).json({
          error: `Invalid transition: ${election.status} → ${target_status}. Expected: ${expectedNext}`,
        });
      }

      const updated = await prisma.election.update({
        where: { id },
        data: { status: target_status },
      });

      // Best-effort publish
      await publishEvent('election.update', {
        election_id: id,
        previous_status: election.status,
        new_status: target_status,
        timestamp: new Date().toISOString(),
      });

      res.json(updated);
    } catch (error: any) {
      console.error('Transition error:', error);
      res.status(500).json({ error: 'Failed to transition election' });
    }
  });

  /**
   * POST /elections/:id/purge — Danger Zone: Wipe voter data
   * Body: { "confirmation": "ARCHIVE" }
   */
  app.post('/elections/:id/purge', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return res.status(404).json({ error: 'Election not found' });
    }
    const { confirmation } = req.body;

    if (confirmation !== 'ARCHIVE') {
      return res.status(400).json({ error: 'Must type "ARCHIVE" to confirm purge' });
    }

    try {
      const election = await prisma.election.findUnique({ where: { id } });
      if (!election) return res.status(404).json({ error: 'Election not found' });

      if (election.status !== 'Archived') {
        return res.status(400).json({
          error: 'Election must be in "Archived" status before purging'
        });
      }

      const deleted = await prisma.voterRegistry.deleteMany({
        where: { electionId: id },
      });

      await prisma.election.update({
        where: { id },
        data: { status: 'Purged' },
      });

      await publishEvent('election.update', {
        election_id: id,
        action: 'WIPE_DATA',
        confirmation: 'ARCHIVE',
        records_purged: deleted.count,
        timestamp: new Date().toISOString(),
      });

      res.json({ purged: true, records_deleted: deleted.count });
    } catch (error) {
      console.error('Purge error:', error);
      res.status(500).json({ error: 'Failed to purge election data' });
    }
  });

  // ============ VOTER REGISTRY MANAGEMENT ============

  /**
   * POST /elections/:id/voters — Register a voter for an election
   */
  app.post('/elections/:id/voters', async (req: Request, res: Response) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid election ID' });
    }
    const schema = z.object({
      mosip_uin: z.string().min(1),
      fingerprint_id: z.number().int().min(0).max(127),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const voter = await prisma.voterRegistry.create({
        data: {
          electionId: req.params.id,
          mosipUin: parsed.data.mosip_uin,
          fingerprintId: parsed.data.fingerprint_id,
          hasVoted: false,
        },
      });
      res.status(201).json(voter);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Voter already registered for this election' });
      }
      console.error('Create voter error:', error);
      res.status(500).json({ error: 'Failed to register voter' });
    }
  });

  /**
   * GET /elections/:id/voters — List voters for an election
   */
  app.get('/elections/:id/voters', async (req: Request, res: Response) => {
    try {
      const voters = await prisma.voterRegistry.findMany({
        where: { electionId: req.params.id },
        select: {
          id: true,
          mosipUin: true,
          fingerprintId: true,
          hasVoted: true,
          tokenIssuedAt: true,
        },
      });
      res.json(voters);
    } catch (error) {
      console.error('List voters error:', error);
      res.status(500).json({ error: 'Failed to fetch voters' });
    }
  });

  // ============ POLLING STATION MANAGEMENT ============

  /**
   * POST /stations — Create a polling station
   */
  app.post('/stations', async (req: Request, res: Response) => {
    const schema = z.object({
      name: z.string().min(1),
      address: z.string().min(1),
      terminal_capacity: z.number().int().min(1).default(5),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const station = await prisma.pollingStation.create({
        data: {
          name: parsed.data.name,
          address: parsed.data.address,
          terminalCapacity: parsed.data.terminal_capacity,
        },
      });
      res.status(201).json(station);
    } catch (error) {
      console.error('Create station error:', error);
      res.status(500).json({ error: 'Failed to create polling station' });
    }
  });

  /**
   * GET /stations — List all polling stations
   */
  app.get('/stations', async (_req: Request, res: Response) => {
    try {
      const stations = await prisma.pollingStation.findMany({
        include: {
          terminals: true,
          _count: {
            select: { votePackages: true }
          }
        },
      });
      res.json(stations);
    } catch (error) {
      console.error('List stations error:', error);
      res.status(500).json({ error: 'Failed to fetch polling stations' });
    }
  });

  // ============ PARTY MANAGEMENT (with MinIO upload) ============

  /**
   * POST /parties — Create party with logo upload
   */
  app.post('/parties', upload.single('logo'), async (req: Request, res: Response) => {
    const { name, short_code } = req.body;
    if (!name || !short_code) {
      return res.status(400).json({ error: 'name and short_code are required' });
    }

    try {
      let logoUrl: string | null = null;

      if (req.file) {
        const fileName = `parties/${Date.now()}-${req.file.originalname}`;
        await minioClient.putObject(MINIO_BUCKET, fileName, req.file.buffer, req.file.size, {
          'Content-Type': req.file.mimetype,
        });
        logoUrl = `http://${process.env.MINIO_ENDPOINT || 'minio'}:${process.env.MINIO_PORT || '9000'}/${MINIO_BUCKET}/${fileName}`;
      }

      const party = await prisma.party.create({
        data: { name, shortCode: short_code, logoUrl },
      });
      res.status(201).json(party);
    } catch (error) {
      console.error('Create party error:', error);
      res.status(500).json({ error: 'Failed to create party' });
    }
  });

  /**
   * GET /parties — List all parties
   */
  app.get('/parties', async (_req: Request, res: Response) => {
    try {
      const parties = await prisma.party.findMany({ include: { candidates: true } });
      res.json(parties);
    } catch (error) {
      console.error('List parties error:', error);
      res.status(500).json({ error: 'Failed to fetch parties' });
    }
  });

  // ============ CONTEST & CANDIDATE MANAGEMENT ============

  /**
   * POST /elections/:id/contests — Create a contest for an election
   */
  app.post('/elections/:id/contests', async (req: Request, res: Response) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid election ID' });
    }
    const schema = z.object({
      office_title: z.string(),
      seats_available: z.number().int().min(1).default(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const contest = await prisma.contest.create({
        data: {
          electionId: req.params.id,
          officeTitle: parsed.data.office_title,
          seatsAvailable: parsed.data.seats_available,
        },
      });
      res.status(201).json(contest);
    } catch (error) {
      console.error('Create contest error:', error);
      res.status(500).json({ error: 'Failed to create contest' });
    }
  });

  /**
   * GET /elections/:id/contests — List contests for an election
   */
  app.get('/elections/:id/contests', async (req: Request, res: Response) => {
    try {
      const contests = await prisma.contest.findMany({
        where: { electionId: req.params.id },
        include: { candidates: { include: { party: true } } },
      });
      res.json(contests);
    } catch (error) {
      console.error('List contests error:', error);
      res.status(500).json({ error: 'Failed to fetch contests' });
    }
  });

  /**
   * POST /contests/:id/candidates — Add candidate with photo upload
   */
  app.post('/contests/:id/candidates', upload.single('photo'), async (req: Request, res: Response) => {
    const { name, party_id, list_position } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    try {
      let photoUrl: string | null = null;

      if (req.file) {
        const fileName = `candidates/${Date.now()}-${req.file.originalname}`;
        await minioClient.putObject(MINIO_BUCKET, fileName, req.file.buffer, req.file.size, {
          'Content-Type': req.file.mimetype,
        });
        photoUrl = `http://${process.env.MINIO_ENDPOINT || 'minio'}:${process.env.MINIO_PORT || '9000'}/${MINIO_BUCKET}/${fileName}`;
      }

      const candidate = await prisma.candidate.create({
        data: {
          contestId: req.params.id,
          name,
          partyId: party_id || null,
          photoUrl,
          listPosition: list_position ? parseInt(list_position) : null,
        },
      });
      res.status(201).json(candidate);
    } catch (error) {
      console.error('Create candidate error:', error);
      res.status(500).json({ error: 'Failed to create candidate' });
    }
  });

  /**
   * GET /contests/:id/candidates — List candidates for a contest
   */
  app.get('/contests/:id/candidates', async (req: Request, res: Response) => {
    try {
      const candidates = await prisma.candidate.findMany({
        where: { contestId: req.params.id },
        include: { party: true, tallyResult: true },
        orderBy: { listPosition: 'asc' },
      });
      res.json(candidates);
    } catch (error) {
      console.error('List candidates error:', error);
      res.status(500).json({ error: 'Failed to fetch candidates' });
    }
  });

  // ============ RESULTS (Redis Cache) ============

  /**
   * GET /elections/:id/results — Read from Redis, fallback to DB
   */
  app.get('/elections/:id/results', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return res.status(404).json({ error: 'Election not found' });
    }
    try {
      // Try Redis cache first
      try {
        const cached = await redis.get(`election:${id}:results`);
        if (cached) {
          return res.json(JSON.parse(cached));
        }
      } catch {
        // Redis unavailable — fall through to DB
      }

      const election = await prisma.election.findUnique({
        where: { id },
        select: { status: true, endDate: true, title: true },
      });

      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      const deadlinePassed = new Date() > new Date(election.endDate);

      const contests = await prisma.contest.findMany({
        where: { electionId: id },
        include: {
          candidates: {
            include: {
              party: true,
              tallyResult: true,
            },
          },
        },
      });

      const allContestIds = contests.map((c: any) => c.id);
      const allVotePackages = await prisma.votePackage.findMany({
        where: { contestId: { in: allContestIds } },
        select: { contestId: true, selections: true },
      });

      const liveVoteCounts: Record<string, Record<string, number>> = {};
      for (const vp of allVotePackages) {
        if (!liveVoteCounts[vp.contestId]) liveVoteCounts[vp.contestId] = {};
        const sels = vp.selections as string[];
        for (const sel of sels) {
          liveVoteCounts[vp.contestId][sel] = (liveVoteCounts[vp.contestId][sel] || 0) + 1;
        }
      }

      const totalCommittedVotes = allVotePackages.length;
      const isFinalized = ['Closed', 'Tallying', 'Archived', 'Purged'].includes(election.status) || deadlinePassed;

      const results = contests.map((c: any) => {
        const contestLiveCounts = liveVoteCounts[c.id] || {};

        const candidatesWithVotes = c.candidates.map((cand: any) => {
          const liveCount = contestLiveCounts[cand.id] || 0;
          const tallyCount = cand.tallyResult?.voteCount ?? null;
          const vote_count = isFinalized && tallyCount !== null ? tallyCount : liveCount;

          return {
            candidate_id: cand.id,
            name: cand.name,
            photo_url: cand.photoUrl,
            party_name: cand.party?.name || 'Independent',
            party_logo_url: cand.party?.logoUrl || null,
            vote_count,
            live_count: liveCount,
            tally_count: tallyCount,
          };
        });

        candidatesWithVotes.sort((a: any, b: any) => b.vote_count - a.vote_count);

        let winner = null;
        if (isFinalized && candidatesWithVotes.length > 0) {
          const topCandidate = candidatesWithVotes[0];
          if (topCandidate.vote_count > 0) {
            winner = {
              candidate_id: topCandidate.candidate_id,
              name: topCandidate.name,
              party_name: topCandidate.party_name,
              vote_count: topCandidate.vote_count,
            };
          }
        }

        return {
          contest_id: c.id,
          office_title: c.officeTitle,
          seats_available: c.seatsAvailable,
          total_votes_cast: allVotePackages.filter((vp: any) => vp.contestId === c.id).length,
          candidates: candidatesWithVotes,
          winner,
        };
      });

      const response = {
        election_id: id,
        election_title: election.title,
        status: election.status,
        deadline_passed: deadlinePassed,
        end_date: election.endDate,
        total_committed_votes: totalCommittedVotes,
        contests: results,
      };

      // Best-effort cache
      try {
        await redis.set(`election:${id}:results`, JSON.stringify(response), 'EX', 5);
      } catch {
        // Redis unavailable — skip caching
      }
      res.json(response);
    } catch (error) {
      console.error('Results fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch results' });
    }
  });

  /**
   * GET /elections/:id/committed-votes — Quick stats: total committed votes
   */
  app.get('/elections/:id/committed-votes', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return res.status(404).json({ error: 'Election not found' });
    }
    try {
      const election = await prisma.election.findUnique({
        where: { id },
        select: { id: true, title: true, status: true },
      });
      if (!election) return res.status(404).json({ error: 'Election not found' });

      const contests = await prisma.contest.findMany({
        where: { electionId: id },
        select: { id: true, officeTitle: true },
      });

      const contestIds = contests.map((c: any) => c.id);
      const total = await prisma.votePackage.count({
        where: { contestId: { in: contestIds } },
      });

      const breakdown = await Promise.all(
        contests.map(async (c: any) => {
          const count = await prisma.votePackage.count({ where: { contestId: c.id } });
          return { contest_id: c.id, office_title: c.officeTitle, votes_cast: count };
        })
      );

      res.json({
        election_id: id,
        election_title: election.title,
        status: election.status,
        total_committed_votes: total,
        contests: breakdown,
        as_of: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Committed votes error:', error);
      res.status(500).json({ error: 'Failed to fetch committed votes' });
    }
  });

  /**
   * GET /elections/:id/vote/:tx_hash — Verify a specific vote exists
   */
  app.get('/elections/:id/vote/:tx_hash', async (req: Request, res: Response) => {
    const { id, tx_hash } = req.params;
    if (!isValidUuid(id)) {
      return res.status(404).json({ error: 'Vote not found for this election' });
    }
    try {
      const votePackage = await prisma.votePackage.findUnique({
        where: { txHash: tx_hash },
        select: {
          txHash: true,
          timestamp: true,
          contest: {
            select: {
              id: true,
              officeTitle: true,
              electionId: true,
            },
          },
        },
      });

      if (!votePackage || votePackage.contest.electionId !== id) {
        return res.status(404).json({ error: 'Vote not found for this election' });
      }

      res.json({
        verified: true,
        tx_hash: votePackage.txHash,
        contest_id: votePackage.contest.id,
        office_title: votePackage.contest.officeTitle,
        timestamp: votePackage.timestamp,
      });
    } catch (error) {
      console.error('Vote verify error:', error);
      res.status(500).json({ error: 'Failed to verify vote' });
    }
  });

  // ============ TALLYING ============

  /**
   * POST /elections/:id/tally — Trigger tally computation
   * Only available when election status is "Tallying"
   */
  app.post('/elections/:id/tally', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isValidUuid(id)) {
      return res.status(404).json({ error: 'Election not found' });
    }
    try {
      const election = await prisma.election.findUnique({ where: { id } });
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }
      if (election.status !== 'Tallying') {
        return res.status(400).json({ error: 'Election must be in "Tallying" status' });
      }

      const contests = await prisma.contest.findMany({
        where: { electionId: id },
        include: { candidates: true },
      });

      for (const contest of contests) {
        for (const candidate of contest.candidates) {
          const votes = await prisma.votePackage.findMany({
            where: { contestId: contest.id },
          });

          let voteCount = 0;
          for (const vote of votes) {
            const selections = vote.selections as string[];
            if (selections.includes(candidate.id)) {
              voteCount++;
            }
          }

          await prisma.tallyResult.upsert({
            where: { candidateId: candidate.id },
            create: {
              contestId: contest.id,
              candidateId: candidate.id,
              voteCount,
              status: 'Provisional',
            },
            update: { voteCount, lastUpdated: new Date() },
          });
        }
      }

      // Best-effort cache invalidation
      try {
        await redis.del(`election:${id}:results`);
      } catch {
        // Redis unavailable
      }

      res.json({ status: 'Tallying complete', election_id: id });
    } catch (error) {
      console.error('Tally error:', error);
      res.status(500).json({ error: 'Failed to run tally' });
    }
  });

  app.get('/metrics', (_req: Request, res: Response) => {
    res.set('Content-Type', 'text/plain');
    res.send('# HELP votiix_core_up Service is up\n# TYPE votiix_core_up gauge\nvotiix_core_up 1\n');
  });

  app.listen(PORT, async () => {
    // Connect to Kafka and MinIO with resilience — don't crash the server
    try {
      await producer.connect();
      producerConnected = true;
      console.log('[Kafka] Producer connected.');
    } catch (err: any) {
      console.warn(`[Kafka] Producer connection failed (non-fatal): ${err.message}`);
    }

    try {
      await ensureBucket();
      console.log('[MinIO] Bucket ready.');
    } catch (err: any) {
      console.warn(`[MinIO] Bucket init failed (non-fatal): ${err.message}`);
    }

    console.log(`votiix-core service listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
