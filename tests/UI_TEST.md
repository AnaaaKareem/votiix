# Votiix UI Test Documentation

Comprehensive UI test cases for all Votiix frontend applications: Voter Interface, Live Dashboard, and Admin Dashboard.

---

## Test Summary

| Category | Tests | Status |
|----------|-------|--------|
| Voter: Enrollment Page | 5 | Ready |
| Voter: Select Language | 5 | Ready |
| Voter: Fingerprint Verification | 8 | Ready |
| Voter: Confirmation Page | 5 | Ready |
| Voter: Select Candidate | 8 | Ready |
| Voter: Candidate Confirmation | 5 | Ready |
| Voter: Successful Voting | 6 | Ready |
| Voter: Full E2E Flow | 5 | Ready |
| Live Dashboard | 8 | Ready |
| Admin: Elections List | 6 | Ready |
| Admin: Create Election | 7 | Ready |
| Admin: Asset Management | 6 | Ready |
| Admin: Results | 5 | Ready |
| Admin: Audit Trail | 6 | Ready |
| Admin: Security/Purge | 6 | Ready |
| Responsive/Layout | 6 | Ready |
| Accessibility | 5 | Ready |
| **Total** | **102** | **Ready** |

---

## 1. Voter Interface - Enrollment Page

**Route:** `/enrollment` | **File:** `EnrollmentPage.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-EN01 | Page renders correctly | Navigate to /enrollment | Header with Votiix logo, fingerprint animation, national ID input, "Enroll Fingerprint" button | Pending |
| UI-EN02 | National ID input accepts text | Type "1234567890" in input field | Input displays typed value | Pending |
| UI-EN03 | Enroll button navigates to language selection | Click "Enroll Fingerprint" button | Navigation to /language | Pending |
| UI-EN04 | Empty national ID submission | Click "Enroll Fingerprint" without entering ID | Navigation still occurs (no validation) | Pending |
| UI-EN05 | Fingerprint animation visible | Observe animated circles on page | Pulsing border animations visible, fingerprint icon centered | Pending |

---

## 2. Voter Interface - Select Language

**Route:** `/language` | **File:** `SelectLanguage.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-SL01 | Both language buttons render | Navigate to /language | English (UK flag) and Arabic (Saudi flag) buttons visible | Pending |
| UI-SL02 | English button navigates to verify | Click English button | Navigation to /verify | Pending |
| UI-SL03 | Arabic button navigates to verify | Click Arabic button | Navigation to /verify | Pending |
| UI-SL04 | Bilingual text displayed | Check page content | "Welcome. Select Language" and "مرحباً. اختر اللغة" both visible | Pending |
| UI-SL05 | Footer security badges render | Scroll to footer | "Secure Biometric Encryption" and "Certified Voting Terminal" visible | Pending |

---

## 3. Voter Interface - Fingerprint Verification

**Route:** `/verify` | **File:** `VerificationFinger.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-VF01 | Scan circle renders with idle state | Navigate to /verify | Fingerprint icon inside blue circle, "Waiting for scan" badge | Pending |
| UI-VF02 | Click fingerprint circle triggers scan | Click fingerprint circle | Loading spinner replaces icon, badge changes to "Scanning..." | Pending |
| UI-VF03 | Successful scan navigates to confirmation | Click circle (mock API success) | Navigation to /confirmation | Pending |
| UI-VF04 | Failed scan shows error message | Click circle (mock API 401) | Red error banner: "Fingerprint not recognized. Try again." | Pending |
| UI-VF05 | Max 3 retries enforced | Fail scan 3 times | Error displayed, retry counter resets after timeout | Pending |
| UI-VF06 | Pending vote flow triggers commit | Navigate from candidate selection with stored pending vote | After successful auth, vote commit called, navigates to /success | Pending |
| UI-VF07 | Already voted error displayed | Mock API 403 response | Error: "Already voted or election not active." | Pending |
| UI-VF08 | Network error handled gracefully | Disconnect network, click circle | Error: "Network error - retrying..." displayed | Pending |

---

## 4. Voter Interface - Confirmation Page

**Route:** `/confirmation` | **File:** `ConfirmationPage.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-CP01 | Identity verified display renders | Navigate to /confirmation | Green check icon, "Identity Verified" badge, "Access Granted" heading | Pending |
| UI-CP02 | Voter profile card displays | Check profile section | Voter avatar, name "Alexander J. Sterling", Voter ID, District 12, Eligible badges | Pending |
| UI-CP03 | Proceed to Voting button navigates | Click "Proceed to Voting" | Navigation to /select-candidate | Pending |
| UI-CP04 | Biometric tunnel footer visible | Check footer | "End-to-end encrypted biometric tunnel active" with lock icon | Pending |
| UI-CP05 | Green success indicators | Check all success elements | Green check badge, green circle border, green accent colors | Pending |

