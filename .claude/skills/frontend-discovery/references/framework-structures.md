# Frontend Framework Structures Reference

This reference describes how common frontend frameworks lay out their files on disk,
so `discover_frontend.py` and manual discovery can correctly identify routes and rendering strategies.

---

## Next.js — Pages Router

```
project/
├── pages/
│   ├── index.tsx          # Route: /
│   ├── about.tsx          # Route: /about
│   ├── blog/
│   │   └── [slug].tsx     # Route: /blog/:slug  (dynamic)
│   └── api/
│       └── hello.ts       # API route — not a page
├── components/            # Shared components
├── public/                # Static assets
└── next.config.js
```

**Rendering signals:**
- `export async function getServerSideProps` → SSR
- `export async function getStaticProps` → SSG
- `export async function getStaticPaths` → SSG with dynamic routes
- Neither → CSR (client-side only)

---

## Next.js — App Router (Next.js 13+)

```
project/
├── app/
│   ├── layout.tsx         # Root layout (Server Component by default)
│   ├── page.tsx           # Route: /
│   ├── about/
│   │   └── page.tsx       # Route: /about
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx   # Route: /blog/:slug
│   └── api/
│       └── route.ts       # API route handler
├── components/            # Shared components
└── next.config.js
```

**Rendering signals:**
- `"use client"` at top of file → Client Component (CSR)
- No directive → Server Component (SSR/RSC by default)
- `export const dynamic = "force-static"` → SSG
- `export const revalidate = N` → ISR

---

## Vite + React (SPA)

```
project/
├── src/
│   ├── main.tsx           # Entry point
│   ├── App.tsx            # Root component + router setup
│   ├── pages/             # Route-level components (convention, not enforced)
│   │   ├── Home.tsx
│   │   └── About.tsx
│   ├── components/        # Shared components
│   └── hooks/             # Custom hooks
├── index.html
└── vite.config.ts
```

**Rendering:** Always CSR. No file-based routing — look for `react-router-dom` or `@tanstack/router` in `package.json` and route definitions in `App.tsx` or a `routes/` file.

---

## Create React App (CRA)

Same structure as Vite SPA above but with `react-scripts` in `package.json` and no `vite.config.*`.
CRA is considered legacy; discovery should flag it and recommend migration.

---

## Remix

```
project/
├── app/
│   ├── root.tsx           # Root layout
│   ├── routes/
│   │   ├── _index.tsx     # Route: /
│   │   ├── about.tsx      # Route: /about
│   │   └── blog.$slug.tsx # Route: /blog/:slug  (dot notation)
│   └── components/        # Shared components
└── remix.config.js
```

**Rendering signals:**
- `export async function loader` → SSR data loading
- `export async function action` → SSR mutation
- No loader/action → CSR leaf route

---

## State Library Detection Hints

| Package Name | Library |
|---|---|
| `redux` + `react-redux` | Redux (legacy) |
| `@reduxjs/toolkit` | Redux Toolkit (modern) |
| `zustand` | Zustand |
| `jotai` | Jotai |
| `recoil` | Recoil |
| `@tanstack/react-query` | TanStack Query (data fetching + server state) |
| `swr` | SWR (data fetching) |
| `mobx` + `mobx-react-lite` | MobX |
| None of the above + `useContext` in source | React Context (built-in) |
