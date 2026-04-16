# Votiix Voter Interface

This application provides the front-end interface for voters to interact with the Votiix electronic voting system. It connects to the backend API to handle voter authentication, candidate selection, and vote casting.

## Features

- Biometric authentication via fingerprint scanning
- Dynamic candidate selection from live election data
- Secure vote casting with blockchain recording
- Receipt verification and confirmation screens

## Architecture

- **Frontend**: React-based single-page application
- **Backend**: Exposed via KrakenD gateway at `http://localhost:8080/api/v1`
- **Authentication**: JWT-based with biometric verification
- **State Management**: React hooks with localStorage for session management

## Key Flows

### Authentication Flow
1. User enters fingerprint at the enrollment/verification screen
2. Application sends fingerprint ID to `/kiosk/identity/auth` endpoint
3. JWT token received and stored in localStorage 
4. Token is signed via `/kiosk/token/sign` endpoint to prevent tampering
5. User proceeds to the voting booth

### Voting Flow
1. User selects candidate from dynamically loaded list at `/public/elections/active`
2. Upon confirmation, user verifies fingerprint again
3. Application commits vote via POST to `/kiosk/vote/commit` 
4. Transaction hash returned and stored for receipt verification
5. Results displayed on success screen with receipt hash

### Live Dashboard Polling
1. The live dashboard polls `/public/elections/{id}/results` every 5 seconds
2. Displays real-time vote tallies, percentages and turnout
3. Updates last refreshed timestamp automatically

## API Integration
All API requests go through the centralized config located at `src/config/api.js`:
- Interceptors add JWT tokens automatically 
- Response errors are handled with user-friendly messages
- Base URL is configured to connect to KrakenD gateway

## Components

- `VerificationFinger.jsx`: Handles biometric authentication and vote commitment
- `SelectCandidate.jsx`: Shows dynamic candidates from election endpoint  
- `SuccessfulVoting.jsx`: Displays vote confirmation and receipt hash
- `ConfirmationPage.jsx`: Shows voter identity verification success
- `config/api.js`: Centralized AXIOS configuration with interceptors