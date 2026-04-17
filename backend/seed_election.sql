-- =============================================================
-- VOTIIX — Election Seed Script
-- Creates one election, two parties, one contest, and candidates
-- Run against ballot_db:
--   psql -U votiix -d ballot_db -f seed_election.sql
-- =============================================================

BEGIN;

-- ---------------------------------------------------------------
-- 1. PARTIES
-- ---------------------------------------------------------------
INSERT INTO party (id, name, short_code, logo_url)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'National Progress Party',  'NPP', NULL),
  ('a1000000-0000-0000-0000-000000000002', 'United Democratic Front',  'UDF', NULL),
  ('a1000000-0000-0000-0000-000000000003', 'Green Future Alliance',    'GFA', NULL)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 2. ELECTION  (status = Draft — transition to Active via API)
-- ---------------------------------------------------------------
INSERT INTO election (id, title, start_date, end_date, status, rsa_public_key, rsa_private_key)
VALUES (
  'e1000000-0000-0000-0000-000000000001',
  'General Election 2026',
  NOW(),
  NOW() + INTERVAL '7 days',
  'Active',
  -- Demo RSA-2048 public key (replace with real key pair in production)
  '-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xHn/ygWep4
9ZO7psMqeWBNS1NCwREWQBWFETBw8MAqpYjhpN1WW0v1+scYl/2jWgZJb9eR8Dqsf
demo-key-replace-in-production
-----END PUBLIC KEY-----',
  '-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Z3VS5JJcds3xHn/ygWep49ZO7psMqeWBNS1NCwREWQBWFET
demo-key-replace-in-production
-----END RSA PRIVATE KEY-----'
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 3. CONTEST  (Presidential Race)
-- ---------------------------------------------------------------
INSERT INTO contest (id, election_id, office_title, seats_available)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'e1000000-0000-0000-0000-000000000001',
  'President of the Republic',
  1
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 4. CANDIDATES
-- ---------------------------------------------------------------
INSERT INTO candidate (id, contest_id, party_id, name, photo_url, list_position)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',  -- NPP
    'Ahmed Al-Rashid',
    NULL,
    1
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000002',  -- UDF
    'Fatima Benali',
    NULL,
    2
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000003',  -- GFA
    'Omar Khalil',
    NULL,
    3
  ),
  (
    'b1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000001',
    NULL,                                     -- Independent
    'Layla Hassan',
    NULL,
    4
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 5. TALLY RESULT stubs (initialized to 0 — updated by tally API)
-- ---------------------------------------------------------------
INSERT INTO tally_result (id, contest_id, candidate_id, vote_count, status)
VALUES
  (gen_random_uuid(), 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 0, 'Provisional'),
  (gen_random_uuid(), 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 0, 'Provisional'),
  (gen_random_uuid(), 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 0, 'Provisional'),
  (gen_random_uuid(), 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 0, 'Provisional')
ON CONFLICT (candidate_id) DO NOTHING;

-- ---------------------------------------------------------------
-- 6. POLLING STATION + TERMINAL (for vote simulation)
-- ---------------------------------------------------------------
INSERT INTO polling_station (id, name, address, terminal_capacity)
VALUES (
  'f1000000-0000-0000-0000-000000000001',
  'Central Polling Station',
  '1 Democracy Square, Capital City',
  10
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO terminal (hardware_id, is_active, status, assigned_station_id, firmware_version)
VALUES (
  'esp32-sim-01',
  TRUE,
  'Online',
  'f1000000-0000-0000-0000-000000000001',
  '1.0.0'
)
ON CONFLICT (hardware_id) DO NOTHING;

COMMIT;

-- Summary of what was seeded:
-- Election  : General Election 2026  (ID: e1000000-...)
-- Contest   : President of the Republic (ID: c1000000-...)
-- Candidates: Ahmed Al-Rashid (NPP), Fatima Benali (UDF), Omar Khalil (GFA), Layla Hassan (Independent)
-- Station   : Central Polling Station (ID: f1000000-...)
-- Terminal  : esp32-sim-01
