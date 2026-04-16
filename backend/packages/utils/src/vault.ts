import axios from 'axios';

const VAULT_ADDR = process.env.VAULT_ADDR || 'http://vault:8200';
const VAULT_TOKEN = process.env.VAULT_TOKEN || 'votiix-dev-root-token';

interface VaultKVResponse {
  data: {
    data: Record<string, string>;
  };
}

/**
 * Read a single secret path from Vault KV v2.
 */
async function readSecret(path: string): Promise<Record<string, string>> {
  try {
    const res = await axios.get<VaultKVResponse>(
      `${VAULT_ADDR}/v1/secret/data/${path}`,
      { headers: { 'X-Vault-Token': VAULT_TOKEN } }
    );
    return res.data.data.data;
  } catch (error: any) {
    console.warn(`[Vault] Failed to read ${path}: ${error.message}. Using env fallback.`);
    return {};
  }
}

/**
 * Load all Votiix secrets from Vault and inject into process.env.
 * Call this ONCE at the top of each service's startup, before any other init.
 *
 * Mapping:
 *   secret/votiix/database  → DATABASE_URL
 *   secret/votiix/redis     → REDIS_URL
 *   secret/votiix/mongodb   → MONGO_URL, MONGO_DB_NAME
 *   secret/votiix/kafka     → KAFKA_BROKER
 *   secret/votiix/jwt       → JWT_SECRET, JWT_EXPIRES_IN
 *   secret/votiix/rsa       → RSA_PRIVATE_KEY, RSA_PUBLIC_KEY
 *   secret/votiix/minio     → MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET
 *   secret/votiix/whatsapp  → WHATSAPP_API_URL, WHATSAPP_API_TOKEN, ADMIN_WHATSAPP_NUMBER
 */
export async function loadSecretsFromVault(): Promise<void> {
  console.log(`[Vault] Loading secrets from ${VAULT_ADDR}...`);

  const [database, redis, mongodb, kafka, jwt, rsa, minio, whatsapp] = await Promise.all([
    readSecret('votiix/database'),
    readSecret('votiix/redis'),
    readSecret('votiix/mongodb'),
    readSecret('votiix/kafka'),
    readSecret('votiix/jwt'),
    readSecret('votiix/rsa'),
    readSecret('votiix/minio'),
    readSecret('votiix/whatsapp'),
  ]);

  // Only set if not already defined (env vars take precedence for overrides)
  const setIfMissing = (key: string, value: string | undefined) => {
    if (value && !process.env[key]) {
      process.env[key] = value;
    }
  };

  setIfMissing('DATABASE_URL', database.url);
  setIfMissing('REDIS_URL', redis.url);
  setIfMissing('MONGO_URL', mongodb.url);
  setIfMissing('MONGO_DB_NAME', mongodb.db_name);
  setIfMissing('KAFKA_BROKER', kafka.broker);
  setIfMissing('JWT_SECRET', jwt.secret);
  setIfMissing('JWT_EXPIRES_IN', jwt.expires_in);
  setIfMissing('RSA_PRIVATE_KEY', rsa.private_key);
  setIfMissing('RSA_PUBLIC_KEY', rsa.public_key);
  setIfMissing('MINIO_ENDPOINT', minio.endpoint);
  setIfMissing('MINIO_PORT', minio.port);
  setIfMissing('MINIO_ACCESS_KEY', minio.access_key);
  setIfMissing('MINIO_SECRET_KEY', minio.secret_key);
  setIfMissing('MINIO_BUCKET', minio.bucket);
  setIfMissing('WHATSAPP_API_URL', whatsapp.api_url);
  setIfMissing('WHATSAPP_API_TOKEN', whatsapp.api_token);
  setIfMissing('ADMIN_WHATSAPP_NUMBER', whatsapp.admin_number);

  console.log('[Vault] Secrets loaded successfully.');
}
