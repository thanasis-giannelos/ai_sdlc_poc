# Frontend Library Landscape

This reference covers the library layer beneath the framework: state management, styling, forms, internationalisation, and testing. Consult it during steps 3–7 of the `frontend-stack-advisor` procedure after the framework and rendering strategy have been chosen. Each entry provides concrete selection signals and trade-offs rather than exhaustive API documentation.

---

## Section 1: State Management

### TanStack Query v5

**Purpose:** Manages asynchronous server state — fetching, caching, synchronising, and updating remote data.

**Choose when:**
- The application fetches data from REST or GraphQL APIs and needs automatic background refetching, stale-while-revalidate caching, and pagination support
- The majority of shared state in the app is data that originates from the server (product listings, user profiles, notifications)
- You want to eliminate hand-rolled `useEffect` + `useState` data-fetching patterns

**Do not use when:**
- The application has minimal data fetching (a single API call at startup) — React Context or a simple `useEffect` is sufficient
- The project uses a full-featured meta-framework with built-in data loading (Remix loaders, Next.js `fetch` with `cache`) that already handles caching at the framework level, making TanStack Query's caching layer redundant

**Bundle size:** ~13 kB gzipped (core); negligible if it replaces equivalent hand-rolled code.

---

### Zustand

**Purpose:** Minimal client-side global state store. Mutable, flux-like, but with almost no boilerplate.

**Choose when:**
- The application has UI state that must be shared across distant components but does not originate from the server (modals, sidebars, wizard step tracking, theme preferences)
- The team finds Redux Toolkit's boilerplate excessive for the scope of client state being managed
- You want a store that works outside React components (e.g. in event handlers, utility functions)

**Do not use when:**
- The primary state problem is server data synchronisation — use TanStack Query for that; Zustand should not become a cache for API responses
- The application requires time-travel debugging, strict action-log auditability, or a Redux DevTools-centric workflow at scale

**Bundle size:** ~1 kB gzipped.

---

### Redux Toolkit

**Purpose:** Opinionated Redux with reduced boilerplate: `createSlice`, `createAsyncThunk`, RTK Query.

**Choose when:**
- The application is large-scale with many contributors and requires a predictable, auditable state model with a strict unidirectional data flow
- RTK Query is being adopted to replace TanStack Query — it is a viable alternative for teams already in the Redux ecosystem
- The existing codebase already uses Redux and migrating to a different paradigm is out of scope

**Do not use when:**
- Greenfield small-to-medium projects where the Redux overhead (action creators, reducers, middleware configuration) exceeds the complexity it manages
- The team is not already familiar with Redux patterns — the learning curve is unjustified for most modern React applications

**Bundle size:** ~11 kB gzipped (toolkit core); RTK Query adds ~9 kB.

---

### Jotai

**Purpose:** Atomic state model — state is composed from small, independent atoms; components subscribe to only the atoms they read.

**Choose when:**
- The application has many independent pieces of UI state that rarely need to be read together, and you want to avoid re-renders caused by a monolithic store
- The team is familiar with Recoil's mental model but wants a lighter, more actively maintained alternative
- Fine-grained reactivity is a performance requirement (e.g. large data grids where individual cell state must update without re-rendering the whole table)

**Do not use when:**
- The team needs a simple, imperative store for a handful of global flags — Zustand is simpler for that use case
- The project requires DevTools-first debugging with a full action history

**Bundle size:** ~3 kB gzipped.

---

### React Context

**Purpose:** Built-in React mechanism for passing values through the component tree without prop drilling.

**Choose when:**
- The shared state changes infrequently (theme, locale, authenticated user object, feature flags)
- The value is consumed by many components but updated rarely, minimising unnecessary re-renders
- Adding a third-party state library is not justified by the scope of shared state

**Do not use when:**
- State updates are frequent (e.g. a counter that updates on every keystroke) — Context re-renders all consumers on every update, which becomes a performance problem
- The application needs cross-context derived state or computed values — use Zustand or Jotai instead

**Bundle size:** 0 kB (built-in).

---

## Section 2: Styling

### Tailwind CSS

**Approach:** Utility-first CSS framework — style is applied by composing small, single-purpose class names directly in markup.

**Choose when:**
- The team wants rapid UI development without context-switching between markup and CSS files
- A design system with a defined token set (spacing scale, colour palette, typography) is being adopted — Tailwind's `theme` config maps directly to design tokens
- The project uses component-based architecture where scoping styles per component via utility classes is natural

**Key trade-off:** Class lists on complex components can become verbose; requires discipline (component extraction, `cn()` utility) to stay readable.

