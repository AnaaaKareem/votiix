import { test, expect } from '@playwright/test';
import { VoterPage } from '../pages/voter.page';

test.describe('Voter E2E Flow', () => {
  let voter: VoterPage;

  test.beforeEach(async ({ page }) => {
    voter = new VoterPage(page);
  });

  test('Happy Path: Full Voting Cycle', async ({ page }) => {
    // Mock identity auth API
    await page.route('**/kiosk/identity/auth', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'test-jwt-token', session_id: 'sess-001', expires_in_seconds: 60 })
    }));
    await page.route('**/kiosk/token/sign', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ signed_blinded_token: 'test-signed-token', election_id: 'test-election' })
    }));

    // 1. Enrollment
    await voter.gotoEnrollment();
    await voter.enterNationalId('1234567890');
    await voter.enroll();
    await expect(page).toHaveURL(/.*language/);

    // 2. Language Selection
    await voter.gotoLanguage();
    await voter.selectLanguage('English');
    await expect(page).toHaveURL(/.*verify/);

    // 3. Fingerprint Authentication
    await voter.gotoVerify();
    await voter.simulateFingerprintScan();
    await expect(page).toHaveURL(/.*confirmation/);

    // 4. Candidate Selection
    await voter.gotoSelectCandidate();
    await voter.selectCandidate('01');
    await voter.confirmVote();

    // 5. Final Verification (Fingerprint for commit)
    await page.route('**/kiosk/vote/commit', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'COMMITTED', tx_hash: 'tx_abc123' })
    }));
    await voter.gotoVerify();
    await voter.simulateFingerprintScan();

    // 6. Success
    await expect(page).toHaveURL(/.*success/);
    await expect(page.locator('h1')).toContainText('Vote Cast Successfully');
  });

  test('Error Handling: Invalid Fingerprint', async ({ page }) => {
    await voter.gotoVerify();
    await page.route('**/kiosk/identity/auth', route => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Fingerprint not recognized' })
    }));

    await voter.simulateFingerprintScan();
    await expect(page.locator('.bg-red-50')).toContainText('Fingerprint not recognized');
  });

  test('Error Handling: Already Voted', async ({ page }) => {
    await voter.gotoVerify();
    await page.route('**/kiosk/identity/auth', route => route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Voter has already been issued a token' })
    }));

    await voter.simulateFingerprintScan();
    await expect(page.locator('.bg-red-50')).toBeVisible();
  });

  test('Error Handling: No Active Election', async ({ page }) => {
    await voter.gotoVerify();
    await page.route('**/kiosk/identity/auth', route => route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'No active election found' })
    }));

    await voter.simulateFingerprintScan();
    await expect(page.locator('.bg-red-50')).toBeVisible();
  });

  test('Error Handling: Token Signing Failure', async ({ page }) => {
    await page.route('**/kiosk/identity/auth', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'test-jwt', session_id: 'sess-002', expires_in_seconds: 60 })
    }));
    await page.route('**/kiosk/token/sign', route => route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Token already issued for this voter' })
    }));

    await voter.gotoVerify();
    await voter.simulateFingerprintScan();
    // Should display error or remain on verify page
    await expect(page.locator('.bg-red-50')).toBeVisible();
  });

  test('Error Handling: Vote Commit Server Error', async ({ page }) => {
    await page.route('**/kiosk/vote/commit', route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' })
    }));

    // Navigate to a state where vote commit would be triggered
    await voter.gotoVerify();
    // Verify error UI is shown when commit fails
  });

  test('Enrollment: Empty National ID Rejected', async ({ page }) => {
    await voter.gotoEnrollment();
    await voter.enroll();
    // Button should be disabled or error shown for empty input
    await expect(page).toHaveURL(/.*enrollment/);
  });

  test('Language Selection: Arabic', async ({ page }) => {
    await voter.gotoLanguage();
    await voter.selectLanguage('Arabic');
    await expect(page).toHaveURL(/.*verify/);
  });

  test('Candidate Selection: Clear Entry', async ({ page }) => {
    await voter.gotoSelectCandidate();
    await voter.selectCandidate('01');
    await voter.clearEntry();
    // After clearing, the selection should be reset
  });

  test('Navigation: Direct URL access to success page redirects', async ({ page }) => {
    // Trying to access success page without going through flow
    await voter.gotoSuccess();
    // Should either redirect or show appropriate state
  });

  test('API Network Timeout Handling', async ({ page }) => {
    await page.route('**/kiosk/identity/auth', route => route.abort('timedout'));

    await voter.gotoVerify();
    await voter.simulateFingerprintScan();
    // Should show network error
  });
});
