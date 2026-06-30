# Folder Structure Patterns

Three main patterns govern how frontend source code is organised: layer-based, feature-based, and hybrid. Each trades off between simplicity, scalability, and team ownership clarity. Choosing the right pattern at the start of a project is significantly cheaper than migrating later — pick the one that matches the expected project size and team structure, not just the current state.

---

## Section 1: Layer-Based (Classic)

All code is grouped by technical layer rather than by domain or feature.

```
src/
  components/     # All React components
  hooks/          # All custom hooks
  utils/          # Utility functions
  pages/          # Page-level components (or views/ in non-Next.js projects)
  services/       # API call functions
  types/          # TypeScript interfaces and types
```

**When to use:**
- Small projects with a single domain (one bounded context).
- Teams new to React who are already familiar with the pattern from tutorials and CRA boilerplate.
- Single-developer projects or very small teams (1-2 engineers) where the lack of formal boundaries is not yet a problem.
- Legacy CRA codebases where the cost of restructuring outweighs the benefit.

**When it breaks down:**
As the project grows, `components/` and `hooks/` become dumping grounds with dozens of unrelated files. It becomes unclear which components belong to which feature. Deleting or transferring a feature requires hunting across multiple top-level directories. Onboarding new engineers requires understanding the entire codebase to locate related code.

**Pros:**
- Simple and familiar — matches how most introductory React tutorials are structured.
- Easy to onboard engineers who have seen this pattern before.
- Low ceremony — no taxonomy decisions required upfront.

**Cons:**
- Poor scalability past a few dozen components.
- "Proximity problem" — related code is spread across multiple top-level directories, making it harder to reason about a single feature in isolation.
- No natural ownership boundary — any file can import any other file without restriction.

---

## Section 2: Feature-Based (Colocation)

Code is grouped by domain feature. Each feature directory contains all of the code that belongs to that domain: its components, hooks, API calls, and types.

```
src/
  features/
    checkout/
      components/   # Checkout-specific components
      hooks/        # Checkout-specific hooks
      api/          # Checkout API call functions
      types/        # Checkout TypeScript types
      index.ts      # Public API — only exported symbols are accessible outside this feature
    catalog/
      components/
      hooks/
      api/
      types/
      index.ts
  shared/           # Cross-feature utilities and design system components
  pages/            # Routing entry points only
```

**When to use:**
- Medium-to-large projects with two or more distinct domain areas (e.g. checkout, catalog, user profile, notifications).
- Multi-team codebases where different teams own different features — the directory structure mirrors team ownership.
- Projects aligned with domain-driven design where the bounded context is well-understood.

**When it breaks down:**
Shared code placement becomes unclear — should a hook used by both `checkout` and `catalog` live in `checkout/hooks/` or `catalog/hooks/`? Without an explicit `shared/` layer and module boundary rules, features drift toward importing each other directly, recreating the coupling problem in a different form.

**Pros:**
- All code related to a feature lives in one place — easy to navigate, understand, and delete a feature entirely.
- Maps naturally to team ownership and code review boundaries.
- Encourages thinking about features as independently deployable and replaceable units.

**Cons:**
- Shared code placement requires explicit rules and a `shared/` layer, or it becomes a source of confusion.
- Newcomers need to understand the domain taxonomy before they can find anything.
- Risk of feature-to-feature coupling if boundary rules are not enforced mechanically.

---

## Section 3: Hybrid (Recommended for Most Projects)

The hybrid pattern combines feature-based colocation for domain code with a dedicated `shared/` layer for cross-cutting concerns. This is the recommended default for most React projects with more than one domain or more than one developer.

```
src/
  features/         # Domain-specific code, colocated by feature
    <domain-a>/
    <domain-b>/
  shared/           # Cross-cutting concerns used by multiple features
    components/     # Generic, reusable UI components (Button, Modal, DataTable)
    hooks/          # Generic hooks (useDebounce, useLocalStorage, useMediaQuery)
    lib/            # Third-party wrappers and configuration (queryClient, i18n, axios)
    types/          # TypeScript types shared across multiple features
  app/              # Routing entry points and layouts (Next.js App Router, or pages/ equivalent)
  styles/           # Global CSS, Tailwind base config, CSS variables
```

**Explanation:**
Domain features are colocated under `src/features/` — everything that belongs to a bounded context lives there. Cross-cutting concerns that genuinely need to be shared across multiple features (the design system, generic hooks, the API client, auth utilities) live under `src/shared/`. Routing entry points (pages, layouts, route files) live in `src/app/` or `src/pages/` and serve only as the thin layer that wires routes to feature code.

**When to use:**
Most React projects with two or more domains or two or more developers will benefit from this pattern. It provides enough structure to prevent the `components/` dumping-ground problem while remaining simple enough to adopt incrementally.

**Import rule:** Features may import from `shared/`. Features must not import from other features directly. If two features need to share logic, that logic belongs in `shared/`.

---

## Section 4: Next.js App Router Specifics

The Next.js App Router introduces `app/` as a file-system-based routing directory with its own conventions. Several implications follow:

- **`app/` is a routing layer, not a source directory.** Business logic, domain hooks, and feature components should not live inside `app/`. The `app/` directory should contain only route files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`), metadata exports, and the minimum glue code needed to connect a route to its feature.
- **Recommended layout:** use `app/` for routing only, with all feature and shared logic in `src/features/` and `src/shared/` alongside it (or inside `src/` with `app/` at the root level per Next.js defaults).
- **Route groups** (`(groupName)/`) organise routes into logical sections without affecting the URL. Use them to separate layouts — for example `(marketing)/` for public pages with a marketing layout and `(dashboard)/` for auth-gated pages with a sidebar layout — without creating URL path segments for the group names.

Example:
```
app/
  (marketing)/
    layout.tsx        # Marketing shell layout
    page.tsx          # Homepage
    about/
      page.tsx
  (dashboard)/
    layout.tsx        # Dashboard shell layout (requires auth)
    overview/
      page.tsx
    settings/
      page.tsx
src/
  features/
    ...
  shared/
    ...
```

---

## Section 5: Barrel Files (`index.ts`) — When to Use and When Not To

Barrel files (`index.ts`) re-export symbols from a directory, creating a single import entry point for consumers.

**When to use:**
- The public API of a feature module — `src/features/checkout/index.ts` exports only the components and hooks that other parts of the application are allowed to use.
- A design system or component library where consumers should import from a single package-like entry point (`@shared/components`).

**When NOT to use:**
- Internal implementation details within a feature — internal sub-components, internal hooks, and internal types should not be re-exported via the barrel. They are private to the feature.
- Deeply nested component trees inside a feature — wrapping every subdirectory in a barrel file creates a chain of re-exports that some bundlers (particularly those that cannot statically analyse re-exports) cannot tree-shake, resulting in larger bundles.

**Rule of thumb:** One barrel per feature at `src/features/<name>/index.ts`, exporting only the public interface of that feature. Do not create barrels for internal implementation subdirectories (e.g. `src/features/checkout/components/index.ts` is usually unnecessary and potentially harmful to bundle size).
