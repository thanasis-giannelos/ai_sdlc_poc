---
name: e2e-test-generator
description: "Generate Playwright (or Cypress) end-to-end tests for critical user flows. Use when the user says 'generate E2E tests', 'write Playwright tests', 'write Cypress tests', 'automate user flows', 'create acceptance tests', 'scaffold E2E suite', or 'test critical paths'."
argument-hint: "<flow-description-or-ac-file> [--framework playwright|cypress] [--base-url URL]"
user-invocable: true
---

# E2E Test Generator

Generates **Playwright** (default) or **Cypress** end-to-end test files for critical user flows — reading acceptance criteria, route trees, or flow descriptions and scaffolding tests with locators, assertions, and setup/teardown. Covers the flow tier of the testing pyramid, above component-level RTL tests.

## When to Use

- User wants to automate a critical user journey (login, checkout, form submission, navigation)
- A feature's acceptance criteria have been written but no automated E2E tests exist
- Before a release to verify that key flows still work end-to-end
- When `e2e/` or `tests/` directory is missing or nearly empty
- After `component-test-generator` to add the flow tier on top of unit coverage

## Skill Boundaries

- Use this skill for **cross-page user journey tests** that drive the real (or preview) UI.
- If the user wants **unit/integration tests for individual components**, use [component-test-generator](../component-test-generator/SKILL.md) instead.
- If the user wants to **verify a live deployment** after a deploy (smoke test, not a full suite), use [deploy-smoke-verifier](../deploy-smoke-verifier/SKILL.md) instead.
- If the user wants **mock data or MSW handlers** to back the E2E tests, use [mock-data-generator](../mock-data-generator/SKILL.md) to generate them first.
- If the user wants to **run** the generated tests, use [test-runner-frontend](../test-runner-frontend/SKILL.md).
- This skill authors test files; it does not run them.

## Prerequisites

- Playwright (`@playwright/test`) or Cypress installed and configured
- A `playwright.config.*` or `cypress.config.*` file exists (or user confirms the framework)
- A `baseURL` is known — from the config file, an environment variable, or provided by the user
- The application can be started locally or against a stable preview URL

## Procedure

1. **Determine framework** — check for `playwright.config.*` or `cypress.config.*`; if both exist, ask the user which to target. Default to Playwright when neither exists yet.
2. **Collect user flows** — read acceptance criteria (provided as text, ticket, or file), the app's route tree, or an explicit list of flows from the user. Extract distinct journeys: each starts at a URL and ends at a verifiable outcome.
3. **Identify selectors** — scan the component source for accessible roles and ARIA labels (`role`, `aria-label`, `data-testid` as a fallback). Prefer `getByRole`, `getByLabel`, `getByText` in Playwright; `cy.findByRole` in Cypress. Log any selectors that require `data-testid` additions in the report.
4. **Plan the test file structure**:
   - One `test.describe` (Playwright) / `describe` (Cypress) block per feature or page
   - One `test` / `it` per distinct user journey
   - Shared setup in `test.beforeEach` / `beforeEach`: navigate to the starting URL, log in if required
   - Teardown in `test.afterEach` / `afterEach`: clear state, intercept cleanup
5. **Scaffold authentication** — if flows require a logged-in user, generate a `storageState` fixture (Playwright) or a `cy.session` command (Cypress) that persists auth across tests without repeating the login journey in every test.
6. **Generate the test files** in the framework's standard location (`e2e/`, `tests/e2e/`, or `cypress/e2e/`):
   - Each flow is a complete `test` block with navigation, interactions via `page.getByRole(...)`, and `expect` assertions
   - Use `page.waitForResponse` / `cy.intercept` for async operations rather than arbitrary `waitForTimeout`
   - Tag tests with `@critical` or `@smoke` annotations where applicable
7. **Generate Page Object Models (POMs)** for pages visited by more than one flow, placing them in `e2e/pages/` or `cypress/support/pages/`.
8. **Report** generated file paths, flows covered, locators that need `data-testid` additions in source, and flows that could not be automated without backend access.

