#!/usr/bin/env python3
"""
VOTIIX — Live Vote Simulator
Generates realistic vote packages directly into ballot_db using Faker.
Bypasses blind-signature crypto (for testing/demo only).

Requirements:
    pip install faker psycopg2-binary requests

Usage:
    # Direct DB mode (fastest, no API needed):
    python simulate_votes.py --mode db --votes 100 --delay 0.5

    # API mode (goes through live endpoint — requires services running):
    python simulate_votes.py --mode api --votes 50 --delay 1.0
"""

import argparse
import hashlib
import json
import random
import time
import uuid
from datetime import datetime, timezone

import psycopg2
import requests
from faker import Faker

# ─── Configuration ────────────────────────────────────────────────────────────

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "ballot_db",
    "user": "votiix",
    "password": "votiix_password",
}

API_BASE_URL = "http://localhost:8080/api/v1"

# IDs that match seed_election.sql — update if you used different UUIDs
ELECTION_ID  = "e1000000-0000-0000-0000-000000000001"
CONTEST_ID   = "c1000000-0000-0000-0000-000000000001"
STATION_ID   = "f1000000-0000-0000-0000-000000000001"
TERMINAL_ID  = "esp32-sim-01"
CANDIDATE_IDS = [
    "b1000000-0000-0000-0000-000000000001",  # Ahmed Al-Rashid (NPP)
    "b1000000-0000-0000-0000-000000000002",  # Fatima Benali (UDF)
    "b1000000-0000-0000-0000-000000000003",  # Omar Khalil (GFA)
    "b1000000-0000-0000-0000-000000000004",  # Layla Hassan (Independent)
]

# Weighted distribution: NPP 40%, UDF 35%, GFA 15%, Independent 10%
CANDIDATE_WEIGHTS = [40, 35, 15, 10]

fake = Faker()

# ─── Helpers ──────────────────────────────────────────────────────────────────

