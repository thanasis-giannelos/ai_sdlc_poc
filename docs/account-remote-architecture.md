# Frontend Architecture Spec — `account-remote`

_Produced by `frontend-architecture-planner` (Step 6 of the SDLC pipeline)._

---

## Section 1: Project Context

| Field | Value |
|---|---|
| Project name | `account-remote` — Mini Storefront MFE |
| Framework + version | React 18.3 (CSR SPA) |
| Rendering target | CSR only — all routes are auth-gated or auth-initiating; no public SEO requirement |
| Stack ADR reference | `docs/stack-adr.md` (2026-06-29) |
| MFE ADR reference | `docs/mfe-adr.md` (2026-06-29) — hub-and-spoke, host :3000, this remote :3003 |
| Greenfield / Brownfield | Greenfield — `demo-app/account/` does not exist yet |
| Date | 2026-06-29 |

---

## Section 2: Folder Structure

**Pattern chosen:** Hybrid (feature-based colocation + shared layer)

Rationale: two identifiable sub-domains exist — `auth` (login, password reset) and
`profile` (user settings, post-POC). Colocating each sub-domain keeps `figma-implement-design`
targets clean and means the `profile` feature can be added later without restructuring
the `auth` feature at all. Catalog used layer-based; account uses hybrid because it has
more than one sub-domain seam.

```
demo-app/account/
  index.html                   # Dev-mode HTML shell (same pattern as catalog)
  rspack.config.ts             # Rspack + MF config (exposes './AccountApp')
  vitest.config.ts             # Vitest + jsdom (mirrors catalog config)
  tailwind.config.ts           # Design tokens (same token set as catalog)
  postcss.config.js
  tsconfig.json
  package.json
  src/
    main.tsx                   # Dev-mode entry: wraps <App> in <BrowserRouter>
    App.tsx                    # React Router <Routes> — connects paths to pages
    index.css                  # Tailwind directives (@tailwind base/components/utilities)
    test-setup.ts              # @testing-library/jest-dom matchers
    pages/
      LoginPage.tsx            # Route entry point for /login — thin; delegates to features/auth
      AccountPage.tsx          # Route entry point for /account/* — stub for post-POC profile
    features/
      auth/
        components/
          LoginForm.tsx        # Form UI: email + password fields + submit button + error display
        hooks/
          useLogin.ts          # useMutation wrapper: calls api/auth.ts, writes token, notifies host
        api/
          auth.ts              # loginUser(credentials): POST /api/auth/login → AuthResponse
        schemas/
          loginSchema.ts       # Zod schema: z.object({ email, password })
        types.ts               # LoginCredentials, AuthResponse, AuthError
        index.ts               # Public API: export { LoginForm }, export type { LoginCredentials }
      profile/
        index.ts               # Stub — no implementation for POC; exported as placeholder
    shared/
      components/
        FormInput.tsx          # Generic: label + input + error message; no domain knowledge
        PrimaryButton.tsx      # Generic: label, onClick, loading?, disabled? — Tailwind styled
        LinkButton.tsx         # Generic: label + href anchor styled as a text link
        ErrorMessage.tsx       # Generic: inline red validation/API error text
        Footer.tsx             # Generic: copyright + nav links; shared across all pages
      hooks/
        useFormError.ts        # Maps API error shapes to React Hook Form setError calls
      lib/
        queryClient.ts         # TanStack Query QueryClient singleton (shared via MF shared dep)
        zodResolver.ts         # Re-exports @hookform/resolvers/zod for consistent import path
      types/
        api.ts                 # ApiError envelope type; shared across features
```

### Why `pages/` rather than putting routes directly in `App.tsx`

`LoginPage` and `AccountPage` are thin wrappers: they apply any route-level layout
(e.g. centered card on desktop) and mount the relevant feature component. Business logic
stays in `features/`. This separation means `App.tsx` stays a pure route map and
`LoginPage.tsx` stays a pure layout wrapper — neither owns domain logic.

---

## Section 3: Per-Route Rendering Strategy

| Route Pattern | Strategy | Data Freshness Requirement | Rationale |
|---|---|---|---|
| `/login` | CSR | None on load — form is empty until user types | No server data needed to render the login form. No SEO requirement (auth screen). TanStack Query mutation fires on submit, not on render. |
| `/account/*` | CSR | Per-session — profile data fetched after auth | User-specific profile data; entirely auth-gated; no crawl requirement. Post-POC `useQuery` will fetch profile once on mount. |

