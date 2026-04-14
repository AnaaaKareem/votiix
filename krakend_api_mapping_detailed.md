# Votiix API Architecture: KrakenD Endpoint Mapping

This document provides a highly detailed mapping of system functionality to the exact API endpoints exposed via the KrakenD Gateway (Port `8080`).

---

## 🔐 1. Identity & Authentication (The "Check-In" Phase)

### `POST /api/v1/kiosk/identity/auth`
*   **Functionality:** Authenticates a voter via their ESP32 fingerprint slot ID and validates their age.
*   **Internal Route:** `http://votiix-identity:3000/identity/auth-session`
*   **Input (JSON):** 
    ```json
    {
      "fingerprint_id": 42,
      "terminal_id": "esp32-terminal-01"
    }
    ```
*   **Logic:**
    1.  Queries the **MOSIP Mock Database** for the citizen JSON associated with slot `42`.
    2.  Parses `dob` and verifies age is **strictly >= 18**.
    3.  Checks the Votiix **Voter Registry** to ensure the user hasn't voted yet for the active election.
*   **Success Response:** Returns a 1-minute scoped JWT.

---

## 🗳️ 2. Privacy & Tokenization (The "Anonymization" Phase)

### `POST /api/v1/kiosk/token/sign`
*   **Functionality:** Exchanges the PII-linked Auth JWT for a cryptographically blinded voting token.
*   **Internal Route:** `http://votiix-token:3001/token/sign`
*   **Auth Required:** `Bearer <Auth_JWT>`
*   **Input (JSON):** 
    ```json
    {
      "blinded_payload": "Base64_Encoded_Blinded_Blob",
      "terminal_id": "esp32-terminal-01"
    }
    ```
*   **Logic:** The system signs the blinded blob using the election's RSA private key. This ensures the ballot cannot be linked back to the UIN/Identity once unblinded by the Kiosk.

---

## 📝 3. Voting & Commitment (The "Ballot" Phase)

### `POST /api/v1/kiosk/vote/commit`
*   **Functionality:** Submits the final anonymous ballot choices.
*   **Internal Route:** `http://votiix-vote-engine:3002/kiosk/vote/commit`
*   **Input (JSON):** 
    ```json
    {
      "contest_id": "uuid",
      "selections": ["candidate-uuid-1", "candidate-uuid-2"],
      "blind_token": "Unblinded_Value",
      "blind_token_signature": "RSA_Signature",
      "terminal_id": "esp32-terminal-01"
    }
    ```
*   **Logic:** Verifies the RSA signature on the token. If valid, writes choice to the **VotePackage** (anonymous table) and burns the token.

---

## 📱 4. Proof of Vote (The "Receipt" Phase)

### `POST /api/v1/kiosk/messenger/whatsapp`
*   **Functionality:** Sends an end-to-end encrypted voting receipt to the user's phone.
*   **Internal Route:** `http://votiix-messenger:3006/messenger/whatsapp`
*   **Input (JSON):** 
    ```json
    {
      "phone_number": "201XXXXXXXXX",
      "tx_hash": "SHA256_Transaction_Hash",
      "election_id": "uuid"
    }
    ```
*   **Logic:** Uses the **open-source `whatsapp-web.js`** client to send a formatted WhatsApp message with the transaction hash for verifiable proof.

---

## ⚙️ 5. IoT & Hardware Management

### `POST /api/v1/kiosk/iot/heartbeat`
*   **Functionality:** Keeps the physical terminal status alive in the dashboard.
*   **Internal Route:** `http://votiix-iot:3004/iot/heartbeat`
*   **Input (JSON):** 
    ```json
    {
      "hardware_id": "esp32-terminal-01",
      "status": "Online",
      "firmware_version": "2.4.0"
    }
    ```

### `GET /api/v1/admin/terminals`
*   **Functionality:** Lists all terminals and their current health/connectivity status.
*   **Internal Route:** `http://votiix-iot:3004/iot/terminals`

---

## 📊 6. Administration & Results

### `GET /api/v1/public/elections/{id}/results`
*   **Functionality:** Fetches live tallies for a specifically selected election.
*   **Internal Route:** `http://votiix-core:3003/elections/{id}/results`

### `POST /api/v1/admin/elections`
*   **Functionality:** Creates a new election and generates the RSA keypair.
*   **Internal Route:** `http://votiix-core:3003/elections`

### `POST /api/v1/admin/elections/{id}/transition`
*   **Functionality:** Moves election from `Draft` -> `Active` (Open Polls) -> `Archived` (Closed).
*   **Internal Route:** `http://votiix-core:3003/elections/{id}/transition`

### `POST /api/v1/admin/elections/{id}/purge`
*   **Functionality:** Triggers the privacy-preservation routine to destroy PII for archived elections.
*   **Internal Route:** `http://votiix-core:3003/elections/{id}/purge`

---

## 🕵️ 7. Audit & Transparency

### `GET /api/v1/admin/audit/logs`
*   **Functionality:** Streams the immutable MongoDB audit ledger.
*   **Internal Route:** `http://votiix-observer:3005/audit/logs`
