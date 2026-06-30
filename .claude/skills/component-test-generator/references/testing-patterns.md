# Component Testing Patterns

## Query Priority (highest to lowest confidence)

| Priority | Query | Example |
|----------|-------|---------|
| 1 | `getByRole` | `getByRole('button', { name: /submit/i })` |
| 2 | `getByLabelText` | `getByLabelText('Email address')` |
| 3 | `getByPlaceholderText` | `getByPlaceholderText('Search...')` |
| 4 | `getByText` | `getByText('Save changes')` |
| 5 | `getByDisplayValue` | `getByDisplayValue('Canada')` |
| 6 | `getByAltText` | `getByAltText('Company logo')` |
| 7 | `getByTitle` | `getByTitle('Close dialog')` |
| 8 | `getByTestId` | `getByTestId('user-avatar')` — last resort only |

## Standard Test File Layout

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  describe('render states', () => {
    it('renders loading skeleton when status is loading', () => { ... })
    it('renders error message when status is error', () => { ... })
    it('renders content when status is success', () => { ... })
  })

  describe('interactions', () => {
    it('calls onSubmit with form values when submitted', async () => { ... })
    it('shows validation error when email is invalid', async () => { ... })
  })

  describe('edge cases', () => {
    it('renders empty state when list is empty', () => { ... })
    it('handles undefined optional prop gracefully', () => { ... })
  })
})
```

## Mocking Modules

```ts
// Vitest — mock an entire module
vi.mock('../services/api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: '1', name: 'Alice' }),
}))

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})
```

## Async Interactions

```tsx
const user = userEvent.setup()

it('submits form', async () => {
  render(<LoginForm onSubmit={mockSubmit} />)
  await user.type(screen.getByLabelText('Email'), 'alice@example.com')
  await user.type(screen.getByLabelText('Password'), 'secret')
  await user.click(screen.getByRole('button', { name: /sign in/i }))
  expect(mockSubmit).toHaveBeenCalledWith({ email: 'alice@example.com', password: 'secret' })
})
```

## Custom Render Wrapper

If the project has a custom render wrapper (with Router, QueryClient, ThemeProvider):

```tsx
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { AllProviders } from './AllProviders'

function customRender(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
```

Always import from `test-utils` rather than `@testing-library/react` when the wrapper exists.
