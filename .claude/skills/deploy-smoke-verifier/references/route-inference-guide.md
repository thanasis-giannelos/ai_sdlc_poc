# Route Inference Guide

When no explicit `smoke-routes.txt` is provided, infer the route list from the project structure.

## Next.js App Router (`src/app/` or `app/`)

Each directory containing a `page.tsx` or `page.js` corresponds to a route. Dynamic segments (`[id]`, `[slug]`) are replaced with a test-friendly fixture value (e.g. `1` or `example`).

```
app/
  page.tsx              →  /
  login/page.tsx        →  /login
  dashboard/page.tsx    →  /dashboard
  products/[id]/page.tsx → /products/1   (inferred fixture)
```

## Next.js Pages Router (`pages/`)

Each `.tsx` / `.js` file in `pages/` that is not prefixed with `_` or `api/` is a route.

```
pages/
  index.tsx    →  /
  about.tsx    →  /about
  [slug].tsx   →  /example  (inferred fixture)
```

## React Router (`src/App.tsx` or router config)

Scan for `<Route path="...">` or `{ path: '...' }` entries in the router configuration. Exclude wildcard catch-all routes (`*`, `/*`).

## Vite SPA (no file-based routing)

Ask the user to provide a route list or point to the router configuration file.

## Default Smoke Route List (fallback)

When inference yields fewer than 3 routes or fails entirely, use this default list and ask the user to confirm:

```
/
/login
/dashboard
```

## `smoke-routes.txt` Format

Create this file in the project root to override inference:

```
# smoke-routes.txt — one route per line, comments allowed
/
/login
/dashboard
/products/1
/settings/profile
```
