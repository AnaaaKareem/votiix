import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { PrismaClient } from '@votiix/db';
import { verifyUnblindedToken, sha256Hash, loadSecretsFromVault } from '@votiix/utils';
import { Kafka } from 'kafkajs';

async function main() {
  // Step 1: Load secrets from Vault into process.env
  await loadSecretsFromVault();

  // Step 2: Initialize clients
  const app = express();
  const PORT = process.env.PORT || 3002;
  const prisma = new PrismaClient();

  const kafka = new Kafka({
    clientId: 'vote-engine',
    brokers: [process.env.KAFKA_BROKER || 'kafka:29092'],
  });
  const producer = kafka.producer();

  app.use(express.json());
  app.use(cors());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'votiix-vote-engine' });
  });

  /**
   * POST /kiosk/vote/commit
   *
   * Called by the ESP32 after the voter selects a candidate.
   * Input: {
   *   "contest_id": "uuid",
   *   "selections": ["candidate-uuid-1"],
   *   "blind_token": "unblinded-value",
   *   "blind_token_signature": "rsa-sig-base64",
   *   "terminal_id": "esp32-01"
   * }
   *
   * Logic:
   * 1. Verify the RSA signature on the unblinded token using the election's public key.
   * 2. Hash the blind_token to find the BLIND_TOKEN record.
   * 3. Verify the BLIND_TOKEN.is_used == false.
   * 4. Generate a tx_hash = SHA-256(token + timestamp + contest_id).
   * 5. Create VOTE_PACKAGE (anonymous — NO user ID).
   * 6. Burn the token (BLIND_TOKEN.is_used = true, usedAt = now).
   * 7. Publish vote.committed to Kafka.
   * 8. Return the tx_hash.
   */
  app.post('/kiosk/vote/commit', async (req: Request, res: Response) => {
    const schema = z.object({
      contest_id: z.string().uuid(),
      selections: z.array(z.string().uuid()).min(1),
      blind_token: z.string().min(1),
      blind_token_signature: z.string().min(1),
      terminal_id: z.string().min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }

    const { contest_id, selections, blind_token, blind_token_signature, terminal_id } = parsed.data;

    try {
      // Step 1: Get the contest and its election to retrieve the RSA public key
      const contest = await prisma.contest.findUnique({
        where: { id: contest_id },
        include: { election: true },
      });

      if (!contest || !contest.election.rsaPublicKey) {
        return res.status(404).json({ error: 'Contest not found or election key missing' });
      }

      // Verify election is Active
      if (contest.election.status !== 'Active') {
        return res.status(403).json({ error: 'Election is not active' });
      }

      // Step 1b: Verify RSA signature
      const isValid = verifyUnblindedToken(blind_token, blind_token_signature, contest.election.rsaPublicKey);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid blind token signature' });
      }

      // Step 2: Find the BLIND_TOKEN by hash
      const tokenHash = sha256Hash(blind_token);
      const blindTokenRecord = await prisma.blindToken.findUnique({
        where: { hash: tokenHash },
      });

      if (!blindTokenRecord) {
        return res.status(404).json({ error: 'Blind token not found' });
      }

      // Step 3: Check token is not already used
      if (blindTokenRecord.isUsed) {
        return res.status(403).json({ error: 'Blind token already used' });
      }

      // Step 4: Generate tx_hash
      const timestamp = new Date();
      const txHash = sha256Hash(`${blind_token}:${timestamp.toISOString()}:${contest_id}`);

      // Step 5 & 6: In a transaction — create VOTE_PACKAGE and burn token
      // Look up the terminal's station for the pollingStationId field
      const terminal = await prisma.terminal.findUnique({
        where: { id: terminal_id },
      });

      await prisma.$transaction([
        // Create anonymous vote package
        prisma.votePackage.create({
          data: {
            contestId: contest_id,
            pollingStationId: terminal?.assignedStationId || null,
            selections: selections,
            blindTokenHash: tokenHash,
            txHash: txHash,
            timestamp: timestamp,
          },
        }),
        // Burn the token
        prisma.blindToken.update({
          where: { hash: tokenHash },
          data: { isUsed: true, usedAt: timestamp },
        }),
      ]);

      // Step 7: Publish vote.committed to Kafka
      await producer.send({
        topic: 'vote.committed',
        messages: [
          {
            value: JSON.stringify({
              tx_hash: txHash,
              contest_id,
              station_id: terminal?.assignedStationId,
              terminal_id,
              timestamp: timestamp.toISOString(),
            }),
          },
        ],
      });

      // Step 8: Return tx_hash
      res.json({
        status: 'COMMITTED',
        tx_hash: txHash,
      });
    } catch (error: any) {
      console.error('Vote commit error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Prometheus metrics endpoint (basic)
  app.get('/metrics', (_req: Request, res: Response) => {
    res.set('Content-Type', 'text/plain');
    res.send('# HELP votiix_vote_engine_up Service is up\n# TYPE votiix_vote_engine_up gauge\nvotiix_vote_engine_up 1\n');
  });

  app.listen(PORT, async () => {
    await producer.connect();
    console.log(`votiix-vote-engine service listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
