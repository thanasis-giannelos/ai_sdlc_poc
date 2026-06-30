# POC: SDLC Automation Demo — "Mini Storefront" via 9 Skills

## Context

The goal is a proof-of-concept for the user's manager showing how a curated set of
9 frontend skills automate the **entire software development lifecycle** — requirement →
design → development → test → deploy — delivering a feature end-to-end.

The user confirmed: **breadth (all 9 skills fire)**, **MFE is must-have**, **greenfield
start**, **Vercel/Netlify preview deploy**, Figma MCP/plugin available but **no Figma
design or account yet**.

**Decision:** Build a **Mini Storefront** with **3 domains** — `catalog`, `cart`,
`account`. This is the
exact scenario `microfrontend-architect` is tuned for, so it yields the richest output.

This plan is the **demo runbook + setup checklist** for the live POC. It does not itself
write application code — each skill does that when run. The deliverable is a repeatable,
narrated end-to-end run.

---

## Two tensions to resolve (and how)

1. **Greenfield vs. `frontend-discovery` (brownfield).** Resolved with a **two-pass
   narrative**: build the first domain (`catalog`) greenfield, then run discovery on _that_
   real code to inform the MFE split. This is a _stronger_ manager story ("the app grew —
   now we scale it to teams") than a forced linear run, and makes discovery genuinely useful.

2. **MFE requires a Webpack-5/Rspack build tool.** `microfrontend-architect` fails on Vite.
   So when running `frontend-stack-advisor`, **steer the stack to React + Rspack (or
   Webpack 5) + Module Federation** — not the Vite default. State this constraint to the
   advisor explicitly as a hard requirement.

3. **Figma blocker (no design/account yet).** The two Figma skills hard-depend on a real
   Figma file. Since the Figma MCP/plugin is available, bootstrap the design with the
   installed `figma:figma-generate-design` skill (code/description → Figma) to create 3
   simple frames, then `figma-spec-extractor` reads them back. **Prerequisite: a Figma
   account + the 3 frames must exist before demo day.**

---

## The demo: 9 skills mapped to the lifecycle

| #   | Phase                | Skill                           | What it does in the demo                                                                                                                    | Output artifact               |
| --- | -------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1   | Requirement          | `figma-spec-extractor`          | Reads the 3 storefront frames → structured spec (screens, components, states, tokens)                                                       | requirements spec (md)        |
| 2   | Design               | `frontend-stack-advisor`        | Recommends stack — **steered to React + Rspack + Module Federation** (hard MFE constraint)                                                  | stack ADR + decision matrix   |
| 3   | Development (pass 1) | `figma-implement-design`        | Implements the **Catalog** domain screens as React/TS components from Figma                                                                 | `catalog/*.tsx`               |
| 4   | Requirement (pass 2) | `frontend-discovery`            | Crawls the now-existing catalog code → inventory (framework, routes, components, state)                                                     | discovery report              |
| 5   | Design               | `microfrontend-architect`       | Uses discovery output → decomposes into 3 remotes (`catalog`, `cart`, `account`) + host shell + Module Federation manifest + topology + ADR | MFE ADR + topology            |
| 6   | Design               | `frontend-architecture-planner` | Defines internal architecture for one remote (e.g. `account`): folders, rendering, state boundaries                                         | architecture spec             |
| 7   | Development          | `figma-implement-design`        | Implements remaining domains (`cart`, `account` incl. **login**) from Figma                                                                 | `cart/*.tsx`, `account/*.tsx` |
| 8   | Test                 | `component-test-generator`      | RTL + Vitest tests for the LoginForm and a catalog/cart component (props, states, validation)                                               | `*.test.tsx`                  |
| 9   | Test                 | `e2e-test-generator`            | Playwright tests for the cross-page flow: login → browse catalog → add to cart → checkout                                                   | `e2e/*.spec.ts`               |
| 10  | Deploy & run         | `deploy-smoke-verifier`         | Drives the Vercel/Netlify preview URL → verifies routes render, no console errors, login flow completes                                     | smoke report (PASS/FAIL)      |

All **9 named skills** fire. (`figma-implement-design` and `frontend-architecture-planner`
each run more than once because there are 3 domains — this _strengthens_ the breadth story
rather than padding it.)

### Why the ordering deviates from a strict phase list

The user's phase mapping puts `frontend-discovery` in "requirement." But discovery needs
code, so it must run **after** pass-1 development. The runbook above sequences for
_correctness_ (each skill gets the input it requires) while still narrating the standard
phase names to the manager.

---

## Prerequisites / setup checklist

- [ ] **Figma account** created; Figma MCP/plugin confirmed working in this environment.
- [ ] **3 storefront frames** created (bootstrap via `figma:figma-generate-design`):
      `Product List`, `Cart / Checkout`, `Login / Profile`. Capture the file URL + node IDs.
- [ ] **Node.js + npm** available (already present per repo CLAUDE.md).
- [ ] **Rspack/Webpack-5 Module Federation** chosen as the stack (locks in skill #2's output).
- [ ] **Vercel or Netlify** account + CLI/token for preview deploys. Note: each MFE remote
      needs hosting — plan to deploy host + 3 remotes (or use a single multi-zone preview).
- [ ] **Playwright** installed: `npx playwright install --with-deps chromium` (for skills #9, #10).
- [ ] A throwaway **test user credential** for the login smoke flow (`SMOKE_EMAIL` /
      `SMOKE_PASSWORD`), set as env vars / CI secrets — never real creds.
- [ ] Decide the demo repo location (new greenfield repo, separate from this skills repo).

---

## Critical files / locations

- `frontend-discovery/scripts/discover_frontend.py` — the brownfield crawler run in step #4.
- New **demo app repo** (greenfield, created during the demo) — holds host shell + 3 remotes,
  generated components, tests, and the Module Federation config (`rspack.config.*`).

## Risks / fallbacks

- **Figma not ready by demo day** → fall back to a hand-written static spec to feed the
  Design phase; narrate the Figma steps as "would run here." (Degrades breadth — avoid.)
- **MFE deploy on Vercel/Netlify is fiddly** (4 deploy targets) → fallback: locally served
  `rspack build` on fixed localhost ports; point `deploy-smoke-verifier` at localhost.
- **Live run too long for a meeting** → pre-run the slow steps; demo live only steps #1,
  #5, #9, #10 (the most visually impressive), showing artifacts from the rest.

---

## Verification (proves the POC works end-to-end)

1. **Each skill produces its artifact** — after each step, confirm the named output exists
   (spec md, ADRs, `.tsx` components, `.test.tsx`, `e2e/*.spec.ts`).
2. **Tests pass** — run the generated component tests (Vitest) and E2E tests (Playwright)
   and show them green: `npx vitest run` and `npx playwright test`.
3. **App builds & federates** — `rspack build` succeeds for host + 3 remotes; host loads
   remotes at runtime without console errors.
4. **Deployed smoke test is green** — `deploy-smoke-verifier` against the preview URL
   returns **PASS**: all routes render, login flow completes, zero app console errors.
