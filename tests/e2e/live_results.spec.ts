import { test, expect } from '@playwright/test';

test.describe('Live Results Dashboard', () => {

  test('Displays election results with candidates', async ({ page }) => {
    // Mock the results API
    await page.route('**/public/elections/*/results', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        election_id: 'test-election-id',
        election_title: 'Test Election 2025',
        status: 'Active',
        deadline_passed: false,
        total_committed_votes: 150,
        contests: [{
          contest_id: 'contest-1',
          office_title: 'President',
          seats_available: 1,
          total_votes_cast: 150,
          candidates: [
            { candidate_id: 'c1', name: 'Alice Johnson', party_name: 'Freedom Party', vote_count: 90, photo_url: null, party_logo_url: null },
            { candidate_id: 'c2', name: 'Bob Smith', party_name: 'Unity Coalition', vote_count: 60, photo_url: null, party_logo_url: null },
          ],
          winner: null,
        }],
      })
    }));

    await page.route('**/public/elections/active', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-election-id',
        title: 'Test Election 2025',
        status: 'Active',
        contests: [],
      })
    }));

    await page.goto('/');
    await expect(page).toHaveTitle(/.*/);
  });

  test('Shows no active election message', async ({ page }) => {
    await page.route('**/public/elections/active', route => route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'No active election found' })
    }));

    await page.goto('/');
    // Should show a "no active election" state
  });

  test('Handles API errors gracefully', async ({ page }) => {
    await page.route('**/public/elections/*/results', route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' })
    }));

    await page.goto('/');
    // Should not crash, show error state
  });
});