---

## 5. Voter Interface - Select Candidate

**Route:** `/select-candidate` | **File:** `SelectCandidate.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-SC01 | Candidate registry loads from API | Navigate to /select-candidate (mock API) | Candidate cards populate from /public/elections/active response | Pending |
| UI-SC02 | Loading state displayed | Navigate while API pending | Loading spinner visible in candidate area | Pending |
| UI-SC03 | Fallback candidates on API failure | Navigate with API returning error | Hardcoded fallback candidates displayed | Pending |
| UI-SC04 | Code input accepts numeric input | Type "01" in input field | Input displays "01" | Pending |
| UI-SC05 | Clicking candidate card fills code | Click a candidate card | Candidate code fills input, card gets highlighted border | Pending |
| UI-SC06 | Confirm Vote button disabled without selection | Observe button with empty code | Button appears disabled/greyed | Pending |
| UI-SC07 | Confirm Vote navigates to verify | Enter code, click "Confirm Vote" | Navigation to /verify, pending_vote_candidate stored in localStorage | Pending |
| UI-SC08 | Clear Entry resets input | Type code, click "Clear Entry" | Input cleared, selection reset | Pending |

---

## 6. Voter Interface - Candidate Confirmation

**Route:** `/candidate-confirmation` | **File:** `CandidateConfirmation.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-CC01 | Candidate info displays | Navigate to /candidate-confirmation | Candidate photo, name "John Doe", party "National Party" visible | Pending |
| UI-CC02 | Submit Vote button present | Check action buttons | Green "SUBMIT VOTE" button with hash icon | Pending |
| UI-CC03 | Submit Vote navigates to success | Click "SUBMIT VOTE" | Navigation to /success | Pending |
| UI-CC04 | Return button navigates back | Click "RETURN" button | Navigation to /select-candidate | Pending |
| UI-CC05 | Verification badge displays | Check candidate details | Green "Candidate Verified" badge with shield icon | Pending |

---

## 7. Voter Interface - Successful Voting

**Route:** `/success` | **File:** `SuccessfulVoting.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-SV01 | Success state renders | Navigate to /success | Green check icon, "Vote Cast Successfully." heading | Pending |
| UI-SV02 | Receipt hash displayed | Complete vote with tx_hash in localStorage | Receipt hash shown in gray box | Pending |
| UI-SV03 | Receipt fetch from API | Mock GET /public/elections/{id}/vote/{tx_hash} | Receipt details loaded and displayed | Pending |
| UI-SV04 | Loading state during receipt fetch | Observe initial load | "Verifying receipt details..." text | Pending |
| UI-SV05 | Return to Language Selection | Click return button | Navigation to /language | Pending |
| UI-SV06 | Auto-close timer displayed | Check footer | "This session will automatically close in 2:00 minutes" visible | Pending |

---

## 8. Voter Interface - Full End-to-End Flow

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-E2E01 | Complete voting flow (happy path) | Enrollment → Language → Verify → Confirm → Select → Verify → Success | Full navigation chain completes, receipt hash stored | Pending |
| UI-E2E02 | Back navigation works | Navigate forward, then browser back | Previous page renders correctly, state preserved | Pending |
| UI-E2E03 | JWT stored after authentication | Complete fingerprint scan | JWT token exists in localStorage | Pending |
| UI-E2E04 | Pending vote cleaned after commit | Complete full flow | localStorage pending_vote_candidate removed after success | Pending |
| UI-E2E05 | Session state isolated | Complete flow, start new session | No residual state from previous voter | Pending |

---

## 9. Live Dashboard

**File:** `ViewerLive.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-LD01 | Dashboard renders with fallback data | Load page without backend | Fallback candidates (Sterling, Rodriguez, Thorne) displayed | Pending |
| UI-LD02 | Polling interval set to 5 seconds | Observe network requests | GET requests to /public/elections/{id}/results every 5s | Pending |
| UI-LD03 | Error banner on API failure | Simulate backend down | Red error banner: "Error loading data..." | Pending |
| UI-LD04 | Manual refresh button works | Click refresh button | fetchData() called, results update | Pending |
| UI-LD05 | Last Updated timestamp refreshes | Wait for polling cycle | Timestamp updates to current time | Pending |
| UI-LD06 | Precincts reporting bar dynamic | Receive API data with precincts_reporting | Progress bar width matches percentage | Pending |
| UI-LD07 | Candidate percentages update | Receive API data with new percentages | Candidate card percentages reflect new data | Pending |
| UI-LD08 | Status indicator changes | Trigger error then recovery | Status dot: orange (error) → green (secure processing) | Pending |

---

## 10. Admin Dashboard - Elections List

