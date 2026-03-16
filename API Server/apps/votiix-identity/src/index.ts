import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { signToken } from '@votiix/utils';

// We would import PrismaClient from @votiix/db in a real execution environment
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// --- REST Endpoints based on specification ---

// 1. Officer Login
app.post('/auth/officer/login', async (req: Request, res: Response) => {
  const schema = z.object({
    officer_id: z.string(),
    password: z.string(),
    station_id: z.string()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error });
  }

  // STUB: Authenticate against DB (Prisma)
  // const officer = await prisma.officer.findUnique({ where: { officerId: parsed.data.officer_id } });

  const token = signToken({ officer_id: parsed.data.officer_id, role: 'OFFICER' }, '8h');
  
  res.json({
    token,
    role: "OFFICER",
    station_name: "Giza School #4" // Stub
  });
});

// 2. Mobile Device Binding
app.post('/mobile/bind', async (req: Request, res: Response) => {
  // Logic: Verify QR JWT, verify officer signature, create DeviceBinding record
  res.json({ status: "BOUND", binding_id: "uuid-stub" });
});

// 3. Verify Voter Eligibility
app.post('/identity/verify-eligibility', async (req: Request, res: Response) => {
  // Logic: Call external MOSIP API (mocked here), check VOTER_REGISTRY
  res.json({
    eligible: true,
    has_voted: false,
    location_id: "uuid-stub",
    age: 36,
    is_alive: true
  });
});

// 4. Create Auth Session
app.post('/identity/auth-session', async (req: Request, res: Response) => {
  // Logic: Store short-lived session token in Redis
  const { mosip_uin } = req.body;
  const jwt = signToken({ uin: mosip_uin }, '1m');
  
  res.json({
    session_id: "uuid-stub",
    jwt,
    expires_in_seconds: 60
  });
});

// 5. Check Has-Voted Status
app.get('/identity/has-voted', async (req: Request, res: Response) => {
  // const { mosip_uin, election_id } = req.query;
  // Logic: Check VOTER_REGISTRY.has_voted
  res.json({
    has_voted: false, // STUB
    voted_at: null
  });
});

// 6. Mark Voter as Token-Issued
app.post('/identity/mark-token-issued', async (req: Request, res: Response) => {
  // Logic: Update VOTER_REGISTRY.has_voted = true
  res.json({
    status: "marked"
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`votiix-identity service listening on port ${PORT}`);
});
