import { defineConfig, devices } from '@playwright/test';

export default defineConfig({|n  testDir: './tests',\n  timeout: 60_000,\n  expect: { timeout: 10_000 },\n  use: {\n    baseURL: 'https://www.epam.com',\n    trace: 'on-first-retry',\n    screenshot: 'only-on-failure'\n  },\n  projects: [\n    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },\n    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },\n    { name: 'webkit', use: { ...devices['Desktop Safari'] } }\n  ],\n  reporter: [['html', { open: 'never' }], ['list']]\n});