**Route:** `/` | **File:** `Elections.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-AE01 | Elections table renders | Navigate to admin root | Table with columns: Title, Start Date, End Date, Status, Actions | Pending |
| UI-AE02 | Stats cards display counts | Check top section | ACTIVE: 12, REGISTRATION: 08, TALLYING: 03, TOTAL: 142 | Pending |
| UI-AE03 | Tab filtering | Click "Active" tab | Tab highlighted with underline, filter applied | Pending |
| UI-AE04 | Create New Election navigation | Click "Create New Election" button | Navigation to /create-election | Pending |
| UI-AE05 | Pagination controls render | Check table footer | Page numbers, prev/next arrows, "Showing 6 of 142" | Pending |
| UI-AE06 | Status badges correct colors | Check each election row | Active=green, Registration=blue, Draft=grey, Closed=amber, Archived=dark | Pending |

---

## 11. Admin Dashboard - Create Election

**Route:** `/create-election` | **File:** `CreateElection.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-ACE01 | Form sections render | Navigate to /create-election | Section A: Election Details, Section B: Geography visible | Pending |
| UI-ACE02 | Election title input accepts text | Type in "Election Title" field | Text displayed in input | Pending |
| UI-ACE03 | Date fields have calendar icons | Check date inputs | Calendar icon positioned inside input | Pending |
| UI-ACE04 | Mobile voting toggle visible | Check toggle switch | "Enable Mobile Voting" with toggle control | Pending |
| UI-ACE05 | Archive policy section renders | Scroll down | PII Purge Timeline input, Biometric Wipe toggle | Pending |
| UI-ACE06 | Geography hierarchy displays | Check Section B | National → Provinces → Wards tree structure | Pending |
| UI-ACE07 | File upload area present | Check CSV/JSON import | Dashed border upload zone with "Upload File" button | Pending |

---

## 12. Admin Dashboard - Asset Management

**Route:** `/assets` | **File:** `Assets.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-AA01 | Add Candidate form renders | Navigate to /assets | Full Name input, Party Affiliation select, Candidate Code input | Pending |
| UI-AA02 | Toast notification displays | Load page (default showToast=true) | Green toast: "Candidate Alex Morgan added successfully!" | Pending |
| UI-AA03 | Toast dismiss on click X | Click X on toast | Toast disappears | Pending |
| UI-AA04 | Party dropdown has options | Click Party Affiliation select | Options: Select Party, Progressive Party, Unity Alliance | Pending |
| UI-AA05 | Portrait upload area renders | Check upload section | Drag & drop zone with "JPG, PNG UP TO 5MB" text | Pending |
| UI-AA06 | Add Candidate button present | Check form bottom | "Add Candidate" button with UserPlus icon | Pending |

---

## 13. Admin Dashboard - Results

**Route:** `/results` | **File:** `Results.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-AR01 | Results table renders | Navigate to /results | Table: Contest, Candidate, Votes, Weighted Votes, % | Pending |
| UI-AR02 | Stations reporting progress bar | Check top section | Progress bar at 81.6%, "245 / 300 stations completed" | Pending |
| UI-AR03 | Certify Results button present | Check certification section | Blue "Certify Results" button in green info banner | Pending |
| UI-AR04 | Live Update indicator | Check table header | Green pulsing dot with "Live Update" badge | Pending |
| UI-AR05 | Download report link | Check bottom | "Download Detailed Report" link with Download icon | Pending |

---

## 14. Admin Dashboard - Audit Trail

