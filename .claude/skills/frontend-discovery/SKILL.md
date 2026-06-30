---
name: frontend-discovery
description: "Crawl an existing frontend codebase and produce a structured inventory: framework, routes/pages, component tree, state libraries, and data-fetching patterns. Use when the user says 'audit the frontend', 'map the codebase', 'what's in this frontend', 'discover the frontend stack', 'inventory the components', or when starting a migration or brownfield redesign."
argument-hint: "[project_dir] [--json] [--verbose]"
user-invocable: true
---

# Frontend Discovery

Crawls an **existing** frontend codebase and emits a structured inventory: detected framework, routes/pages, component tree, state management libraries, and data-fetching patterns. Used on brownfield projects before redesign, migration planning, or onboarding.

## When to Use

- Starting work on an unfamiliar frontend codebase (brownfield or acquired project)
- Planning a framework migration (e.g. CRA → Vite, Pages Router → App Router)
- Before running `frontend-architecture-planner` on an existing project
- When asked to "map", "audit", or "document" the structure of an existing frontend
- As a first step in a redesign to understand what already exists

## Skill Boundaries

- Use this skill to **inventory what already exists** in a frontend codebase.
- If the project is greenfield (no existing code), skip this skill and go to [frontend-nfr-gatherer](../frontend-nfr-gatherer/SKILL.md) and [frontend-stack-advisor](../frontend-stack-advisor/SKILL.md) directly.
- If the user wants to check **dependency weights or bundle size**, use [bundle-analyzer](../bundle-analyzer/SKILL.md) — that skill analyses package health; this one analyses structural topology.
- If the user wants to **design new architecture**, use [frontend-architecture-planner](../frontend-architecture-planner/SKILL.md). Run discovery first to give the planner an accurate picture.
- If the user wants to **clarify requirements** (ticket text, acceptance criteria), use [requirement-clarifier](../requirement-clarifier/SKILL.md). Discovery is a pre-requirements step on existing code; clarifier is a post-requirements step on tickets.

## Procedure

1. Run [discover_frontend.py](./scripts/discover_frontend.py) against the project directory:
   ```
   python frontend-discovery/scripts/discover_frontend.py <project_dir> [--json] [--verbose]
   ```
2. Review the script output: framework detection, route inventory, component counts, state library detections, and data-fetching pattern summary.
3. For any ambiguous detections (e.g. multiple routing strategies, unrecognised state patterns), read the relevant config files directly to confirm.
4. Summarise findings in a structured discovery report using the Output Contract format below.
5. Recommend the appropriate next step based on the findings:
   - Brownfield migration → [frontend-architecture-planner](../frontend-architecture-planner/SKILL.md)
   - Greenfield layer on existing infra → [frontend-stack-advisor](../frontend-stack-advisor/SKILL.md)
   - Requirements unknown → [frontend-nfr-gatherer](../frontend-nfr-gatherer/SKILL.md)

## Output Contract

- **Framework & rendering strategy** — detected framework name, version, and rendering mode (SSR / SSG / CSR / hybrid)
- **Route inventory** — table: route path → source file → inferred rendering strategy
- **Component tree summary** — total component count, shared vs page-level split, estimated max nesting depth
- **State library list** — each library detected, confidence level (found in `package.json` / found in imports / both)
- **Data-fetching pattern summary** — patterns detected (React Query, SWR, server actions, `useEffect`+fetch, `getServerSideProps`, `getStaticProps`)
- **Recommended next step** — one of: `frontend-architecture-planner`, `frontend-stack-advisor`, `frontend-nfr-gatherer`

## Resources

- [discover_frontend.py](./scripts/discover_frontend.py)
- [framework-structures.md](./references/framework-structures.md)

---

## Failure Handling

- If `project_dir` does not contain a `package.json`, stop and ask the user to confirm the correct directory.
- If the framework cannot be determined from `package.json`, fall back to inspecting config files (`next.config.*`, `vite.config.*`, `remix.config.*`) before reporting "unknown framework".
- If the component count exceeds 500, report the number but skip deep nesting analysis to avoid timeouts — note this limitation in the output.

## Examples

### Example 1: Brownfield audit before migration

User says: "Audit the frontend before we migrate to the App Router"

**Actions:**
1. Run `discover_frontend.py ./` with `--verbose`.
2. Script detects Next.js Pages Router, 47 routes, 120 components, Redux + React Query, `getServerSideProps` on 12 routes.
3. Report surfaces the 12 SSR routes as migration risk items.

**Result:** Discovery report with route inventory and a recommendation to run `frontend-architecture-planner` next, with the SSR routes flagged.

### Example 2: Onboarding to unfamiliar repo

User says: "I just inherited this React codebase — what's in it?"

**Actions:**
1. Run `discover_frontend.py ./` with `--json`.
2. Script detects Vite SPA, React Router v6, Zustand, SWR, 83 components (28 shared / 55 page-level).
3. Emit structured JSON report.

**Result:** A complete inventory the user can read or pass to downstream skills.
