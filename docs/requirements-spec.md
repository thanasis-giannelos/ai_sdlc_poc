# Frontend Spec — Mini Storefront (Catalog · Cart · Account)

> Extracted from Figma file: tSbHxqHRLPxKbAt2vtpXKj  
> File: Catalyst Storefront — Community  
> Frames: Product List (3:4230) · Cart/Checkout (3:5124) · Login (3:5136)  
> Date: 2026-06-29  
> Skill: figma-spec-extractor  

---

## 1. Screen Inventory

| Screen Name        | Domain   | Frame ID | Inferred Rendering | Notes                                              |
|--------------------|----------|----------|--------------------|----------------------------------------------------|
| Product List       | catalog  | 3:4230   | SSR / SSG          | Grid of product cards; filter/sort bar at top      |
| Cart / Checkout    | cart     | 3:5124   | CSR                | Line-item list + order summary + checkout CTA      |
| Login              | account  | 3:5136   | CSR                | Email + password form; "Forgot password" link      |

---

## 2. Component List

| Figma Component      | Variants                              | Props / Notes                                                                 |
|----------------------|---------------------------------------|-------------------------------------------------------------------------------|
| ProductCard          | Default, Hover, Out-of-Stock          | `title: string`, `price: number`, `imageUrl: string`, `inStock: boolean`      |
| ProductGrid          | —                                     | Wraps N × ProductCard; responsive 1–4 col layout                              |
| FilterBar            | Collapsed, Expanded                   | `categories: string[]`, `sortOptions: string[]`, `onFilter`, `onSort`         |
| SearchInput          | Default, Focused, Filled              | `placeholder: string`, `onSearch: (q: string) => void`                        |
| NavBar               | Default, Mobile                       | Logo + nav links + cart icon (badge count) + account icon                     |
| CartLineItem         | Default, Removing                     | `product: Product`, `quantity: number`, `onRemove`, `onQtyChange`             |
| CartSummary          | —                                     | Subtotal / tax / shipping lines + total; read-only display                    |
| CheckoutButton       | Default, Loading, Disabled            | `onClick`, `loading: boolean`                                                 |
| EmptyCartMessage     | —                                     | Illustration + CTA back to catalog                                            |
| LoginForm            | Default, Loading, Error               | `email: string`, `password: string`, `onSubmit`, `error?: string`             |
| FormInput            | Default, Focused, Error, Disabled     | `label: string`, `type`, `value`, `onChange`, `error?: string`                |
| PrimaryButton        | Default, Hover, Loading, Disabled     | `label: string`, `onClick`, `loading?: boolean`, `disabled?: boolean`         |
| LinkButton           | Default, Hover                        | `label: string`, `href: string`                                               |
| ErrorMessage         | —                                     | Inline red text for form validation feedback                                  |
| Footer               | —                                     | Copyright + nav links; shared across all screens                              |

---

## 3. Per-Screen State Matrix

| Screen          | Loading | Empty | Error | Success | Notes                                                       |
|-----------------|---------|-------|-------|---------|-------------------------------------------------------------|
| Product List    | ✓       | ✓     | ?     | ✓       | Loading: skeleton cards; Empty: no-results message          |
| Cart / Checkout | ✓       | ✓     | ?     | ✓       | Empty: EmptyCartMessage component; Loading: spinner on CTA  |
| Login           | ✓       | –     | ✓     | ✓       | Error: inline form validation + API error banner            |

Legend: ✓ = state designed  –  = not applicable  ? = not explicitly designed (assume spinner)

---

## 4. Responsive Breakpoints

| Label   | Max Width  | Screens with This Breakpoint          |
|---------|------------|---------------------------------------|
| Mobile  | 480 px     | Product List, Cart/Checkout, Login    |
| Tablet  | 1024 px    | Product List, Cart/Checkout           |
| Desktop | > 1024 px  | Product List, Cart/Checkout, Login    |

Layout changes:
- **Product List**: 1 col (mobile) → 2 col (tablet) → 4 col (desktop)
- **Cart/Checkout**: stacked single column (mobile) → two-column line-items + summary (desktop)
- **Login**: full-width form (mobile) → centered card max-width 480 px (desktop)

---

## 5. Design Token Table

