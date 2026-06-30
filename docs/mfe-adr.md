# ADR: Micro-Frontend Decomposition — Mini Storefront

---

## Status

Accepted

---

## Date

2026-06-29

---

## Deciders

- [x] Frontend Tech Lead
- [x] Engineering Manager (POC sponsor)
- [ ] Affected team leads (one per remote — TBD for POC)

---

## Context

The catalog domain was built as a single CSR SPA (`demo-app/catalog/`) during the
first pass of the SDLC pipeline. `frontend-discovery` (Step 4) confirmed three clear
domain seams: product browsing (`catalog`), cart and checkout (`cart`), and user
authentication / profile (`account`). All three scored 6/6 on the boundary-heuristics
scoring template — each owns a distinct data model, a distinct route cluster, and no
cross-domain component sharing.

The stack ADR locks Rspack as the build tool and `@module-federation/enhanced ^0.6.0`
as the Module Federation runtime — both are prerequisites for this decomposition.

Key discovery findings that drive this decision:
- `NavBar` renders inside `ProductListPage` but displays a cart badge that must reflect
  state from the `cart` domain → must migrate to the host shell.
- Cart count lives in local `useState` inside `ProductListPage` → must move to a
  shared Zustand store owned by the host shell.
- No router is installed in the catalog remote → the host shell will own React Router
  and mount each remote behind its path prefix.
- `react` / `react-dom` are not yet declared as singletons → this ADR mandates
  `singleton: true` in every remote's MF config.

---

## Decision

We adopt a **Hub-and-Spoke Module Federation topology** using **Rspack 1.x** and
**`@module-federation/enhanced ^0.6.0`**, decomposing the storefront into three
domain remotes plus one host shell.

### Remote Decomposition Map

| Remote name | Domain | Routes / features | Owning team | Dev port |
|---|---|---|---|---|
| `catalog-remote` | Product catalog | `/`, `/catalog/*` — product grid, filter/sort, search | Catalog Team | 3001 |
| `cart-remote` | Cart & checkout | `/cart` — line items, order summary, checkout CTA | Cart Team | 3002 |
| `account-remote` | Auth & profile | `/login`, `/account/*` — login form, profile (post-POC) | Account Team | 3003 |

### Host Shell

| Property | Value |
|---|---|
| App name | `storefront-host` |
| Dev port | 3000 |
| Routing strategy | Path-based — `/` and `/catalog/*` → catalog-remote; `/cart` → cart-remote; `/login` and `/account/*` → account-remote |
| Shared layout scope | `NavBar` and `Footer` live in the host shell. Cart item count badge is fed from the shared Zustand store (not passed as props into remotes). |
| Auth approach | JWT stored in `localStorage` (per spec open question §7). Host shell reads the token on startup, exposes it via a React context (`AuthContext`). Each remote consumes `AuthContext` from the shared singleton — no per-remote validation. |
| Error boundary policy | Each remote import is wrapped in `<ErrorBoundary>` + `<Suspense>` in the host. A failed remote shows a graceful per-domain fallback; it does not crash the host shell or other remotes. |

### Module Federation Shared-Dependency Manifest

| Package | Version constraint | Singleton | Eager |
|---|---|---|---|
| `react` | `^18.3.0` | yes | host entry only |
| `react-dom` | `^18.3.0` | yes | host entry only |
| `react-router-dom` | `^6.23.0` | yes | no |
| `zustand` | `^4.5.0` | yes | no |
| `@tanstack/react-query` | `^5.0.0` | yes | no |

**`eager: true` on the host entry only** — this prevents the "Shared module is not
available for eager consumption" bootstrap error. All remotes set `eager: false`
(the default).

Tailwind CSS produces static utility classes that are scoped per remote's own CSS
output; it is not a JS runtime and does not require a `shared:` entry.

### Federation Topology

```
storefront-host :3000
  ├── loads → catalog-remote :3001
  │             exposes: './CatalogApp' → src/App.tsx (<CatalogApp />)
  │
  ├── loads → cart-remote :3002
  │             exposes: './CartApp' → src/App.tsx (<CartApp />)
  │
  └── loads → account-remote :3003
                exposes: './AccountApp' → src/App.tsx (<AccountApp />)

shared (all nodes): react, react-dom, react-router-dom, zustand, @tanstack/react-query
```

No peer-to-peer remote dependencies. All cross-remote state is exchanged through the
shared Zustand store, not via direct remote-to-remote imports.

### Rspack / MF config snippets (reference)

**Each remote** (`catalog`, `cart`, `account`) — add to `rspack.config.ts`:

```ts
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

// Inside plugins array:
new ModuleFederationPlugin({
  name: 'catalogRemote',           // change per remote
  filename: 'remoteEntry.js',
  exposes: {
    './CatalogApp': './src/App',   // change per remote
  },
  shared: {
    react:                  { singleton: true, requiredVersion: '^18.3.0' },
    'react-dom':            { singleton: true, requiredVersion: '^18.3.0' },
    'react-router-dom':     { singleton: true, requiredVersion: '^6.23.0' },
    zustand:                { singleton: true, requiredVersion: '^4.5.0' },
    '@tanstack/react-query':{ singleton: true, requiredVersion: '^5.0.0' },
  },
})
```

**Host shell** — `rspack.config.ts`:

