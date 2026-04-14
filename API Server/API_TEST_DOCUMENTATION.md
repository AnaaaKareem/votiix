# Votiix API Test Documentation

This document contains comprehensive test cases for the Votiix voting system API endpoints exposed via the KrakenD Gateway (Port 8080).

**Note:** Tests marked with [ESP32] require hardware (fingerprint sensor) and are skipped until the kiosk is received.

---

## Test Summary

| Category | Tests | Status |
|----------|-------|--------|
| Health Checks | 5 | Ready |
| Elections Management | 8 | Ready |
| Parties Management | 5 | Ready |
| Contests Management | 5 | Ready |
| Candidates Management | 5 | Ready |
| Polling Stations | 5 | Ready |
| Voter Registry | 5 | Ready |
| IoT Terminals | 5 | Ready |
| Audit Logs | 5 | Ready |
| Live Results Dashboard | 5 | Ready |
| Data Purge (GDPR) | 3 | Ready |
| Messenger (WhatsApp) | 3 | Ready |
| **Total** | **59** | **Ready** |

---

## 1. Health Checks

| Test ID | Description | Endpoint | Method | Payload | Expected Result | Actual Result | Status |
|---------|-------------|----------|--------|---------|-----------------|---------------|--------|
| TC-H01 | Verify Core service health | /api/v1/health/core | GET | N/A | Status 200; `{"status": "ok", "service": "votiix-core"}` | Pending | - |
| TC-H02 | Verify IoT service health | /api/v1/health/iot | GET | N/A | Status 200; `{"status": "ok"}` | Pending | - |
| TC-H03 | Verify Observer service health | /api/v1/health/observer | GET | N/A | Status 200; `{"status": "ok"}` | Pending | - |
| TC-H04 | Verify Messenger service health | /api/v1/health/messenger | GET | N/A | Status 200; `{"status": "ok"}` | Pending | - |
| TC-H05 | Verify Identity service health | /api/v1/health/identity | GET | N/A | Status 200; `{"status": "ok"}` | Pending | - |

---

## 2. Elections Management

| Test ID | Description | Endpoint | Method | Payload | Expected Result | Actual Result | Status |
|---------|-------------|----------|--------|---------|-----------------|---------------|--------|
| TC-E01 | Create election with valid data | /api/v1/admin/elections | POST | `{"title": "Test Election 2024", "start_date": "2024-12-01T00:00:00Z", "end_date": "2024-12-31T23:59:59Z"}` | Status 201; Election created with status "Draft" | Pending | - |
| TC-E02 | Create election with missing title | /api/v1/admin/elections | POST | `{"start_date": "2024-12-01T00:00:00Z", "end_date": "2024-12-31T23:59:59Z"}` | Status 400; Validation error | Pending | - |
| TC-E03 | List all elections | /api/v1/admin/elections | GET | N/A | Status 200; Array of elections | Pending | - |
| TC-E04 | Get single election by ID | /api/v1/admin/elections/{id} | GET | N/A | Status 200; Election object with contests | Pending | - |
| TC-E05 | Get non-existent election | /api/v1/admin/elections/00000000-0000-0000-0000-000000000000 | GET | N/A | Status 404; "Election not found" | Pending | - |
| TC-E06 | Transition election Draft → Active | /api/v1/admin/elections/{id}/transition | POST | `{"target_status": "Active"}` | Status 200; status changed to "Active" | Pending | - |
| TC-E07 | Invalid transition (skip status) | /api/v1/admin/elections/{id}/transition | POST | `{"target_status": "Archived"}` | Status 400; "Invalid transition" error | Pending | - |
| TC-E08 | Get currently active election | /api/v1/public/elections/active | GET | N/A | Status 200; Active election with contests | Pending | - |

---

## 3. Parties Management

