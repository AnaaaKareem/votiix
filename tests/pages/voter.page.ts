import { Page, expect } from '@playwright/test';

export class VoterPage {
  constructor(private page: Page) {}

  async gotoEnrollment() {
    await this.page.goto('/enrollment');
  }

  async gotoLanguage() {
    await this.page.goto('/language');
  }

  async gotoVerify() {
    await this.page.goto('/verify');
  }

  async gotoConfirmation() {
    await this.page.goto('/confirmation');
  }

  async gotoSelectCandidate() {
    await this.page.goto('/select-candidate');
  }

  async gotoCandidateConfirmation() {
    await this.page.goto('/candidate-confirmation');
  }

  async gotoSuccess() {
    await this.page.goto('/success');
  }

  // Actions
  async enterNationalId(id: string) {
    await this.page.fill('input[placeholder="enter national ID"]', id);
  }

  async enroll() {
    await this.page.click('button:has-text("Enroll Fingerprint")');
  }

  async selectLanguage(lang: 'English' | 'Arabic') {
    await this.page.click(`button:has-text("${lang}")`);
  }

  async simulateFingerprintScan() {
    // The scanner is a div/svg that is clickable
    await this.page.click('.relative.z-10.w-36.h-36');
  }

  async selectCandidate(id: string) {
    await this.page.click(`div:has-text("${id}")`);
  }

  async confirmVote() {
    await this.page.click('button:has-text("Confirm Vote")');
  }

  async clearEntry() {
    await this.page.click('button:has-text("Clear Entry")');
  }
}
