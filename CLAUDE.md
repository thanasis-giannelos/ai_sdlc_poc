# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What this repo is

A proof-of-concept SDLC automation demo: a **Mini Storefront** built end-to-end by 9
Claude Code skills. It is greenfield and runs entirely on localhost. There is no backend —
product data is mocked and cart state is held in React context (in-memory, not persisted).

Four packages, each in its own directory under `demo-app/`:

| Package | Path | Port | Role |
|---|---|---|---|
| `host` | `demo-app/host/` | 3000 | Shell — owns routing, NavBar, AuthContext, cart-count badge |
| `catalog` | `demo-app/catalog/` | 3001 | Remote — product listing, search, filter, sort |
| `cart` | `demo-app/cart/` | 3002 | Remote — cart items, order summary, checkout |
| `account` | `demo-app/account/` | 3003 | Remote — login, account profile |

**All four must be running simultaneously** for the composed app at `:3000` to work. Each
remote also runs standalone at its own port for isolated development.

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
| Unit tests | Vitest + React Testing Library (catalog, cart, account only — host has no tests) |
| E2E tests | Playwright |

React and react-dom are declared `singleton: true` in all Module Federation configs.

---

## Commands

Run from inside each package's directory:

```bash
npm run dev          # rspack serve --mode development
npm run build        # rspack build --mode production
npm test             # vitest run
npm run test:watch   # vitest
npx vitest run src/components/ProductCard.test.tsx   # single test file
npx vitest run --coverage
```

To start the full composed app, run `npm run dev` in all four directories concurrently.

---

## Architecture

### Module Federation topology

The host shell (`demo-app/host/rspack.config.ts`) declares three remotes hard-coded to
localhost URLs:

```
catalogRemote  →  http://localhost:3001/remoteEntry.js
cartRemote     →  http://localhost:3002/remoteEntry.js
accountRemote  →  http://localhost:3003/remoteEntry.js
```

Each remote exposes components via its own `rspack.config.ts`. The host is the only
package with `react-router-dom` as a runtime dependency; remotes declare it as a shared
singleton and rely on the host's instance.

### What the host shell owns

- `BrowserRouter` + all `<Route>` definitions (`/`, `/catalog/*`, `/cart`, `/login`, `/account/*`)
- `<NavBar>` — rendered once, above all routes. **Remotes must not render their own NavBar** when mounted via the host.
- `AuthContext` — token stored in `localStorage`; `isAuthenticated` flag consumed by NavBar
- `useCartCountStore` (Zustand) — badge count on the cart icon. The cart remote has its own `useCartStore` for item list; the two are not yet wired together (planned for production).

### Remote standalone mode vs. host-mounted mode

Cart and account remotes wrap their content in their own `BrowserRouter` (for standalone
dev on `:3002`/`:3003`). The host mounts individual page components — not the remote's
`App` — so the inner router is never activated when running through the host.

Catalog is the exception: it exposes its full `App` (which renders `ProductListPage`
directly, no inner router). `ProductListPage` must **not** render `<NavBar>` — the host
shell provides it.

### State boundaries

- **Filter / sort / search** — local `useState` in `ProductListPage` (catalog).
- **Cart item list** — `useCartStore` (Zustand) inside the cart remote (`demo-app/cart/src/features/cart/hooks/useCartStore.ts`).
- **Cart badge count** — `useCartCountStore` (Zustand) in the host (`demo-app/host/src/store/cartStore.ts`). Not yet connected to the cart remote's store.
- **Auth token** — `AuthContext` in the host, persisted to `localStorage`.

### Key documents

| File | Purpose |
|---|---|
| `docs/requirements-spec.md` | Figma-extracted spec: screens, components, states, tokens, interactions |
| `docs/stack-adr.md` | ADR explaining every stack choice and rejected alternatives |
| `using-primarily-the-skills-splendid-brooks.md` | Demo runbook: 9-skill pipeline order, rationale, prerequisites |

---

## Testing conventions

- Test files sit next to their component: `Foo.tsx` / `Foo.test.tsx`.
- Use `@testing-library/react` + `@testing-library/user-event`; assert with `@testing-library/jest-dom`.
- Mock only external API calls — never the DOM or React internals.
- Coverage provider is `@vitest/coverage-v8`; do not switch to Istanbul.

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
