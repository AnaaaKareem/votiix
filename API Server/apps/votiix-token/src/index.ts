import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { verifyToken, signBlindedToken } from '@votiix/utils';

// We would import PrismaClient from @votiix/db in a real execution environment
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(cors());

// 1. Request Blind Token Signing
app.post('/token/sign', async (req: Request, res: Response) => {
  const schema = z.object({
    election_id: z.string(),
    blinded_token: z.string(), // Base64
    auth_session_jwt: z.string()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error });
  }

  try {
    const payload = verifyToken(parsed.data.auth_session_jwt);
    if (!payload.uin) {
      return res.status(401).json({ error: "Invalid auth token payload" });
    }

    // Validation sequence:
    // 1. verify JWT valid
    // 2. call votiix-identity via gRPC (HasVoted(uin, election_id)) -> must be false
    // 3. get election private key from Vault / config
    // 4. RSA sign blinded token S(B) = B^d mod N
    const privateKeyPem = process.env.RSA_PRIVATE_KEY || 'stub_key'; 
    const signedBlindedToken = signBlindedToken(parsed.data.blinded_token, privateKeyPem);
    
    // 5. call votiix-identity to mark voter as token-issued (gRPC: CheckAndMarkVoted)
    
    // 6. DB write: BLIND_TOKEN created (hash is stored) -> Wait, the hash is known only upon unblinding in Engine! 
    // This allows anonymity. Token service might not even write to DB, just signs. The specification says Database: Ballot DB (BLIND_TOKEN) + Redis. 
    // Wait, the specification says: Database: Ballot DB (BLIND_TOKEN). But token service likely only reads.
    
    res.json({
      signed_blinded_token: signedBlindedToken,
      election_id: parsed.data.election_id
    });

  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

// 2. Get Election Public Key
app.get('/token/public-key', async (req: Request, res: Response) => {
  const election_id = req.query.election_id as string;
  // Look up ELECTION by ID to get rsa_public_key
  
  res.json({
    election_id,
    public_key: process.env.RSA_PUBLIC_KEY || 'stub_pub_key',
    key_size: 2048
  });
});

app.listen(PORT, () => {
  console.log(`votiix-token service listening on port ${PORT}`);
});
