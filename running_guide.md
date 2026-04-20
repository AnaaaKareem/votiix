# Votiix Server Startup Guide

## Prerequisites
- Docker & Docker Compose
- Node.js 20+
- npm

## Backend Services

```bash
cd backend/API\ Server
docker-compose up -d
```

Wait 2-3 minutes for all services to initialize. Check health:

```bash
# Health check endpoints
curl http://localhost:8080/api/v1/health/core
curl http://localhost:8080/api/v1/health/identity
curl http://localhost:8080/api/v1/health/iot
```

Services run on:
- KrakenD Gateway: http://localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6380
- MongoDB: localhost:27017
- MinIO: http://localhost:9000
- Grafana: http://localhost:3200 (admin/admin)

## Frontend Applications

**Voter Interface** (separate terminal):
```bash
cd frontend/voters_interface
npm install
npm run dev
```
Access: http://localhost:5173

**Admin Dashboard** (separate terminal):
```bash
cd frontend/admin_dashboard
npm install
npm run dev
```
Access: http://localhost:5174

**Live Dashboard**:
```bash
cd frontend/live
npm install
npm run dev  # or integrate into main frontend
```

## Testing

**API Tests** (Postman/Newman):
```bash
cd tests
newman run votiix-api.postman_collection.json --reporters cli,html
```

**UI Tests** (Playwright):
```bash
cd tests
npm install @playwright/test
npx playwright test
```

## Quick Verification

1. Backend ready: `curl http://localhost:8080/api/v1/health/core` → 200 OK
2. Voter UI: Open http://localhost:5173 → Should show enrollment page
3. Admin UI: Open http://localhost:5174 → Should show elections list
4. Live results: Polls available at http://localhost:8080/api/v1/public/elections/active

## Troubleshooting
- Services won't start: Check docker logs `docker-compose logs [service-name]`
- Frontend won't load: Ensure backend is running first
- API errors: Verify JWT token storage in localStorage
- Database issues: Ensure ports 5432, 6380, 27017 are free
