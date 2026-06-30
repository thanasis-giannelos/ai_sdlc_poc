import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Persisted auth state for tests that need a pre-authenticated session.
// The mock API accepts any non-empty email + password.
const authFile = path.join(__dirname, '../.auth/user.json');

setup('save auth state', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL(/\/catalog/);

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