```ts
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    catalogRemote:  'catalogRemote@http://localhost:3001/remoteEntry.js',
    cartRemote:     'cartRemote@http://localhost:3002/remoteEntry.js',
    accountRemote:  'accountRemote@http://localhost:3003/remoteEntry.js',
  },
  shared: {
    react:                  { singleton: true, requiredVersion: '^18.3.0', eager: true },
    'react-dom':            { singleton: true, requiredVersion: '^18.3.0', eager: true },
    'react-router-dom':     { singleton: true, requiredVersion: '^6.23.0' },
    zustand:                { singleton: true, requiredVersion: '^4.5.0' },
    '@tanstack/react-query':{ singleton: true, requiredVersion: '^5.0.0' },
  },
})
```

---

## Alternatives Considered

### Option A: Continue with the monolith

**Pros:** No infrastructure overhead; single dev server; no shared-dep complexity.

**Cons:** All teams share one deploy pipeline. Bundle grows unbounded. Framework
upgrades affect all domains simultaneously. Cart, catalog, and account have genuinely
divergent change cadences — conflating them creates unnecessary coordination overhead.

**Rejected because:** The POC explicitly requires demonstrating independent-deploy MFE
capability via the `microfrontend-architect` skill. Three clear, high-scoring domain
seams exist — continuing as a monolith would ignore the primary architectural signal.

---

### Option B: Iframes

**Pros:** Complete runtime isolation; zero shared-dep risk; framework-agnostic.

**Cons:** `postMessage` API is cumbersome for auth token forwarding and shared NavBar
state. Accessibility is broken across `<iframe>` boundaries (focus, screen-reader
context). UX transitions are degraded.

**Rejected because:** The storefront requires a shared `NavBar` and a shared cart
count that spans domains — iframe communication for this pattern adds more complexity
than Module Federation.

---

### Option C: Web Components / Custom Elements

**Pros:** Framework-agnostic; strong encapsulation via Shadow DOM.

**Cons:** Shadow DOM conflicts with Tailwind's global utility classes. React's
synthetic event system has rough edges with Web Component event propagation. No
built-in code-sharing mechanism — shared deps must be duplicated or separately
distributed.

**Rejected because:** The stack is React + Tailwind throughout; the framework-agnostic
benefit of Web Components does not apply. Shared dep deduplication is a requirement,
which Module Federation handles natively.

---

### Option D: Server-Side Composition

**Pros:** No client-side integration cost; each service owns its server.

**Cons:** Requires a server per domain. The stack ADR explicitly chose CSR SPA with no
SSR requirement. Adding per-domain servers contradicts the POC's localhost static build
target.

**Rejected because:** The POC deploy target is localhost static builds (or
Vercel/Netlify static hosting). Server-side composition is architecturally incompatible
with this constraint.

---

## Consequences

### Positive

- Each remote deploys independently — catalog can ship new product card UI without
  touching cart or account pipelines.
- Bundle splitting is domain-scoped: users visiting `/catalog` only download catalog
  JS + the shared singletons; cart and account chunks load on demand.
- The NavBar migration to the host shell cleanly resolves the cross-domain cart count
  problem identified by `frontend-discovery`.
- Rspack's `@module-federation/enhanced` is API-compatible with Webpack 5's
  `ModuleFederationPlugin` — the migration path is non-breaking if Rspack is ever
  replaced.

### Negative

- Shared singleton versioning requires discipline. A semver mismatch in `react` between
  remotes will cause MF to silently load two React instances, breaking hooks. Enforce
  the version constraint in CI before each remote's deploy.
- Local development requires four concurrent dev servers (host + 3 remotes). A
  `concurrently` root script or `turbo dev` is recommended to reduce developer friction.
- The host shell becomes a routing coordination point — any new top-level route
  (`/checkout-confirm`, `/order-history`) requires a host update in addition to a remote
  update.
- Source maps must be configured per remote for cross-boundary debugging. Without this,
  stack traces in production will reference minified remote bundle filenames.

---

## Open Questions

| Question | Owner | Target date |
|---|---|---|
| Confirm `@module-federation/enhanced` v0.6+ works without patching against Rspack v1.x | Frontend Tech Lead | Before Step 7 (cart/account code gen) |
| Decide monorepo vs. separate repos for host + 3 remotes | Frontend Tech Lead | Before Step 7 |
| Define `shared:` version-drift CI check (e.g. a `check-versions.js` script run in each remote's CI) | Frontend Tech Lead | Before first remote deploy |
| Rollback strategy for a broken remote deploy (host pinned to last-known-good `remoteEntry.js` URL, or feature flag) | Engineering Manager | Before preview deploy |
| Confirm Vercel/Netlify can serve 4 independent static deployments and that CORS is configured for cross-origin remote loads | Frontend Tech Lead | Before Step 10 (smoke test) |

---

## Next Steps

1. **`frontend-architecture-planner`** (Step 6 in the pipeline) — run for `account-remote` first
   (it contains the login form, which is the most complex new component). Then run for `cart-remote`.
   The `catalog-remote` internal structure is already defined by the existing code.

2. **`figma-implement-design`** (Step 7) — implement `cart-remote` and `account-remote` component
   trees from Figma frames (Cart/Checkout :3:5124, Login :3:5136).

3. **Host shell scaffolding** — create `demo-app/host/` with:
   - React Router v6 routes mapping each path prefix to its remote
   - `NavBar` migrated from `catalog-remote`
   - Zustand cart-count store
   - `AuthContext` provider wrapping the router
   - `<ErrorBoundary>` + `<Suspense>` wrappers per remote import

4. Update `demo-app/catalog/rspack.config.ts` — replace the MF stub comment with the
   `ModuleFederationPlugin` config block from the Decision section above.