| Test ID | Description | Endpoint | Method | Payload | Expected Result | Actual Result | Status |
|---------|-------------|----------|--------|---------|-----------------|---------------|--------|
| TC-P01 | Create party with valid data | /api/v1/admin/parties | POST | Form: `name=Freedom Party, short_code=FP` | Status 201; Party created | Pending | - |
| TC-P02 | Create party without name | /api/v1/admin/parties | POST | Form: `short_code=XX` | Status 400; "name and short_code are required" | Pending | - |
| TC-P03 | Create party without short code | /api/v1/admin/parties | POST | Form: `name=Test Party` | Status 400; "name and short_code are required" | Pending | - |
| TC-P04 | List all parties | /api/v1/admin/parties | GET | N/A | Status 200; Array of parties with candidates | Pending | - |
| TC-P05 | Create second party | /api/v1/admin/parties | POST | Form: `name=Unity Coalition, short_code=UC` | Status 201; Party created | Pending | - |

---

## 4. Contests Management

| Test ID | Description | Endpoint | Method | Payload | Expected Result | Actual Result | Status |
|---------|-------------|----------|--------|---------|-----------------|---------------|--------|
| TC-C01 | Create contest with valid data | /api/v1/admin/elections/{id}/contests | POST | `{"office_title": "President", "seats_available": 1}` | Status 201; Contest created | Pending | - |
| TC-C02 | Create contest with multiple seats | /api/v1/admin/elections/{id}/contests | POST | `{"office_title": "Senate", "seats_available": 5}` | Status 201; Contest with 5 seats | Pending | - |
| TC-C03 | List contests for election | /api/v1/admin/elections/{id}/contests | GET | N/A | Status 200; Array of contests | Pending | - |
| TC-C04 | List contests for non-existent election | /api/v1/admin/elections/00000000-0000-0000-0000-000000000000/contests | GET | N/A | Status 200; Empty array | Pending | - |
| TC-C05 | Create contest without title | /api/v1/admin/elections/{id}/contests | POST | `{"seats_available": 1}` | Status 400; Validation error | Pending | - |

---

## 5. Candidates Management

| Test ID | Description | Endpoint | Method | Payload | Expected Result | Actual Result | Status |
|---------|-------------|----------|--------|---------|-----------------|---------------|--------|
| TC-CD01 | Add candidate with party | /api/v1/admin/contests/{id}/candidates | POST | Form: `name=John Candidate, party_id={party_id}, list_position=1` | Status 201; Candidate created | Pending | - |
| TC-CD02 | Add independent candidate (no party) | /api/v1/admin/contests/{id}/candidates | POST | Form: `name=Jane Independent, list_position=2` | Status 201; Candidate with null partyId | Pending | - |
| TC-CD03 | Add candidate without name | /api/v1/admin/contests/{id}/candidates | POST | Form: `list_position=3` | Status 400; "name is required" | Pending | - |
| TC-CD04 | List candidates for contest | /api/v1/admin/contests/{id}/candidates | GET | N/A | Status 200; Array of candidates | Pending | - |
| TC-CD05 | Add third candidate | /api/v1/admin/contests/{id}/candidates | POST | Form: `name=Bob Smith, list_position=3` | Status 201; Candidate created | Pending | - |

---

## 6. Polling Stations

| Test ID | Description | Endpoint | Method | Payload | Expected Result | Actual Result | Status |
|---------|-------------|----------|--------|---------|-----------------|---------------|--------|
| TC-PS01 | Create polling station | /api/v1/admin/stations | POST | `{"name": "Central Polling Station", "address": "123 Main Street", "terminal_capacity": 10}` | Status 201; Station created | Pending | - |
| TC-PS02 | Create station without name | /api/v1/admin/stations | POST | `{"address": "123 Main Street"}` | Status 400; Validation error | Pending | - |
| TC-PS03 | List polling stations | /api/v1/admin/stations | GET | N/A | Status 200; Array of stations | Pending | - |
| TC-PS04 | Create station with default capacity | /api/v1/admin/stations | POST | `{"name": "North District Station", "address": "456 North Ave"}` | Status 201; terminal_capacity defaults to 5 | Pending | - |
| TC-PS05 | Create station with large capacity | /api/v1/admin/stations | POST | `{"name": "Convention Center", "address": "789 Event Blvd", "terminal_capacity": 50}` | Status 201; Station with 50 terminals | Pending | - |

---

## 7. Voter Registry

