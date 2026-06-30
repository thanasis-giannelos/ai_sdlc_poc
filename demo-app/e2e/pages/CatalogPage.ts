import { type Page, type Locator } from '@playwright/test';

export class CatalogPage {
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly sortSelect: Locator;
  readonly showFiltersButton: Locator;
  readonly addToCartButtons: Locator;
  readonly unavailableButtons: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'All Products', level: 1 });
    // SearchInput renders <input type="search"> → searchbox role
    this.searchInput = page.getByRole('searchbox');
    this.sortSelect = page.getByRole('combobox', { name: 'Sort products' });
    this.showFiltersButton = page.getByRole('button', { name: 'Show filters' });
    this.addToCartButtons = page.getByRole('button', { name: 'Add to Cart' });
    this.unavailableButtons = page.getByRole('button', { name: 'Unavailable' });
  }

  async goto() {
    await this.page.goto('/catalog');
    await this.heading.waitFor();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async expandFilters() {
    await this.showFiltersButton.click();
  }

  async filterByCategory(category: string) {
    await this.expandFilters();
    // Category buttons rendered as pill buttons with the category label (capitalized via CSS)
    await this.page.getByRole('button', { name: category }).click();
  }
}