**Design token integration:** Tailwind `theme.extend` in `tailwind.config.ts` accepts design tokens for colours, spacing, and typography, enabling direct sync with Figma tokens or Style Dictionary output.

---

### CSS Modules

**Approach:** Scoped CSS — each `.module.css` file generates locally-scoped class names at build time, eliminating global namespace collisions.

**Choose when:**
- The team prefers writing standard CSS with full access to all CSS features (animations, media queries, pseudo-selectors) without a utility abstraction
- The project has an existing CSS codebase that is being incrementally modularised
- Tailwind's utility-class paradigm conflicts with team or organisation code standards

**Key trade-off:** No built-in token system; design tokens must be applied via CSS custom properties or a separate token file, adding a manual integration step.

**Design token integration:** CSS custom properties (`--color-primary`) defined in a global token file; CSS Modules reference these variables. Compatible with Style Dictionary.

---

### styled-components

**Approach:** CSS-in-JS — styles are written as tagged template literals attached to React components; styles are generated and injected at runtime.

**Choose when:**
- The team is already using styled-components in an existing codebase and migration cost exceeds benefit
- Dynamic styles that depend heavily on props are a core pattern in the application (e.g. a UI library with many variant permutations)

**Key trade-off:** Runtime style injection has a measurable performance cost; not compatible with React Server Components (requires `'use client'` boundary); bundle size is higher than zero-runtime alternatives.

**Design token integration:** Theme object passed via `ThemeProvider`; tokens accessible in template literals via `${({ theme }) => theme.color.primary}`.

---

### Emotion

**Approach:** CSS-in-JS — similar to styled-components; provides both `styled` API and `css` prop for ad-hoc styling.

**Choose when:**
- The project uses MUI (Material UI), which is built on Emotion — adopting Emotion directly avoids dual CSS-in-JS runtimes
- The team requires the `css` prop for ad-hoc styling without creating named components
- SSR support is needed and styled-components' SSR configuration is a known friction point in the existing setup

**Key trade-off:** Same runtime penalty as styled-components; not RSC-compatible without `'use client'` wrapper.

**Design token integration:** Theme object via `ThemeProvider`; Emotion is the native token mechanism for MUI's `sx` prop.

---

### vanilla-extract

**Approach:** Zero-runtime CSS-in-JS — styles are written in TypeScript and extracted to static CSS files at build time; no runtime style injection.

**Choose when:**
- Type-safe styles are a requirement — vanilla-extract provides full TypeScript inference for design tokens and style variants
- The project is adopting RSC and a zero-runtime styling solution is required to avoid `'use client'` boundaries on styled components
- Performance is a hard NFR and runtime CSS injection overhead must be eliminated

**Key trade-off:** Build-time constraint means truly dynamic styles (values computed at runtime from arbitrary user input) require CSS custom properties as an escape hatch.

**Design token integration:** First-class via `createTheme` and `createGlobalTheme`; tokens are TypeScript objects consumed directly in style definitions with full autocomplete.

---

## Section 3: Form Libraries

### React Hook Form

**Philosophy:** Uncontrolled-by-default form management — minimises re-renders by using refs rather than state for form values, with a subscription model for observed fields.

**Choose when:**
- The project has forms of moderate-to-high complexity (multi-step forms, dynamic field arrays, conditional fields)
- Performance is a consideration — React Hook Form re-renders only the fields that change, not the entire form on each keystroke
- This is the recommended default for new projects unless a specific constraint points to another option

**Validation integration:** Native integration with Zod (`@hookform/resolvers/zod`), Yup, Valibot, and Joi via the `@hookform/resolvers` package. Zod is the recommended schema library for TypeScript projects.

---

### Formik

**Philosophy:** Controlled form management — form state is held in React state; straightforward values/errors/touched model.

**Choose when:**
- The codebase already uses Formik and migrating to React Hook Form is not justified by the current scope
- The team is more familiar with Formik's mental model and form complexity is low enough that re-render overhead is not a concern

**Validation integration:** Native Yup integration via `validationSchema` prop; Zod requires a wrapper adapter. Less ergonomic with Zod compared to React Hook Form.

---

### TanStack Form

**Philosophy:** Type-safe, headless form management with first-class TypeScript inference across fields, validators, and submission state.

**Choose when:**
- Type safety across the entire form (field names, values, errors) is a hard requirement and the team is willing to accept a newer, less battle-tested library
- The project already uses TanStack ecosystem libraries (TanStack Query, TanStack Router) and consistency across the stack is valued

