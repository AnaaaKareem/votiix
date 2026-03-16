import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
// import { Kafka } from 'kafkajs';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.json());
app.use(cors());

// const kafka = new Kafka({ clientId: 'messenger-service', brokers: [process.env.KAFKA_BROKER || 'kafka:29092'] });
// const consumer = kafka.consumer({ groupId: 'votiix-messenger-group' });

// 1. Send Manual Notification
app.post('/messenger/send', async (req: Request, res: Response) => {
  const schema = z.object({
    recipient: z.string(),
    channel: z.string(),
    template: z.string(),
    data: z.any()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  // Logic: Format template and call Twilio/Africa's Talking SDK
  res.json({ message_id: "msg_stub", status: "queued" });
});

// 2. Get Notification Status
app.get('/messenger/status/:id', async (req: Request, res: Response) => {
  res.json({ message_id: req.params.id, status: "delivered" });
});

async function startKafkaConsumer() {
  /*
  await consumer.connect();
  await consumer.subscribe({ topic: 'vote.committed', fromBeginning: true });
  await consumer.subscribe({ topic: 'terminal.alert', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message on ${topic}: ${message.value?.toString()}`);
      // STUB: Dispatch notification to voter via SMS or WhatsApp, or to Officer for alerts.
    },
  });
  */
}

app.listen(PORT, async () => {
  await startKafkaConsumer();
  console.log(`votiix-messenger service listening on port ${PORT}`);
});