| Test ID | Description | Endpoint | Method | Payload | Expected Result | Actual Result | Status |
|---------|-------------|----------|--------|---------|-----------------|---------------|--------|
| TC-VR01 | Register voter with valid data | /api/v1/admin/elections/{id}/voters | POST | `{"mosip_uin": "UIN-TEST-001", "fingerprint_id": 42}` | Status 201; Voter registered with hasVoted=false | Pending | - |
| TC-VR02 | Register duplicate UIN | /api/v1/admin/elections/{id}/voters | POST | `{"mosip_uin": "UIN-TEST-001", "fingerprint_id": 43}` | Status 409; "Voter already registered" | Pending | - |
| TC-VR03 | Register voter with invalid fingerprint ID | /api/v1/admin/elections/{id}/voters | POST | `{"mosip_uin": "UIN-TEST-002", "fingerprint_id": 128}` | Status 400; fingerprint_id must be 0-127 | Pending | - |
| TC-VR04 | List voters for election | /api/v1/admin/elections/{id}/voters | GET | N/A | Status 200; Array of voters | Pending | - |
| TC-VR05 | Register second voter | /api/v1/admin/elections/{id}/voters | POST | `{"mosip_uin": "UIN-TEST-002", "fingerprint_id": 43}` | Status 201; Voter registered | Pending | - |

---

## 8. IoT Terminals

| Test ID | Description | Endpoint | Method | Payload | Expected Result | Actual Result | Status |
|---------|-------------|----------|--------|---------|-----------------|---------------|--------|
| TC-IOT01 | Send terminal heartbeat | /api/v1/kiosk/iot/heartbeat | POST | `{"hardware_id": "esp32-terminal-01", "status": "Online", "firmware_version": "2.4.0"}` | Status 200; `{"status": "ok"}` | Pending | - |
| TC-IOT02 | Heartbeat without hardware_id | /api/v1/kiosk/iot/heartbeat | POST | `{"status": "Online"}` | Status 400; Validation error | Pending | - |
| TC-IOT03 | Get terminals list | /api/v1/admin/terminals | GET | N/A | Status 200; Array of terminals | Pending | - |
| TC-IOT04 | Second terminal heartbeat | /api/v1/kiosk/iot/heartbeat | POST | `{"hardware_id": "esp32-terminal-02", "status": "Online", "firmware_version": "2.4.1"}` | Status 200; Terminal registered | Pending | - |
| TC-IOT05 | Update terminal to maintenance | /api/v1/kiosk/iot/heartbeat | POST | `{"hardware_id": "esp32-terminal-01", "status": "Maintenance", "firmware_version": "2.4.0"}` | Status 200; Status updated | Pending | - |

---

## 9. Audit Logs

| Test ID | Description | Endpoint | Method | Payload | Expected Result | Actual Result | Status |
|---------|-------------|----------|--------|---------|-----------------|---------------|--------|
| TC-A01 | Get audit logs | /api/v1/admin/audit/logs | GET | N/A | Status 200; `{logs: [...]}` | Pending | - |
| TC-A02 | Get audit logs with limit | /api/v1/admin/audit/logs?limit=10 | GET | N/A | Status 200; Max 10 logs | Pending | - |
| TC-A03 | Get audit logs by action | /api/v1/admin/audit/logs?action=ELECTION_STATUS_CHANGE | GET | N/A | Status 200; Filtered logs | Pending | - |
| TC-A04 | Verify audit chain integrity | /api/v1/admin/audit/verify | GET | N/A | Status 200; `{valid: true/false}` | Pending | - |
| TC-A05 | Get audit logs paginated | /api/v1/admin/audit/logs?limit=5&skip=0 | GET | N/A | Status 200; Paginated results | Pending | - |

---

## 10. Live Results Dashboard

| Test ID | Description | Endpoint | Method | Payload | Expected Result | Actual Result | Status |
|---------|-------------|----------|--------|---------|-----------------|---------------|--------|
| TC-R01 | Get election results | /api/v1/public/elections/{id}/results | GET | N/A | Status 200; Results with contests array | Pending | - |
| TC-R02 | Results include winner info | /api/v1/public/elections/{id}/results | GET | N/A | Status 200; election_id, status, deadline_passed fields | Pending | - |
| TC-R03 | Results for non-existent election | /api/v1/public/elections/00000000-0000-0000-0000-000000000000/results | GET | N/A | Status 404; "Election not found" | Pending | - |
| TC-R04 | Results contain vote counts | /api/v1/public/elections/{id}/results | GET | N/A | Status 200; candidates have vote_count | Pending | - |
| TC-R05 | Results return from cache (fast) | /api/v1/public/elections/{id}/results | GET | N/A | Status 200; Response < 1000ms | Pending | - |

