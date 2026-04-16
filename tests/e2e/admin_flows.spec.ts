import { test, expect } from '@playwright/test';
import { AdminPage } from '../pages/admin.page';

test.describe('Admin Dashboard Flows', () => {
  let admin: AdminPage;

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
    await expect(page.locator('div')).toContainText('Candidate John Doe added successfully!');
  });

  test('Security - Purge Data', async ({ page }) => {
    await admin.gotoSecurity();
    await admin.performPurge('ARCHIVE');
    // Verification depends on implementation
  });
});
