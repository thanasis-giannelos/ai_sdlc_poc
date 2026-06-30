# Module Boundary Rules

Module boundaries define which parts of a codebase are allowed to depend on which other parts. Without explicit boundaries, a large frontend codebase will drift toward a tightly coupled graph where changing any file can break anything else. Enforcing module boundaries prevents circular dependencies, makes individual features independently deletable, and makes ownership clear — a team can confidently modify code inside their feature directory without needing to understand the rest of the application.

---

## Section 1: The Import Direction Rule

All imports must flow in one direction through the dependency graph. The allowed import directions are:

```
app/ (routing)  -->  features/  -->  shared/  -->  lib/
                                     shared/  -->  lib/
```

Imports flow downward and inward toward lower-level, more stable code. Higher-level directories may import from lower-level directories; lower-level directories must never import from higher-level ones.

**Prohibited import patterns:**

- `shared/` importing from `features/` — shared code must not depend on domain-specific feature code. If a shared utility needs something from a feature, the shared/feature boundary is drawn incorrectly.
- `features/A` importing from `features/B` — features must not depend on each other directly. Cross-feature communication should go through `shared/` (for shared logic) or through an event bus / context (for runtime coordination).
- `app/` importing from `lib/` directly — routing entry points should go through `shared/` wrappers rather than calling third-party library internals directly. This keeps the routing layer thin and decoupled from library implementation details.
- Circular imports at any level — any cycle in the import graph can cause runtime errors (module not yet initialized), bundler confusion, and makes it impossible to test modules in isolation.

---

## Section 2: What Belongs Where

| Directory | Owns | Examples | Must NOT contain |
|-----------|------|----------|-----------------|
| `app/` or `pages/` | Route entry points, layouts, route-level metadata | `app/dashboard/page.tsx`, `app/layout.tsx`, `app/(marketing)/about/page.tsx` | Business logic, domain hooks, feature-specific state |
| `features/<name>/` | Domain logic, feature-specific components, feature hooks, feature-scoped API calls, feature types | `features/checkout/CheckoutForm.tsx`, `features/checkout/useCartSummary.ts`, `features/checkout/api/placeOrder.ts` | Imports from other features, generic utilities that belong in `shared/` |
| `shared/components/` | Generic, reusable UI components with no domain knowledge | `Button`, `Modal`, `DataTable`, `FormField`, `Spinner`, `Toast` | Domain or business logic, feature-specific state, references to any feature |
| `shared/hooks/` | Generic hooks usable across any feature | `useDebounce`, `useLocalStorage`, `useMediaQuery`, `useClickOutside` | Feature-specific side effects, domain API calls |
| `shared/lib/` or `lib/` | Third-party library wrappers and initialisation configuration | `queryClient.ts`, `i18n.ts`, `axiosInstance.ts`, `supabaseClient.ts` | Business logic, UI components, domain types |
| `shared/types/` | Shared TypeScript types and interfaces used by multiple features | Domain-agnostic utility types, API response envelope shapes, pagination types | Feature-specific types (keep those in `features/<name>/types.ts`) |

---

## Section 3: The Feature Public API Pattern

Each feature should expose exactly one entry point: `features/<name>/index.ts`.

Only the symbols exported from this file are part of the feature's public API. All other files inside the feature directory are private implementation details. Code outside the feature must only import from the feature's `index.ts` — never from internal files directly.

**Example:**

`features/checkout/index.ts`:
```ts
export { CheckoutPage } from './components/CheckoutPage';
export { useCheckoutState } from './hooks/useCheckoutState';
export type { CheckoutSummary } from './types';
```

`features/checkout/components/PaymentForm.tsx` is a private implementation file. Any import that reaches into `features/checkout/components/PaymentForm` from outside the checkout feature is a boundary violation, even if TypeScript allows it.

This pattern means that:
- The feature can be refactored internally without breaking anything outside it, as long as the public API in `index.ts` stays stable.
- Deleting a feature is straightforward — remove the feature directory and fix the import errors, which will all point to the `index.ts` entry point.
- Code review can focus on whether changes to `index.ts` are intentional API changes vs. incidental internal refactors.

---

## Section 4: Detecting and Preventing Violations

Boundary rules are only effective if they are enforced mechanically. Manual code review is insufficient at scale.

**Tools to enforce boundaries:**

- **ESLint `import/no-restricted-paths`** (from `eslint-plugin-import`) — configure per-directory restrictions once boundaries are defined. Add a rule preventing `features/A` from importing `features/B` and `shared/` from importing `features/`.
- **`eslint-plugin-boundaries`** — a dedicated ESLint plugin for formal module boundary enforcement. Supports defining element types (feature, shared, app) and allowed/disallowed import relationships between them. More expressive than `no-restricted-paths` for complex projects.
- **TypeScript path aliases** — configure `@features/*`, `@shared/*`, and `@app/*` path aliases in `tsconfig.json`. This makes the import origin explicit in code review (a reviewer can immediately see that `@features/checkout` is importing from `@features/catalog` and flag it), and enables ESLint rules that operate on alias prefixes.

Run `lint-config-generator` after this skill to wire up these ESLint rules based on the module boundaries defined in the architecture spec.

---

## Section 5: Anti-Patterns

| Anti-pattern | Why it is harmful | Preferred alternative |
|---|---|---|
| Feature-to-feature direct import | Creates hidden coupling between features; removing or refactoring one feature breaks another in unexpected ways | Move the shared logic to `shared/`; use a pub/sub event bus or React context for cross-feature runtime communication |
| God `utils/` directory at root | Becomes a dumping ground with no clear ownership; developers add anything that does not fit elsewhere, making it impossible to understand what the directory actually contains | Split into `shared/hooks/` for custom hooks, `shared/lib/` for third-party wrappers, and feature-local `utils.ts` files for utilities that are only used within one feature |
| Importing implementation details across features | Breaks encapsulation; internal refactors inside a feature break unrelated code elsewhere; makes it impossible to confidently refactor feature internals | Expose only the intended public interface through the feature's `index.ts`; consumers import from the public API only |
| Circular dependencies | Causes runtime module initialisation errors; prevents isolated testing; bundlers may produce unpredictable output | Break cycles by extracting the shared logic into `shared/`; if two features depend on each other's types, the shared types belong in `shared/types/` |
