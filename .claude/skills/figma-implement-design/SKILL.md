---
name: figma-implement-design
description: "Convert a Figma frame or component into a production-ready React/TypeScript
  component. Trigger when the user provides a Figma URL or frame ID and asks to 'implement
  this design', 'build this from Figma', 'convert Figma to code', 'generate component
  from Figma', or 'turn this design into React'."
argument-hint: "<figma-url-or-frame-id> [--output-dir PATH] [--dry-run]"
user-invocable: true
---

# Figma Implement Design

Reads a Figma frame or component, interprets its visual structure, and generates a
production-ready React/TypeScript component that faithfully implements the design —
respecting the project's stack, conventions, and design tokens.

## When to Use

- User provides a Figma URL or frame ID and asks to implement, build, or convert it
- User says "implement this design", "build from Figma", "Figma to code", "convert design to React", or "generate component from Figma"
- User shares a Figma link alongside an existing codebase to implement a specific screen or component
- A `figma-spec-extractor` spec exists and the next step is producing the actual code

## Skill Boundaries

- Use this skill when the primary input is a Figma frame and the output must be a `.tsx` component file.
- If the user wants a requirements spec from Figma (not code), switch to [figma-spec-extractor](../figma-spec-extractor/SKILL.md).
- If the user wants to scaffold a component from scratch (no Figma input), switch to [generate-react-component](../generate-react-component/SKILL.md).
- If the user wants to push code back into Figma as a design, switch to `figma:figma-generate-design`.
- If the user wants to wire Figma's Dev Mode panel to show code snippets for an existing component, switch to `figma:figma-code-connect`.
- After generating the component, recommend [frontend-pattern-enforcer](../frontend-pattern-enforcer/SKILL.md) to validate idiom compliance and [component-test-generator](../component-test-generator/SKILL.md) for full test coverage.

## Prerequisites

- Figma MCP access (`figma:figma-use` skill must be available)
- A valid Figma URL or frame node ID pointing to the target frame or component

## Procedure

1. **Parse input** — extract the Figma file key and node ID from the provided URL or argument.
   Figma URL format: `https://www.figma.com/file/<fileKey>/...?node-id=<nodeId>`.
   If only a frame name is provided, ask the user for the URL.

2. **Load project context** (optional but preferred) — check for:
   - `.claude/rules/` — convention files from `convention-extractor` (naming, file layout, component idioms)
   - Stack ADR from `frontend-stack-advisor` (framework, styling library, component library)
   - Design token file from `design-tokens-architect` (CSS variables, Tailwind config, or theme object)
   If none found, proceed with React + TypeScript + CSS Modules defaults and note the assumptions.

3. **Invoke `figma:figma-use`** — read the target frame or component node:
   - Node tree (children, nesting depth, layer names)
   - Auto-layout (direction, gap, padding, alignment)
   - Fills (solid colours, gradients, image fills)
   - Typography (font family, size, weight, line height — map to Figma text styles)
   - Component instances inside the frame (Figma component name → project component mapping)
   - Variants and variant properties (map to TypeScript union props)

4. **Map design → code structure** — for each design property, resolve to a code equivalent:
   - Auto-layout direction/gap/padding → `flex`/`grid` CSS with spacing tokens
   - Figma text styles → token class names or CSS variable references
   - Solid colour fills → design token lookup; flag unmapped hex values as `// TODO: map to token`
   - Component instances → import from the project's component library or stub as `// TODO: replace with <ComponentName>`
   - Variant properties → TypeScript discriminated union or boolean props
   - Interactive layers (buttons, inputs, links) → semantic HTML elements with ARIA roles and placeholder handlers

5. **Generate component file** — write `<ComponentName>.tsx`:
   - TypeScript `Props` interface derived from Figma variants and overrides
   - JSX that mirrors the Figma node hierarchy (layout, spacing, typography)
   - Token-based class names or inline CSS variables for all resolved design values
   - `// TODO` inline comments for any unmapped colours, missing tokens, or stubbed components
   - If `--dry-run` is set, print the file content only — do not write

6. **Generate test stub** — write `<ComponentName>.test.tsx` with a render smoke test
   (renders the component with required props, asserts it mounts without error).
   Format mirrors `generate-react-component --tests` output.

7. **Report** — print a summary:
   - Files written (or previewed in `--dry-run`)
   - Resolved tokens (count)
   - Unmapped colours and component stubs (list)
   - Recommended next steps: run `frontend-pattern-enforcer` to validate idioms; run
     `component-test-generator` for interaction tests; run `figma:figma-code-connect` to
     wire Dev Mode if needed

## Output Contract

- `<ComponentName>.tsx` — React/TypeScript component implementing the Figma frame, with token-based styles
- `<ComponentName>.test.tsx` — render smoke test (skipped if `--dry-run`)
- Mapping summary — inline console report listing resolved tokens, `// TODO` stubs, and next steps

## Resources

No additional reference files are required. This skill composes `figma:figma-use` for
Figma access and defers to project files (`.claude/rules/`, stack ADR, token config)
for code conventions.

---

## Failure Handling

- If the Figma node ID is invalid or inaccessible, surface the error from `figma:figma-use` and ask the user to verify the URL and permissions.
- If auto-layout is absent on the root frame, infer layout from child positions (absolute positioning) and add a `// TODO: verify layout` comment.
- If the output directory cannot be determined from project structure, ask the user before writing any files.
- If no design tokens are found, generate the component with hardcoded values and prefix every colour and spacing value with `// TODO: replace with token`.

## Examples

### Example 1: Implement a card component from a Figma URL

User says: "Implement this Figma design: https://www.figma.com/file/abc123/Design?node-id=42%3A7"

**Actions:**
1. Extract file key `abc123`, node ID `42:7`.
2. Check `.claude/rules/` — finds `naming.md` (PascalCase components, kebab-case files).
3. Invoke `figma:figma-use` — reads a card frame: auto-layout column, 16px gap, text layers, image fill, a button instance.
4. Maps: column → `flex-col gap-4`, text styles → `text-heading-md`/`text-body-sm` tokens, button instance → `<Button>` import, image fill → `<img>` with `// TODO: replace with token`.
5. Writes `ProductCard.tsx` with typed `title`, `description`, `imageUrl`, `onAction` props.
6. Writes `ProductCard.test.tsx` render smoke test.
7. Reports: 3 tokens resolved, 1 unmapped colour, 0 component stubs.

**Result:** `ProductCard.tsx` + `ProductCard.test.tsx` ready to drop into the project.

### Example 2: Dry run before writing

User says: "Show me what you'd generate for this Figma frame before writing anything --dry-run"

**Actions:**
1–4. Same as Example 1.
5. Prints the `<ComponentName>.tsx` content to the console.

**Result:** User reviews the output and confirms before files are written.

## Best Practices

- Always load project context (stack ADR, conventions, tokens) before generating code — a component that ignores project patterns creates more work than it saves.
- Prefer token class names over inline styles; if tokens are missing, flag them rather than silently hardcoding values.
- Keep the generated component structurally faithful to the Figma hierarchy — renaming layers is acceptable, but do not collapse sibling nodes into a single element unless they are purely decorative wrappers.
- Run `frontend-pattern-enforcer` immediately after generation to catch idiom violations before the component is committed.
