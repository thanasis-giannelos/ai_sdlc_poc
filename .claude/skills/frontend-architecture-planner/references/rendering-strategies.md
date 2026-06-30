# Rendering Strategy Reference

Modern React and Vue frameworks support multiple rendering strategies that can be applied per route. Choosing the right strategy for each route is one of the most consequential architectural decisions in a frontend application — it directly affects SEO, performance, infrastructure cost, and data freshness. This reference covers the four main strategies (SSR, SSG, ISR, CSR) and provides concrete decision guidance for each.

---

## Strategy Overview Table

| Strategy | Full Name | Data timing | SEO | TTFB | Best for |
|----------|-----------|-------------|-----|------|----------|
| SSR | Server-Side Rendering | Per-request, server | Excellent | Slower (server round-trip required) | Personalised pages, auth-required SEO pages |
| SSG | Static Site Generation | At build time | Excellent | Fastest (CDN-served) | Marketing, docs, content that changes on a publish cycle |
| ISR | Incremental Static Regeneration | At build + on schedule/on-demand | Excellent | Fast (CDN-served, stale-while-revalidate) | Product catalogs, news feeds, pages where slight staleness is acceptable |
| CSR | Client-Side Rendering | At runtime, client | Poor (without additional SSR shell) | Fast shell, slow content paint | Auth-gated dashboards, real-time UIs, internal tools |

---

## SSR — Server-Side Rendering

**Definition:** The HTML for each page request is generated on the server at request time using the latest data before being sent to the client.

**How it works:** When a user requests a page, the server fetches the required data, renders the React or Vue component tree to HTML, and streams or sends the complete document to the browser. The browser receives a fully populated HTML document that search engines can index. The client-side JavaScript then hydrates the page to make it interactive. Because rendering happens per-request, the response always reflects the most current data.

**When to use:**
- Personalised content that differs per user (e.g. a product page showing "recommended for you" sections based on purchase history).
- Auth-required pages where SEO still matters (e.g. a SaaS dashboard that needs to appear in search results for logged-in users).
- Content that changes on every request and stale data would cause a degraded user experience (e.g. live stock availability on a product page).
- TTFB budget is generous — the route can tolerate a server round-trip of 200ms or more before the first byte reaches the browser.

**When NOT to use:**
- Static content that rarely changes — SSG will serve these pages faster at lower cost.
- High-traffic pages where the server-side rendering cost is prohibitive and the content does not need to be personalised.
- When the deploy target is a static host (GitHub Pages, Netlify static) with no server runtime available.

**Framework APIs:**
- Next.js App Router: Server Components are SSR by default; no additional configuration required.
- Next.js Pages Router: export `getServerSideProps` from the page module.
- Remix: use a `loader` function — all Remix loaders run on the server per request.

**Performance note:** SSR increases TTFB because the server must fetch data and render HTML before responding. Mitigate this with React Suspense streaming (Next.js `loading.tsx`, Remix `<Suspense>` boundaries) so the browser can begin rendering the shell while data-dependent sections stream in.

---

## SSG — Static Site Generation

**Definition:** All HTML is generated once at build time; the resulting static files are deployed to a CDN and served without any server computation per request.

**When to use:**
- Marketing pages, landing pages, and homepages with no user-specific content.
- Blog posts or editorial content that changes on a scheduled publish cycle (e.g. a CMS publish triggers a new build).
- Documentation sites where content is version-controlled alongside code.
- Any page with no user-specific data — if two users see identical content, the page is a candidate for SSG.

**When NOT to use:**
- Real-time data that must reflect changes within seconds — the page would be stale until the next build.
- Personalised content that differs per user (SSR or CSR is required).
- Sites with thousands of dynamically generated pages where build time grows to minutes or hours (consider ISR or SSR at scale).

**Framework APIs:**
- Next.js App Router: a Server Component with no dynamic data fetching is statically rendered by default; use `generateStaticParams` to pre-render dynamic route segments.
- Next.js Pages Router: `getStaticProps` (and `getStaticPaths` for dynamic routes).
- Remix: use the static adapter (`@remix-run/serve` with a static export configuration).
- Astro: SSG is the default mode; all pages are statically generated unless explicitly marked as server-rendered.

