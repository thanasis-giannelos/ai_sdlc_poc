---
name: microfrontend-architect
description: "Analyse a frontend codebase or greenfield requirements and produce a micro-frontend
  decomposition plan with Module Federation topology and an ADR. Use when the user says
  'apply micro-frontend architecture', 'split into micro-frontends', 'MFE boundaries',
  'decompose the frontend', 'Module Federation setup', or 'micro frontend architecture'."
user-invocable: true
---

# Micro-Frontend Architect

Decomposes a frontend application into independently deployable micro-frontends by identifying domain boundaries, designing a Module Federation topology, and producing a decision record that teams can act on.

## When to Use

- The frontend codebase has grown to the point where multiple teams own distinct domains and need independent deploy cadences
- The user explicitly asks for micro-frontend or Module Federation architecture
- A `frontend-discovery` output is available and reveals a large monolithic route/component tree with natural domain seams
- Greenfield project where independent team deployments are a stated requirement from the start
- Scaling pain is visible: long CI times, frequent merge conflicts across team boundaries, or inability to deploy one domain without re-testing another

## Skill Boundaries

- Use this skill to decide **whether and how** to split the frontend into multiple apps and how those apps connect via Module Federation.
- If the user wants to design the **internal** folder structure, rendering strategy (SSR/SSG/CSR), or state boundaries **within a single app**, use [frontend-architecture-planner](../frontend-architecture-planner/SKILL.md) — run it separately for each remote after decomposition.
- If no inventory of the existing codebase exists yet, run [frontend-discovery](../frontend-discovery/SKILL.md) first to produce the input this skill needs.
- If the stack (framework, state library, build tool) has not been chosen yet, run [frontend-stack-advisor](../frontend-stack-advisor/SKILL.md) before this skill — Module Federation requires Webpack 5 or Rspack as the build tool.
- If the user wants to **codify idioms** of an existing remote into Claude Code rules, use [convention-extractor](../convention-extractor/SKILL.md) per remote after decomposition.

## Procedure

1. **Determine input mode** — confirm whether a `frontend-discovery` output is available (brownfield) or whether the user is providing a greenfield requirements description. Adjust heuristic application in step 2 accordingly.

2. **Identify seam candidates** — apply the rules in [boundary-heuristics.md](./references/boundary-heuristics.md) to the available input:
   - Group routes and features by business domain (checkout, catalog, user profile, admin)
   - Identify route clusters that never share components with other clusters
   - Map known team ownership — if one team owns a domain end-to-end, it is a strong remote candidate
   - Flag divergent update frequencies: slices that change at very different cadences should not share a deploy
   - Check for data isolation: slices with no shared API calls or global state with the rest are lowest-risk remotes

3. **Propose remote decomposition** — for each identified remote, state:
   - Remote name (kebab-case, e.g. `checkout-remote`)
   - Domain it owns
   - Routes / features it contains
   - Owning team placeholder (or "TBD")
   - Estimated JS weight if `frontend-discovery` data is available

4. **Design the host shell** — specify:
   - Routing strategy: path-based (each `/domain/*` prefix routes to its remote) vs. layout-based (shared shell renders remotes inside slots)
   - Shared layout: header, nav, footer — whether these live in the host or a dedicated shared remote
   - Auth approach: token forwarded to remotes via shared context, or each remote validates independently
   - Error boundary policy: each remote wrapped in an `<ErrorBoundary>` so one remote failure does not crash the host

5. **Define the Module Federation shared-dependency manifest** — using the patterns in [module-federation-patterns.md](./references/module-federation-patterns.md), list every package that must go into `shared:`:
   - Singleton packages (React, React-DOM, React Router) — flag `singleton: true, eager: false`
   - Design system / component library — flag `singleton: true` to prevent style conflicts
   - Auth context or session store — flag `singleton: true`
   - For each entry: specify whether version pinning should be exact or a semver range

6. **Map the federation topology** — produce an ASCII dependency graph showing:
   - The host app and each remote
   - Which remotes expose modules (and which module names)
   - Which remotes or the host consume those exposed modules
   - Any peer-to-peer remote dependencies (keep these to a minimum — document the trade-off if they exist)

