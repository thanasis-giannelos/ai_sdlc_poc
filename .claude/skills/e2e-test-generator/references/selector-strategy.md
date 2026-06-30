# Selector Strategy for E2E Tests

## Priority Order

| Priority | Selector type | Why |
|----------|--------------|-----|
| 1 | `getByRole` / ARIA role | Semantic, tests real accessibility |
| 2 | `getByLabel` | Tied to form field labels — survives CSS refactors |
| 3 | `getByPlaceholder` | Stable for inputs with placeholder text |
| 4 | `getByText` | Good for unique visible text; fragile if copy changes often |
| 5 | `data-testid` | Explicit contract; add to source only when ARIA roles are absent |
| 6 | CSS class / tag | Never use — breaks on any styling refactor |

## When to Add `data-testid`

Add a `data-testid` attribute to source code only when:
- The element has no meaningful ARIA role or label
- The element is not interactive (e.g. a container that wraps a dynamic list)
- Multiple elements of the same role exist and cannot be distinguished by name

Convention: `data-testid` values use kebab-case and describe the element's purpose, not its appearance: `data-testid="user-avatar"` not `data-testid="round-image"`.

## Common ARIA Roles Reference

| Element | Implicit role |
|---------|--------------|
| `<button>` | `button` |
| `<a href>` | `link` |
| `<input type="text">` | `textbox` |
| `<input type="checkbox">` | `checkbox` |
| `<select>` | `combobox` |
| `<table>` | `table` |
| `<ul>`, `<ol>` | `list` |
| `<nav>` | `navigation` |
| `<main>` | `main` |
| `<dialog>` | `dialog` |
| `<form>` | `form` (only when `aria-label` or `aria-labelledby` is present) |

## Querying by Accessible Name

The accessible name is the text the screen reader announces for the element.

```ts
// Button with visible text
page.getByRole('button', { name: /save changes/i })

// Icon-only button — must have aria-label in source
page.getByRole('button', { name: /close/i }) // source: <button aria-label="Close">✕</button>

// Input — label must be associated via htmlFor / aria-labelledby
page.getByLabel('Email address') // source: <label htmlFor="email">Email address</label>
```

If these selectors fail because the source lacks ARIA attributes, log the element in the **Selector gaps** section of the output and recommend adding the attribute to the source.
