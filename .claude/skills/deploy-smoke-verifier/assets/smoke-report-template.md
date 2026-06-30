# Smoke Verification Report

**Target URL:** `<base-url>`
**Verified at:** `<ISO-8601 timestamp>`
**Overall verdict:** PASS | PARTIAL | FAIL

---

## Route Results

| Route | HTTP status | Content rendered | Console errors | Verdict |
|-------|-------------|-----------------|----------------|---------|
| `/` | 200 | ✓ | 0 | PASS |
| `/login` | 200 | ✓ | 0 | PASS |
| `/dashboard` | 200 | ✓ | 2 | PARTIAL |
| `/settings` | 500 | — | — | FAIL |

---

## Flow Results

_(Only present when flows were executed)_

| Flow | Steps completed | Failure step | Verdict |
|------|----------------|-------------|---------|
| Login with valid credentials | 3 / 3 | — | PASS |
| Place order (guest) | 2 / 5 | Step 3: payment form not visible | FAIL |

---

## Console Error Log

### `/dashboard`
1. `TypeError: Cannot read properties of undefined (reading 'id')` — `analytics.js:42`
2. `Failed to load resource: /api/feature-flags 403` — network

---

## Failure Screenshots

_(File paths or base64 inline images for each failed route or flow)_

- `/settings` — `smoke-screenshots/settings-500.png`
- Flow "Place order" step 3 — `smoke-screenshots/checkout-payment-missing.png`

---

## Recommended Next Steps

- `/settings` returning 500: check server logs; potential environment variable misconfiguration in the deployed environment.
- Console errors on `/dashboard`: investigate analytics initialization — may be a missing API key in the deployed config.
- Payment form not visible in order flow: run `e2e-test-generator` flow for checkout to reproduce locally; check feature flag state.
- For performance metrics on this deployment: run [performance-auditor](../../performance-auditor/SKILL.md).
- For SEO meta tag verification: run [seo-auditor](../../seo-auditor/SKILL.md).