**Validation integration:** Built-in support for Zod, Valibot, and ArkType validators; schema is inferred directly into field types.

---

### Native HTML5 Validation

**Philosophy:** Browser-built-in form validation via `required`, `pattern`, `min`, `max`, and `type` attributes.

**Choose when:**
- The form is simple (a single search input, a contact form with 3–4 fields) and the overhead of a form library is not justified
- Progressive enhancement is a requirement — the form must function without JavaScript

**Validation integration:** No schema library integration; custom error messages via `setCustomValidity`. Not suitable for complex async validation, cross-field dependencies, or multi-step forms.

---

## Section 4: i18n Libraries

### next-intl

**Framework affinity:** Next.js (App Router and Pages Router).

**Choose when:**
- The framework is Next.js — next-intl is purpose-built for Next.js and provides first-class App Router support with Server Components
- ICU message format support (pluralisation, gender, number/date formatting) is required
- Locale routing (URL-based locale segments, e.g. `/en/`, `/fr/`) needs to be handled at the middleware level

**RSC / SSR compatibility:** Full — next-intl supports async Server Components and passes translations without client-side bundle overhead for static content.

---

### react-i18next

**Framework affinity:** Framework-agnostic (React).

**Choose when:**
- The framework is not Next.js (Vite SPA, Remix, Nuxt is excluded as it is Vue)
- The project requires a mature, widely adopted library with a large plugin ecosystem (backend loaders, language detectors, Phrase/Lokalise integrations)
- The team already has i18next infrastructure (translation management, CI pipelines) and migrating to a different library is not justified

**RSC / SSR compatibility:** Partial — works with SSR via `i18next-http-backend` or static import, but requires careful hydration setup to avoid mismatch. Not natively RSC-compatible; requires `'use client'` boundaries for components that use `useTranslation`.

---

### Lingui

**Framework affinity:** Framework-agnostic (React, and also supports non-React JS).

**Choose when:**
- The project requires ICU message syntax with a compiler-based approach that extracts messages at build time, reducing runtime overhead
- The team wants a CLI-driven translation workflow (`lingui extract`, `lingui compile`) that enforces message coverage before deployment
- Bundle size is a hard constraint — Lingui's compiled message catalogs are smaller than runtime-parsed ICU strings

**RSC / SSR compatibility:** Compatible with SSR; RSC support requires explicit handling of locale loading on the server. Less turnkey than next-intl for Next.js App Router projects.

---

## Section 5: Testing Libraries

### Unit / Integration Testing

#### Vitest vs. Jest

| Signal | Choose Vitest | Choose Jest |
|---|---|---|
| Build tool | Vite or Rspack | Webpack (CRA, legacy setups) |
| Project type | Greenfield or any project using Vite-based framework (Next.js with Turbopack experimental, Remix with Vite) | Existing project with Jest already configured and a large test suite |
| Configuration | Near-zero config in Vite projects — shares `vite.config.ts` transforms | Requires separate `jest.config.ts` with `ts-jest` or Babel transform |
| ESM support | Native — Vite resolves ESM naturally | Requires additional configuration (`--experimental-vm-modules` or Babel) |
| Speed | Faster cold start due to Vite's module graph | Slower cold start; faster with `--runInBand` for small suites |

**React Testing Library** is used with both runners. It is the standard for testing React component behaviour from the user's perspective (interactions, accessible roles, text content) rather than implementation details.

---

### E2E Testing

#### Playwright vs. Cypress

| Signal | Choose Playwright | Choose Cypress |
|---|---|---|
| Default recommendation | Yes — recommended default for new projects | Only if the team has significant existing Cypress investment |
| Browser coverage | Chromium, Firefox, WebKit (Safari engine) in a single run | Chromium and Firefox; WebKit support is experimental and limited |
| Architecture | Out-of-process — does not run inside the browser; avoids test interference with app network requests | In-process — runs inside the browser; provides direct access to `window` and app internals |
| Parallelisation | Native sharding across workers and machines with no additional config | Requires Cypress Cloud (paid) for full parallelisation |
| CI performance | Faster on CI due to parallelisation and lighter browser binaries | Slower on CI without cloud plan; Electron-based runner adds overhead |
| Component testing | Playwright CT available; less mature than Cypress CT | Cypress Component Testing is mature and well-documented |
| Accessibility testing | `@axe-core/playwright` integration available | `cypress-axe` available |

**Playwright is the recommended default** for new projects. Choose Cypress only when migrating an existing Cypress suite or when component testing in isolation is a primary workflow and the team is already familiar with Cypress CT.
