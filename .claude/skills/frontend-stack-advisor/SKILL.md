---
name: frontend-stack-advisor
description: "Takes project requirements and frontend-nfr-gatherer output and recommends a
  frontend stack with rationale and trade-offs: framework/rendering, state, styling, forms,
  data-fetching, i18n, and testing libraries. Produces a decision matrix and an ADR consumed
  by frontend-architecture-planner and development skills. Use when the user says 'recommend
  a frontend stack', 'which framework should we use', 'help me choose a stack', 'what state
  library', 'frontend tech choices', or 'stack ADR'."
user-invocable: true
---

## When to Use

- Starting a new frontend project and the framework/library choices haven't been made yet
- Migrating an existing project and the new stack needs to be evaluated against NFR constraints
- The team is debating framework or library options and needs a structured trade-off analysis
- The `frontend-nfr-gatherer` output is available and the next step is translating constraints into concrete library choices
- The user explicitly asks for a stack recommendation, ADR, or decision matrix

## Skill Boundaries

- Use this skill to decide WHICH libraries to use. If the user wants to design HOW the app is structured using those libraries (folder layout, rendering strategy per route, state boundaries), use `frontend-architecture-planner` after this skill.
- `frontend-nfr-gatherer` captures the constraints this skill consumes (WCAG level, performance budgets, browser support, i18n scope). Run it first if those constraints are not yet documented.
- `architecture-planner` covers general backend/fullstack implementation patterns. This skill is frontend library selection only.
- `microfrontend-architect` assumes the stack is already chosen. Run this skill before `microfrontend-architect` if MFE is being considered.

## Procedure

1. **Gather inputs** — confirm an NFR spec from `frontend-nfr-gatherer` is available (or ask the user to describe constraints manually). Ask for: project type (content/marketing site, SPA/dashboard, e-commerce, internal tool), whether this is greenfield or brownfield, and any hard constraints (existing infra, team experience).
2. **Choose framework + rendering mode** — using [framework-comparison.md](./references/framework-comparison.md), map NFR constraints (SEO tier, TTFB budget, WCAG level, i18n scope) to framework and rendering strategy (Next.js App Router, Remix, Vite SPA, Nuxt, Astro).
3. **Choose state management** — using [library-landscape.md](./references/library-landscape.md), map the server-state vs. client-state ratio and interaction complexity to a library (TanStack Query, Zustand, Redux Toolkit, Jotai, React Context).
4. **Choose styling approach** — map design system presence, token requirements, and team familiarity to: Tailwind CSS, CSS Modules, styled-components, Emotion, or vanilla-extract.
5. **Choose forms library** — map form complexity and validation requirements to: React Hook Form (recommended default), Formik, TanStack Form, or native HTML5 validation.
6. **Choose i18n library** — if the NFR spec lists a non-trivial locale scope (more than one language), recommend `next-intl` (Next.js), `react-i18next` (framework-agnostic), or `lingui`. Skip this step if i18n scope is single-locale only.
7. **Choose testing libraries** — map to the chosen framework: Vitest + React Testing Library for unit/integration; Playwright (recommended) or Cypress for E2E. Note any framework-specific test utilities (e.g. Next.js `renderWithRouter`).
8. **Complete the decision matrix** — fill in [stack-decision-matrix.md](./assets/stack-decision-matrix.md): one row per concern, recording chosen option, alternatives considered, rationale, and the driving NFR constraint or project signal.
9. **Complete the ADR** — fill in [stack-adr-template.md](./assets/stack-adr-template.md). List open questions (team familiarity gaps, existing infra constraints not yet resolved). Recommend `frontend-architecture-planner` as the next step, passing the completed ADR as input.

## Output Contract

- **Decision matrix** — table: concern → chosen option → alternatives considered → rationale → driving constraint
- **ADR** — completed `stack-adr-template.md` (status, context, decision, alternatives, consequences)
- **Dependency constraint list** — specific version ranges or known incompatibilities (e.g. "Next.js 14 requires React 18.2+; App Router requires React Server Components support in all libraries")
- **Open questions list** — anything not yet resolved (team familiarity, existing infra constraints, pending vendor evaluation)
- **Next step** — explicit recommendation to run `frontend-architecture-planner` with the stack ADR as input

## Failure Handling

- If no NFR spec is available and the user cannot describe constraints, stop and run `frontend-nfr-gatherer` first — making stack choices without performance, accessibility, and browser constraints produces recommendations that may need to be reversed.
- If there is a hard existing-infra constraint (e.g. "must use Webpack 4", "must deploy to a static host with no SSR"), surface it prominently in the ADR consequences and note which otherwise-preferred options it eliminates.

## Examples

### Greenfield SaaS dashboard

User says: "We're building a new SaaS dashboard, mostly internal tool, no SEO needed, team knows React."

Actions: detects SPA/dashboard project type; maps no-SEO constraint to Vite SPA or Next.js without SSR; maps complex client state to Zustand + TanStack Query; recommends Tailwind + React Hook Form + Vitest + Playwright.

Result: decision matrix + ADR recommending Vite + React + Zustand + TanStack Query stack.

### E-commerce migration

User says: "We're rewriting our e-commerce site, need strong SEO, targeting WCAG AA, 12 locales."

Actions: maps SEO + 12 locales + WCAG AA to Next.js App Router + next-intl + Tailwind; recommends TanStack Query for product/cart server state.

Result: decision matrix + ADR with Next.js App Router stack.

## Resources

- [framework-comparison.md](./references/framework-comparison.md)
- [library-landscape.md](./references/library-landscape.md)
- [stack-decision-matrix.md](./assets/stack-decision-matrix.md)
- [stack-adr-template.md](./assets/stack-adr-template.md)
