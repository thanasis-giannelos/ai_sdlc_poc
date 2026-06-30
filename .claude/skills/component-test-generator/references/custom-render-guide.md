# Custom Render Wrapper Guide

## Purpose

Many React projects wrap RTL's `render` with a project-specific `customRender` that supplies all the providers a component tree requires (Router, React Query, Redux store, ThemeProvider). Before generating tests, identify whether this wrapper exists.

## How to Detect

Search for any of these patterns in the project:

```
src/test-utils.tsx
src/utils/test-utils.tsx
src/testing/render.tsx
src/__tests__/helpers.tsx
```

Or grep for: `export.*render` combined with `wrapper:` in test helper files.

## When a Wrapper Exists

Import from the wrapper, not from `@testing-library/react`:

```tsx
// correct
import { render, screen } from '../test-utils'

// wrong — skips providers
import { render, screen } from '@testing-library/react'
```

## When No Wrapper Exists

Wrap inline for tests that need providers:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

render(<MyComponent />, { wrapper: Providers })
```

Note: always set `retry: false` on the test QueryClient to prevent RTL from timing out on failed queries.

## Common Providers to Include

| Provider | Package | When Needed |
|----------|---------|-------------|
| `MemoryRouter` | `react-router-dom` | Component uses `<Link>`, `useNavigate`, `useParams` |
| `QueryClientProvider` | `@tanstack/react-query` | Component uses `useQuery`, `useMutation` |
| `Provider` (Redux) | `react-redux` | Component uses `useSelector`, `useDispatch` |
| `ThemeProvider` | `@mui/material` / styled-components | Component uses theme tokens |
| `IntlProvider` | `react-intl` | Component renders translated strings |
