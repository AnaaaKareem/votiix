import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { PrismaClient } from '@votiix/db';
import { loadSecretsFromVault } from '@votiix/utils';

async function main() {
  // Step 1: Load secrets from Vault into process.env
  await loadSecretsFromVault();

  // Step 2: Initialize clients
  const app = express();
  const PORT = process.env.PORT || 3004;
  const prisma = new PrismaClient();

  app.use(express.json());
  app.use(cors());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'votiix-iot' });
  });

  /**
   * POST /iot/heartbeat
   * 
   * Called by ESP32 every 10 seconds.
   * Input: { "hardware_id": "esp32-01", "firmware_version": "1.0.0" }
   * 
   * Logic: Upserts the TERMINAL record, updating last_heartbeat and status to "Online".
   */
  app.post('/iot/heartbeat', async (req: Request, res: Response) => {
    const schema = z.object({
      hardware_id: z.string().min(1),
      firmware_version: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const now = new Date();
      await prisma.terminal.upsert({
        where: { id: parsed.data.hardware_id },
        create: {
          id: parsed.data.hardware_id,
          isActive: true,
          lastHeartbeat: now,
          firmwareVersion: parsed.data.firmware_version || null,
          status: 'Online',
        },
        update: {
          lastHeartbeat: now,
          status: 'Online',
          firmwareVersion: parsed.data.firmware_version || undefined,
        },
      });

      res.json({ ack: true, server_time: now.toISOString() });
    } catch (error) {
      console.error('Heartbeat error:', error);
      res.status(500).json({ error: 'Failed to process heartbeat' });
    }
  });

  /**
   * GET /iot/terminals
   * 
   * Returns the fleet status for the Admin Dashboard.
   * A terminal is "Offline" if its last_heartbeat is more than 30 seconds ago.
   */
  app.get('/iot/terminals', async (_req: Request, res: Response) => {
    try {
      const terminals = await prisma.terminal.findMany({
        include: { station: true },
      });

      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

      const enriched = terminals.map((t: any) => ({
        hardware_id: t.id,
        is_active: t.isActive,
        status: t.lastHeartbeat && t.lastHeartbeat > thirtySecondsAgo ? 'Online' : 'Offline',
        last_heartbeat: t.lastHeartbeat?.toISOString() || null,
        firmware_version: t.firmwareVersion,
        station_name: t.station?.name || 'Unassigned',
      }));

      res.json(enriched);
    } catch (error) {
      console.error('List terminals error:', error);
      res.status(500).json({ error: 'Failed to list terminals' });
    }
  });

  app.get('/metrics', (_req: Request, res: Response) => {
    res.set('Content-Type', 'text/plain');
    res.send('# HELP votiix_iot_up Service is up\n# TYPE votiix_iot_up gauge\nvotiix_iot_up 1\n');
  });

  app.listen(PORT, () => {
    console.log(`votiix-iot service listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
