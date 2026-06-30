# Playwright Patterns

## Standard Test File Layout

```ts
import { test, expect } from '@playwright/test'

test.describe('Checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cart')
  })

  test('completes checkout with valid payment', async ({ page }) => {
    await page.getByRole('button', { name: /proceed to checkout/i }).click()
    await page.getByLabel('Card number').fill('4242 4242 4242 4242')
    await page.getByRole('button', { name: /pay now/i }).click()
    await expect(page).toHaveURL('/confirmation')
    await expect(page.getByRole('heading', { name: /order confirmed/i })).toBeVisible()
  })
})
```

## Locator Priority

```ts
// preferred — semantic
page.getByRole('button', { name: /submit/i })
page.getByLabel('Email address')
page.getByPlaceholder('Search...')
page.getByText('Save changes')

// fallback — structural
page.locator('[data-testid="user-menu"]')
page.locator('form >> nth=0')
```

## Waiting for Network

```ts
// Wait for a specific API response before asserting
const responsePromise = page.waitForResponse('**/api/orders')
await page.getByRole('button', { name: /place order/i }).click()
await responsePromise
await expect(page.getByText('Order #12345')).toBeVisible()
```

## Authentication with storageState

```ts
// fixtures/auth.setup.ts — runs once, saves auth state
import { test as setup } from '@playwright/test'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(process.env.SMOKE_EMAIL!)
  await page.getByLabel('Password').fill(process.env.SMOKE_PASSWORD!)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL('/dashboard')
  await page.context().storageState({ path: 'playwright/.auth/user.json' })
})
```

```ts
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'authenticated',
      use: { storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
})
```

## Page Object Model

```ts
// e2e/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() { await this.page.goto('/login') }
  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email)
    await this.page.getByLabel('Password').fill(password)
    await this.page.getByRole('button', { name: /sign in/i }).click()
  }
  async expectDashboard() {
    await expect(this.page).toHaveURL('/dashboard')
  }
}
```

## Console Error Collection

```ts
const errors: string[] = []
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })

await page.goto('/')
expect(errors).toHaveLength(0)
```
