# Votiix Runbook

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Services](#services)
- [Environment Setup](#environment-setup)
- [Running Votiix](#running-votiix)
  - [Local Development](#local-development)
  - [Production](#production)
- [Interacting with MOSIP/eSignet](#interacting-with-mosipesignet)
  - [Mock Identity System](#mock-identity-system)
  - [Production eSignet Integration](#production-esignet-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview
**Votiix** is a secure, event-driven voting platform built as a **TypeScript monorepo** with **microservices**. It integrates with **MOSIP/eSignet** for citizen identity verification and uses **Kafka**, **Redis**, and **PostgreSQL** for real-time operations.

This runbook provides:
- Steps to **run Votiix locally** and in **production**.
- Details on **services** and their interactions.
- Guidance on **MOSIP/eSignet integration**.

---

## Prerequisites
| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20.x | Runtime for services |
| **npm** | 10.x | Package management |
| **Docker** | 24.x | Containerization |
| **Docker Compose** | 2.20.x | Orchestration |
| **PostgreSQL** | 13+ | Database |
| **Redis** | 6.x | Caching and pub/sub |
| **MOSIP/eSignet** | (Optional) | Citizen identity verification |

---

## Services
Votiix consists of **7 microservices** and **shared packages**:

| Service | Port | Description | Dependencies |
|---------|------|-------------|--------------|
| **`votiix-identity`** | 3001 | Citizen enrollment and authentication | PostgreSQL, MOSIP/eSignet |
| **`votiix-core`** | 3004 | Election management and results | PostgreSQL, Redis |
| **`votiix-vote-engine`** | 3003 | Vote processing and validation | Kafka, PostgreSQL |
| **`votiix-token`** | 3002 | Blind token issuance for anonymous voting | `votiix-identity`, RSA keys |
| **`votiix-messenger`** | 3007 | Notifications (SMS/WhatsApp) | Kafka, WhatsApp API |
| **`votiix-iot`** | 3005 | IoT device management (fingerprint scanners) | Kafka |
| **`votiix-observer`** | 3006 | Monitoring and audit logging | Kafka, PostgreSQL |

**Shared Packages**:
- `packages/db`: Prisma schema and database models.
- `packages/utils`: Shared utilities (JWT, crypto).
- `packages/proto`: gRPC definitions.

**Dependencies**:
- **PostgreSQL**: Primary database.
- **Redis**: Caching and real-time updates.
- **Kafka**: Event-driven communication.
- **MOSIP/eSignet**: Citizen identity verification.

---

## Environment Setup

### 1. Clone the Repository
```bash
git clone <votiix-repo-url>
cd votiix/API\ Server
```

### 2. Configure Environment Secrets (Vault)
Votiix relies exclusively on **HashiCorp Vault** for secrets management. There is no manual `.env` file required!

When you start the Docker environment, a dedicated `vault-init` container will automatically run the `vault/init.sh` script. This script seeds the Vault server with all necessary development keys (JWT Secrets, API Keys, Database URLs) and exposes them to the microservices at runtime.

### 3. Install Dependencies
```bash
npm install
```

---

## Running Votiix

### Local Development
#### Option 1: Docker Compose (Recommended)
```bash
docker-compose -f docker-compose.dev.yml up --build
```

#### Option 2: Manual Start
1. Start dependencies:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d database redis kafka
   ```

2. Start services individually:
   ```bash
   npm run start --workspace=votiix-identity
   npm run start --workspace=votiix-core
   # Repeat for other services
   ```

### Production
```bash
docker-compose -f docker-compose.yml up --build -d
```

### Linking WhatsApp for Voting Receipts
The `votiix-messenger` service runs a headless Chromium browser using `whatsapp-web.js` to send unlimited, free, end-to-end encrypted receipts to voters.
1. Make sure the stack is running.
2. View the logs for the messenger service:
   ```bash
   docker logs apiserver-votiix-messenger-1 -f
   ```
3. Open WhatsApp on your phone ➔ Linked Devices ➔ Link a Device.
4. Scan the QR code rendered in your terminal. The service is now permanently authenticated.

---

## Interacting with MOSIP/eSignet

### Mock Identity System
Votiix includes a **mock identity system** for development/testing:

#### Key Features:
- Stores citizen data (name, DOB, VIN, fingerprint hash) in PostgreSQL.
- Mimics MOSIP/eSignet endpoints for enrollment and verification.

#### Endpoints:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mock-identity-system/identity` | POST | Enroll a citizen |
| `/mock-identity-system/identities` | GET | List all citizens |
| `/mock-identity-system/identities/search` | GET | Search citizens by VIN/fingerprint |
| `/mock-identity-system/identities/:id` | PATCH | Update citizen record |

#### Example Workflow:
1. **Enroll a Citizen** (via Dashboard):
   ```bash
   curl -X POST http://localhost:3001/citizens/enroll \
     -H "Content-Type: application/json" \
     -d '{"fullName": "John Doe", "dob": "1990-01-01", "vin": "VIN123456", "fingerprintHash": "abc123"}'
   ```

2. **Search a Citizen** (via `votiix-identity`):
   ```bash
   curl "http://localhost:3001/citizens/search?type=fingerprint&value=abc123"
   ```

3. **Verify Eligibility** (via `votiix-identity`):
   ```bash
   curl -X POST http://localhost:3001/identity/verify-eligibility \
     -H "Content-Type: application/json" \
     -d '{"citizen_id": "UIN-123456"}'
   ```


### Production eSignet Integration
To integrate with **MOSIP/eSignet** in production:

#### 1. Configure `.env`:
```env
MOCK_IDENTITY_URL=
MOSIP_ESIGNET_HOST=https://api.mosip.io
MOSIP_ESIGNET_API_KEY=your_api_key
```

#### 2. Replace Mock Endpoints
Update `votiix-identity` to call **real eSignet APIs** for:
- **Citizen Enrollment**:
  ```typescript
  // Replace mock enrollment with eSignet API call
  await axios.post(`${MOSIP_ESIGNET_HOST}/idrepository/v1.0/enroll`, payload);
  ```

- **Citizen Verification**:
  ```typescript
  // Replace mock eligibility check with eSignet API
  await axios.post(`${MOSIP_ESIGNET_HOST}/idrepository/v1.0/verify`, payload);
  ```

- **Biometric Search**:
  ```typescript
  // Call eSignet's biometric search API
  await axios.post(`${MOSIP_ESIGNET_HOST}/idrepository/v1.0/search`, {
    biometrics: [{ type: "FINGERPRINT", hash: "abc123" }]
  });
  ```

#### 3. Key eSignet Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/idrepository/v1.0/enroll` | POST | Enroll a citizen |
| `/idrepository/v1.0/verify` | POST | Verify citizen eligibility |
| `/idrepository/v1.0/search` | POST | Search by biometrics |
| `/v1/esignet/oidc/userinfo` | GET | Fetch citizen details |

#### 4. Security Considerations
- **TLS**: Ensure all eSignet API calls use HTTPS.
- **API Key**: Store `MOSIP_ESIGNET_API_KEY` securely (e.g., Vault).
- **Rate Limiting**: Implement retries for eSignet API rate limits.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Prisma Client Not Generated** | Ensure `npx prisma generate` runs during Docker build. |
| **Kafka Connection Errors** | Verify Kafka is running (`docker-compose logs kafka`). |
| **WhatsApp Messages Not Sent** | Check the logs using `docker logs apiserver-votiix-messenger-1`. Ensure you have scanned the QR code to authenticate the headless browser. |
| **eSignet API Failures** | Test eSignet endpoints with Postman/curl. |
| **Port Conflicts** | Ensure no other services are using ports (e.g., 3001, 8080, 5432). |

For Docker issues:
```bash
# View logs for a service
docker-compose logs votiix-identity

# Rebuild containers
docker-compose up --build --force-recreate
```