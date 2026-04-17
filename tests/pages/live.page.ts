import { Page, expect } from '@playwright/test';
import { api } from '../../frontend/voters_interface/src/config/api';

export class LivePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/live'); // Assuming it's hosted on the same port
  }

  async waitForUpdate() {
    await this.page.waitForSelector('.animate-pulse', { timeout: 10000 });
  }

  async getTurnout() {
    const text = await this.page.textContent('.text-blue-600');
    return text?.trim();
  }

  async getCandidatePercent(name: string) {
    const container = this.page.locator('tr', { hasText: name });
    const percentText = await container.locator('td:has-text("%")').textContent();
    return percentText?.trim();
  }
}
