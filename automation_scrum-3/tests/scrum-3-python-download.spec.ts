import { test, expect } from '@playwright/test';

// Mapped to Confluence test cases: SCRUM-3-TC-001,002,003,006,016,017

test.describe('SCRUM-3 — Python.org Download Python Feature', () => {
  test('SCRUM-3-TC-001: Navigate from homepage to Downloads', async ({ page }) => {
    await page.goto('/');

    // Dismiss cookie banner if present (best-effort)
    const cookieBtn = page.getByRole('button', { name: /accept|agree/i });
    if (await cookieBtn.count()) {
      await cookieBtn.first().click().catch(() => {});
    }

    const downloadsLink = page.getByRole('link', { name: /^downloads$/i });
    if (await downloadsLink.count()) {
      await downloadsLink.first().click();
    } else {
      await page.locator('a[href^="/downloads"], a[href*="/downloads/"]').first().click();
    }

    await expect(page).toHaveURL(/\/downloads\//);
  });

  test('SCRUM-3-TC-002: Latest stable version is prominently displayed (banner text heuristic)', async ({ page }) => {
    await page.goto('/downloads/');

    // Python.org typically has a hero button like “Download Python 3.x.y”
    const downloadCta = page.getByRole('link', { name: /download python\s+3\./i }).first();
    await expect(downloadCta).toBeVisible();

    const ctaText = (await downloadCta.textContent()) || '';
    expect(ctaText).toMatch(/3\.[0-9]+\.[0-9]+/);
  });

  test('SCRUM-3-TC-016: Download link uses HTTPS', async ({ page }) => {
    await page.goto('/downloads/');

    const downloadCta = page.getByRole('link', { name: /download python\s+3\./i }).first();
    await expect(downloadCta).toBeVisible();

    const href = await downloadCta.getAttribute('href');
    expect(href).toBeTruthy();
    const absolute = new URL(href!, page.url());
    expect(absolute.protocol).toBe('https:');
  });

  test('SCRUM-3-TC-003/017: Clicking Download Latest initiates download', async ({ page }) => {
    await page.goto('/downloads/');

    const downloadCta = page.getByRole('link', { name: /download python\s+3\./i }).first();
    await expect(downloadCta).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 30_000 }),
      downloadCta.click()
    ]);

    // Basic assertion that a download started
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('SCRUM-3-TC-006: Installation instructions section present (heuristic)', async ({ page }) => {
    await page.goto('/downloads/');

    // Heuristic: look for “Installation” heading/link or a section containing install guidance.
    const installationHeading = page.getByRole('heading', { name: /install/i }).first();
    const installText = page.locator('text=/Installation|Install Python|How to install/i').first();

    if (await installationHeading.count()) {
      await expect(installationHeading).toBeVisible();
    } else {
      await expect(installText).toBeVisible();
    }
  });
});
