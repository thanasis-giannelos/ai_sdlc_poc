---
name: component-test-generator
description: "Generate React Testing Library and Vitest (or Jest) tests for existing components: props, render states, user interactions, and edge cases. Use when the user says 'write tests for this component', 'generate unit tests', 'add component tests', 'test coverage for existing components', 'RTL tests', or 'component test suite'."
argument-hint: "<component-path-or-glob> [--framework vitest|jest] [--coverage]"
user-invocable: true
---

# Component Test Generator

Generates **React Testing Library** tests for existing components — covering props, render states, user interactions, and edge cases. Fills the unit/integration tier in the testing pyramid: above MSW mock data, below Playwright E2E flows.

## When to Use

- User points at one or more existing components that have no tests or incomplete tests
- User asks to increase coverage on the component layer without writing E2E tests
- Before merging a PR that adds or significantly changes a component
- When `test-runner-frontend` reports low coverage on component files
- After `generate-react-component` (which only adds a test stub) when full coverage is needed

## Skill Boundaries

- Use this skill to generate **unit and integration tests for existing components**.
- If the user wants tests for **brand-new** components being scaffolded now, use [generate-react-component](../generate-react-component/SKILL.md) — it produces a test stub as part of scaffolding.
- If the user wants **end-to-end user flow tests** (cross-page journeys), use [e2e-test-generator](../e2e-test-generator/SKILL.md) instead.
- If the user wants **MSW handlers or fixture data** to feed these tests, use [mock-data-generator](../mock-data-generator/SKILL.md) first.
- If the user wants to **run** the generated tests, use [test-runner-frontend](../test-runner-frontend/SKILL.md).
- This skill authors tests; it does not run them.

## Prerequisites

- React project with TypeScript (`.tsx` / `.ts` components)
- A test runner configured: Vitest (preferred) or Jest + `@testing-library/react`
- `@testing-library/user-event` v14+ for interaction simulation
- If testing components with server calls: MSW or equivalent mock layer should be set up (see [mock-data-generator](../mock-data-generator/SKILL.md))

## Procedure

1. **Identify scope** — list all component files to cover (glob from user argument, or the single file provided). Confirm with the user if the list is large (> 10 files).
2. **Read existing test infrastructure** — locate `vitest.config.*` / `jest.config.*`, `src/setupTests.*`, and any existing `*.test.tsx` files to understand the current helpers, custom render wrappers, and global mocks already in place.
3. **Read each component** to understand:
   - All accepted props (required vs optional, types, defaults)
   - Conditional render paths (loading, empty, error, success states)
   - User interactions that trigger state changes or callbacks (`onClick`, `onChange`, `onSubmit`)
   - Context or store dependencies (detect `useContext`, `useSelector`, `useQuery` calls)
4. **Plan the test cases** for each component:
   - One `it` block per distinct render state or prop variation
   - One `it` block per user interaction that should produce an observable effect
   - Edge cases: empty arrays, null/undefined optional props, disabled states
5. **Generate the test file** (`<ComponentName>.test.tsx`) alongside the component:
   - Use `render` from the project's existing custom wrapper (if present) or RTL's `render` directly
   - Query with role-based or accessible selectors (`getByRole`, `getByLabelText`) over `getByTestId`
   - Use `userEvent` for interactions, not `fireEvent`
   - Mock external calls (API, router, context) at the module boundary using `vi.mock` / `jest.mock`
   - Group related cases under `describe` blocks named after the component and scenario
6. **Validate generated tests compile** — run `tsc --noEmit` on the test file(s); fix any type errors before presenting results.
7. **Report** the test file paths created, the scenarios covered, and any remaining gaps flagged as TODOs.

## Output Contract

- **Test files** — one `<ComponentName>.test.tsx` per component, placed alongside the source file
- **Coverage map** — for each component: list of scenarios covered and scenarios skipped with reason
- **Compile status** — TypeScript compilation result (pass / errors with line numbers)
- **Gaps report** — cases that cannot be tested without additional setup (e.g. missing MSW handlers, missing context provider) with recommended next steps

## Resources

- [testing-patterns.md](./references/testing-patterns.md)
- [custom-render-guide.md](./references/custom-render-guide.md)

---

## Failure Handling

- If a component has no identifiable render branches or interactions, generate a minimal smoke test (renders without throwing) and note the gap.
- If the component depends on a context with no test double available, scaffold a minimal provider wrapper and note it as a prerequisite.
- If TypeScript compilation fails on the generated file, fix errors before reporting; do not leave a broken file.
- If `userEvent` or `@testing-library/react` is not installed, surface the install command and pause.

## Examples

### Example 1: Single component with multiple states

User says: "Write tests for `src/components/UserCard.tsx` — it shows a loading spinner, an error message, or the user details."

**Actions:**
1. Read `UserCard.tsx` — find props `status: 'loading' | 'error' | 'success'`, `user?: User`, `error?: string`.
2. Generate three `it` blocks: renders spinner when `status='loading'`; renders error text when `status='error'`; renders user name/avatar when `status='success'`.
3. Run `tsc --noEmit` — confirm no type errors.

**Result:** `src/components/UserCard.test.tsx` with three test cases, all green.

### Example 2: Form component with validation

User says: "Add tests for the login form at `src/features/auth/LoginForm.tsx`."

**Actions:**
1. Read `LoginForm.tsx` — finds controlled inputs for email/password, a submit button, inline validation errors, and an `onSubmit` prop.
2. Generate tests: renders empty form; shows email validation error on blur; shows password too-short error; calls `onSubmit` with correct values on valid submit; disables button while submitting.
3. Mock `onSubmit` with `vi.fn()`; use `userEvent.type` and `userEvent.click`.

**Result:** `src/features/auth/LoginForm.test.tsx` with five test cases covering all observable behaviors.

## Best Practices

- Prefer role-based queries (`getByRole('button', { name: /submit/i })`) — they survive refactors and double as accessibility checks.
- Do not test implementation details (internal state variables, private methods). Test observable outputs: DOM, callbacks, side effects.
- Keep each test independent — avoid test-order dependencies by resetting mocks in `beforeEach`.
- If a component renders a list, test the empty case, the single-item case, and the many-items case.

## Common Issues and Solutions

### Issue: Component requires a router context

**Cause:** Component uses `useNavigate`, `useParams`, or `<Link>` internally.
**Solution:** Wrap the render call in `MemoryRouter` (react-router-dom) or use the project's custom render wrapper if it already includes a router.

### Issue: Test file causes circular import

**Cause:** Mock placed at the top of the file imports the module under test transitively.
**Solution:** Move the `vi.mock(...)` call before any other imports, or use `vi.doMock` for dynamic mocking.
