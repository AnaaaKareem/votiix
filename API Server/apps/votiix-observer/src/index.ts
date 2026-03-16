import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
// import { Kafka } from 'kafkajs';
// import { PrismaClient } from '@votiix/db';

const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());
app.use(cors());

// const prisma = new PrismaClient();
// const kafka = new Kafka({ clientId: 'observer-service', brokers: [process.env.KAFKA_BROKER || 'kafka:29092'] });
// const consumer = kafka.consumer({ groupId: 'votiix-observer-group' });

// 1. Query Audit Events
app.get('/audit/logs', async (req: Request, res: Response) => {
  // Logic: Paginate over AUDIT_LOG where actor_id, action matches query
  res.json({
    total: 1500,
    page: 1,
    logs: [
      {
        id: "uuid",
        actor_id: req.query.actor_id || "uuid",
        actor_type: "Officer",
        action: req.query.action || "OPEN_POLLS",
        timestamp: new Date().toISOString(),
        metadata: "{\"station_id\":\"ST-GIZA-04\" }"
      }
    ]
  });
});

// 2. Get Audit Summary (Per Election)
app.get('/audit/summary', async (req: Request, res: Response) => {
  // Logic: aggregate stats from AUDIT_LOG
  res.json({
    election_id: req.query.election_id,
    anomalies: 0,
    tamper_alerts: 1,
    votes_cast: 1500
  });
});

async function startKafkaConsumer() {
  /*
  await consumer.connect();
  await consumer.subscribe({ topic: 'vote.committed', fromBeginning: true });
  await consumer.subscribe({ topic: 'terminal.alert', fromBeginning: true });
  await consumer.subscribe({ topic: 'election.update', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message on ${topic}: ${message.value?.toString()}`);
      // STUB: Write to DB
      // let action = 'SYSTEM_EVENT';
      // if (topic === 'vote.committed') action = 'VOTE_CAST';
      // else if (topic === 'terminal.alert') action = 'TERMINAL_ALERT';
      // else if (topic === 'election.update') action = 'ELECTION_STATUS_CHANGE';

      // await prisma.auditLog.create({
      //   data: { actorId: 'system', actorType: 'System', action, metadata: message.value?.toString() }
      // });
    },
  });
  */
}

app.listen(PORT, async () => {
  await startKafkaConsumer();
  console.log(`votiix-observer service listening on port ${PORT}`);
});
