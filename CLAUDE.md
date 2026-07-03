# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What this repo is

A proof-of-concept SDLC automation demo: a **Mini Storefront** built end-to-end by 9
Claude Code skills. It is greenfield and runs entirely on localhost. There is no backend —
product data is mocked and cart state is persisted to `localStorage`.

Five packages under `demo-app/`:

| Package | Path | Port | Role |
|---|---|---|---|
| `host` | `demo-app/host/` | 3000 | Shell — owns routing, NavBar, AuthContext, cart-count badge |
| `catalog` | `demo-app/catalog/` | 3001 | Remote — product listing, search, filter, sort (8 mock products) |
| `cart` | `demo-app/cart/` | 3002 | Remote — cart items, order summary, checkout |
| `account` | `demo-app/account/` | 3003 | Remote — login, account profile |
| `wishlist` | `demo-app/wishlist/` | — | Pre-built remote (dist only, no source) — dormant, not wired into host |

**All four active remotes must be running simultaneously** for the composed app at `:3000` to work.

---

## Tech stack

**Hard constraint: Vite is not allowed.** Module Federation requires Webpack 5 or Rspack.

| Concern | Choice |
|---|---|
| Build tool | Rspack `^1.0.0` |
| Module Federation | `@module-federation/enhanced ^0.6.0` |
| Framework | React 18 (CSR SPA per remote) |
| Language | TypeScript `^5.4.0` |
| Styling | Tailwind CSS v3 |
| Server state | TanStack Query v5 |
| Client / UI state | Zustand |
| Forms | React Hook Form + Zod |
| Unit tests | Vitest + React Testing Library (catalog, cart, account only) |
| E2E tests | Playwright (run from `demo-app/`) |

React and react-dom are declared `singleton: true` in all Module Federation configs.
Keep `react` pinned to `^18.3.0` across all packages — a version mismatch breaks MF negotiation silently.

---

## Commands

### Per-package (run from each app's directory)

```bash
npm run dev          # rspack serve --mode development
npm run build        # rspack build --mode production
npm test             # vitest run  — NOT available in host/
npm run test:watch   # vitest  — NOT available in host/
npx vitest run src/components/ProductCard.test.tsx   # single test file
npx vitest run --coverage
```

**The host package has no test runner.** Running `npm test` in `demo-app/host/` will fail.

### E2E tests (run from `demo-app/`)

```bash
npm install                                    # installs @playwright/test (only dep here)
npx playwright install --with-deps chromium    # one-time browser install
npx playwright test                            # all specs
npx playwright test --ui                       # interactive UI
npx playwright test e2e/catalog/catalog.spec.ts   # single spec
npx playwright test --grep "@smoke"            # smoke-tagged tests only
```

Playwright config lives at `demo-app/playwright.config.ts`. Auth state is saved to
`demo-app/e2e/.auth/user.json` by `auth.setup.ts` on first run.

### Environment variables (no `.env` files; pass at process level)

| Variable | Default | Effect |
|---|---|---|
| `CATALOG_URL` | `http://localhost:3001` | Remote URL in host rspack config |
| `CART_URL` | `http://localhost:3002` | Remote URL in host rspack config |
| `ACCOUNT_URL` | `http://localhost:3003` | Remote URL in host rspack config |
| `PUBLIC_URL` | each app's localhost URL | Overrides `output.publicPath` |
| `BASE_URL` | `http://localhost:3000` | Playwright base URL |

---

## Architecture

### Module Federation topology

The host shell (`demo-app/host/rspack.config.ts`) declares three remotes:

```
catalogRemote  →  http://localhost:3001/remoteEntry.js
cartRemote     →  http://localhost:3002/remoteEntry.js
accountRemote  →  http://localhost:3003/remoteEntry.js
```

The host is the only package with `react-router-dom` as a runtime dependency; remotes
declare it as a shared singleton and rely on the host's instance.

### What each remote exposes and how the host uses it

| Remote | Exposed module | Host usage |
|---|---|---|
| `catalogRemote` | `./CatalogApp` — full App, renders ProductListPage, no router | `React.lazy(() => import('catalogRemote/CatalogApp'))` |
| `cartRemote` | `./CartApp` (BrowserRouter-wrapped, standalone only) + `./CartPage` (bare page) | Host imports `CartPage` — never `CartApp` |
| `accountRemote` | `./AccountApp`, `./LoginPage`, `./AccountPage` | Host imports individual page exports |

Cart and account remotes wrap content in a `BrowserRouter` for standalone dev on their
ports. The host mounts individual page components, so the inner router is never activated
in the composed app. Catalog exposes its full App (no inner router); `ProductListPage`
must **not** render `<NavBar>`.

### What the host shell owns

