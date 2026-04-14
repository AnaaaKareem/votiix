import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { PrismaClient } from '@votiix/db';
import { signToken, loadSecretsFromVault } from '@votiix/utils';
import { Pool } from 'pg';

async function main() {
  // Step 1: Load secrets from Vault into process.env
  await loadSecretsFromVault();

  // Step 2: Initialize clients
  const app = express();
  const PORT = process.env.PORT || 3000;
  const prisma = new PrismaClient();

  // Connect to MOSIP PostgreSQL Database (via Docker DNS)
  const mosipDbUrl = process.env.MOSIP_DB_URL || 'postgresql://postgres:postgres@database:5432/mosip_mockidentitysystem';
  const mosipPool = new Pool({ connectionString: mosipDbUrl });

  app.use(express.json());
  app.use(cors());

  // Health check for Docker/KrakenD
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'votiix-identity' });
  });

  /**
   * POST /identity/auth-session
   * 
   * Called by the ESP32 after a fingerprint match.
   * Input: { "finger_id": 3, "terminal_id": "esp32-01" }
   * 
   * Logic:
   * 1. Find the active election (status = "Active").
   * 2. Look up VOTER_REGISTRY where esp32_finger_id = finger_id AND election = active election.
   * 3. Check has_voted == false. If true, reject with 403.
   * 4. Generate a 1-minute JWT containing { finger_id, terminal_id, election_id }.
   * 5. Create an AUTH_SESSION record in PostgreSQL.
   * 6. Return the JWT to the ESP32.
   */
  app.post('/identity/auth-session', async (req: Request, res: Response) => {
    const schema = z.object({
      fingerprint_id: z.number().int().min(0).max(127),
      terminal_id: z.string().min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }

    const { fingerprint_id, terminal_id } = parsed.data;

    try {
      // Step 1: Find the active election
      const activeElection = await prisma.election.findFirst({
        where: { status: 'Active' },
      });

      if (!activeElection) {
        return res.status(404).json({ error: 'No active election found' });
      }

      // Step 2: Look up citizen in mock MOSIP eSignet using fingerprint_id (slot ID)
      const getCitizenFromMosip = async (slotId: number) => {
        const query = "SELECT individual_id, identity_json FROM mockidentitysystem.mock_identity WHERE identity_json->>'fingerprintHash' = $1";
        const result = await mosipPool.query(query, [slotId.toString()]);
        if (result.rows.length === 0) return null;
        return result.rows[0];
      };

      const citizen = await getCitizenFromMosip(fingerprint_id);
      if (!citizen) {
        return res.status(401).json({ error: 'Citizen fingerprint not found in MOSIP eSignet database' });
      }

      const mosip_uin = citizen.individual_id;
      const identity = typeof citizen.identity_json === 'string' ? JSON.parse(citizen.identity_json) : citizen.identity_json;

      // Validate Voting Age >= 18
      if (!identity.dob) {
        return res.status(400).json({ error: 'Citizen JSON missing Date of Birth' });
      }

      const dob = new Date(identity.dob);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 18) {
        return res.status(403).json({ error: 'Citizen does not meet the minimum voting age of 18', age });
      }

      // Step 3: Look up voter in registry for this election using mosipUin
      const voter = await prisma.voterRegistry.findUnique({
        where: {
          electionId_mosipUin: {
            electionId: activeElection.id,
            mosipUin: mosip_uin,
          },
        },
      });

      if (!voter) {
        return res.status(404).json({ error: 'Citizen not registered for this election' });
      }

      // Step 4: [DELETED] We no longer check fingerprintId in VoterRegistry because MOSIP tells us who they are
      // We rely entirely on MOSIP as the source of truth for biometrics->UIN linkage.

      // Step 5: Check has_voted
      if (voter.hasVoted) {
        return res.status(403).json({ error: 'Voter has already been issued a token' });
      }

      // Step 6: Generate 1-minute JWT
      const jwt = signToken(
        {
          mosip_uin: mosip_uin,
          terminal_id,
          election_id: activeElection.id,
        },
        '1m' // 1 minute TTL
      );

      // Step 7: Create AUTH_SESSION record
      const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute from now
      const session = await prisma.authSession.create({
        data: {
          mosipUin: mosip_uin,
          terminalId: terminal_id,
          jwtToken: jwt,
          expiresAt,
          status: 'Active',
        },
      });

      // Step 8: Link session to voter registry
      await prisma.voterRegistry.update({
        where: { id: voter.id },
        data: { authSessionId: session.id },
      });

      // Step 9: Return JWT
      res.json({
        session_id: session.id,
        jwt,
        expires_in_seconds: 60,
        election_id: activeElection.id,
      });
    } catch (error: any) {
      console.error('Auth session error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Prometheus metrics endpoint (basic)
  app.get('/metrics', (_req: Request, res: Response) => {
    res.set('Content-Type', 'text/plain');
    res.send('# HELP votiix_identity_up Service is up\n# TYPE votiix_identity_up gauge\nvotiix_identity_up 1\n');
  });

  app.listen(PORT, () => {
    console.log(`votiix-identity service listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
