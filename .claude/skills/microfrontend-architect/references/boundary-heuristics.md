# Boundary Heuristics for Micro-Frontend Decomposition

Use these rules to identify which parts of a frontend codebase (or a described set of requirements)
are strong candidates for extraction into separate remotes.

Apply multiple heuristics together — a seam that scores on three or more signals is a high-confidence
remote candidate. A seam that scores on only one is weak; defer extraction until more signals appear.

---

## Signal 1: Business Domain Isolation

A slice maps cleanly to a single business capability (e.g. checkout, product catalog, user profile,
admin console, search). Strong seam indicators:

- The slice has its own data model with no foreign-key-style dependencies on other slices' data
- A product manager or designer "owns" the slice end-to-end without needing to coordinate with another PM
- The slice appears in a bounded context in any existing domain model or architecture diagram

**Weak version:** The slice shares many API endpoints or state atoms with adjacent slices — prefer a
monolith or a single shared remote until the data boundaries clarify.

---

## Signal 2: Route Cluster Independence

A group of routes never renders components from another route group in the same view.

Steps:
1. List all routes from the `frontend-discovery` output (or from the requirements).
2. Group routes by URL prefix (e.g. `/checkout/*`, `/catalog/*`, `/account/*`).
3. For each group, identify every component it renders.
4. If no component appears in more than one group → strong seam signal for each group.
5. If many components are shared across groups → extract a shared component library remote instead of
   splitting the routes into separate remotes.

---

## Signal 3: Team Ownership Alignment

A remote boundary that matches a team boundary has the highest return on investment for MFE.

If one team owns a domain end-to-end (frontend + backend + deploy), extracting it as a remote gives
that team full autonomy: they can deploy, rollback, and scale independently without coordinating
with other teams.

**Anti-pattern:** Creating a remote boundary that cuts *across* team ownership. A remote owned by
two teams requires coordination on every deploy and eliminates the primary benefit of MFE.

---

## Signal 4: Divergent Update Frequency

Parts of an application that change at very different cadences should not share a deploy pipeline.

Examples:
- A marketing homepage (changes multiple times per day) vs. a settings panel (changes monthly)
- A checkout flow (PCI-sensitive, slow and careful releases) vs. a product search (rapid experimentation)

Mixing high-frequency and low-frequency slices in one deploy forces the slow-cadence team to
validate changes they did not author, and forces the high-frequency team to wait for slow gates.

---

## Signal 5: Data and State Isolation

A slice that reads from and writes to its own API endpoints exclusively, with no shared global state
atoms (Redux slice, Zustand store key, React context) that other slices also read or write, is
a low-risk extraction target.

Checklist:
- [ ] All API calls in the slice target endpoints not used by any other slice
- [ ] No shared React context (auth context is expected — see host shell auth pattern)
- [ ] No cross-slice state: selecting from another domain's store or writing to another domain's store
- [ ] No cross-slice navigation that requires passing non-URL state (use URL params or events instead)

---

## Signal 6: Bundle Weight Threshold

A slice whose JS weight (from `frontend-discovery` or bundle analysis) exceeds ~150–200 KB gzipped
and has no reason to be co-loaded with other heavy slices is a candidate for lazy loading via a remote.

This signal alone is not sufficient — it suggests a split worth considering, but domain and team
ownership signals should confirm it.

---

## Weak Signals (do not split on these alone)

| Weak signal | Why it is insufficient |
|---|---|
| Different visual style or design | Shared design tokens and a design system solve this within a monolith |
| Different framework versions | Version upgrade should be done in-place; framework divergence adds MFE complexity without architectural benefit |
| Slow build times | Monorepo with build caching (Turborepo, Nx) solves this more cheaply |
| "It feels big" | Big is not a domain boundary; wait for a real ownership or data isolation signal |

---

## Scoring Template

Use this table when evaluating seam candidates. Count the strong signals; a score of 3+ warrants
extraction.

| Seam candidate | Domain isolation | Route cluster | Team ownership | Update frequency | Data isolation | Bundle weight | Score |
|---|---|---|---|---|---|---|---|
| `checkout`     | ✓                | ✓             | ✓              | ✓                | ✓              | ✓             | 6/6   |
| `admin`        | ✓                | ✓             | ?              | ✗                | ✓              | ✗             | 3/6   |
| `search-bar`   | ✗                | ✗             | ✗              | ✓                | ✗              | ✗             | 1/6   |

In the example above `checkout` is a strong candidate, `admin` is a borderline candidate (discuss
team ownership), and `search-bar` should stay in the monolith.
