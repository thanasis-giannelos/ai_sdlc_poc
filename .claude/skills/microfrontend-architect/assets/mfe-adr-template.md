# ADR: Micro-Frontend Decomposition

<!-- Fill in each section. Remove placeholder text when done. -->

---

## Status

<!-- One of: Proposed | Accepted | Superseded by ADR-XXX | Deprecated -->
Proposed

---

## Date

<!-- ISO 8601 date, e.g. 2025-09-01 -->
YYYY-MM-DD

---

## Deciders

<!-- List the people or roles who approved this decision -->
- [ ] Frontend Tech Lead
- [ ] Product Owner / Engineering Manager
- [ ] Affected team leads (one per remote)

---

## Context

<!-- 
  Why is MFE being considered now?
  Describe the pain: team coordination overhead, deploy coupling, codebase size, CI bottlenecks, etc.
  Include any quantitative signals if available (e.g. "deploy pipeline takes 40 min and blocks 3 teams").
-->

_Describe the problem here._

---

## Decision

We adopt a **micro-frontend architecture** using **Webpack 5 Module Federation** with the following
decomposition:

### Host Shell

| Property | Value |
|---|---|
| Routing strategy | <!-- path-based / layout-based --> |
| Shared layout scope | <!-- header, footer, nav — owned by host or dedicated remote --> |
| Auth approach | <!-- token forwarded via React context / each remote validates independently --> |
| Error boundary policy | <!-- each remote wrapped in ErrorBoundary / ... --> |

### Remote Apps

| Remote name | Domain | Routes / features | Owning team |
|---|---|---|---|
| `<remote-name>` | _e.g. Checkout_ | `/checkout/*` | Team A |
| `<remote-name>` | _e.g. Catalog_  | `/catalog/*`  | Team B |
| _(add rows as needed)_ | | | |

### Module Federation Shared-Dependency Manifest

| Package | Version constraint | Singleton | Eager |
|---|---|---|---|
| `react` | `^18.0.0` | yes | host only |
| `react-dom` | `^18.0.0` | yes | host only |
| `react-router-dom` | `^6.0.0` | yes | no |
| _(design system package)_ | `^x.y.z` | yes | no |
| _(auth context package)_ | `^x.y.z` | yes | no |

### Federation Topology

```
<!-- Replace with an ASCII diagram of your actual topology, e.g.:

Host (shell) :3000
  ├── loads → checkout-remote :3001
  │             exposes: <CheckoutApp />
  ├── loads → catalog-remote :3002
  │             exposes: <CatalogApp />
  └── loads → account-remote :3003
                exposes: <AccountApp />

shared: react, react-dom, react-router-dom, design-system
-->
```

---

## Alternatives Considered

### Option A: Continue with the monolith

**Description:** Keep all features in a single deployable frontend application.

**Pros:**
- No infrastructure or configuration overhead
- Simpler local development (one dev server)
- No shared-dep versioning complexity

**Cons:**
- All teams share a single deploy pipeline — one failing test blocks everyone
- Growing bundle size; harder to isolate team responsibilities
- Framework or library upgrades affect all teams simultaneously

**Rejected because:** _state reason_

---

### Option B: Iframes

**Description:** Each domain is served as a separate full-page app; the host embeds them in `<iframe>` elements.

**Pros:**
- Complete runtime isolation — no shared JS at all
- Zero shared-dep versioning risk
- Works with any framework or build tool

**Cons:**
- Cross-frame communication is cumbersome (postMessage)
- Shared state (auth tokens, navigation) requires coordination
- Poor accessibility: focus management and screen-reader context break across iframe boundaries
- Poor UX for transitions and animations

**Rejected because:** _state reason_

---

### Option C: Web Components / Custom Elements

**Description:** Each domain exposes its UI as standard browser custom elements that the host renders.

**Pros:**
- Framework-agnostic integration — works when teams use different frameworks
- Strong encapsulation via Shadow DOM

**Cons:**
- Shadow DOM conflicts with global CSS and design tokens
- React and Vue interop with Web Components has rough edges (event handling, property vs attribute)
- No built-in code-sharing mechanism (must duplicate or separately distribute shared deps)

**Rejected because:** _state reason_

---

### Option D: Server-Side Composition

**Description:** Each domain is rendered server-side and assembled into a single response (e.g. via
Edge Side Includes, server-side includes, or a composition proxy).

**Pros:**
- No client-side loading cost for integration
- Strong isolation — each service owns its own server

**Cons:**
- Requires server infrastructure per domain
- Client-side interactivity across domain boundaries becomes complex
- High latency if composition waits for the slowest service

**Rejected because:** _state reason_

---

## Consequences

### Positive

- Each team can deploy their remote independently without coordinating with other teams.
- CI pipelines can be scoped per remote — failing tests in one domain do not block others.
- Bundle splitting is explicit: users only download the code for the domain they are visiting.
- Teams can upgrade their own dependencies on their own schedule (within shared singleton constraints).

### Negative

- Shared singleton versioning must be actively managed. A version mismatch in `react` or the design
  system between remotes will cause runtime errors or style conflicts.
- Local development requires running multiple dev servers simultaneously.
- The host shell becomes a coordination point for routing and auth — changes to shared navigation
  affect all teams.
- Network overhead: each remote's `remoteEntry.js` is an extra HTTP request on first load.
- Debugging across remote boundaries is harder — source maps must be configured per remote.

---

## Open Questions

<!-- List anything not yet decided. Assign an owner and a target date for resolution. -->

| Question | Owner | Target date |
|---|---|---|
| Which team owns the host shell long-term? | | |
| Will remotes share a monorepo or be separate repositories? | | |
| How will the `shared:` version constraint be enforced in CI? | | |
| What is the rollback strategy if a remote deploy is broken? | | |
| _(add more)_ | | |