**Performance note:** SSG produces the best possible TTFB because HTML is pre-built and served directly from a CDN edge node with no server computation. There is no per-request server cost, making SSG the most scalable and cost-efficient strategy for pages that qualify.

---

## ISR — Incremental Static Regeneration

**Definition:** A hybrid of SSG and SSR — pages are statically generated at build time but can be revalidated and regenerated either on a time-based schedule or on demand, without requiring a full site rebuild.

**When to use:**
- Content that changes on a schedule rather than continuously — product catalogs that update nightly, news feeds that refresh every few minutes, pricing pages that update daily.
- Pages where serving data that is a few minutes stale is acceptable to the user and the business.
- High-traffic pages where SSR server cost per request is prohibitive but the content changes too frequently to commit to a full SSG build cycle.

**Framework APIs:**
- Next.js App Router: add `export const revalidate = 60` (seconds) to a page or layout, or use `fetch` with `{ next: { revalidate: 60 } }` for time-based revalidation. Use `revalidatePath('/path')` or `revalidateTag('tag')` in a Server Action or Route Handler for on-demand revalidation.
- Next.js Pages Router: return `revalidate` from `getStaticProps`.
- Note: ISR is a Next.js-specific feature. Remix does not have a native ISR equivalent — use SSR with aggressive HTTP caching headers as an alternative. Vite SPAs do not support ISR.

**Trade-off:** The stale-while-revalidate behaviour means the first visitor after a cache expiry receives the previous (stale) version of the page while the new version regenerates in the background. The next visitor receives the fresh version. This is acceptable for most content but unsuitable for pages where stale data has business or safety implications (e.g. inventory availability, pricing regulated by compliance requirements).

---

## CSR — Client-Side Rendering

**Definition:** The server sends a minimal HTML shell (often just a `<div id="root">`), and the browser downloads a JavaScript bundle that fetches data and renders the full page on the client.

**When to use:**
- Auth-gated dashboards and admin panels that have no public SEO requirement — the entire page is behind a login wall.
- Highly interactive UIs where most of the page state is driven by user interaction in real time (drag-and-drop builders, spreadsheet editors, real-time collaboration features).
- Internal tools where the user base is known, devices are reasonably powerful, and SEO is irrelevant.
- Any feature that lives entirely behind a login wall where search engine visibility is neither required nor desirable.

**When NOT to use:**
- Public-facing pages that need to rank in search engines — CSR pages are poorly indexed by most crawlers even with JavaScript rendering enabled.
- Pages where JavaScript bundle size significantly impacts Largest Contentful Paint — the browser must download, parse, and execute JS before any meaningful content is visible.
- Users on slow connections or low-powered devices where large bundles create a poor experience.

**Performance note:** CSR shifts rendering work entirely to the client, which can hurt LCP on slow devices or connections. Mitigate with code-splitting (dynamic `import()`) and lazy loading so only the code needed for the current route is downloaded. Monitor LCP budgets using the metrics collected by `frontend-nfr-gatherer` and set bundle size budgets in CI.

---

## Mixed Strategy (per-route)

Modern frameworks allow — and encourage — mixing rendering strategies across different routes within the same application. Choosing the right strategy for each route independently is the norm, not the exception.

**Example — Next.js App Router e-commerce application:**
- `/products` (product listing page): SSG + ISR with `revalidate = 3600` — catalog changes infrequently, CDN-served for maximum performance.
- `/products/[slug]` (product detail page): SSR — personalised "customers also bought" section requires per-request data.
- `/checkout` (checkout flow): CSR — entirely auth-gated, no SEO requirement, highly interactive.
- `/` (homepage): SSG — fully static marketing content, rebuilt on each CMS publish.

**Decision guidance:**
1. Default to SSG for any page whose content can be determined at build time.
2. Upgrade to ISR when the content changes on a schedule and a full rebuild is impractical.
3. Use SSR only when the page genuinely requires per-request data (personalisation, real-time availability, user-specific content with SEO requirements).
4. Use CSR for anything behind a login wall that does not need SEO.
