import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { PrismaClient } from '@votiix/db';
import { verifyToken, signBlindedToken, sha256Hash, loadSecretsFromVault } from '@votiix/utils';

async function main() {
  // Step 1: Load secrets from Vault into process.env
  await loadSecretsFromVault();

  // Step 2: Initialize clients
  const app = express();
  const PORT = process.env.PORT || 3001;
  const prisma = new PrismaClient();

  app.use(express.json());
  app.use(cors());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'votiix-token' });
  });

  /**
   * POST /token/sign
   * 
   * Called by the ESP32 after receiving the auth-session JWT.
   * Input: { "auth_session_jwt": "ey...", "blinded_token": "random_string_123" }
   * 
   * Logic:
   * 1. Verify the JWT is valid and not expired.
   * 2. Extract finger_id and election_id from the JWT payload.
   * 3. Look up the VOTER_REGISTRY to confirm has_voted == false (double check).
   * 4. Get the election's RSA private key.
   * 5. Sign the blinded token with the RSA private key.
   * 6. Mark the voter as has_voted = true and set token_issued_at.
   * 7. Store the token hash in BLIND_TOKEN table.
   * 8. Update the AUTH_SESSION status to "Used".
   * 9. Return the signed blinded token.
   */
  app.post('/token/sign', async (req: Request, res: Response) => {
    const schema = z.object({
      auth_session_jwt: z.string().min(1),
      blinded_token: z.string().min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }

    try {
      // Step 1: Verify JWT
      const payload = verifyToken(parsed.data.auth_session_jwt);

      if (!payload.mosip_uin || !payload.election_id) {
        return res.status(401).json({ error: 'Invalid auth token: missing mosip_uin or election_id' });
      }

      // Step 2: Look up voter registry
      const voter = await prisma.voterRegistry.findUnique({
        where: {
          electionId_mosipUin: {
            electionId: payload.election_id,
            mosipUin: payload.mosip_uin,
          },
        },
      });

      if (!voter) {
        return res.status(404).json({ error: 'Voter not found' });
      }

      // Step 3: Double-check has_voted
      if (voter.hasVoted) {
        return res.status(403).json({ error: 'Token already issued for this voter' });
      }

      // Step 4: Get election RSA private key
      const election = await prisma.election.findUnique({
        where: { id: payload.election_id },
      });

      if (!election || !election.rsaPrivateKey) {
        return res.status(500).json({ error: 'Election RSA key not configured' });
      }

      // Step 5: Sign the blinded token
      const signedBlindedToken = signBlindedToken(parsed.data.blinded_token, election.rsaPrivateKey);

      // Step 6: Mark voter as has_voted = true
      await prisma.voterRegistry.update({
        where: { id: voter.id },
        data: {
          hasVoted: true,
          tokenIssuedAt: new Date(),
        },
      });

      // Step 7: Store the token hash in BLIND_TOKEN
      // We hash the blinded_token to create a unique identifier
      const tokenHash = sha256Hash(parsed.data.blinded_token);
      await prisma.blindToken.create({
        data: {
          hash: tokenHash,
          electionId: payload.election_id,
          isUsed: false,
        },
      });

      // Step 8: Mark AUTH_SESSION as Used
      if (voter.authSessionId) {
        await prisma.authSession.update({
          where: { id: voter.authSessionId },
          data: { status: 'Used' },
        });
      }

      // Step 9: Return signed token
      res.json({
        signed_blinded_token: signedBlindedToken,
        election_id: payload.election_id,
      });
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'JWT invalid or expired' });
      }
      console.error('Token sign error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /token/public-key?election_id=uuid
   * 
   * Returns the election's RSA public key (used by ESP32 for unblinding).
   */
  app.get('/token/public-key', async (req: Request, res: Response) => {
    const electionId = req.query.election_id as string;
    if (!electionId) {
      return res.status(400).json({ error: 'election_id query parameter required' });
    }

    try {
      const election = await prisma.election.findUnique({
        where: { id: electionId },
        select: { id: true, rsaPublicKey: true },
      });

      if (!election || !election.rsaPublicKey) {
        return res.status(404).json({ error: 'Election or public key not found' });
      }

      res.json({
        election_id: election.id,
        public_key: election.rsaPublicKey,
      });
    } catch (error) {
      console.error('Public key fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/metrics', (_req: Request, res: Response) => {
    res.set('Content-Type', 'text/plain');
    res.send('# HELP votiix_token_up Service is up\n# TYPE votiix_token_up gauge\nvotiix_token_up 1\n');
  });

  app.listen(PORT, () => {
    console.log(`votiix-token service listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
