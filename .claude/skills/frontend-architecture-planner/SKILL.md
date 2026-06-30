---
name: frontend-architecture-planner
description: "Defines the frontend application architecture: folder structure, per-route rendering
  strategy (SSR/SSG/ISR/CSR), routing layout, state boundaries, data-fetching layer, and module
  boundaries. Consumes the stack ADR from frontend-stack-advisor. Use when the user says 'plan
  the frontend architecture', 'define folder structure', 'frontend architecture spec', 'rendering
  strategy per route', 'state boundaries', 'data fetching layer', or 'frontend blueprint'."
user-invocable: true
---

## When to Use

- The stack has been chosen (via `frontend-stack-advisor`) and the next step is deciding how to structure the application.
- Starting a new frontend project and needing a folder layout, rendering strategy, and module boundary decisions documented before implementation begins.
- An existing project has grown organically and needs its architecture rationalized and documented.
- `convention-extractor` has been run (brownfield) and the team wants to validate or redesign the current structure.
- The user explicitly asks for folder structure, routing layout, rendering strategy, or state boundary decisions.

## Skill Boundaries

- Use this skill to decide HOW the app is structured (folder layout, routing, state boundaries, data-fetching layer). If the stack (WHICH libraries) has not been chosen yet, run `frontend-stack-advisor` first.
- `architecture-planner` (the existing general skill) covers backend/fullstack implementation patterns (design patterns, module connections, integration points, security). This skill is frontend-only.
- `microfrontend-architect` decides whether to split into MULTIPLE apps. This skill structures a SINGLE app. If MFE is in use, run this skill separately for each remote after `microfrontend-architect` completes.
- `convention-extractor` codifies conventions of an EXISTING project into `.claude/rules/`. This skill defines the TARGET architecture — use it for new projects or as the reference standard before running convention-extractor on a brownfield codebase.
- `design-tokens-architect` and `lint-config-generator` are downstream of this skill — run them after the architecture is defined.

## Procedure

1. **Confirm inputs** — verify the stack ADR from `frontend-stack-advisor` is available (framework, state library, styling choice, rendering target). If not available, stop and run `frontend-stack-advisor` first. Also confirm whether this is greenfield (new project) or brownfield (existing codebase to restructure).
2. **Choose folder structure pattern** — using [folder-structure-patterns.md](./references/folder-structure-patterns.md), select the appropriate pattern (feature-based colocation, layer-based, or hybrid) based on project size, team structure, and framework conventions. Define top-level directory names and what each layer owns.
3. **Define per-route rendering strategy** — for each route group in the application, assign a rendering strategy (SSR/SSG/ISR/CSR) using [rendering-strategies.md](./references/rendering-strategies.md). Map each route's SEO requirement, data freshness requirement, and TTFB constraint to the appropriate strategy.
4. **Design routing layout** — define the layout hierarchy: shared root layout, nested layouts per section, route groups (Next.js App Router) or layout route components (Remix). Identify code-splitting boundaries and lazy-loading entry points.
5. **Define state boundaries** — categorise all state the application manages: server/async state (TanStack Query, SWR), client/UI state (Zustand, Redux Toolkit), form state (React Hook Form), URL/query state (search params, router state). For each category: assign the library from the stack ADR, define scope (component-local / feature-level / global), and specify persistence (in-memory / URL / sessionStorage / localStorage).
6. **Design the data-fetching layer** — specify where data fetching lives: Server Components (Next.js), loaders (Remix), custom hooks (SPA). Define the standard error boundary and loading skeleton pattern. Document the caching strategy (TanStack Query staleTime/gcTime, Next.js `fetch` cache config, or SWR revalidation rules).
7. **Define module boundaries** — using [module-boundary-rules.md](./references/module-boundary-rules.md), specify what each top-level directory owns, what import directions are allowed, and the coupling rules (e.g. `features/` may import from `shared/` but never from another feature directly).
8. **Produce the architecture spec** — fill in [architecture-spec-template.md](./assets/architecture-spec-template.md): ASCII folder tree with one-line descriptions, rendering strategy table, state boundaries map, data-fetching layer description, module boundary rules.
9. **Flag open questions and recommend next steps** — list anything not yet decided (team alignment on colocation vs. layering, specific state scope for a disputed domain). Recommend: `design-tokens-architect` for token system, `convention-extractor` if brownfield, `lint-config-generator` to enforce module boundaries mechanically.

## Output Contract

- **Folder structure diagram** — ASCII directory tree with one-line description per layer/directory.
- **Per-route rendering strategy table** — route pattern → strategy (SSR/SSG/ISR/CSR) → data freshness requirement → rationale.
- **Routing layout description** — layout hierarchy prose + diagram, shared layout components identified, code-split entry points.
- **State boundaries map** — table: state category → library → scope (component / feature / global) → persistence mechanism.
- **Data-fetching layer description** — where fetching lives, error/loading pattern used, caching rules.
- **Module boundary rules** — what each top-level directory owns, allowed import directions, prohibited patterns.
- **Architecture spec document** — completed `architecture-spec-template.md`.
- **Open questions + next steps.**

## Resources

- [rendering-strategies.md](./references/rendering-strategies.md)
- [folder-structure-patterns.md](./references/folder-structure-patterns.md)
- [module-boundary-rules.md](./references/module-boundary-rules.md)
- [architecture-spec-template.md](./assets/architecture-spec-template.md)

## Failure Handling

- If the stack ADR is unavailable and the user cannot describe the framework and libraries, stop and run `frontend-stack-advisor` first — folder structure and rendering strategy decisions are framework-dependent.
- If the project is brownfield and the existing structure contradicts the recommended pattern, document both the current state and the target state in the architecture spec; do not silently propose a greenfield layout for a brownfield codebase.
- If a route's rendering strategy cannot be determined (conflicting SEO and freshness requirements), flag it as an open question and propose both options with trade-offs rather than picking arbitrarily.

## Examples

### Example 1: New Next.js e-commerce app

**User says:** "We've chosen Next.js App Router + TanStack Query + Zustand + Tailwind. Now plan the architecture."

**Actions taken:**
- Selects hybrid folder structure (`features/` for domain code, `shared/` for design system + utils).
- Assigns SSG to product listing pages (static catalog, CDN-served).
- Assigns SSR to product detail pages (personalised recommendations require per-request data).
- Assigns CSR to cart/checkout (auth-gated, no SEO crawl requirement).
- Designs TanStack Query for product/catalog server state + Zustand for cart client state.

**Result:** Architecture spec with folder tree, rendering strategy table, state boundaries map, and data-fetching layer description.

---

### Example 2: Brownfield SPA restructure

**User says:** "Our Vite SPA has grown messy. We need to define a proper structure."

**Actions taken:**
- Detects brownfield; documents current folder layout before proposing changes.
- Runs through `folder-structure-patterns.md` to select feature-based colocation as the target pattern.
- Documents current state vs. target state side by side.
- Defines module boundary rules and flags files that would need to move.

**Result:** Architecture spec documenting current structure alongside target, with a list of migration steps required to reach the target state.