| Token Name               | Category   | Value           | Notes                               |
|--------------------------|------------|-----------------|-------------------------------------|
| color-primary            | Colour     | #3B82F6         | Blue; CTA buttons                   |
| color-primary-hover      | Colour     | #2563EB         | Darker blue on hover                |
| color-danger             | Colour     | #EF4444         | Error states, remove actions        |
| color-success            | Colour     | #22C55E         | Success toasts, in-stock badge      |
| color-neutral-900        | Colour     | #111827         | Primary text                        |
| color-neutral-500        | Colour     | #6B7280         | Secondary / placeholder text        |
| color-neutral-200        | Colour     | #E5E7EB         | Borders, dividers                   |
| color-neutral-50         | Colour     | #F9FAFB         | Page background                     |
| color-white              | Colour     | #FFFFFF         | Card backgrounds                    |
| font-family-base         | Typography | Inter, sans-serif | Body and UI text                  |
| font-size-xs             | Typography | 12 px           |                                     |
| font-size-sm             | Typography | 14 px           |                                     |
| font-size-base           | Typography | 16 px           | Body default                        |
| font-size-lg             | Typography | 18 px           | Card titles                         |
| font-size-xl             | Typography | 20 px           | Section headings                    |
| font-size-2xl            | Typography | 24 px           | Page headings                       |
| font-weight-normal       | Typography | 400             |                                     |
| font-weight-medium       | Typography | 500             |                                     |
| font-weight-semibold     | Typography | 600             |                                     |
| font-weight-bold         | Typography | 700             | NavBar logo, price display          |
| spacing-1                | Spacing    | 4 px            |                                     |
| spacing-2                | Spacing    | 8 px            |                                     |
| spacing-3                | Spacing    | 12 px           |                                     |
| spacing-4                | Spacing    | 16 px           | Standard component padding          |
| spacing-6                | Spacing    | 24 px           | Section gaps                        |
| spacing-8                | Spacing    | 32 px           | Page-level gutters                  |
| border-radius-sm         | Spacing    | 4 px            | Inputs, small chips                 |
| border-radius-md         | Spacing    | 8 px            | Cards, buttons                      |
| border-radius-lg         | Spacing    | 12 px           | Modal / checkout summary panel      |
| shadow-card              | Effect     | 0 1px 3px rgba(0,0,0,0.1) | Product card elevation   |
| shadow-panel             | Effect     | 0 4px 16px rgba(0,0,0,0.08) | Cart summary panel      |

---

## 6. Interaction Notes

| Source Screen   | Trigger                          | Destination Screen | Transition    |
|-----------------|----------------------------------|--------------------|---------------|
| Product List    | Click "Add to Cart" on ProductCard | Cart / Checkout  | Cart badge increment (no navigate) |
| Product List    | Click cart icon in NavBar        | Cart / Checkout    | Instant / slide-in drawer or navigate |
| Cart / Checkout | Click "Checkout" button          | (External checkout or confirmation) | Loading state then navigate |
| Cart / Checkout | Click "Continue Shopping"        | Product List       | Instant navigate |
| NavBar          | Click account icon (unauthenticated) | Login           | Instant navigate |
| Login           | Submit valid credentials         | Product List       | Instant navigate (auth token stored) |
| Login           | Click "Forgot password"          | (Password reset — out of scope) | Instant navigate |

---

## 7. Open Questions

- [ ] **Product detail page** — no frame provided; clicking a ProductCard has no designed destination. Assume out-of-scope for this POC; card click is non-interactive.
- [ ] **Checkout flow** — frame 3:5124 shows cart + checkout summary but no multi-step checkout wizard. Treat as single-page cart with a "Proceed to Checkout" CTA that is a stub.
- [ ] **Error state on Product List** — no explicit error frame. Implement as a generic "Failed to load products" banner matching the color-danger token.
- [ ] **Password reset flow** — Login screen shows "Forgot password?" link but no target frame. Link is rendered but non-functional in this POC.
- [ ] **Authentication persistence** — spec does not define session/token storage strategy. Assume `localStorage` JWT for the POC; revisit for production.
- [ ] **Cart persistence** — no frame shows an empty-cart-after-reload state. Assume in-memory cart state (React context) for the POC; no backend.
- [ ] **Figma tokens not formalised** — file does not expose a published token library. Values in Section 5 are inferred from frame inspection and Catalyst design system conventions. Treat as unverified until confirmed against the live Figma styles panel.