def sha256(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def pick_candidate() -> str:
    return random.choices(CANDIDATE_IDS, weights=CANDIDATE_WEIGHTS, k=1)[0]


def generate_tx_hash(token: str, contest_id: str) -> str:
    ts = datetime.now(timezone.utc).isoformat()
    return sha256(f"{token}:{ts}:{contest_id}")


# ─── DB Mode ──────────────────────────────────────────────────────────────────

def simulate_db(num_votes: int, delay: float) -> None:
    """Insert VotePackage rows directly into PostgreSQL (bypasses API/crypto)."""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    print(f"[DB] Connected to ballot_db. Simulating {num_votes} votes…\n")

    for i in range(1, num_votes + 1):
        candidate_id = pick_candidate()
        fake_token    = fake.sha256()
        token_hash    = sha256(fake_token)
        tx_hash       = generate_tx_hash(fake_token, CONTEST_ID)
        now           = datetime.now(timezone.utc)
        vote_id       = str(uuid.uuid4())

        try:
            # Insert a BlindToken stub
            cur.execute(
                """
                INSERT INTO blind_token (token_hash, election_id, is_used, issued_at, used_at)
                VALUES (%s, %s, TRUE, %s, %s)
                ON CONFLICT (token_hash) DO NOTHING
                """,
                (token_hash, ELECTION_ID, now, now),
            )

            # Insert the VotePackage
            cur.execute(
                """
                INSERT INTO vote_package
                  (id, contest_id, polling_station_id, selections, blind_token_hash, tx_hash, timestamp)
                VALUES (%s, %s, %s, %s::jsonb, %s, %s, %s)
                """,
                (
                    vote_id,
                    CONTEST_ID,
                    STATION_ID,
                    json.dumps([candidate_id]),
                    token_hash,
                    tx_hash,
                    now,
                ),
            )
            conn.commit()

            # Resolve display name
            cand_name = {
                "b1000000-0000-0000-0000-000000000001": "Ahmed Al-Rashid",
                "b1000000-0000-0000-0000-000000000002": "Fatima Benali",
                "b1000000-0000-0000-0000-000000000003": "Omar Khalil",
                "b1000000-0000-0000-0000-000000000004": "Layla Hassan",
            }.get(candidate_id, candidate_id)

            print(f"[{i:>4}/{num_votes}] ✓  Vote committed → {cand_name}  tx:{tx_hash[:16]}…")

        except Exception as e:
            conn.rollback()
            print(f"[{i:>4}/{num_votes}] ✗  Error: {e}")

        if delay > 0:
            time.sleep(delay)

    cur.close()
    conn.close()
    print("\n[DB] Done. Run POST /api/v1/admin/elections/{id}/tally to compute TallyResult.")


# ─── API Mode ─────────────────────────────────────────────────────────────────

def simulate_api(num_votes: int, delay: float) -> None:
    """
    Simulates votes via the public committed-votes endpoint (read-only check)
    and directly posts VotePackage data to the vote commit endpoint.

    NOTE: Full blind-signature flow requires the ESP32 crypto handshake.
    This mode calls the internal vote-engine endpoint bypassing KrakenD
    for demo purposes — set INTERNAL_VOTE_URL to votiix-vote-engine:3002
    if running inside Docker.
    """
    INTERNAL_VOTE_URL = "http://localhost:3002/kiosk/vote/commit"

    print(f"[API] Targeting {INTERNAL_VOTE_URL}")
    print(f"[API] Simulating {num_votes} votes…\n")

    for i in range(1, num_votes + 1):
        candidate_id = pick_candidate()
        fake_token   = fake.sha256()
        # NOTE: signature won't pass RSA verification — use DB mode for valid inserts
        fake_sig     = fake.sha256()

        payload = {
            "contest_id":            CONTEST_ID,
            "selections":            [candidate_id],
            "blind_token":           fake_token,
            "blind_token_signature": fake_sig,
            "terminal_id":           TERMINAL_ID,
        }

        try:
            r = requests.post(INTERNAL_VOTE_URL, json=payload, timeout=5)
            status = "✓" if r.status_code == 200 else "✗"
            print(f"[{i:>4}/{num_votes}] {status}  HTTP {r.status_code}  {r.text[:80]}")
        except requests.exceptions.ConnectionError:
            print(f"[{i:>4}/{num_votes}] ✗  Connection refused — are services running?")

        if delay > 0:
            time.sleep(delay)

    print("\n[API] Done.")


# ─── Stats ────────────────────────────────────────────────────────────────────

def print_stats() -> None:
    """Print live results by calling the public results API."""
    url = f"{API_BASE_URL}/public/elections/{ELECTION_ID}/results"
    try:
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            data = r.json()
            print(f"\n{'─'*55}")
            print(f"  Live Results — {data.get('election_title', 'Election')}")
            print(f"  Status : {data.get('status')}   Total Votes : {data.get('total_committed_votes', 0)}")
            print(f"{'─'*55}")
            for contest in data.get("contests", []):
                print(f"\n  {contest['office_title']}")
                for cand in contest.get("candidates", []):
                    bar_len = int(cand["vote_count"] / max(1, data.get("total_committed_votes", 1)) * 30)
                    bar = "█" * bar_len
                    print(f"    {cand['name']:<22} {bar:<30}  {cand['vote_count']:>5}")
            print(f"{'─'*55}\n")
        else:
            print(f"[stats] HTTP {r.status_code}: {r.text}")
    except requests.exceptions.ConnectionError:
        print("[stats] Could not reach API — results not available")


# ─── Entry Point ──────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Votiix Live Vote Simulator")
    parser.add_argument("--mode",   choices=["db", "api"], default="db",
                        help="db = direct DB insert (default), api = call vote-engine")
    parser.add_argument("--votes",  type=int, default=50,
                        help="Number of votes to generate (default: 50)")
    parser.add_argument("--delay",  type=float, default=0.3,
                        help="Seconds between votes (default: 0.3)")
    parser.add_argument("--stats",  action="store_true",
                        help="Print live results after simulation")
    args = parser.parse_args()

    print("=" * 55)
    print("  VOTIIX Vote Simulator")
    print(f"  Mode  : {args.mode.upper()}")
    print(f"  Votes : {args.votes}   Delay: {args.delay}s")
    print("=" * 55 + "\n")

    if args.mode == "db":
        simulate_db(args.votes, args.delay)
    else:
        simulate_api(args.votes, args.delay)

    if args.stats:
        print_stats()


if __name__ == "__main__":
    main()
