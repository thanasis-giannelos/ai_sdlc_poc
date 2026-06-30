# Spec Output Schema

This document defines every field that `figma-spec-extractor` produces, its type, and
the source in the Figma file.

## 1. Screen Inventory

| Field | Type | Source |
|---|---|---|
| `screen_name` | string | FRAME or SECTION node name |
| `page` | string | Parent CANVAS node name |
| `frame_id` | string | Node ID (`"<page>:<node>"` format) |
| `inferred_rendering` | enum: SSR / SSG / CSR / unknown | Heuristic: presence of `/api/` routes, `getServerSideProps` naming, or static content only |
| `notes` | string | Free text for anything unusual |

## 2. Component List

| Field | Type | Source |
|---|---|---|
| `component_name` | string | COMPONENT or COMPONENT_SET node name |
| `variants` | string[] | Property=Value pairs from variant names |
| `instance_count` | number | Count of INSTANCE nodes referencing this component |
| `notes` | string | Inferred props, accessibility role, or usage notes |

## 3. Per-Screen State Matrix

| Field | Type | Source |
|---|---|---|
| `screen_name` | string | From Screen Inventory |
| `loading` | ✓ / – / ? | Sibling frame with "loading" / "skeleton" in name |
| `empty` | ✓ / – / ? | Sibling frame with "empty" / "zero state" in name |
| `error` | ✓ / – / ? | Sibling frame with "error" / "failed" in name |
| `success` | ✓ / – / ? | Sibling frame with "success" / "confirmation" in name |

## 4. Responsive Breakpoint Map

| Field | Type | Source |
|---|---|---|
| `label` | string | Inferred from frame width (Mobile/Tablet/Desktop) |
| `max_width` | number (px) | FRAME `absoluteBoundingBox.width` |
| `screens` | string[] | Screen names that have a frame at this width |

## 5. Design Token Table

| Field | Type | Source |
|---|---|---|
| `token_name` | string | Named style key in `styles` map |
| `category` | enum: colour / typography / spacing | Style type field |
| `value` | string | Resolved hex, font string, or pixel value |
| `source` | enum: named-style / raw-fallback | Whether it came from a Figma style or was inferred |

## 6. Interaction Notes

| Field | Type | Source |
|---|---|---|
| `source_screen` | string | Frame containing the reaction |
| `trigger` | string | `reaction.trigger.type` |
| `destination_screen` | string | Frame name at `action.destinationId` |
| `transition` | string | `transition.type` |

## 7. Open Questions

Free-text list. Include one item for each of:
- States that appear to be missing (e.g. no error frame for a form screen)
- Tokens without a named style (raw hex values used as fallbacks)
- Screens with no prototype connections where flows seem incomplete
- Breakpoints that exist for some screens but not others