All routes are CSR. This is consistent with the stack ADR: "The storefront is not
public-facing; SEO is not required; CSR is sufficient."

---

## Section 4: Routing Layout

**Root layout (`App.tsx`):**
Provides `QueryClientProvider` (wrapping the shared `queryClient` singleton). Does NOT
provide `BrowserRouter` — the host shell owns the Router context. During standalone
dev-mode runs, `main.tsx` adds `<BrowserRouter>` before mounting `<App>`.

```tsx
// App.tsx (illustrative — not generated here)
<QueryClientProvider client={queryClient}>
  <Routes>
    <Route path="/login"    element={<LoginPage />} />
    <Route path="/account/*" element={<AccountPage />} />
  </Routes>
</QueryClientProvider>
```

**`main.tsx` (dev-mode standalone only):**
```tsx
<BrowserRouter>
  <App />
</BrowserRouter>
```
When loaded by the host shell, the host's `<BrowserRouter>` already wraps the remote
component, so `main.tsx` is the standalone dev entry only — not the MF exposed module.

**Nested layouts:**

| Route | Layout wrapper in `pages/` | Contents |
|---|---|---|
| `/login` | `LoginPage.tsx` | `<main className="min-h-screen bg-neutral-50 flex items-center justify-center">` centered card (max-width 480 px at desktop per spec) |
| `/account/*` | `AccountPage.tsx` | Stub — `<div>Account — coming soon</div>` for POC |

**Code-split entry points:**
The `account-remote` itself is a code-split boundary from the host's perspective
(loaded as a Module Federation remote on demand when the user navigates to `/login` or
`/account`). No further internal lazy-loading is needed for the POC given the small
component count. Post-POC, a heavy profile editor component could be `React.lazy()`
imported inside `AccountPage`.

---

## Section 5: State Boundaries

| State Category | Library | Scope | Persistence | Notes |
|---|---|---|---|---|
| Form state | React Hook Form | Component-local (`LoginForm`) | In-memory | Zod schema (`loginSchema.ts`) passed via `zodResolver`. Field errors come from Zod validation; API errors injected via `setError('root')`. Never lifted to a store. |
| Mutation / async state | TanStack Query `useMutation` | Feature-level (`useLogin` hook) | In-memory | Drives `isPending` → `PrimaryButton loading` prop; `isError` → `ErrorMessage`. No caching — mutations do not cache. |
| Auth token | `localStorage` | Global (cross-remote) | `localStorage` | Written by `useLogin` on success. Read by the host shell's `AuthContext` on startup. This remote does NOT own a Zustand auth store — it only writes to `localStorage` and calls the host's `setAuth()` context setter via the shared `AuthContext` singleton. |
| Profile / server state (post-POC) | TanStack Query `useQuery` | Feature-level (`profile` feature) | In-memory (cache) | `staleTime: 10 * 60 * 1000` (10 min) — profile data rarely changes during a session. Not implemented in POC. |
| URL state | React Router `useNavigate` | Route-level | URL | After successful login, `useLogin` calls `navigate('/')` to redirect to catalog. No query params for auth flow in this POC. |

**Auth token ownership rule:** `account-remote` **writes** the token; the host shell
**owns** `AuthContext` and exposes `{ token, setAuth, clearAuth }`. `account-remote`
consumes `AuthContext` as a shared singleton (via MF `shared:` dep). This prevents the
anti-pattern of two React contexts competing for auth state.

---

## Section 6: Data-Fetching Layer

**Where fetching lives:** all data operations are in `features/auth/hooks/useLogin.ts`
and `features/auth/api/auth.ts`. Pages and components do not call `fetch` directly.

**Login mutation flow:**
1. `LoginForm` submits validated credentials to `useLogin()`
2. `useLogin` calls `mutateAsync(credentials)` from `useMutation`
3. `auth.ts: loginUser()` POSTs to `/api/auth/login` → returns `{ token: string }`
4. On success: token written to `localStorage`, `setAuth(token)` called, `navigate('/')`
5. On error: mutation `error` mapped to `setError('root', { message: error.message })`

