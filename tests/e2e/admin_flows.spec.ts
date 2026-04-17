import { test, expect } from '@playwright/test';
import { AdminPage } from '../pages/admin.page';

test.describe('Admin Dashboard Flows', () => {
  let admin: AdminPage;

  test.use({ baseURL: 'http://localhost:5174' });

  test.beforeEach(async ({ page }) => {
    admin = new AdminPage(page);
  });

  test('Manage Elections Lifecycle', async ({ page }) => {
    await admin.gotoElections();
    await expect(page.locator('h1')).toContainText('Elections Lifecycle Manager');

    // Create new election
    await admin.gotoCreateElection();
    await admin.createElection('Test Election 2025');
    await expect(page).toHaveURL(/.*elections/);
  });

  test('Asset Management - Add Candidate', async ({ page }) => {
    await admin.gotoAssets();
    await admin.addCandidate('John Doe', 'Democratic Party');
    await expect(page.locator('.bg-emerald-500')).toContainText('Candidate John Doe added successfully!');
  });

  test('Security - Purge Data', async ({ page }) => {
    await admin.gotoSecurity();
    await admin.performPurge('ARCHIVE');
    // Verification depends on implementation
  });

  test('Security - Purge Rejected Without Confirmation', async ({ page }) => {
    await admin.gotoSecurity();
    await admin.performPurge('wrong');
    // Should show error that ARCHIVE confirmation is required
  });

  test('View Audit Logs', async ({ page }) => {
    await admin.gotoAudit();
    await expect(page).toHaveURL(/.*audit/);
  });

  test('Search Audit Logs', async ({ page }) => {
    await admin.gotoAudit();
    await admin.searchAudit('ELECTION_STATUS_CHANGE');
    // Should filter results
  });

  test('View Results Dashboard', async ({ page }) => {
    await admin.gotoResults();
    await expect(page).toHaveURL(/.*results/);
  });

  test('Certify Election Results', async ({ page }) => {
    await admin.gotoResults();
    await admin.certifyResults();
    // Should trigger tally or certification flow
  });

  test('Navigation - All Sidebar Links Accessible', async ({ page }) => {
    // Elections page
    await admin.gotoElections();
    await expect(page).toHaveURL(/.*\//);

    // Assets page
    await admin.gotoAssets();
    await expect(page).toHaveURL(/.*assets/);

    // Results page
    await admin.gotoResults();
    await expect(page).toHaveURL(/.*results/);

    // Audit page
    await admin.gotoAudit();
    await expect(page).toHaveURL(/.*audit/);

    // Security page
    await admin.gotoSecurity();
    await expect(page).toHaveURL(/.*security/);
  });
});