7. **Produce the ADR** — fill in [mfe-adr-template.md](./assets/mfe-adr-template.md) with:
   - Context: why MFE is being considered for this project
   - Decision: number of remotes, their names, integration technique (Module Federation), host shell approach
   - Alternatives considered: monolith continuation, iframes, Web Components, server-side composition
   - Consequences: independent deploys and team autonomy (positive) vs. shared-dep versioning complexity, network overhead, local dev setup cost (negative)
   - Open questions: anything not yet resolved (team ownership, version alignment, CI/CD per remote)

8. **Recommend next steps** — provide an ordered list:
   - Run [frontend-architecture-planner](../frontend-architecture-planner/SKILL.md) for each remote to define its internal structure
   - Run [convention-extractor](../convention-extractor/SKILL.md) on any existing remote codebase to codify its idioms
   - Run [lint-config-generator](../lint-config-generator/SKILL.md) for shared ESLint/tsconfig rules that span all remotes
   - Set up independent CI pipelines per remote (one remote should not gate another's deploy)

## Output Contract

- **Remote decomposition map** — markdown table: remote name → domain → routes/features → owning team
- **Host shell definition** — prose or bullet list: routing strategy, shared layout scope, auth approach, error boundary policy
- **Module Federation shared-dependency manifest** — table: package name → version constraint → `singleton` flag → `eager` flag
- **Federation topology diagram** — ASCII graph of host ↔ remote relationships and any cross-remote dependencies
- **ADR** — completed [mfe-adr-template.md](./assets/mfe-adr-template.md) inline in the response
- **Next steps** — ordered list of follow-on skills to invoke, one per remote or cross-cutting concern

## Resources

- [boundary-heuristics.md](./references/boundary-heuristics.md)
- [module-federation-patterns.md](./references/module-federation-patterns.md)
- [mfe-adr-template.md](./assets/mfe-adr-template.md)

---

## Failure Handling

- If no `frontend-discovery` output is available and the user cannot describe the domain breakdown, stop and run [frontend-discovery](../frontend-discovery/SKILL.md) first before proceeding.
- If the build tool is not Webpack 5 or Rspack, Module Federation is not available — state this clearly, recommend [frontend-stack-advisor](../frontend-stack-advisor/SKILL.md) to revisit the build tool, and offer to document an iframe or Web Components approach instead.
- If fewer than two clear domain seams are identifiable, the project may not benefit from MFE yet — state this finding and recommend revisiting when team or codebase boundaries become clearer.

## Examples

### Example 1: Brownfield decomposition from discovery output

User says: "We've run frontend-discovery on our e-commerce app. Now apply micro-frontend architecture to it."

**Actions:**
1. Read the `frontend-discovery` output to extract the route inventory and component tree.
2. Apply boundary heuristics: identify `checkout`, `catalog`, `user-account`, and `admin` as seam candidates based on route clusters and zero cross-domain component sharing.
3. Propose four remotes plus a host shell; estimate JS weight per remote from discovery data.
4. Design the host: path-based routing (`/checkout/*`, `/catalog/*`, etc.), shared header in host, token forwarded via React context.
5. Define `shared:` manifest (React, React-DOM, React Router, design-system package).
6. Produce ASCII topology diagram and completed ADR.

**Result:** Remote decomposition table, host shell spec, `shared:` manifest, topology diagram, and a filled-in ADR ready for team review.

### Example 2: Greenfield MFE from requirements

User says: "We're building a new platform from scratch. Three teams: Search, Orders, and Account. We want independent deploys. Set up micro-frontend architecture."

**Actions:**
1. Detect greenfield mode — no discovery output available.
2. Map three teams directly to three remotes: `search-remote`, `orders-remote`, `account-remote`.
3. Design host shell with path-based routing and a shared nav component.
4. Define the `shared:` manifest for the agreed stack (React + React Router + Tailwind).
5. Produce topology diagram and ADR noting that alternative approaches were considered.

**Result:** Decomposition map, host shell spec, manifest, topology diagram, ADR, and per-team next steps.
