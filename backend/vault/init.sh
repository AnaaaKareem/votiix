#!/bin/sh
# ============================================
# Votiix Vault Secret Initialization Script
# ============================================
# This script seeds HashiCorp Vault with all required secrets for Votiix microservices.
# It runs automatically via the vault-init container on docker-compose up.
#
# For PRODUCTION: Replace placeholder values with actual secrets before deployment.
# ============================================

set -e

# Wait for Vault to be ready
echo "=== Waiting for Vault to be ready ==="
until vault status >/dev/null 2>&1; do
  echo "Vault is unavailable - sleeping"
  sleep 2
done

export VAULT_TOKEN='votiix-dev-root-token'

echo "=== Starting Vault Secret Seeding ==="

# ==========================================
# 1. DATABASE CONNECTIONS
# ==========================================

# PostgreSQL - Primary transactional database
vault kv put secret/votiix/database \
  url="postgresql://votiix:votiix_password@postgres:5432/ballot_db?schema=public"

# Redis - Caching and real-time updates
vault kv put secret/votiix/redis \
  url="redis://redis:6379"

# MongoDB - Audit ledger (immutable hash chain)
vault kv put secret/votiix/mongodb \
  url="mongodb://mongo:27017" \
  db_name="votiix_audit"

# MOSIP Mock Database - Citizen identity system (eSignet)
# Used by votiix-identity for fingerprint lookup
vault kv put secret/votiix/mosip \
  db_url="postgresql://postgres:postgres@host.docker.internal:5433/esignet_mock" \
  esignet_url="http://esignet:8088" \
  mock_identity_url="http://mock-identity-system:8082"

# ==========================================
# 2. MESSAGING & EVENT STREAMING
# ==========================================

# Kafka - Event-driven communication (KRaft mode)
vault kv put secret/votiix/kafka \
  broker="kafka:9092" \
  client_id="votiix-services" \
  group_id="votiix-consumers"

# ==========================================
# 3. AUTHENTICATION & CRYPTOGRAPHY
# ==========================================

# JWT Configuration - Authentication tokens
# PRODUCTION: Generate a strong secret (min 256 bits)
vault kv put secret/votiix/jwt \
  secret="votiix-jwt-secret-change-in-production-min-32-chars" \
  expires_in="1m" \
  algorithm="HS256"

# RSA Keys - Blind signature scheme for anonymous voting
# PRODUCTION: Generate RSA-2048 or RSA-4096 keypair
# Elections will generate their own keypairs, but global fallback here
vault kv put secret/votiix/rsa \
  private_key="" \
  public_key="" \
  key_size="2048"

# ==========================================
# 4. STORAGE & ASSETS
# ==========================================

# MinIO - Object storage (party logos, candidate photos)
vault kv put secret/votiix/minio \
  endpoint="minio" \
  port="9000" \
  access_key="minioadmin" \
  secret_key="minioadmin" \
  bucket="votiix-assets" \
  use_ssl="false"

# ==========================================
# 5. EXTERNAL SERVICES
# ==========================================

# WhatsApp - Voting receipt delivery
# Uses whatsapp-web.js (no API key needed, uses QR auth)
vault kv put secret/votiix/whatsapp \
  api_url="https://whapi.cloud/messages" \
  api_token="" \
  admin_number="+201XXXXXXXXX" \
  enabled="true"

# ==========================================
# 6. OBSERVABILITY
# ==========================================

# Grafana - Dashboards and monitoring
vault kv put secret/votiix/grafana \
  admin_user="admin" \
  admin_password="admin" \
  prometheus_url="http://prometheus:9090" \
  loki_url="http://loki:3100"

# ==========================================
# 7. APPLICATION SETTINGS
# ==========================================

# Votiix Core Settings
vault kv put secret/votiix/app \
  environment="development" \
  log_level="debug" \
  enable_metrics="true" \
  results_cache_ttl="5" \
  heartbeat_timeout="30" \
  auth_session_ttl="60"

echo "=== Vault secrets seeded successfully ==="
echo ""
echo "Secrets available at:"
echo "  - secret/votiix/database"
echo "  - secret/votiix/redis"
echo "  - secret/votiix/mongodb"
echo "  - secret/votiix/mosip"
echo "  - secret/votiix/kafka"
echo "  - secret/votiix/jwt"
echo "  - secret/votiix/rsa"
echo "  - secret/votiix/minio"
echo "  - secret/votiix/whatsapp"
echo "  - secret/votiix/grafana"
echo "  - secret/votiix/app"
echo ""
echo "=== Ready for Votiix Services ==="