---

## 11. Data Purge (GDPR Compliance)

| Test ID | Description | Endpoint | Method | Payload | Expected Result | Actual Result | Status |
|---------|-------------|----------|--------|---------|-----------------|---------------|--------|
| TC-DP01 | Purge without confirmation | /api/v1/admin/elections/{id}/purge | POST | `{"confirmation": "wrong"}` | Status 400; "Must type ARCHIVE" | Pending | - |
| TC-DP02 | Purge non-archived election | /api/v1/admin/elections/{id}/purge | POST | `{"confirmation": "ARCHIVE"}` | Status 400; "Must be Archived status" | Pending | - |
| TC-DP03 | Purge non-existent election | /api/v1/admin/elections/00000000-0000-0000-0000-000000000000/purge | POST | `{"confirmation": "ARCHIVE"}` | Status 404; "Election not found" | Pending | - |

---

## 12. Messenger (WhatsApp)

| Test ID | Description | Endpoint | Method | Payload | Expected Result | Actual Result | Status |
|---------|-------------|----------|--------|---------|-----------------|---------------|--------|
| TC-M01 | Send WhatsApp receipt | /api/v1/kiosk/messenger/whatsapp | POST | `{"phone_number": "201234567890", "tx_hash": "abc123def456", "election_id": "{id}"}` | Status 200 (if paired) or 503 | Pending | - |
| TC-M02 | Send without phone number | /api/v1/kiosk/messenger/whatsapp | POST | `{"tx_hash": "abc123def456", "election_id": "{id}"}` | Status 400; Validation error | Pending | - |
| TC-M03 | Send without tx_hash | /api/v1/kiosk/messenger/whatsapp | POST | `{"phone_number": "201234567890", "election_id": "{id}"}` | Status 400; Validation error | Pending | - |

---

## ESP32-Dependent Tests (Deferred)

The following tests require the ESP32 fingerprint sensor and will be implemented after hardware arrives:

| Test ID | Description | Endpoint | Status |
|---------|-------------|----------|--------|
| TC-ID01 | [ESP32] Authenticate with fingerprint | /api/v1/kiosk/identity/auth | Deferred |
| TC-ID02 | [ESP32] Auth with invalid fingerprint ID | /api/v1/kiosk/identity/auth | Deferred |
| TC-ID03 | [ESP32] Auth for underage voter | /api/v1/kiosk/identity/auth | Deferred |
| TC-TK01 | [ESP32] Sign blind token | /api/v1/kiosk/token/sign | Deferred |
| TC-TK02 | [ESP32] Get RSA public key | /api/v1/kiosk/token/public-key | Deferred |
| TC-VC01 | [ESP32] Commit vote | /api/v1/kiosk/vote/commit | Deferred |
| TC-VC02 | [ESP32] Commit with invalid token | /api/v1/kiosk/vote/commit | Deferred |

---

## Running Tests

### Using Postman

1. Import `votiix-api.postman_collection.json` into Postman
2. Ensure Docker environment is running: `docker-compose up -d`
3. Wait for all services to be healthy
4. Run the collection using Postman Collection Runner
5. Export results as HTML for documentation

### Using Newman (CLI)

```bash
npm install -g newman newman-reporter-htmlextra

newman run votiix-api.postman_collection.json \
  --environment votiix-local.postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export test-results.html
```

---

## Test Environment

| Variable | Value | Description |
|----------|-------|-------------|
| base_url | http://localhost:8080 | KrakenD Gateway URL |
| election_id | (auto-populated) | Created during test run |
| contest_id | (auto-populated) | Created during test run |
| party_id | (auto-populated) | Created during test run |
| candidate_id | (auto-populated) | Created during test run |
