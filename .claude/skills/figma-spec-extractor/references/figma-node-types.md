# Figma Node Types Reference

When reading a Figma file via `use_figma`, nodes are returned with a `type` field.
This reference maps node types to what they represent and how to handle them.

## Top-Level Node Types

| Type | Meaning | Spec Action |
|---|---|---|
| `DOCUMENT` | Root of the file | Iterate its `children` (pages) |
| `CANVAS` | A page in the file | Iterate its `children` (frames/sections) |
| `FRAME` | A screen, section, or artboard | Add to screen inventory |
| `SECTION` | A labelled grouping of frames | Treat children as a logical group |
| `COMPONENT` | A reusable component definition | Add to component list |
| `COMPONENT_SET` | A component with variants | Add all variants to component list |
| `INSTANCE` | A placed instance of a component | Record which component it references |
| `GROUP` | A non-layout grouping | Recurse into children |
| `TEXT` | A text layer | Extract for copy inventory if needed |
| `VECTOR` / `STAR` / `ELLIPSE` / `RECTANGLE` | Shape nodes | Skip unless they carry a style |

## Variant Naming Convention

Figma encodes variants in the component name as `Property=Value` pairs separated by commas.
Example: `State=Hover, Size=Large, Disabled=True`

When building the component list, parse these pairs to enumerate the prop matrix.

## Inferring Screen States

Look for frames or top-level groups whose names contain these keywords (case-insensitive):

| Keyword | Inferred State |
|---|---|
| `loading`, `skeleton`, `shimmer` | Loading |
| `empty`, `zero state`, `no results` | Empty |
| `error`, `failed`, `failure` | Error |
| `success`, `confirmation`, `done` | Success |

Sibling frames at the same level with the same base name and a state suffix are treated as
state variants of the same screen.
Example: `Checkout`, `Checkout — Loading`, `Checkout — Error` → three states of Checkout.

## Prototype Connections

Each node can have a `reactions` array. Each reaction has:
- `trigger.type` — `ON_CLICK`, `ON_HOVER`, `MOUSE_ENTER`, `AFTER_DELAY`, etc.
- `action.type` — `NAVIGATE`, `OVERLAY`, `SWAP`, `SCROLL_TO`, etc.
- `action.destinationId` — the target frame's node ID
- `transition.type` — `INSTANT`, `DISSOLVE`, `SLIDE_IN`, `MOVE_IN`, etc.

Only record connections between named top-level frames (screens) in the Interaction Notes.
Skip micro-interactions within a single screen.
