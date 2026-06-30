import { defineConfig, devices } from '@playwright/test';

/**
 * Prerequisites: all four dev servers must be running before executing tests.
 *   cd demo-app/host    && npm run dev  (port 3000)
 *   cd demo-app/catalog && npm run dev  (port 3001)
 *   cd demo-app/cart    && npm run dev  (port 3002)
 *   cd demo-app/account && npm run dev  (port 3003)
 *
 * Install Playwright once:
 *   npm install --save-dev @playwright/test
 *   npx playwright install --with-deps chromium
 *
 * Run tests:
 *   npx playwright test
 *   npx playwright test --ui
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Saves localStorage auth state for reuse in future authenticated-only tests
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /auth\.setup\.ts/,
    },
  ],
});
