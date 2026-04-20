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
    if (lang === 'Arabic') {
      // The Arabic button text is "العربية", not "Arabic"
      await this.page.click('button:has-text("العربية")');
    } else {
      await this.page.click('button:has-text("English")');
    }
  }

  async simulateFingerprintScan() {
    // The fingerprint scanner is a rounded div with specific classes
    await this.page.click('.rounded-full.flex.items-center.justify-center.cursor-pointer');
  }

  async selectCandidate(id: string) {
    // The select-candidate page has an input field with placeholder "00"
    // where the voter types the candidate number
    const input = this.page.locator('input[placeholder="00"]');
    await input.fill(id);
  }

  async confirmVote() {
    await this.page.click('button:has-text("Confirm Vote")');
  }

  async clearEntry() {
    await this.page.click('button:has-text("Clear Entry")');
  }
}
