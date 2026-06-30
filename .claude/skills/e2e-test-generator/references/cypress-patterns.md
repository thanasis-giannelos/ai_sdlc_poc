# Cypress Patterns

## Standard Test File Layout

```ts
describe('Checkout flow', () => {
  beforeEach(() => {
    cy.visit('/cart')
  })

  it('completes checkout with valid payment', () => {
    cy.findByRole('button', { name: /proceed to checkout/i }).click()
    cy.findByLabelText('Card number').type('4242 4242 4242 4242')
    cy.findByRole('button', { name: /pay now/i }).click()
    cy.url().should('include', '/confirmation')
    cy.findByRole('heading', { name: /order confirmed/i }).should('be.visible')
  })
})
```

## Locator Strategy

Use `@testing-library/cypress` (`cy.findBy*`) for semantic queries, matching RTL conventions:

```ts
// preferred
cy.findByRole('button', { name: /submit/i })
cy.findByLabelText('Email address')
cy.findByPlaceholderText('Search...')

// fallback
cy.get('[data-testid="user-menu"]')
```

## Intercepting Network Calls

```ts
cy.intercept('POST', '/api/orders', { fixture: 'order-success.json' }).as('createOrder')
cy.findByRole('button', { name: /place order/i }).click()
cy.wait('@createOrder')
cy.findByText('Order #12345').should('be.visible')
```

## Authentication with cy.session

```ts
// cypress/support/commands.ts
Cypress.Commands.add('loginAs', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.findByLabelText('Email').type(email)
    cy.findByLabelText('Password').type(password)
    cy.findByRole('button', { name: /sign in/i }).click()
    cy.url().should('include', '/dashboard')
  }, {
    validate: () => {
      cy.request('/api/me').its('status').should('eq', 200)
    },
  })
})
```

```ts
// In tests that require auth
beforeEach(() => {
  cy.loginAs(Cypress.env('SMOKE_EMAIL'), Cypress.env('SMOKE_PASSWORD'))
  cy.visit('/dashboard')
})
```

## Console Error Assertion

```ts
// cypress/support/e2e.ts — attach before each test
beforeEach(() => {
  cy.on('window:console', (type, ...args) => {
    if (type === 'error') {
      throw new Error(`Console error: ${args.join(' ')}`)
    }
  })
})
```
