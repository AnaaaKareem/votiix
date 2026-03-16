import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { verifyUnblindedToken, verifyHmacSignature } from '@votiix/utils';
// import { Kafka } from 'kafkajs';
// import { PrismaClient } from '@prisma/client';

// STUB Integrations
// const prisma = new PrismaClient();
// const kafka = new Kafka({ clientId: 'vote-engine', brokers: [process.env.KAFKA_BROKER || 'kafka:29092'] });
// const producer = kafka.producer();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(cors());

// Internal helpers
async function processVoteCommit(
  type: 'KIOSK' | 'MOBILE', 
  payload: any
): Promise<{ status: string; tx_hash?: string; error?: string }> {
  // 1. Check RSA Signature
  const electionPubKey = process.env.ELECTION_PUB_KEY || 'stub_pub_key';
  const isValid = verifyUnblindedToken(payload.blind_token, payload.blind_token_signature, electionPubKey);
  if (!isValid) return { status: "FAILED", error: "Invalid Blind Signature" };

  // 2. Check BLIND_TOKEN.is_used == false (by token hash)
  // 3. (If KIOSK) gRPC votiix-iot -> IsTerminalLive
  // 4. Store VOTE_PACKAGE (anonymous)
  // 5. Burn token (BLIND_TOKEN.is_used = true)
  // 6. Publish vote.committed to Kafka
  
  // STUB: Publish Event
  /*
  await producer.send({
    topic: 'vote.committed',
    messages: [
      { value: JSON.stringify({
        tx_hash: "stub_hash", timestamp: new Date(), contest_id: payload.contest_id, station_id: payload.terminal_id
      })}
    ]
  });
  */

  return { status: "COMMITTED", tx_hash: "8f4a-STUB-HASH" };
}

// 1. Kiosk Vote Commit
app.post('/kiosk/vote/commit', async (req: Request, res: Response) => {
  const schema = z.object({
    terminal_id: z.string(),
    contest_id: z.string(),
    selections: z.array(z.string()),
    blind_token: z.string(),
    blind_token_signature: z.string(),
    device_signature: z.string()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  const result = await processVoteCommit('KIOSK', parsed.data);
  if (result.error) return res.status(400).json({ error: result.error });

  res.json({ status: result.status, tx_hash: result.tx_hash });
});

// 2. Mobile Vote Commit
app.post('/mobile/vote/commit', async (req: Request, res: Response) => {
  const schema = z.object({
    contest_id: z.string(),
    selections: z.array(z.string()),
    blind_token: z.string(),
    blind_token_signature: z.string(),
    device_signature: z.string()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  const result = await processVoteCommit('MOBILE', parsed.data);
  if (result.error) return res.status(400).json({ error: result.error });

  res.json({ status: result.status, tx_hash: result.tx_hash });
});

// 3. Offline Vote Sync
app.post('/kiosk/vote/sync', async (req: Request, res: Response) => {
  const schema = z.object({
    terminal_id: z.string(),
    votes: z.array(z.object({
      contest_id: z.string(),
      selections: z.array(z.string()),
      blind_token: z.string(),
      blind_token_signature: z.string(),
      device_signature: z.string(),
      captured_at: z.string()
    }))
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const vote of parsed.data.votes) {
    const result = await processVoteCommit('KIOSK', { ...vote, terminal_id: parsed.data.terminal_id });
    if (result.status === 'COMMITTED') synced++;
    else {
      failed++;
      errors.push(`Vote failed: ${result.error}`);
    }
  }

  res.json({ synced, failed, errors });
});

app.listen(PORT, async () => {
  // await producer.connect();
  console.log(`votiix-vote-engine service listening on port ${PORT}`);
});
