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
    await this.page.getByLabel('Election Title').fill(title);
    await this.page.click('button:has-text("Save Election")');
  }

  async addCandidate(name: string, party: string) {
    await this.page.getByLabel('Full Name').fill(name);
    // Handle select if needed
    await this.page.click('button:has-text("Add Candidate")');
  }

  async certifyResults() {
    await this.page.click('button:has-text("Certify Results")');
  }

  async performPurge(phrase: string = 'ARCHIVE') {
    await this.page.getByPlaceholder('ARCHIVE').fill(phrase);
    await this.page.click('button:has-text("Execute Purge")');
  }

  async searchAudit(query: string) {
    await this.page.fill('input[placeholder="Search..."]', query);
  }
}
