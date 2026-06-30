# Frontend Architecture Spec

_This is a fill-in template produced by `frontend-architecture-planner`. Replace every placeholder with project-specific values. Sections marked [REQUIRED] must be completed before sharing with the team; optional sections should be filled in as decisions are made._

---

## Section 1: Project Context [REQUIRED]

| Field | Value |
|-------|-------|
| Project name | _e.g. Acme Storefront_ |
| Framework + version | _e.g. Next.js 14.2 (App Router)_ |
| Rendering target | _e.g. Mix: SSG for marketing, SSR for product detail, CSR for dashboard_ |
| Stack ADR reference | _Link or date of the frontend-stack-advisor output this spec is based on_ |
| Greenfield / Brownfield | _Greenfield or Brownfield (if brownfield, note the current state in each section)_ |
| Date | _YYYY-MM-DD_ |

---

## Section 2: Folder Structure [REQUIRED]

_Replace the ASCII tree below with your project's actual top-level structure. Add a one-line description for each directory explaining what it owns. If this is a brownfield restructure, show the current structure first, then the target structure._

**Target structure:**

```
src/
  app/              # Next.js App Router routes and layouts (routing only — no business logic)
  features/
    <domain-a>/     # Domain A — components, hooks, API calls, types colocated
    <domain-b>/     # Domain B — replace with actual domain names
  shared/
    components/     # Generic reusable UI components (Button, Modal, DataTable)
    hooks/          # Generic hooks usable across features (useDebounce, useMediaQuery)
    lib/            # Third-party wrappers and config (queryClient, i18n, axiosInstance)
    types/          # TypeScript types and interfaces shared across multiple features
  styles/           # Global CSS, Tailwind base config, CSS custom properties
```

_If brownfield: add a "Current structure" subsection above showing the actual existing layout before describing the target._

---

## Section 3: Per-Route Rendering Strategy [REQUIRED]

_For each route group, assign a rendering strategy and document the rationale. Add or remove rows as needed._

| Route Pattern | Strategy | Data Freshness Requirement | Rationale |
|---------------|----------|---------------------------|-----------|
| _e.g. `/` (homepage)_ | _SSG_ | _Static — changes on CMS publish only_ | _No user-specific data; CDN-served for maximum performance_ |
| _e.g. `/products/[slug]`_ | _SSR_ | _Per-request — personalised recommendations_ | _User-specific content requires server-side rendering; SEO required_ |
| _e.g. `/dashboard`_ | _CSR_ | _Real-time — fetched client-side after auth_ | _Entirely auth-gated; no SEO requirement; highly interactive_ |

---

## Section 4: Routing Layout

**Root layout:** _Describe what the root layout (`app/layout.tsx` or equivalent) contains — e.g. global providers (QueryClientProvider, ThemeProvider), font loading, analytics scripts._

**Nested layouts:** _List each nested layout by route group and what it adds._

| Route group | Layout file | Contains |
|-------------|-------------|---------|
| _e.g. `(marketing)/`_ | _`app/(marketing)/layout.tsx`_ | _Marketing navigation, footer_ |
| _e.g. `(dashboard)/`_ | _`app/(dashboard)/layout.tsx`_ | _Sidebar, top nav, auth guard_ |

**Code-split entry points:** _List the lazy-loaded boundaries — routes or heavy components that are loaded dynamically to keep initial bundle size small._

- _e.g. `/dashboard` — loaded lazily; not included in the public-facing bundle_
- _e.g. Rich text editor component — dynamically imported on first use_

---

## Section 5: State Boundaries [REQUIRED]

_For each category of state the application manages, specify the library, scope, and persistence. Assign libraries from the stack ADR._

| State Category | Library | Scope | Persistence | Notes |
|----------------|---------|-------|-------------|-------|
| Server / Async State | _e.g. TanStack Query_ | _Feature-level_ | _In-memory (cache)_ | _staleTime and gcTime defined per query in the data-fetching layer_ |
| Client / UI State | _e.g. Zustand_ | _Global or feature-level_ | _In-memory_ | _One store per domain; avoid a single monolithic store_ |
| Form State | _e.g. React Hook Form_ | _Component-local_ | _In-memory_ | _Controlled by the form component; not lifted to global state_ |
| URL / Query State | _e.g. Next.js `useSearchParams`_ | _Route-level_ | _URL (browser history)_ | _Filters, pagination, and search terms live in the URL_ |

---

## Section 6: Data-Fetching Layer

**Where fetching lives:** _Specify the primary pattern — e.g. Next.js Server Components for initial data load + TanStack Query for client-side mutations and refetching; or all fetching via custom hooks in a Vite SPA._

**Error boundary pattern:** _Describe how error states are handled — e.g. React Error Boundaries wrapping each route segment (`error.tsx` in Next.js App Router); feature-level error boundaries for isolated sections._

**Loading pattern:** _Describe the loading UI approach — e.g. Suspense boundaries with skeleton screens (`loading.tsx` in Next.js App Router); per-component loading states managed by TanStack Query `isLoading`._

**Caching rules:**

| Data type | Cache config | Rationale |
|-----------|-------------|-----------|
| _e.g. Product catalog_ | _`staleTime: 5 * 60 * 1000` (5 min)_ | _Catalog changes infrequently; stale data acceptable for 5 minutes_ |
| _e.g. Cart contents_ | _`staleTime: 0` (always fresh)_ | _Cart must always reflect server state to prevent checkout errors_ |
| _e.g. User profile_ | _`staleTime: 10 * 60 * 1000` (10 min)_ | _Profile data changes rarely during a session_ |

---

## Section 7: Module Boundary Rules

_Document the import direction rule and directory ownership for this project. The standard rules are defined in `module-boundary-rules.md`. Note any project-specific deviations below._

**Allowed import directions:**

```
app/ (routing)  -->  features/  -->  shared/  -->  lib/
                                     shared/  -->  lib/
```

_Note any project-specific additions or exceptions here._

**Directory ownership:**

| Directory | Owns | Must NOT contain |
|-----------|------|-----------------|
| `app/` | Route entry points, layouts, metadata | Business logic, domain hooks |
| `features/<name>/` | Domain logic, feature components, feature hooks, feature API calls | Imports from other features |
| `shared/components/` | Generic reusable UI components | Domain logic, feature-specific state |
| `shared/hooks/` | Generic hooks usable across features | Feature-specific side effects |
| `shared/lib/` | Third-party wrappers and configuration | Business logic |
| `shared/types/` | Shared TypeScript types | Feature-specific types |

**Enforcement:**

- ESLint rule: _specify which plugin and configuration will be used, e.g. `eslint-plugin-boundaries` with element types mapped to the directories above_
- TypeScript path aliases: _list configured aliases, e.g. `@features/*`, `@shared/*`, `@app/*`_
- CI check: _specify whether boundary violations fail the CI build_

---

## Section 8: Open Questions

_Document decisions that have not yet been made, who owns the decision, and when it needs to be resolved. Remove rows as questions are answered._

| Question | Owner | Target Date |
|----------|-------|-------------|
| _e.g. Should the notifications feature be its own MFE remote or a feature inside this app?_ | _Engineering lead_ | _YYYY-MM-DD_ |
| _e.g. What is the staleTime budget for real-time inventory data on product detail pages?_ | _Product + Engineering_ | _YYYY-MM-DD_ |
| _e.g. Which route groups require authenticated layouts vs. public layouts?_ | _Product_ | _YYYY-MM-DD_ |
