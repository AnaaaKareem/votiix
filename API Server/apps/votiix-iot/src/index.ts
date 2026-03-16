import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
// import { Kafka } from 'kafkajs';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(cors());

// STUB Integrations
// const kafka = new Kafka({ clientId: 'iot-engine', brokers: [process.env.KAFKA_BROKER || 'kafka:29092'] });
// const producer = kafka.producer();

// 1. Terminal Heartbeat
app.post('/iot/heartbeat', async (req: Request, res: Response) => {
  const schema = z.object({
    hardware_id: z.string(),
    battery_level: z.number(),
    firmware_version: z.string(),
    status: z.string()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  // Update TERMINAL.last_heartbeat in DB
  res.json({ ack: true, server_time: new Date().toISOString() });
});

// 2. Register Terminal
app.post('/iot/terminals', async (req: Request, res: Response) => {
  // Logic: Insert/update TERMINAL record with mTLS cert thumbprint
  res.json({ id: req.body.hardware_id, status: "Registered" });
});

// 3. List Terminals for Station
app.get('/iot/terminals', async (req: Request, res: Response) => {
  const station_id = req.query.station_id as string;
  // Logic: Look up TERMINAL by station_id
  res.json([{ hardware_id: "ESP32-MAC-ADDR", status: "Online" }]);
});

// 4. Report Tamper Alert
app.post('/iot/alert', async (req: Request, res: Response) => {
  const schema = z.object({
    hardware_id: z.string(),
    alert: z.string()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  // DB logic: Auto-disable terminal (update is_active = false, status = 'Tampered')
  
  // Publish `terminal.alert` to Kafka
  /*
  await producer.send({
    topic: 'terminal.alert',
    messages: [
      { value: JSON.stringify({ hardware_id: parsed.data.hardware_id, alert: parsed.data.alert, timestamp: new Date() }) }
    ]
  });
  */

  res.json({ ack: true, alert_logged: true });
});

// Start Server
app.listen(PORT, async () => {
  // await producer.connect();
  console.log(`votiix-iot service listening on port ${PORT}`);
});
