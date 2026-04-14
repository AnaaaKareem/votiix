import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { Kafka } from 'kafkajs';
import { MongoClient, Db, Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { loadSecretsFromVault } from '@votiix/utils';

async function main() {
  // Step 1: Load secrets from Vault into process.env
  await loadSecretsFromVault();

  // Step 2: Initialize clients
  const app = express();
  const PORT = process.env.PORT || 3005;

  app.use(express.json());
  app.use(cors());

  // MongoDB connection
  const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017';
  const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'votiix_audit';
  let db: Db;
  let auditCollection: Collection;

  // Kafka consumer
  const kafka = new Kafka({
    clientId: 'observer-service',
    brokers: [process.env.KAFKA_BROKER || 'kafka:29092'],
  });
  const consumer = kafka.consumer({ groupId: 'votiix-observer-group' });

  // Track the previous hash for chaining
  let previousHash = '0000000000000000000000000000000000000000000000000000000000000000'; // Genesis

  /**
   * Compute the cryptographic hash chain:
   * H_n = SHA-256(H_{n-1} || JSON(Payload_n))
   */
  function computeHash(previousHash: string, payload: object): string {
    const input = previousHash + JSON.stringify(payload);
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  /**
   * Insert an audit log entry into MongoDB with hash chaining.
   */
  async function insertAuditLog(
    actorId: string,
    actorType: 'Admin' | 'Officer' | 'System',
    action: string,
    metadata: object
  ): Promise<void> {
    const payload = { actorId, actorType, action, metadata, timestamp: new Date() };
    const currentHash = computeHash(previousHash, payload);

    const doc = {
      id: uuidv4(),
      actor_id: actorId,
      actor_type: actorType,
      action,
      timestamp: new Date(),
      previous_hash: previousHash,
      current_hash: currentHash,
      metadata,
    };

    await auditCollection.insertOne(doc);
    previousHash = currentHash;
  }

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'votiix-observer' });
  });

  /**
   * GET /audit/logs — Query the immutable audit ledger
   * 
   * Query params:
   *   - page (default 1)
   *   - limit (default 50)
   *   - action (optional filter, e.g. "VOTE_CAST")
   *   - actor_id (optional filter)
   */
  app.get('/audit/logs', async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (req.query.action) filter.action = req.query.action;
      if (req.query.actor_id) filter.actor_id = req.query.actor_id;

      const [logs, total] = await Promise.all([
        auditCollection.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).toArray(),
        auditCollection.countDocuments(filter),
      ]);

      res.json({ total, page, limit, logs });
    } catch (error) {
      console.error('Audit log query error:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  /**
   * GET /audit/verify — Verify the integrity of the hash chain
   * Returns whether the chain is intact or if tampering is detected.
   */
  app.get('/audit/verify', async (_req: Request, res: Response) => {
    try {
      const allLogs = await auditCollection.find({}).sort({ timestamp: 1 }).toArray();

      let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
      let valid = true;
      let brokenAt = -1;

      for (let i = 0; i < allLogs.length; i++) {
        const log = allLogs[i];

        // Verify previous_hash matches
        if (log.previous_hash !== prevHash) {
          valid = false;
          brokenAt = i;
          break;
        }

        // Recompute current_hash
        const payload = {
          actorId: log.actor_id,
          actorType: log.actor_type,
          action: log.action,
          metadata: log.metadata,
          timestamp: log.timestamp,
        };
        const expectedHash = computeHash(prevHash, payload);

        if (log.current_hash !== expectedHash) {
          valid = false;
          brokenAt = i;
          break;
        }

        prevHash = log.current_hash;
      }

      res.json({
        chain_length: allLogs.length,
        integrity: valid ? 'INTACT' : 'BROKEN',
        broken_at_index: brokenAt >= 0 ? brokenAt : null,
      });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ error: 'Failed to verify chain' });
    }
  });

  /**
   * Kafka Consumer — Listens to system events and logs them to MongoDB
   */
  async function startKafkaConsumer(): Promise<void> {
    await consumer.connect();
    await consumer.subscribe({ topic: 'vote.committed', fromBeginning: false });
    await consumer.subscribe({ topic: 'terminal.alert', fromBeginning: false });
    await consumer.subscribe({ topic: 'election.update', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const event = JSON.parse(message.value?.toString() || '{}');
        console.log(`[AUDIT] Received ${topic}:`, event);

        let action = 'SYSTEM_EVENT';
        if (topic === 'vote.committed') action = 'VOTE_CAST';
        else if (topic === 'terminal.alert') action = 'TERMINAL_ALERT';
        else if (topic === 'election.update') {
          action = event.action === 'WIPE_DATA' ? 'WIPE_DATA' : 'ELECTION_STATUS_CHANGE';
        }

        await insertAuditLog('SYS-KAFKA-CONSUMER', 'System', action, event);
      },
    });
  }

  /**
   * Initialize MongoDB — create the collection with TTL index.
   */
  async function initMongo(): Promise<void> {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    db = client.db(MONGO_DB_NAME);

    // Create collection if not exists
    const collections = await db.listCollections({ name: 'audit_log' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('audit_log');
    }
    auditCollection = db.collection('audit_log');

    // TTL index: auto-delete after 365 days
    await auditCollection.createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 365 * 24 * 60 * 60 }
    );

    // Index for queries
    await auditCollection.createIndex({ action: 1, timestamp: -1 });
    await auditCollection.createIndex({ actor_id: 1 });

    // Initialize previousHash from the last document
    const lastDoc = await auditCollection.findOne({}, { sort: { timestamp: -1 } });
    if (lastDoc) {
      previousHash = lastDoc.current_hash;
    }

    console.log('MongoDB initialized for audit ledger');
  }

  app.get('/metrics', (_req: Request, res: Response) => {
    res.set('Content-Type', 'text/plain');
    res.send('# HELP votiix_observer_up Service is up\n# TYPE votiix_observer_up gauge\nvotiix_observer_up 1\n');
  });

  await initMongo();
  await startKafkaConsumer();

  app.listen(PORT, () => {
    console.log(`votiix-observer service listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
