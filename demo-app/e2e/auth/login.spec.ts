import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// NOTE: This spec does NOT use storageState — it drives the unauthenticated login form.

test.describe('Login page @smoke', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('shows login form on /login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('valid credentials redirect to catalog', async ({ page }) => {
    // The mock API accepts any non-empty email + password
    await loginPage.login('test@example.com', 'password123');
    // Host app redirects / → /catalog
    await expect(page).toHaveURL(/\/catalog/);
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
  });

  test('empty email shows validation error', async ({ page }) => {
    await loginPage.passwordInput.fill('password123');
    await loginPage.submitButton.click();
    await expect(loginPage.emailError).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('empty password shows validation error', async ({ page }) => {
    await loginPage.emailInput.fill('test@example.com');
    await loginPage.submitButton.click();
    await expect(loginPage.passwordError).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('sign in button shows loading state during submission', async ({ page }) => {
    await loginPage.login('test@example.com', 'password123');
    // Button label transitions to "Signing in…" while the mock API call (600 ms) is in flight
    await expect(loginPage.submitButton).toHaveText('Signing in…');
  });

  test('NavBar account icon navigates to login when unauthenticated', async ({ page }) => {
    await page.goto('/catalog');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