## Output Contract

- **Test files** — one `.spec.ts` / `.cy.ts` per feature or page group, placed in the framework's standard directory
- **Page Object Models** — one POM class per shared page (if applicable)
- **Auth fixture** — `storageState` file or `cy.session` command for authenticated flows (if applicable)
- **Flows coverage map** — table: flow name | automated (yes/no) | file | reason (if skipped)
- **Selector gaps** — list of elements that currently lack accessible roles and need `data-testid` attributes added to the source

## Resources

- [playwright-patterns.md](./references/playwright-patterns.md)
- [cypress-patterns.md](./references/cypress-patterns.md)
- [selector-strategy.md](./references/selector-strategy.md)

---

## Failure Handling

- If no acceptance criteria or route tree is available, ask the user to describe at least three critical paths before proceeding.
- If the app has no accessible selectors on interactive elements, generate tests using `data-testid` fallbacks and flag each as a `// FIXME: add aria-label to source` comment.
- If authentication requires a backend call that cannot be stubbed, scaffold the test with a `test.skip` and a comment explaining the prerequisite.
- If `playwright.config.*` does not exist and the user wants Playwright, scaffold a minimal config with `baseURL` and `testDir` and present it to the user for review before generating tests.

## Examples

### Example 1: Login flow

User says: "Generate Playwright tests for our login flow — email + password, valid login redirects to dashboard, invalid credentials shows an error."

**Actions:**
1. Confirm `playwright.config.ts` exists with `baseURL`.
2. Scaffold `e2e/auth/login.spec.ts` with two tests: `'valid credentials redirect to /dashboard'` and `'invalid credentials shows error message'`.
3. Use `page.getByLabel('Email')`, `page.getByLabel('Password')`, `page.getByRole('button', { name: /sign in/i })`.
4. Assert `expect(page).toHaveURL('/dashboard')` and `expect(page.getByRole('alert')).toBeVisible()`.

**Result:** `e2e/auth/login.spec.ts` with two tests, a `storageState` fixture for reuse in downstream specs.

### Example 2: Multi-page checkout flow from acceptance criteria

User says: "We have AC for the checkout: cart → shipping → payment → confirmation. Generate E2E tests."

**Actions:**
1. Parse the AC: four steps, three page transitions, one order confirmation assertion.
2. Scaffold `e2e/checkout/checkout.spec.ts` with one end-to-end `test` and three shorter tests for each intermediate step.
3. Create `e2e/pages/CartPage.ts`, `ShippingPage.ts`, `PaymentPage.ts`, `ConfirmationPage.ts` as Page Object Models.
4. Use `page.waitForResponse('**/api/orders')` before asserting the confirmation page.

**Result:** One spec file, four POM files, six tests covering the full checkout funnel.

## Best Practices

- Never use `waitForTimeout` — wait for network responses, element visibility, or URL changes instead.
- Keep tests independent: each `test` block must be runnable in isolation. Use `beforeEach` to reset state.
- Run at most one authenticated session setup per `describe` block using `storageState` / `cy.session`.
- Tag critical flows `@smoke` so a subset can run on every deploy as a quick gate.
- Generate tests against the UI's accessible structure first; reach for `data-testid` only when ARIA roles are absent.

## Common Issues and Solutions

### Issue: Tests are flaky due to animation or delayed renders

**Cause:** Assertions run before CSS transitions or skeleton loaders finish.
**Solution:** Assert against the final visible element using `expect(locator).toBeVisible()` — Playwright's auto-waiting handles transitions. For Cypress, prefer `cy.findByRole(...)` with `cy-commands` that retry automatically.

### Issue: Auth tokens expire mid-suite

**Cause:** Long test suites outlive the token TTL.
**Solution:** Use Playwright's `storageState` per worker and refresh the fixture if the token expiry is shorter than the suite runtime. For Cypress, call `cy.session` with `validate` to re-authenticate when the session is invalid.