**Route:** `/audit` | **File:** `Audit.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-AAU01 | Audit log table renders | Navigate to /audit | Table: Timestamp, Actor, Action, Details, Status | Pending |
| UI-AAU02 | Filter controls present | Check filter bar | Date range input, Actor select, Action Type select, Apply/Reset buttons | Pending |
| UI-AAU03 | Action type badges color-coded | Check each row | MODIFY=accent, CREATE=accent, SYNC=neutral, SECURITY=error, EXPORT=warning | Pending |
| UI-AAU04 | Pagination works | Check table footer | "Showing 1 to 5 of 1,248 results", page numbers | Pending |
| UI-AAU05 | Status indicators correct | Check status column | Green dot for Success, red dot for Blocked | Pending |
| UI-AAU06 | Apply Filters button triggers filter | Click "Apply Filters" | Filter request sent (currently static data) | Pending |

---

## 15. Admin Dashboard - Security/Purge

**Route:** `/security` | **File:** `Security.jsx`

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-AS01 | Danger zone banner renders | Navigate to /security | Red warning banner with AlertTriangle icon, "This action is irreversible." | Pending |
| UI-AS02 | Retention policy details displayed | Check policy section | Records Targeted, Data Range, Storage Size, Compliance Standard | Pending |
| UI-AS03 | ARCHIVE confirmation input | Check Wipe Verification | Input with "ARCHIVE" placeholder, centered mono font | Pending |
| UI-AS04 | Execute Purge button present | Check bottom of form | Red "Execute Purge" button with Trash2 icon | Pending |
| UI-AS05 | Admin protocol checklist | Check sidebar | Security Clearance: checked, MFA Token: checked, Execution: pending | Pending |
| UI-AS06 | Related actions buttons | Check sidebar | Export Metadata, View Retention Logs, Modify Policy Rules | Pending |

---

## 16. Responsive & Layout Tests

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-RL01 | Voter interface mobile layout | Resize to 375px width | Single-column layout, buttons stack vertically | Pending |
| UI-RL02 | Admin dashboard responsive grid | Resize to 768px width | Grid adapts from multi-column to single column | Pending |
| UI-RL03 | Admin sidebar navigation | Click sidebar links | Navigation to correct routes, active state highlighted | Pending |
| UI-RL04 | Live dashboard grid reflow | Resize browser | 3-column → 1-column grid adaptation | Pending |
| UI-RL05 | Candidate confirmation mobile view | Resize to mobile | Photo and details stack vertically | Pending |
| UI-RL06 | Table horizontal scroll | View tables on mobile | Horizontal scroll enabled for data tables | Pending |

---

## 17. Accessibility Tests

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-AX01 | Keyboard navigation - voter flow | Tab through voter pages | All interactive elements focusable, logical tab order | Pending |
| UI-AX02 | Color contrast verification | Check all text elements | WCAG AA minimum contrast ratio (4.5:1 for normal text) | Pending |
| UI-AX03 | Image alt text present | Check all images | Alt attributes defined on flag images, voter avatar, fingerprint icon | Pending |
| UI-AX04 | Form labels associated | Check all form inputs | Labels linked to inputs via htmlFor/id or wrapping | Pending |
| UI-AX05 | Focus indicators visible | Tab to interactive elements | Visible focus ring/outlines on buttons and inputs | Pending |

---

## 18. Error Handling & Edge Cases

| Test ID | Description | Action | Expected Result | Status |
|---------|-------------|--------|-----------------|--------|
| UI-ERR01 | API interceptor error messages | Trigger 400/401/403/404/500 errors | User-friendly error.userMessage attached to error object | Pending |
| UI-ERR02 | JWT auto-attached to requests | Make authenticated request | Authorization: Bearer header present | Pending |
| UI-ERR03 | Network timeout handled | Set slow API response (>10s) | Request times out, error displayed | Pending |
| UI-ERR04 | Direct URL access without auth | Navigate to /select-candidate directly | Page loads (auth not enforced at frontend level) | Pending |
| UI-ERR05 | Stale JWT token handling | Use expired JWT in request | 401 response, error message displayed | Pending |

---

## Test Environment Setup

### Prerequisites
```bash
# Backend
cd backend/API\ Server && docker-compose up -d

# Voter Interface
cd frontend/voters_interface && npm install && npm run dev

# Admin Dashboard
cd frontend/admin_dashboard && npm install && npm run dev

# Live Dashboard (integrated with main frontend or standalone)
```

### Running Tests

#### Manual Testing
Follow each test case above, performing actions and verifying expected results.

#### Cypress (Recommended)
```bash
npm install -D cypress @testing-library/cypress
npx cypress open
```

#### Playwright Alternative
```bash
npm install -D @playwright/test
npx playwright test
```

### Environment Variables
| Variable | Value | Description |
|----------|-------|-------------|
| VITE_API_BASE | http://localhost:8080/api/v1 | Backend API base URL |
| VOTER_URL | http://localhost:5173 | Voter interface dev server |
| ADMIN_URL | http://localhost:5174 | Admin dashboard dev server |

---

## Route Map

### Voter Interface
| Route | Component | Description |
|-------|-----------|-------------|
| / | Redirect | → /enrollment |
| /enrollment | EnrollmentPage | Fingerprint enrollment |
| /language | SelectLanguage | Language selection |
| /verify | VerificationFinger | Fingerprint authentication |
| /confirmation | ConfirmationPage | Identity verified |
| /select-candidate | SelectCandidate | Candidate selection |
| /candidate-confirmation | CandidateConfirmation | Vote review |
| /success | SuccessfulVoting | Vote confirmed |

### Admin Dashboard
| Route | Component | Description |
|-------|-----------|-------------|
| / | Elections | Election lifecycle manager |
| /create-election | CreateElection | New election form |
| /assets | Assets | Candidate/party CMS |
| /results | Results | Tally & certification |
| /audit | Audit | System audit trail |
| /security | Security | Data purge controls |

---

Generated: 2026-04-16
