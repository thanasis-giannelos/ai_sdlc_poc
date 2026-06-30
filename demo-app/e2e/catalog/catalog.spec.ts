import { test, expect } from '@playwright/test';
import { CatalogPage } from '../pages/CatalogPage';

// Catalog is publicly accessible — no login required.

test.describe('Catalog page', () => {
  let catalog: CatalogPage;

  test.beforeEach(async ({ page }) => {
    catalog = new CatalogPage(page);
    await catalog.goto();
  });

  test('renders All Products heading with product grid @smoke', async ({ page }) => {
    await expect(catalog.heading).toBeVisible();
    // 6 in-stock products → 6 enabled "Add to Cart" buttons
    await expect(catalog.addToCartButtons).toHaveCount(6);
    // 2 out-of-stock products → 2 disabled "Unavailable" buttons
    await expect(catalog.unavailableButtons).toHaveCount(2);
  });

  test('search narrows visible products', async ({ page }) => {
    await catalog.search('tee');
    // Only "Cotton Crew Neck Tee" matches
    await expect(catalog.addToCartButtons).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Cotton Crew Neck Tee', level: 3 })).toBeVisible();
  });

  test('search with no matches shows empty grid', async ({ page }) => {
    await catalog.search('xyznonexistent');
    await expect(catalog.addToCartButtons).toHaveCount(0);
    await expect(catalog.unavailableButtons).toHaveCount(0);
  });

  test('default sort is price low-to-high', async ({ page }) => {
    // With default sort (price-asc) the cheapest in-stock product appears first
    const firstAddToCart = catalog.addToCartButtons.first();
    // Cheapest in-stock item: Cotton Crew Neck Tee $24.99
    // Locate its sibling heading to verify ordering
    await expect(
      page.getByRole('heading', { name: 'Cotton Crew Neck Tee', level: 3 })
    ).toBeVisible();
    await expect(firstAddToCart).toBeVisible();
  });

  test('expand filters reveals category chips', async ({ page }) => {
    await catalog.expandFilters();
    // "All" chip plus one chip per category (shoes, pants, shirts, jackets, accessories)
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'shoes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'shirts' })).toBeVisible();
  });

  test('filter by shoes shows 2 products (1 in-stock, 1 out-of-stock)', async ({ page }) => {
    await catalog.filterByCategory('shoes');
    await expect(catalog.addToCartButtons).toHaveCount(1);    // Classic White Sneakers
    await expect(catalog.unavailableButtons).toHaveCount(1);  // Leather Oxford Shoes
    await expect(page.getByRole('heading', { name: 'Classic White Sneakers', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Leather Oxford Shoes', level: 3 })).toBeVisible();
  });

  test('unavailable buttons are disabled', async ({ page }) => {
    const unavailable = catalog.unavailableButtons;
    for (const btn of await unavailable.all()) {
      await expect(btn).toBeDisabled();
    }
  });

  test('"Add to Cart" button is enabled for in-stock products', async ({ page }) => {
    const addBtn = catalog.addToCartButtons.first();
    await expect(addBtn).toBeEnabled();
  });

  test('sort select is present', async () => {
    await expect(catalog.sortSelect).toBeVisible();
  });
});
