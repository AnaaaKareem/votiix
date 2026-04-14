import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { loadSecretsFromVault } from '@votiix/utils';

async function main() {
  // Step 1: Load secrets from Vault into process.env
  await loadSecretsFromVault();

  // Step 2: Initialize clients
  const app = express();
  const PORT = process.env.PORT || 3006;

  // Initialize WhatsApp Client (OSS/Free via Puppeteer)
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
  });

  let clientReady = false;

  client.on('qr', (qr: string) => {
    console.log('\\n[WhatsApp] === SCAN THIS QR CODE IN YOUR WHATSAPP APP ===\\n');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('[WhatsApp] Client is ready and authenticated!');
    clientReady = true;
  });

  client.on('disconnected', () => {
    console.log('[WhatsApp] Client disconnected.');
    clientReady = false;
  });

  client.initialize();

  app.use(express.json());
  app.use(cors());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'votiix-messenger' });
  });

  /**
   * POST /messenger/whatsapp
   * 
   * Called by the ESP32 in the Receipt Phase after a vote is committed.
   * The voter enters their WhatsApp number on the keypad.
   * 
   * Input: {
   *   "phone_number": "+20123456789",
   *   "tx_hash": "8f4a...",
   *   "election_id": "uuid"
   * }
   * 
   * Logic:
   * 1. Format a verification message with the tx_hash.
   * 2. Send via WhatsApp Business API (or Whapi.cloud sandbox).
   * 3. Return confirmation to ESP32.
   */
  app.post('/messenger/whatsapp', async (req: Request, res: Response) => {
    const schema = z.object({
      phone_number: z.string().min(1),
      tx_hash: z.string().min(1),
      election_id: z.string().uuid(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }

    const { phone_number, tx_hash, election_id } = parsed.data;

    const messageBody = [
      '🗳️ *Votiix Voting Receipt*',
      '',
      `Your vote has been securely recorded.`,
      '',
      `📋 *Transaction Hash:*`,
      `\`${tx_hash}\``,
      '',
      `🔗 *Election ID:* ${election_id}`,
      '',
      'This hash serves as your verifiable proof of vote.',
      'Keep it safe — you may use it to verify your vote was counted.',
      '',
      '— Votiix Electoral System',
    ].join('\n');

    try {
      if (clientReady) {
        // whatsapp-web.js expects format: 1234567890@c.us
        const formattedNumber = phone_number.replace('+', '') + '@c.us';
        await client.sendMessage(formattedNumber, messageBody);
        console.log(`[WhatsApp] Receipt successfully sent to ${phone_number}`);
      } else {
        // If no token configured, just log the message (dev mode)
        console.log(`[DEV] WhatsApp Client not paired yet. Would send to ${phone_number}:\n${messageBody}`);
      }

      res.json({
        status: 'sent',
        phone_number,
        tx_hash,
      });
    } catch (error: any) {
      console.error('WhatsApp send error:', error.response?.data || error.message);
      // Don't fail the whole flow — receipt is optional
      res.json({
        status: 'failed',
        error: 'WhatsApp delivery failed, but your vote was recorded.',
        tx_hash,
      });
    }
  });

  app.get('/metrics', (_req: Request, res: Response) => {
    res.set('Content-Type', 'text/plain');
    res.send('# HELP votiix_messenger_up Service is up\n# TYPE votiix_messenger_up gauge\nvotiix_messenger_up 1\n');
  });

  app.listen(PORT, () => {
    console.log(`votiix-messenger service listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
