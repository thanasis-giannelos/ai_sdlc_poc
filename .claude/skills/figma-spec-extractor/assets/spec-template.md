# Frontend Spec — [Project / Feature Name]

> Extracted from Figma file: [FILE_KEY]  
> Page(s): [PAGE_NAMES]  
> Date: [DATE]

---

## 1. Screen Inventory

| Screen Name | Page | Frame ID | Inferred Rendering | Notes |
|---|---|---|---|---|
| [name] | [page] | [id] | SSR / SSG / CSR / unknown | |

---

## 2. Component List

| Figma Component | Variants | Props / Notes |
|---|---|---|
| [ComponentName] | [Default, Hover, Disabled, …] | [e.g. label: string, disabled: bool] |

---

## 3. Per-Screen State Matrix

| Screen | Loading | Empty | Error | Success | Notes |
|---|---|---|---|---|---|
| [ScreenName] | ✓ / – / ? | ✓ / – / ? | ✓ / – / ? | ✓ / – / ? | |

Legend: ✓ = frame exists in Figma  –  = not designed  ? = unclear

---

## 4. Responsive Breakpoints

| Label | Max Width | Screens with This Breakpoint |
|---|---|---|
| Mobile | 480 px | |
| Tablet | 1024 px | |
| Desktop | > 1024 px | |

---

## 5. Design Token Table

| Token Name | Category | Value | Notes |
|---|---|---|---|
| [token-name] | Colour / Typography / Spacing | [value] | Named style / raw fallback |

---

## 6. Interaction Notes

| Source Screen | Trigger | Destination Screen | Transition |
|---|---|---|---|
| [Screen] | [click / hover / swipe] | [Screen] | [instant / dissolve / slide] |

---

## 7. Open Questions

- [ ] [Question 1 — e.g. "Loading state not designed for Settings screen — assumed spinner"]
- [ ] [Question 2]
