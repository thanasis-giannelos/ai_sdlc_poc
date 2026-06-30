# Framework & Rendering Strategy Comparison

This reference maps NFR constraints and project signals to framework and rendering strategy choices. Consult it during step 2 of the `frontend-stack-advisor` procedure, after constraints have been gathered from `frontend-nfr-gatherer` or described manually by the user. Each section is structured to support a rapid, defensible decision rather than exhaustive feature enumeration.

---

## Section 1: Framework Comparison Table

| Framework | Rendering Modes | Routing Model | Build Tool | SSR / Edge Support | i18n Built-in | SEO Readiness | Best For |
|---|---|---|---|---|---|---|---|
| Next.js 14 App Router | SSR, SSG, ISR, CSR, RSC | File-system (app/) | Turbopack / Webpack 5 | Yes — Node.js + Edge Runtime | No (next-intl recommended) | Excellent | React teams needing flexible per-route rendering, RSC, and strong SEO |
| Next.js 14 Pages Router | SSR, SSG, ISR, CSR | File-system (pages/) | Webpack 5 | Yes — Node.js | No | Excellent | Teams migrating from Next.js 12/13 or needing a stable, well-documented SSR model without RSC |
| Remix | SSR, CSR | File-system (routes/) | Vite (v2+) | Yes — Cloudflare, Deno, Node.js | No | Excellent | Data-heavy apps with nested layouts, progressive enhancement, and form-heavy interactions |
| Vite SPA (React) | CSR only | Client-side (React Router / TanStack Router) | Vite | No (unless added via separate server) | No | Poor — requires SSR wrapper for SEO | Auth-gated dashboards, internal tools, or any project with no SEO requirement |
| Nuxt 3 | SSR, SSG, ISR, CSR, hybrid | File-system (pages/) | Vite + Nitro | Yes — Node.js, Edge, serverless | No (nuxt-i18n module) | Excellent | Vue.js teams; not appropriate when the team is React-native |
| Astro 4 | SSG (default), SSR (opt-in per page), Islands | File-system + framework-agnostic components | Vite + Rollup | Yes — Cloudflare, Node.js, Deno (SSR adapter) | No | Excellent | Content-heavy marketing sites, blogs, documentation; minimal JavaScript by default |

---

## Section 2: Decision Signals — "Choose X when..."

### Next.js 14 App Router

- SEO is critical AND the team is React-native AND you need fine-grained SSR/SSG/ISR mixing per route
- You want React Server Components to reduce client bundle size for data-heavy pages
- The project includes both a public-facing marketing section (SSG) and an authenticated dashboard (CSR) under a single codebase
- You need Edge Runtime support for geolocation, A/B testing, or auth middleware close to the user
- The team is starting greenfield on Next.js 13+ and has no migration debt forcing use of the Pages Router

### Next.js 14 Pages Router

- The codebase is already on Next.js 12 or 13 Pages Router and a full App Router migration is out of scope
- The team needs a mature, fully documented SSR/SSG model without the RSC learning curve
- Third-party libraries in the existing dependency tree are not yet RSC-compatible
- The project does not require React Server Components or server actions

### Remix

- The application is primarily form-driven with complex nested layouts (e.g. multi-step wizards, settings pages with sidebar navigation)
- Progressive enhancement is a hard requirement — the app must function without JavaScript enabled
- The team wants co-located loader/action data fetching without a separate API layer
- Deployment targets Cloudflare Workers or another edge runtime where Remix's adapter model shines

### Vite SPA (React)

- No SEO requirement: the application is auth-gated, an internal tool, or a dashboard where public indexing is not needed
- The team prefers a simple, CRA-like development model with fast local startup and no SSR complexity
- Deployment is to a static CDN with no server runtime (S3 + CloudFront, GitHub Pages, Netlify static)
- The project requires maximum flexibility in routing (TanStack Router, React Router v6 data mode) without framework conventions

### Nuxt 3

- The team is Vue.js-native — this is the primary and sufficient signal; do not recommend Nuxt to React teams
- The project requires a Vue-compatible equivalent of Next.js's hybrid rendering model
- Existing Vue 2 / Nuxt 2 codebase is being upgraded

### Astro 4

- The project is primarily content-driven: marketing site, documentation portal, or blog where most pages are static
- Minimal JavaScript shipped to the browser is a hard performance NFR (e.g. First Input Delay < 50 ms on mobile)
- The team wants to compose UI using multiple frameworks (React, Vue, Svelte) in isolated islands without full framework overhead
- SEO is critical and content changes infrequently, making SSG the appropriate rendering strategy

---

## Section 3: Rendering Mode Decision Tree

```
Q1: Does the content need to be indexed by search engines?
├── No (auth-gated, internal tool, dashboard)
│   └── CSR — use Vite SPA or Next.js without SSR
└── Yes
    └── Q2: Does the content change per-user or per-request?
        ├── Yes (personalised content, live inventory, user-specific data)
        │   └── SSR — Next.js App Router Server Components or Remix loaders
        ├── No — content changes on a schedule (e.g. CMS-driven, product catalogue updated daily)
        │   └── ISR — Next.js `revalidate` (regenerate cached pages on a time interval)
        └── No — purely static, changes only on deploy
            └── SSG — Next.js `generateStaticParams`, Astro static mode
                └── Q3: Is there a mix of static marketing pages AND dynamic app pages in one project?
                    ├── Yes
                    │   └── Next.js App Router (mix SSG + SSR + CSR per route in a single project)
                    └── No — all routes share the same rendering mode
                        └── Choose the framework matching that single mode (Astro for pure SSG,
                            Vite SPA for pure CSR, Next.js SSR for all-SSR)
```

---

## Section 4: Known Incompatibilities & Version Constraints

| Constraint | Affected Options | Notes |
|---|---|---|
| Webpack 4 (Create React App) | Module Federation not supported; slow builds | Must eject or migrate to Webpack 5 / Vite before adopting modern tooling |
| React < 18.2 | Next.js App Router not supported | App Router and React Server Components require React 18.2+ |
| Strict CSP — no inline scripts | Next.js Pages Router has known `<script>` injection issues | App Router + React Server Components is safer; configure `nonce` via middleware |
| Static host with no Node.js runtime (S3, GitHub Pages) | SSR and ISR not possible | Must use SSG or CSR; Next.js requires a Node.js or Edge runtime for any SSR/ISR route |
| Cloudflare Workers (no Node.js APIs) | Next.js Node.js runtime routes incompatible | Use Edge Runtime only in Next.js, or switch to Remix with Cloudflare adapter |
| Safari < 15 (older iOS) | CSS Container Queries, `:has()` selector not available | Audit Tailwind CSS v3+ utilities and vanilla-extract that depend on these features |
| React 19 (experimental at time of writing) | Not yet supported by all ecosystem libraries | Pin to React 18.x for production projects until ecosystem support is confirmed |
| Node.js < 18 | Next.js 14 requires Node.js 18.17+ | Verify CI/CD and deployment environment Node.js version before adopting Next.js 14 |
