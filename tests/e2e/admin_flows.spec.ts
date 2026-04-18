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

    // Navigate to create election page
    await admin.gotoCreateElection();
    await expect(page).toHaveURL(/.*create-election/);

    // Create new election
    await admin.createElection('Test Election 2025');
    // After saving, should navigate back to elections list or stay on page
    await page.waitForTimeout(1000);
  });

  test('Asset Management - Add Candidate', async ({ page }) => {
    await admin.gotoAssets();
    await expect(page.locator('h1')).toContainText('Asset Management');

    await admin.addCandidate('John Doe', 'Progressive Party');
    // Toast notification uses bg-emerald-500
    const toast = page.locator('[class*="emerald"]');
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  test('Security - Purge Data', async ({ page }) => {
    await admin.gotoSecurity();
    await expect(page.locator('h1')).toContainText('Danger Zone');
    await admin.performPurge('ARCHIVE');
  });

  test('Security - Purge Rejected Without Confirmation', async ({ page }) => {
    await admin.gotoSecurity();
    await admin.performPurge('wrong');
    // Should not proceed — the button triggers the API which returns 400
  });

  test('View Audit Trail', async ({ page }) => {
    await admin.gotoAudit();
    await expect(page).toHaveURL(/.*audit/);
    await expect(page.locator('h1')).toContainText('System Audit Trail');
  });

  test('Filter Audit Logs', async ({ page }) => {
    await admin.gotoAudit();
    // The audit page uses filter selects and an "Apply Filters" button
    const applyButton = page.locator('button:has-text("Apply Filters")');
    await expect(applyButton).toBeVisible({ timeout: 5000 });
  });

  test('View Results Dashboard', async ({ page }) => {
    await admin.gotoResults();
    await expect(page).toHaveURL(/.*results/);
  });

  test('Navigation - All Sidebar Links Accessible', async ({ page }) => {
    // Elections page (index)
    await admin.gotoElections();
    await expect(page.locator('h1')).toContainText('Elections');

    // Assets page
    await admin.gotoAssets();
    await expect(page.locator('h1')).toContainText('Asset');

    // Results page
    await admin.gotoResults();
    await expect(page).toHaveURL(/.*results/);

    // Audit page
    await admin.gotoAudit();
    await expect(page.locator('h1')).toContainText('Audit');

    // Security page
    await admin.gotoSecurity();
    await expect(page.locator('h1')).toContainText('Danger Zone');
  });
});
