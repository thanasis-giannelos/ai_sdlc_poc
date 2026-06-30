import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';

// Cart is publicly accessible — no login required.
// The cart remote pre-seeds two items in its Zustand store on mount:
//   - Wireless Headphones  $79.99  qty 1
//   - Mechanical Keyboard  $129.99 qty 2
// These are NOT connected to the catalog "Add to Cart" action (POC limitation).

test.describe('Cart page', () => {
  let cart: CartPage;

  test.beforeEach(async ({ page }) => {
    cart = new CartPage(page);
    await cart.goto();
  });

  test('renders Shopping Cart heading @smoke', async () => {
    await expect(cart.heading).toBeVisible();
  });

  test('displays pre-seeded cart items', async ({ page }) => {
    await expect(cart.cartItemsRegion).toBeVisible();
    await expect(page.getByText('Wireless Headphones')).toBeVisible();
    await expect(page.getByText('Mechanical Keyboard')).toBeVisible();
  });

  test('order summary panel is visible', async ({ page }) => {
    await expect(cart.orderSummaryRegion).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Order Summary' })).toBeVisible();
    // Totals row labels
    await expect(page.getByText('Subtotal')).toBeVisible();
    await expect(page.getByText('Total')).toBeVisible();
  });

  test('"Proceed to Checkout" button is visible and enabled', async () => {
    await expect(cart.checkoutButton).toBeVisible();
    await expect(cart.checkoutButton).toBeEnabled();
  });

  test('"Proceed to Checkout" shows processing state then resets', async ({ page }) => {
    await cart.checkoutButton.click();
    // POC stub: button label changes to "Processing…" for ~1.5 s then resets
    await expect(page.getByRole('button', { name: 'Processing…' })).toBeVisible();
    await expect(cart.checkoutButton).toBeVisible({ timeout: 3000 });
  });

  test('"Continue Shopping" button is present', async () => {
    await expect(cart.continueShopping).toBeVisible();
  });
});
