import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CatalogPage } from '../pages/CatalogPage';
import { CartPage } from '../pages/CartPage';

/**
 * End-to-end user journey: login → browse catalog → navigate to cart → checkout.
 *
 * POC limitations baked in:
 *   - "Add to Cart" on the catalog page only logs to console; it does NOT update the cart remote.
 *   - Cart always opens pre-seeded with Wireless Headphones + Mechanical Keyboard.
 *   - Checkout is a stub: shows "Processing…" for 1.5 s then resets without navigating.
 */

test.describe('Full storefront user journey @smoke', () => {
  test('login → catalog → cart → checkout', async ({ page }) => {
    // ── Step 1: Login ──────────────────────────────────────────────────────────
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

    await loginPage.login('demo@example.com', 'demopass');

    // Host redirects / → /catalog after successful auth
    await page.waitForURL(/\/catalog/);

    // ── Step 2: Browse catalog ─────────────────────────────────────────────────
    const catalog = new CatalogPage(page);
    await expect(catalog.heading).toBeVisible();

    // NavBar account icon updates to "My account" once authenticated
    await expect(page.getByRole('button', { name: 'My account' })).toBeVisible();

    // Search for a specific product
    await catalog.search('sneakers');
    await expect(
      page.getByRole('heading', { name: 'Classic White Sneakers', level: 3 })
    ).toBeVisible();
    await expect(catalog.addToCartButtons).toHaveCount(1);

    // "Add to Cart" click (POC: console.info only — does not update cart remote)
    await catalog.addToCartButtons.first().click();

    // Clear search to restore full grid before navigating
    await catalog.search('');
    await expect(catalog.addToCartButtons).toHaveCount(6);

    // ── Step 3: Navigate to cart via NavBar ───────────────────────────────────
    await page.getByRole('link', { name: 'Cart' }).click();
    await page.waitForURL(/\/cart/);

    const cart = new CartPage(page);
    await expect(cart.heading).toBeVisible();

    // Pre-seeded items always present (POC — not connected to catalog add-to-cart)
    await expect(page.getByText('Wireless Headphones')).toBeVisible();
    await expect(page.getByText('Mechanical Keyboard')).toBeVisible();

    // ── Step 4: Proceed to Checkout ───────────────────────────────────────────
    await expect(cart.checkoutButton).toBeEnabled();
    await cart.checkoutButton.click();

    // Stub checkout: button transitions to "Processing…"
    await expect(page.getByRole('button', { name: 'Processing…' })).toBeVisible();

    // After ~1.5 s the stub resets and the button is available again
    await expect(cart.checkoutButton).toBeVisible({ timeout: 3000 });
  });

  test('unauthenticated user is redirected from /account to login', async ({ page }) => {
    // The NavBar account icon navigates to /login when not authenticated
    await page.goto('/catalog');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('catalog filter + cart navigation', async ({ page }) => {
    // Navigate directly to catalog (no login required)
    const catalog = new CatalogPage(page);
    await catalog.goto();

    // Filter by "pants" → 2 products (Slim Fit Chinos + Running Shorts, both in-stock)
    await catalog.filterByCategory('pants');
    await expect(catalog.addToCartButtons).toHaveCount(2);
    await expect(catalog.unavailableButtons).toHaveCount(0);

    // Navigate to cart via NavBar
    await page.getByRole('link', { name: 'Cart' }).click();
    await page.waitForURL(/\/cart/);
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
  });
});
