---
name: figma-spec-extractor
description: "Read a Figma file and extract a structured frontend requirements spec: screen inventory, component list, per-screen states, responsive breakpoints, design tokens, and interaction notes. Use when the user provides a Figma URL or says 'extract spec from Figma', 'read Figma design', 'what screens are in this Figma', 'turn Figma into requirements', or 'get design tokens from Figma'."
argument-hint: "<figma-url-or-file-key> [--page PAGE_NAME] [--node NODE_ID]"
user-invocable: true
---

# Figma Spec Extractor

Reads a Figma file and produces a structured **requirements spec** (not code): screen inventory, component list, per-screen state matrix, responsive breakpoints, design-token table, and interaction notes. The output feeds `requirement-clarifier` and the Design-phase skills.

**Direction: Figma → requirements spec.** This is the reverse of the installed `figma` plugin, which goes code → Figma.

## When to Use

- User provides a Figma file URL or file key
- User asks to "extract requirements from Figma", "turn this design into a spec", or "what's in this Figma file"
- Before running `requirement-clarifier` when design-first (Figma exists before code)
- When starting a new frontend project from a Figma handoff
- When auditing what screens and states are designed vs implemented

## Skill Boundaries

- Use this skill to extract a **requirements spec** from a Figma file.
- If the user wants to **create or update a Figma design from code**, use [figma:figma-generate-design](../figma/figma-generate-design/SKILL.md) instead.
- If the user wants to **map Figma components to code**, use [figma:figma-code-connect](../figma/figma-code-connect/SKILL.md) instead.
- If the user has requirements text (not a Figma file) to clarify, use [requirement-clarifier](../requirement-clarifier/SKILL.md) instead. This skill feeds that one — run this first, then clarifier.
- This skill produces no code. For scaffolding components from the spec, use [generate-react-component](../generate-react-component/SKILL.md) afterwards.

## Prerequisites

- A Figma file URL (`https://www.figma.com/file/<key>/...`) or bare file key
- For private files: a Figma personal access token must be set in the environment or provided by the user
- The `figma-use` skill must be invoked immediately before any `use_figma` tool call (it is the mandatory prerequisite for all Figma MCP access)

## Procedure

1. Invoke the `figma-use` skill as a mandatory prerequisite before making any `use_figma` calls.
2. Parse the Figma URL: extract the `file-key` and optional `node-id` (for a specific frame or page).
3. Read the file's top-level pages and frames via `use_figma`; build the screen inventory using the names and frame IDs.
4. For each screen frame: identify component instances and their variants; infer per-screen states (loading / empty / error / success) by looking for sibling frames or layers with those words in their names.
5. Detect responsive breakpoints from frame widths — group frames that share a name but differ in width as breakpoint variants (mobile ≤ 480 px, tablet ≤ 1024 px, desktop > 1024 px).
6. Extract design tokens: collect all named colour styles, text styles, and effect styles from the file's style library.
7. Note prototype connections: for each screen, record the trigger type, destination frame, and transition for significant interactions.
8. Compile all findings into the structured spec using [spec-template.md](./assets/spec-template.md) as the output skeleton.
9. List any open questions — ambiguous state names, missing breakpoints, undocumented interactions.

## Output Contract

- **Screen inventory** — table: screen name, page, frame ID, inferred rendering strategy (SSR/SSG/CSR) if detectable
- **Component list** — table: Figma component name, variants present, notes on props
- **Per-screen state matrix** — table: screen × state (loading / empty / error / success) with ✓ / – / ?
- **Responsive breakpoint map** — table: breakpoint label, frame width, screens that have this breakpoint
- **Design token table** — table: token name, category (colour / typography / spacing), value
- **Interaction notes** — list: source screen → trigger → destination screen → transition type
- **Open questions** — list of ambiguities or missing information that block implementation

## Resources

- [spec-template.md](./assets/spec-template.md)
- [figma-node-types.md](./references/figma-node-types.md)
- [spec-schema.md](./references/spec-schema.md)

---

## Failure Handling

- If the file is private and no API token is available, stop and ask the user to provide a personal access token or make the file public.
- If a page or node ID is not found, list the available pages and ask the user which to target.
- If no named colour/text styles exist, note "design tokens not formalised" and extract raw hex/font values as a best-effort fallback — flag these as unverified tokens.
- If no prototype connections exist, omit the Interaction notes section rather than leaving it empty.

## Examples

### Example 1: Full file extraction

User says: "Extract the spec from https://www.figma.com/file/abc123/MyApp"

**Actions:**
1. Invoke `figma-use`.
2. Read all pages and frames in `abc123`.
3. Build screen inventory, component list, state matrix, breakpoints, tokens, and interactions.

**Result:** A structured spec document with all seven Output Contract sections filled in, ready to hand to `requirement-clarifier`.

### Example 2: Single screen extraction

User says: "Get the spec for just the Checkout screen in this Figma: https://www.figma.com/file/abc123/MyApp?node-id=12:34"

**Actions:**
1. Invoke `figma-use`.
2. Read only frame `12:34` and its children.
3. Extract component list, state matrix (for Checkout only), tokens used in this frame.

**Result:** A scoped spec covering only the Checkout screen.