- `BrowserRouter` + all `<Route>` definitions (`/`, `/catalog/*`, `/cart`, `/login`, `/account/*`)
- `<NavBar>` — rendered once, above all routes. **Remotes must never render their own NavBar when mounted via the host.**
- `AuthContext` — token stored in `localStorage` key `auth_token`; `isAuthenticated` flag consumed by NavBar
- `useCartCountStore` (Zustand) — badge count only (`demo-app/host/src/store/cartStore.ts`)

### Cross-MFE state: custom event bus

There is no shared Zustand store across remotes. The bridge is `window` custom events:

- **Catalog → Host**: `window.dispatchEvent(new CustomEvent('cart:add', { detail: product }))` when user clicks Add to Cart. Does **not** call the cart remote's store.
- **Cart → Host**: `window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }))` after every mutation in `useCartStore`.
- **Host NavBar** listens to both: `cart:updated` updates `useCartCountStore` badge; `cart:add` writes directly to `localStorage['ministore:cart']` and updates the badge (because `CartPage` may not be mounted).

This is a POC mechanism, not a production pattern.

### localStorage keys

| Key | Owner | Contents |
|---|---|---|
| `ministore:cart` | Cart remote + NavBar (host) | `CartItem[]` JSON |
| `auth_token` | AuthContext (host) | auth token string |

Cart initialises from `localStorage['ministore:cart']`, falling back to two hard-coded
mock items (Wireless Headphones $79.99, Mechanical Keyboard $129.99). E2E tests rely on these being present.

### JSX transform difference

The **host** rspack config sets `transform.react.runtime: 'automatic'` in swc-loader.
The **three remotes** do not. New files in remotes must `import React from 'react'`
at the top — omitting it causes a runtime error.

### Path alias gotcha

The `@` alias (→ `/src`) is configured in each remote's `vitest.config.ts` only. It
does **not** work in Rspack builds or `tsconfig.json`. Use relative paths in production
source; `@` only works inside test files.

---

## POC limitations (by design)

- **"Add to Cart" is decoupled**: clicking it in catalog fires `cart:add` and updates localStorage/badge, but the cart remote's Zustand store is not called live. A page refresh will show the item in the cart.
- **Checkout is a stub**: "Proceed to Checkout" shows "Processing…" for ~1.5 s then resets with no navigation or state change.
- **Auth accepts any credentials**: `loginUser()` accepts any non-empty email + password, waits 600 ms, returns `{ token: 'mock-token' }`.
- **No monorepo tooling**: no npm workspaces, turborepo, or pnpm. `demo-app/node_modules` contains only `@playwright/test`; all other deps are per-package.

---

## State boundaries

- **Filter / sort / search** — local `useState` in `ProductListPage` (catalog).
- **Cart item list** — `useCartStore` (Zustand) in the cart remote.
- **Cart badge count** — `useCartCountStore` (Zustand) in the host; synced via `cart:updated` event.
- **Auth token** — `AuthContext` in the host, persisted to `localStorage['auth_token']`.

---

## Testing conventions

- Test files sit next to their component: `Foo.tsx` / `Foo.test.tsx`.
- Vitest globals enabled — no need to import `describe`, `it`, `expect`.
- Setup file in each remote: `src/test-setup.ts` (imports `@testing-library/jest-dom/matchers`).
- Use `@testing-library/react` + `@testing-library/user-event`; assert with `@testing-library/jest-dom`.
- Mock only external API calls — never the DOM or React internals.
- Coverage provider is `@vitest/coverage-v8`; do not switch to Istanbul.
- Catalog's `demo-app/catalog/src/components/NavBar.tsx` is a **legacy leftover** — do not use it in `ProductListPage` and do not expose it via Module Federation.

---

## Key documents

| File | Purpose |
|---|---|
| `docs/requirements-spec.md` | Figma-extracted spec: screens, components, states, tokens, interactions |
| `docs/stack-adr.md` | ADR for build tool / library choices; Node v24 confirmed |
| `docs/mfe-adr.md` | ADR for MFE decomposition; hub-and-spoke topology; boundary scoring |
| `docs/discovery-report.md` | Frontend discovery report on `demo-app/catalog/` |
| `docs/account-remote-architecture.md` | Architecture spec for `account-remote` |

---

## Pipeline / skill ordering

The demo app is built by running skills in this fixed order (later skills depend on
earlier artifacts):

1. `figma-spec-extractor` → `docs/requirements-spec.md`
2. `frontend-stack-advisor` → `docs/stack-adr.md`
3. `figma-implement-design` (pass 1) → `demo-app/catalog/` components
4. `frontend-discovery` → discovery report (runs against existing catalog code)
5. `microfrontend-architect` → MFE topology + Module Federation configs
6. `frontend-architecture-planner` → internal architecture spec for one remote
7. `figma-implement-design` (pass 2) → `demo-app/cart/`, `demo-app/account/`
8. `component-test-generator` → `*.test.tsx` files
9. `e2e-test-generator` → `e2e/*.spec.ts`
10. `deploy-smoke-verifier` → smoke report against preview URL
