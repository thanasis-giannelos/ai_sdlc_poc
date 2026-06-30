# Frontend Stack Decision Matrix

Fill in one row per concern. For each row, record the winning option in **Chosen Option**, list every serious alternative that was evaluated in **Alternatives Evaluated** (comma-separated), explain the reasoning in **Rationale**, and identify the specific NFR constraint or project signal that drove the decision in **Driving Constraint / Signal**. Leave no cell blank — if a concern does not apply to the project, record "N/A" and state why in the Rationale column. This matrix is the supporting evidence for the ADR and should contain enough detail to reconstruct the reasoning six months later.

| Concern | Chosen Option | Alternatives Evaluated | Rationale | Driving Constraint / Signal |
|---|---|---|---|---|
| Framework | _e.g. Next.js 14 App Router_ | _e.g. Remix, Vite SPA_ | _Why this framework was selected over alternatives_ | _e.g. SEO required; team is React-native; per-route rendering mix needed_ |
| Rendering Strategy | _e.g. SSR + SSG per route_ | _e.g. CSR, ISR_ | _Why this rendering mode fits the content model and performance budget_ | _e.g. TTFB budget < 400 ms; public marketing pages must be indexable_ |
| State Management — Server State | _e.g. TanStack Query v5_ | _e.g. RTK Query, SWR_ | _Why this library handles async/remote state for this project_ | _e.g. Multiple REST endpoints; stale-while-revalidate caching requirement_ |
| State Management — Client / UI State | _e.g. Zustand_ | _e.g. Redux Toolkit, Jotai, React Context_ | _Why this library handles UI state (modals, wizard state, theme)_ | _e.g. Minimal global state; Redux overhead not justified_ |
| Styling | _e.g. Tailwind CSS_ | _e.g. CSS Modules, styled-components_ | _Why this approach fits the design system and team workflow_ | _e.g. Design token set available; team prefers utility-first approach_ |
| Forms & Validation | _e.g. React Hook Form + Zod_ | _e.g. Formik + Yup, TanStack Form_ | _Why this library fits the form complexity and validation requirements_ | _e.g. Multi-step forms with dynamic field arrays; TypeScript schema required_ |
| i18n | _e.g. next-intl_ | _e.g. react-i18next, lingui_ | _Why this library fits the locale scope and framework_ | _e.g. 12 locales required; framework is Next.js App Router_ |
| Unit / Integration Testing | _e.g. Vitest + React Testing Library_ | _e.g. Jest + RTL_ | _Why this test runner is appropriate for the build toolchain_ | _e.g. Project uses Vite; native ESM support required_ |
| E2E Testing | _e.g. Playwright_ | _e.g. Cypress_ | _Why this E2E framework was chosen_ | _e.g. Multi-browser coverage including WebKit; CI parallelisation needed_ |

---

## Dependency Constraints

Record specific version ranges and known incompatibilities identified during the analysis. Add one bullet per constraint. Remove this example row when filling in real content.

- _e.g. `react ^18.2.0` — required by Next.js 14 App Router; do not upgrade to React 19 until ecosystem support is confirmed_
- _e.g. `next ^14.0.0` — requires Node.js 18.17+; verify CI and deployment environment_
- _e.g. `@tanstack/react-query ^5.0.0` — breaking changes from v4; migration guide required if upgrading existing project_
