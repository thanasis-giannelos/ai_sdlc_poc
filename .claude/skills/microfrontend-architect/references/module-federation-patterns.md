# Module Federation Patterns Reference

Module Federation (MF) is a Webpack 5 / Rspack feature that lets separately built and deployed
JavaScript applications share code at runtime — no npm install, no monorepo required.

---

## Core Concepts

| Term | Meaning |
|---|---|
| **Host** | The app that loads remotes at runtime (the shell / container app) |
| **Remote** | An independently deployed app that exposes modules for the host (or other remotes) to consume |
| **Exposed module** | A component, hook, or utility a remote makes available via `exposes:` in its MF config |
| **Shared dep** | A package listed under `shared:` that MF will deduplicate across host and all remotes at runtime |

---

## Topology Patterns

### Pattern 1: Hub-and-Spoke (most common)

One host shell loads all remotes. Remotes do not load each other.

```
Host (shell)
  ├── loads → checkout-remote
  ├── loads → catalog-remote
  └── loads → account-remote
```

**When to use:** The host owns routing and orchestrates which remote to render per URL. Remotes are
self-contained domain apps. No peer dependencies between remotes.

**Trade-off:** The host becomes a coordination point. Adding a new remote requires a host update
to register it.

---

### Pattern 2: Peer-to-Peer (use sparingly)

A remote loads another remote directly.

```
Host
  └── loads → orders-remote
                └── loads → payment-remote (peer dependency)
```

**When to use:** Only when one domain genuinely embeds another (e.g. an order summary embedding
a payment widget). Each additional peer edge increases coupling and version-alignment burden.

**Caution:** Circular peer dependencies (`A` loads `B` which loads `A`) will deadlock at runtime.
Never allow them.

---

### Pattern 3: Shared Component Library Remote

A dedicated remote that only exposes shared UI components and design tokens; no routing, no business
logic.

```
Host
  ├── loads → ui-library-remote (exposes Button, Modal, FormField, tokens)
  ├── loads → checkout-remote   (consumes ui-library-remote)
  └── loads → catalog-remote    (consumes ui-library-remote)
```

**When to use:** Teams cannot agree on an npm-published design system version, or the design system
changes faster than npm publish cycles allow.

**Trade-off:** Adds a third deployment target. Prefer an npm package if publish cadence is acceptable.

---

## The `shared:` Manifest

### Packages that must be in `shared:`

These packages break or behave incorrectly if loaded more than once on the page:

| Package | Why singleton | Config |
|---|---|---|
| `react` | Hook state is stored in the React instance — two Reacts means broken hooks | `singleton: true, requiredVersion: "^18.0.0"` |
| `react-dom` | Must match the React instance | `singleton: true, requiredVersion: "^18.0.0"` |
| `react-router-dom` | Router context is global; two instances produce broken navigation | `singleton: true` |
| Design system package | CSS-in-JS or CSS Modules global styles conflict with duplicate instances | `singleton: true` |
| Auth context / session store | Token must come from one source of truth | `singleton: true` |

### Packages that benefit from `shared:` (but don't require singleton)

| Package | Benefit | Config |
|---|---|---|
| `lodash`, `date-fns` | Deduplication reduces bundle size | No singleton flag needed |
| `axios`, `fetch` wrappers | Minor dedup benefit | Optional |

### `eager` flag

- `eager: false` (default) — the shared dep is loaded lazily when first needed. **Recommended** for all remotes.
- `eager: true` — the dep is bundled into the initial chunk (needed only in the **host** entry point to avoid the "Uncaught Error: Shared module is not available for eager consumption" bootstrap error).

### Version strategy

- Use semver ranges (`^18.0.0`) not exact versions to allow patch-level flexibility across remotes.
- All remotes and the host must be able to satisfy the range. Mismatches cause MF to fall back to
  loading two copies — defeating the singleton guarantee.
- Enforce a shared `package.json` version constraint in CI so drift is caught before deploy.

---

## Dynamic vs. Static Remote Registration

### Static (simpler, recommended to start)

Remotes are declared in the host's webpack / rspack config at build time:

```js
// host webpack.config.js (illustrative)
new ModuleFederationPlugin({
  name: "host",
  remotes: {
    checkoutRemote: "checkoutRemote@https://checkout.example.com/remoteEntry.js",
    catalogRemote:  "catalogRemote@https://catalog.example.com/remoteEntry.js",
  },
  shared: { react: { singleton: true, requiredVersion: "^18.0.0" } },
})
```

**Trade-off:** Remote URLs are hardcoded at host build time. Changing a remote URL requires
rebuilding the host.

### Dynamic (more flexible)

Remote URLs are resolved at runtime from a config endpoint or environment variable. The host uses
`__webpack_init_sharing__` and `__webpack_share_scopes__` APIs (or a wrapper library like
`@module-federation/runtime`) to load remotes on demand.

**When to use:** Multiple environments (staging, production, preview) with different remote URLs,
or when the set of remotes is not known at host build time.

---

## Fallback Strategy

Always wrap remote-loaded components in an `<ErrorBoundary>` and a `<Suspense>` in the host:

```jsx
// Illustrative pattern — not a code-generation output
<ErrorBoundary fallback={<RemoteError remoteName="checkout" />}>
  <Suspense fallback={<RemoteLoading />}>
    <CheckoutApp />
  </Suspense>
</ErrorBoundary>
```

Rules:
- A remote failing to load (network error, deploy in progress) must not crash the host shell.
- Show a graceful degraded state per-remote, not a full-page error.
- Log the load failure to your observability stack (see [frontend-observability-setup](../frontend-observability-setup/SKILL.md)).

---

## Local Development Setup

Each remote is an independent dev server. The host needs all remotes running to render the full app.

Recommended approach:
1. Each remote's `package.json` has its own `dev` script that starts its own dev server on a fixed port.
2. The host's local config points `remotes` at `localhost:<port>/remoteEntry.js` for each remote.
3. A root-level script (e.g. `start-all.sh` or a `concurrently` npm script) launches all dev servers at once.
4. Alternatively, use a `mocks/` entry in the host that stubs out remote modules for host-only development.

**Tip:** Document the port assignment (e.g. host: 3000, checkout: 3001, catalog: 3002) in the repo
README or a `PORTS.md` so new developers can onboard without guessing.

---

## Build Tool Requirement

Module Federation requires **Webpack 5** or **Rspack** as the bundler.

- Vite does not support MF natively — use the `@originjs/vite-plugin-federation` community plugin
  (less mature; evaluate carefully before committing).
- Create React App (Webpack 4) does not support MF — must be ejected or migrated to Vite/Next.js first.
- Next.js supports MF via `@module-federation/nextjs-mf` (community) or native App Router support
  in Next.js 13.4+ (experimental).

If the current stack does not support MF, surface this in the ADR and recommend
[frontend-stack-advisor](../frontend-stack-advisor/SKILL.md) to evaluate a build-tool migration.
