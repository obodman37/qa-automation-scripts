import { test, expect } from '@playwright/test';

// Mapped to Confluence test cases: SCRUM-1-TC-001,002,003,005

test.describe('SCRUM-1 — Python.org Documentation Search', () => {
  const query = 'requests';

  // NOTE: Jira AC says "official requests documentation" but does not define the domain.
  // Keep allowlist configurable. Update once product owners confirm expected target.
  const allowedOfficialDocHosts = [
    'docs.python-requests.org',
    'requests.readthedocs.io',
    'python-requests.org'
  ];

  async function performSearch(page) {
    await page.goto('/');

    const searchField = page.locator('input[name="q"], input#id-search-field').first();
    await expect(searchField).toBeVisible();
    await searchField.fill(query);

    // Try button submit first, then fall back to Enter.
    const submit = page.locator('form#searchform button, form[action*="search"] button, button[type="submit"]').first();
    if (await submit.count()) {
      await submit.click();
    } else {
      await searchField.press('Enter');
    }

    // Results page typically uses /search/.
    await expect(page).toHaveURL(/\/search\//);
  }

  test('SCRUM-1-TC-001: Search "requests" via submit control and see results', async ({ page }) => {
    await performSearch(page);

    const results = page.locator('ul.list-recent-events, ol, .list-recent-events').first();
    await expect(results).toBeVisible();

    const firstResultLink = results.locator('li a').first();
    await expect(firstResultLink).toBeVisible();
  });

  test('SCRUM-1-TC-002: Search "requests" via Enter key', async ({ page }) => {
    await page.goto('/');

    const searchField = page.locator('input[name="q"], input#id-search-field').first();
    await expect(searchField).toBeVisible();
    await searchField.fill(query);
    await searchField.press('Enter');

    await expect(page).toHaveURL(/\/search\//);
  });

  test('SCRUM-1-TC-005: Page title indicates search results', async ({ page }) => {
    await performSearch(page);

    // Keep assertion permissive since exact title format is not specified in Jira.
    await expect(page).toHaveTitle(/search/i);
  });

  test('SCRUM-1-TC-003: First result contains a link to official Requests documentation (allowlist check)', async ({ page }) => {
    await performSearch(page);

    const results = page.locator('ul.list-recent-events, ol, .list-recent-events').first();
    await expect(results).toBeVisible();

    const firstResultLink = results.locator('li a').first();
    await expect(firstResultLink).toBeVisible();

    const href = await firstResultLink.getAttribute('href');
    expect(href).toBeTruthy();

    // If href is relative, resolve against current origin.
    const absolute = new URL(href!, page.url());
    const host = absolute.host;

    expect(
      allowedOfficialDocHosts.some((h) => host === h || host.endsWith(`.${h}`))
    ).toBeTruthy();
  });
});
