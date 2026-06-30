# ADR: Frontend Stack Selection

**Status:** _Proposed / Accepted / Superseded — delete inapplicable options_

**Date:** _YYYY-MM-DD_

**Deciders:**

- [ ] Frontend Tech Lead
- [ ] Product Owner / Engineering Manager
- [ ] Affected team leads

---

## Context

_Describe the project type (content site, SaaS dashboard, e-commerce, internal tool), the team's existing skills and experience, and the NFR constraints that shaped this decision. Reference the completed `stack-decision-matrix.md` as the supporting evidence. Include: SEO requirements, WCAG accessibility target, performance budgets (TTFB, LCP, bundle size), browser support matrix, i18n scope (number of locales), and any hard infrastructure constraints (deployment target, Node.js version, existing toolchain)._

---

## Decision

### Stack Summary

| Concern | Chosen Option | Version Constraint |
|---|---|---|
| Framework | _e.g. Next.js 14_ | _e.g. `^14.0.0`_ |
| Rendering Strategy | _e.g. App Router — SSG for marketing, SSR for app routes_ | _N/A_ |
| State — Server State | _e.g. TanStack Query v5_ | _e.g. `^5.0.0`_ |
| State — Client / UI State | _e.g. Zustand_ | _e.g. `^4.0.0`_ |
| Styling | _e.g. Tailwind CSS_ | _e.g. `^3.4.0`_ |
| Forms | _e.g. React Hook Form + Zod_ | _e.g. `^7.0.0` / `^3.0.0`_ |
| i18n | _e.g. next-intl_ | _e.g. `^3.0.0`_ |
| Unit Testing | _e.g. Vitest + React Testing Library_ | _e.g. `^1.6.0` / `^16.0.0`_ |
| E2E Testing | _e.g. Playwright_ | _e.g. `^1.44.0`_ |

### Why This Stack

_Write 3–5 sentences explaining the core reasoning: how the chosen stack satisfies the dominant NFR constraints, why it fits the team's existing skills, and what makes this combination coherent (e.g. the rendering strategy aligns with the data fetching model, the state libraries complement each other rather than overlap)._

---

## Alternatives Considered

### Alternative 1

**Option Name:** _e.g. Remix + Zustand + Tailwind_

**Description:** _Brief description of this alternative stack and its primary differentiator._

**Pros:**
- _e.g. Co-located loader/action data fetching eliminates the need for TanStack Query_
- _e.g. Strong progressive enhancement story_

**Cons:**
- _e.g. Smaller ecosystem than Next.js; fewer third-party integrations_
- _e.g. Team has no Remix experience; ramp-up cost estimated at 2–3 sprints_

**Rejected because:** _e.g. Team familiarity strongly favours Next.js; Remix's progressive enhancement benefit is not required for this auth-gated application._

---

### Alternative 2

**Option Name:** _e.g. Vite SPA + Redux Toolkit + CSS Modules_

**Description:** _Brief description of this alternative and its primary differentiator._

**Pros:**
- _e.g. Simplest possible setup for a dashboard with no SSR requirement_
- _e.g. Redux Toolkit provides a well-understood, auditable state model_

**Cons:**
- _e.g. Redux Toolkit overhead is disproportionate to the volume of client state in this project_
- _e.g. CSS Modules lack built-in design token integration, requiring additional tooling_

**Rejected because:** _e.g. Zustand satisfies the client state requirement with significantly less boilerplate; Tailwind offers faster design token integration with the provided Figma token export._

---

### Alternative 3

**Option Name:** _e.g. Astro + react-i18next + Tailwind_

**Description:** _Brief description of this alternative and its primary differentiator._

**Pros:**
- _e.g. Best-in-class static site performance; minimal JavaScript shipped by default_
- _e.g. Framework-agnostic Islands allow mixing React and Svelte components_

**Cons:**
- _e.g. Dynamic authenticated sections require a separate React SPA or significant Islands complexity_
- _e.g. Not well-suited to the SaaS dashboard portion of the project_

**Rejected because:** _e.g. The project contains a substantial authenticated app section alongside the public marketing pages; Next.js App Router handles this hybrid requirement in a single project while Astro would require a separate deployment._

---

## Consequences

### Positive

- _e.g. Chosen stack is well-documented with a large community; known failure modes and patterns are readily available_
- _e.g. Team's existing React/Next.js experience reduces onboarding time and ramp-up risk_
- _e.g. TanStack Query + Zustand divide server and client state clearly, preventing the "cache everything in Redux" anti-pattern_
- _e.g. Playwright provides multi-browser E2E coverage without additional tooling or paid services_

### Negative / Risks

- _e.g. React Server Components (App Router) require a learning investment; components incorrectly marked as server components cause subtle bugs_
- _e.g. Next.js 14 requires Node.js 18.17+; deployment environment must be upgraded before go-live_
- _e.g. [Specific incompatibility identified during analysis — e.g. third-party library X does not yet support RSC; must wrap in `'use client'`]_
- _e.g. Tailwind's utility-class approach requires team discipline (component extraction, consistent `cn()` usage) to maintain readability at scale_

---

## Open Questions

| Question | Owner | Target Date |
|---|---|---|
| _e.g. Does the CI/CD pipeline support Node.js 18.17+? Confirm with DevOps before finalising._ | _e.g. DevOps Lead_ | _e.g. YYYY-MM-DD_ |
| _e.g. Has the design team exported Tailwind-compatible tokens from Figma? Unblocks styling setup._ | _e.g. Design Lead_ | _e.g. YYYY-MM-DD_ |
| _e.g. Is third-party library [X] RSC-compatible or does it require a `'use client'` boundary?_ | _e.g. Frontend Tech Lead_ | _e.g. YYYY-MM-DD_ |
