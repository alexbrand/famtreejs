# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React library (`@yourorg/family-tree`) for rendering interactive family trees. The key differentiator from existing libraries: **partnerships are first-class entities**, with children descending from unions rather than single parents.

## Project Status

This project is in **pre-implementation phase**. No code exists yet.

## Key Files

- `SPEC.md` - Full technical specification (architecture, data model, component API, styling)
- `ROADMAP.md` - 5-phase implementation plan with checkboxes

Read these files before implementing any features.

## Implementation Guidance

### Development Approach
- **Test-driven development**: Write tests before implementation. Run tests frequently.
- **TypeScript strict mode**: No `any` types. Define interfaces for all data structures.
- **Incremental commits**: Commit working code at each logical checkpoint.
- **Conventional commits**: Use format `type: short description` (e.g., `feat: add pan/zoom`, `fix: circular ref detection`, `test: layout engine`).
- **Prefer CLIs for scaffolding**: Use tools like `npm init`, `npx storybook init`, etc. rather than manually generating config files.

### Visual Verification
When implementing or modifying visual features (layout, rendering, styling, animations):
1. Run the dev server or Storybook
2. Use the browser to visually inspect the output
3. Verify the rendering matches the spec's visual design (partnership lines, drop lines, node positioning)
4. Test interactions (pan, zoom, hover, click) manually before marking complete
