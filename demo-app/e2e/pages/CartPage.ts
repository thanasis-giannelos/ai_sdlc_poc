import { type Page, type Locator } from '@playwright/test';

export class CartPage {
  readonly heading: Locator;
  readonly cartItemsRegion: Locator;
  readonly orderSummaryRegion: Locator;
  readonly checkoutButton: Locator;
  readonly continueShopping: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Shopping Cart', level: 1 });
    // <section aria-label="Cart items"> maps to region role
    this.cartItemsRegion = page.getByRole('region', { name: 'Cart items' });
    // <aside aria-label="Order summary"> maps to complementary role
    this.orderSummaryRegion = page.getByRole('complementary', { name: 'Order summary' });
    this.checkoutButton = page.getByRole('button', { name: 'Proceed to Checkout' });
    this.continueShopping = page.getByRole('button', { name: /continue shopping/i });
  }

  async goto() {
    await this.page.goto('/cart');
    await this.heading.waitFor();
  }
}
