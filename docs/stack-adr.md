# ADR: Frontend Stack Selection — Mini Storefront MFE POC

**Status:** Accepted

**Date:** 2026-06-29

**Deciders:**
- [x] Frontend Tech Lead
- [x] Engineering Manager (POC sponsor)

---

## Context

This is a greenfield micro-frontend proof-of-concept delivering a Mini Storefront across
three business domains: `catalog` (product list), `cart` (checkout), and `account`
(login/profile). The app will be decomposed into three MFE remotes plus a host shell
using Module Federation in a subsequent pipeline step.

**Hard infrastructure constraint:** the `microfrontend-architect` skill — which runs
later in this pipeline — requires Webpack 5-compatible Module Federation. Vite does not
implement the Module Federation spec; therefore **Vite is explicitly disallowed** for
this project. All framework and build-tool choices are constrained by this requirement.

**NFR summary:**
- SEO: not required — the storefront is a POC rendered client-side; no public indexing
- Accessibility: WCAG AA target (best-effort for POC)
- Performance: no hard budget for POC; fast local dev iteration is prioritised
- Browser support: modern evergreen (Chrome/Edge/Firefox/Safari latest)
- i18n: single locale (English) — i18n libraries are out of scope
- Deploy target: localhost static build on fixed ports (host + 3 remotes)
- Node.js: v24 confirmed available

---

## Decision

### Stack Summary

| Concern               | Chosen Option                        | Version Constraint  |
|-----------------------|--------------------------------------|---------------------|
| Build tool            | Rspack                               | `^1.0.0`            |
| Module Federation     | `@module-federation/enhanced`        | `^0.6.0`            |
| Framework             | React (CSR SPA per remote)           | `^18.3.0`           |
| Language              | TypeScript                           | `^5.4.0`            |
| Routing (host shell)  | React Router v6                      | `^6.23.0`           |
| State — Server State  | TanStack Query v5                    | `^5.0.0`            |
| State — Client / UI   | Zustand                              | `^4.5.0`            |
| Styling               | Tailwind CSS v3                      | `^3.4.0`            |
| Forms                 | React Hook Form + Zod                | `^7.51.0` / `^3.23.0` |
| i18n                  | None (single locale)                 | N/A                 |
| Unit Testing          | Vitest + React Testing Library       | `^1.6.0` / `^16.0.0` |
| E2E Testing           | Playwright                           | `^1.44.0`           |

### Why This Stack

The Module Federation hard constraint drives everything: Rspack (a Rust-based Webpack
drop-in replacement) provides full Webpack 5 Module Federation compatibility while
delivering significantly faster builds than Webpack 5 itself — the ideal choice for a
POC where fast iteration matters. React with CSR is sufficient because the storefront is
not public-facing and has no SEO requirement. TanStack Query handles product and cart
server state (async fetches, caching, refetch), while Zustand manages lightweight
cross-remote UI state such as the cart item count displayed in the host shell's NavBar.
Tailwind maps cleanly to the design tokens extracted from the Catalyst Storefront spec,
and React Hook Form + Zod covers the login form's validation requirements with minimal
boilerplate. Vitest is chosen over Jest because it integrates with Rspack's module
resolution without a separate transform pipeline, and Playwright is the default
recommendation for new E2E suites.

---

## Alternatives Considered

### Alternative 1 — Vite SPA + React

**Description:** Standard Vite-based React SPA; the most common greenfield React setup
in 2024–2026.

**Pros:**
- Fastest cold-start dev server; near-instant HMR
- Minimal configuration; excellent TypeScript and JSX support out of the box
- Large ecosystem of Vite plugins

**Cons:**
- Vite does not implement Webpack 5 Module Federation; `vite-plugin-federation` is a
  partial, community re-implementation that is incompatible with `@module-federation/enhanced`
- The `microfrontend-architect` skill explicitly fails on Vite-based projects

**Rejected because:** Hard pipeline constraint. Vite cannot be used.

---

### Alternative 2 — Webpack 5 + `ModuleFederationPlugin`

**Description:** Original Webpack 5 with the built-in `ModuleFederationPlugin`; the
reference implementation for Module Federation.

**Pros:**
- Maximum documentation and community examples for MFE patterns
- Fully compatible with `microfrontend-architect` skill outputs
- No third-party build-tool risk

**Cons:**
- Webpack 5 build times are significantly slower than Rspack, especially on cold builds
- Configuration verbosity is high; Rspack provides an identical API surface with a
  simpler getting-started story
- Rspack is a strict superset — it accepts Webpack 5 configs unchanged

**Rejected because:** Rspack is API-compatible with Webpack 5, accepts the same
`ModuleFederationPlugin` config, and builds 5–10× faster. No downside for a POC.

---

### Alternative 3 — Next.js 14 + Module Federation

**Description:** Next.js 14 App Router with `@module-federation/nextjs-mf` plugin.

**Pros:**
- SSR + RSC capability if SEO becomes a requirement later
- Familiar framework for React teams

**Cons:**
- `@module-federation/nextjs-mf` adds significant complexity to the Next.js build pipeline
- App Router RSC boundary rules conflict with the runtime module-sharing model that
  Module Federation relies on
- Each remote would need its own Next.js server instance; far heavier than a static
  Rspack build for a POC deploy

**Rejected because:** Over-engineered for a CSR POC with no SEO requirement; the MFE +
RSC integration surface adds risk without benefit.

---

## Consequences

### Positive

- Rspack + Module Federation is the industry-standard stack for MFE decomposition;
  `microfrontend-architect` outputs will work without modification
- Tailwind + design token table from `requirements-spec.md` enables direct mapping
  of Figma tokens to utility classes — no separate token pipeline needed for the POC
- TanStack Query + Zustand cleanly separate server state from UI state, preventing
  cart item count from being stale after a remote re-mount
- Playwright covers the full login → browse → add to cart → checkout E2E flow across
  all three remotes in a single test suite

### Negative / Risks

- Rspack is younger than Webpack 5; edge-case plugin incompatibilities may surface.
  Mitigation: fall back to Webpack 5 config (API-identical) if a blocker is hit
- Module Federation shared dependency version pinning requires discipline: if `catalog`
  and `cart` remotes ship different React versions, the host shell will load both.
  Pin `react` and `react-dom` as `singleton: true` in all federation configs
- Vitest + Rspack requires `@vitest/coverage-v8`; confirm the Rspack resolver plugin
  does not conflict with Vitest's module mock system before writing the first test

---

## Open Questions

| Question | Owner | Target Date |
|---|---|---|
| Confirm `@module-federation/enhanced` v0.6+ works with Rspack v1.x without patching | Frontend Tech Lead | Before Step 5 (microfrontend-architect) |
| Decide fixed localhost ports for host + 3 remotes (e.g. 3000 / 3001 / 3002 / 3003) | Frontend Tech Lead | Before Step 3 (catalog build) |
| Playwright install with `--with-deps chromium` — confirm no proxy/firewall block in local environment | Frontend Tech Lead | Before Step 9 (E2E generation) |

---

## Next Step

Run **`frontend-architecture-planner`** with this ADR as input to define the internal
folder structure, rendering boundaries, and state ownership model for each remote before
code generation begins.

> Note: in this pipeline, `frontend-architecture-planner` runs after `microfrontend-architect`
> (Step 6) so that the remote decomposition is known first. This ADR is its primary input.
