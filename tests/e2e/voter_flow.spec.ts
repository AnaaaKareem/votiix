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
      body: JSON.stringify({ token: 'test-jwt-token' })
    }));
    await page.route('**/kiosk/token/sign', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'test-signed-token' })
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
      body: JSON.stringify({ tx_hash: 'tx_abc123' })
    }));
    await voter.gotoVerify();
    await voter.simulateFingerprintScan();

    // 6. Success
    await expect(page).toHaveURL(/.*success/);
    await expect(page.locator('h1')).toContainText('Vote Cast Successfully');
  });

  test('Error Handling: Invalid Fingerprint', async ({ page }) => {
    await voter.gotoVerify();
    // Mock failure by setting up a way to fail or just asserting error handling if code allows
    // In a real test environment, we would intercept the API call
    await page.route('**/kiosk/identity/auth', route => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Fingerprint not recognized' })
    }));

    await voter.simulateFingerprintScan();
    await expect(page.locator('.bg-red-50')).toContainText('Fingerprint not recognized');
  });
});