**Error boundary pattern:**
`LoginPage.tsx` is wrapped in a React `<ErrorBoundary>` in the host shell (per the MFE
ADR error boundary policy). Inside the remote, form-level errors are handled inline by
React Hook Form — no additional Error Boundary is needed for the login flow itself.

**Loading pattern:**
`PrimaryButton` receives `loading={isPending}` from `useLogin`. The button shows a
loading state (disabled + spinner) while the mutation is in-flight. No skeleton screens
are needed — the login form has no async data on initial render.

**Caching rules:**

| Data type | Config | Rationale |
|---|---|---|
| Login mutation | Mutations do not cache | Each submit is a fresh network request; previous results are irrelevant |
| Profile data (post-POC) | `staleTime: 10 * 60 * 1000` | Profile changes rarely during a session; 10-min cache avoids redundant fetches on re-mount |

---

## Section 7: Module Boundary Rules

**Allowed import directions:**

```
pages/  ──►  features/  ──►  shared/components
             features/  ──►  shared/hooks
             features/  ──►  shared/lib
             features/  ──►  shared/types
                             shared/  ──►  shared/lib
```

**Prohibited patterns:**

| Pattern | Why prohibited |
|---|---|
| `features/auth` importing from `features/profile` | Feature-to-feature coupling; if profile is extracted or deleted, auth must remain unaffected |
| `shared/` importing from `features/` | Shared code must have no domain knowledge; if it needs domain logic, the domain boundary is drawn incorrectly |
| `pages/` importing from `shared/lib` directly | Pages should go through features or shared/components; direct lib imports in routing entry points couple the routing layer to third-party internals |
| Any circular import | Causes MF runtime initialisation errors, which are silent and hard to debug across remote boundaries |

**Directory ownership:**

| Directory | Owns | Must NOT contain |
|---|---|---|
| `pages/` | Route entry points, layout wrappers | Business logic, API calls, direct store access |
| `features/auth/` | Login form, auth mutation, Zod schema, auth API call, auth types | Imports from `features/profile/`; generic UI components |
| `features/profile/` | Profile display, profile query, profile types (post-POC) | Imports from `features/auth/`; generic UI components |
| `shared/components/` | Generic UI: `FormInput`, `PrimaryButton`, `LinkButton`, `ErrorMessage`, `Footer` | Domain logic, feature-specific state, references to any feature |
| `shared/hooks/` | Generic hooks: `useFormError` | Domain API calls, feature-specific side effects |
| `shared/lib/` | `queryClient.ts`, `zodResolver.ts` | Business logic, UI components |
| `shared/types/` | `ApiError` envelope | Feature-specific types |

**TypeScript path aliases (add to `tsconfig.json`):**
```json
{
  "compilerOptions": {
    "paths": {
      "@features/*": ["./src/features/*"],
      "@shared/*":   ["./src/shared/*"],
      "@pages/*":    ["./src/pages/*"]
    }
  }
}
```

**Enforcement:** Run `lint-config-generator` post-POC to wire `eslint-plugin-boundaries`
rules that match these aliases. For the POC, the path alias convention in code review
makes violations visible without automated enforcement.

**Feature public API:** `features/auth/index.ts` exports only `LoginForm` and the
`LoginCredentials` type. `LoginPage.tsx` imports exclusively from this entry point —
never from `features/auth/components/LoginForm` directly.

---

## Section 8: Open Questions

| Question | Owner | Target date |
|---|---|---|
| How does `account-remote` receive the `AuthContext` setter from the host shell? Does the host expose it as a shared singleton package, or does `account-remote` write to `localStorage` and the host polls? | Frontend Tech Lead | Before Step 7 (account code gen) |
| `/api/auth/login` endpoint — is there a real backend for the POC, or should `loginUser()` be a mock that accepts any credentials? | Engineering Manager | Before Step 7 |
| Password reset: `LoginForm` renders a "Forgot password?" `LinkButton` — should it navigate to a stub route (`/account/reset-password`) or be non-functional in the POC? | Product | Before Step 7 |
| `AccountPage` stub: should it render a "Coming soon" placeholder or redirect to `/login` if the user hits `/account` directly? | Product | Before Step 7 |
| Port 3003 confirmed for `account-remote`? (Assigned in MFE ADR — confirm no conflicts in local dev environment) | Frontend Tech Lead | Before Step 7 |
