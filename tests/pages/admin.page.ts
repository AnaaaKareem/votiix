import { Page, expect } from '@playwright/test';

export class AdminPage {
  constructor(private page: Page) {}

  async gotoElections() {
    await this.page.goto('/');
  }

  async gotoCreateElection() {
    await this.page.goto('/create-election');
  }

  async gotoAssets() {
    await this.page.goto('/assets');
  }

  async gotoResults() {
    await this.page.goto('/results');
  }

  async gotoAudit() {
    await this.page.goto('/audit');
  }

  async gotoSecurity() {
    await this.page.goto('/security');
  }

  // Actions
  async createElection(title: string) {
    // The create election page uses placeholder "e.g. 2024 Presidential General Election"
    await this.page.fill('input[placeholder*="Presidential"]', title);
    // Fill start date
    const startInput = this.page.locator('input[placeholder*="mm/dd/yyyy"]').first();
    await startInput.fill('12/01/2025, 08:00 AM');
    // Fill end date
    const endInput = this.page.locator('input[placeholder*="mm/dd/yyyy"]').last();
    await endInput.fill('12/31/2025, 06:00 PM');
    // Click the save button — the admin dashboard uses "Save" or similar text
    await this.page.click('button:has-text("Save")');
  }

  async addCandidate(name: string, party: string) {
    // The assets page uses placeholder "e.g. Alex Morgan"
    await this.page.fill('input[placeholder*="Alex Morgan"]', name);
    await this.page.click('button:has-text("Add Candidate")');
  }

  async certifyResults() {
    await this.page.click('button:has-text("Certify")');
  }

  async performPurge(phrase: string = 'ARCHIVE') {
    await this.page.fill('input[placeholder="ARCHIVE"]', phrase);
    await this.page.click('button:has-text("Execute Purge")');
  }

  async searchAudit(query: string) {
    // The audit page uses filter selects, not a text search input.
    // Use the "Action Type" select or the "Apply Filters" button.
    const actionSelect = this.page.locator('select').last();
    await actionSelect.selectOption({ label: query }).catch(() => {
      // If it's not a select option, try clicking Apply Filters
    });
    await this.page.click('button:has-text("Apply Filters")').catch(() => {});
  }
}
