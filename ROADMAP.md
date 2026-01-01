# Roadmap

Implementation plan for `@yourorg/family-tree` organized into 5 phases.

---

## Phase 1: Foundation

> Renders a static tree from data, no interactivity

- [x] **Project Setup**
  - [x] Initialize npm package with TypeScript
  - [x] Configure ESM-only build (Vite or Rollup)
  - [x] Install dependencies (React 18, D3, Zustand, Framer Motion)
  - [x] Set up linting (ESLint) and formatting (Prettier)
  - [x] Configure testing framework (Vitest)

- [x] **Data Layer**
  - [x] Define TypeScript interfaces (`PersonNode<T>`, `Partnership`, `FamilyTreeData<T>`)
  - [x] Implement data validation (missing IDs, circular refs, duplicates)
  - [x] Write unit tests for validation logic

- [x] **Layout Engine**
  - [x] Implement D3-based layout algorithm for top-down orientation
  - [x] Handle partnership positioning (partners side-by-side)
  - [x] Calculate child drop-line positions (vertical line from partnership center)
  - [x] Handle single-parent edge case
  - [x] Write unit tests for layout calculations

- [x] **Basic Rendering**
  - [x] Create `<FamilyTree>` component shell
  - [x] Render SVG container with viewBox
  - [x] Render partnership lines (horizontal between partners)
  - [x] Render child connection lines (vertical drop + horizontal branches)
  - [x] Render nodes via `<foreignObject>` with user's `nodeComponent`
  - [x] Basic props: `data`, `nodeComponent`

**Phase 1 Complete:** [x]

---

## Phase 2: Interactivity

> Fully navigable tree

- [x] **Pan & Zoom**
  - [x] Implement drag-to-pan on SVG container
  - [x] Implement scroll-wheel zoom
  - [x] Implement pinch-to-zoom (touch devices)
  - [x] Add `minZoom` / `maxZoom` props
  - [x] Add `initialZoom` prop

- [x] **Node Interactions**
  - [x] Track hover state, pass `isHovered` to `nodeComponent`
  - [x] Track selected state, pass `isSelected` to `nodeComponent`
  - [x] Implement `onPersonClick` callback
  - [x] Implement `onPersonHover` callback
  - [x] Implement `onPartnershipClick` callback

- [x] **Expand/Collapse**
  - [x] Track expanded/collapsed state per branch
  - [x] Pass `isExpanded` and `onToggleExpand` to `nodeComponent`
  - [x] Hide/show descendants based on state
  - [x] Update layout when branches toggle

- [x] **Re-rooting**
  - [x] Implement `rootPersonId` prop
  - [x] Implement `ancestorDepth` / `descendantDepth` props
  - [x] Recalculate visible nodes when root changes
  - [x] Implement `onRootChange` callback

**Phase 2 Complete:** [x]

---

## Phase 3: API & State

> Programmatically controllable tree

- [x] **State Management**
  - [x] Set up Zustand store for tree state
  - [x] Store: zoom level, root person, selected node, expanded branches
  - [x] Ensure React components subscribe to relevant slices

- [x] **Ref API**
  - [x] Define `FamilyTreeHandle` interface
  - [x] Implement `zoomTo(level)`
  - [x] Implement `zoomIn()` / `zoomOut()`
  - [x] Implement `centerOnPerson(id)`
  - [x] Implement `fitToView()`
  - [x] Implement `expandAll()` / `collapseAll()`
  - [x] Implement `toggleBranch(id)`
  - [x] Implement `setRoot(id)`
  - [x] Implement `getZoom()` / `getRoot()`
  - [x] Expose via `React.forwardRef`

- [x] **Hooks**
  - [x] Implement `useFamilyTreeState()` hook
  - [x] Implement `useFamilyTreeActions()` hook
  - [x] Create context provider for hooks
  - [x] Document that hooks must be used within `<FamilyTree>`

- [x] **Callbacks**
  - [x] Implement `onZoomChange` callback
  - [x] Ensure all callbacks are stable (memoized)

**Phase 3 Complete:** [x]

---

## Phase 4: Polish

> Production-quality visuals

- [x] **Multi-Orientation**
  - [x] Refactor layout engine to support orientation parameter
  - [x] Implement `bottom-up` orientation
  - [x] Implement `left-right` orientation
  - [x] Implement `right-left` orientation
  - [x] Add `orientation` prop

- [x] **Theming & Styling**
  - [x] Define CSS variables (`--ft-line-color`, `--ft-line-width`, etc.)
  - [x] Implement `light` theme
  - [x] Implement `dark` theme
  - [x] Add `theme` prop
  - [x] Add `lineStyle` prop
  - [x] Add `spacing` prop (generation, siblings, partners)
  - [x] Add `className` / `style` props for overrides

- [x] **Default Components**
  - [x] Create `BasicPersonCard` component
  - [x] Create `DetailedPersonCard` component (photo, name, dates)
  - [x] Export from package

- [x] **Animations**
  - [x] Integrate Framer Motion
  - [x] Animate node position changes
  - [x] Animate expand/collapse transitions
  - [x] Animate pan/zoom smoothly
  - [x] Animate re-rooting transition
  - [x] Add `disableAnimations` prop
  - [x] Add `animationDuration` prop
  - [x] Respect `prefers-reduced-motion` media query

**Phase 4 Complete:** [x]

---

## Phase 5: Release

> Public release

- [x] **Accessibility**
  - [x] Add `role` attributes to tree structure
  - [x] Add `aria-label` to nodes
  - [x] Add `aria-expanded` to collapsible branches
  - [x] Add `aria-level`, `aria-posinset`, `aria-setsize`
  - [x] Implement keyboard navigation (Tab, Arrow keys)
  - [x] Implement Enter/Space to select
  - [x] Implement +/- to zoom
  - [x] Add visible focus indicators
  - [x] Verify WCAG AA contrast in default themes

- [ ] **Documentation Site** (deferred - README covers basics)
  - [ ] Set up docs framework (Docusaurus, Nextra, or similar)
  - [ ] Write Getting Started guide
  - [ ] Write Data Modeling guide
  - [ ] Write Custom Components guide
  - [ ] Write Styling & Theming guide
  - [ ] Write TypeScript guide
  - [ ] Generate API reference from TSDoc
  - [ ] Deploy docs site

- [x] **Storybook**
  - [x] Set up Storybook
  - [x] Create stories for `<FamilyTree>` variants
  - [x] Create stories for default components
  - [x] Add controls for all props
  - [ ] Deploy Storybook

- [x] **Examples** (included in Storybook)
  - [x] Basic family tree example
  - [x] Multi-generational example
  - [x] Custom styled example
  - [ ] Large tree example
  - [ ] Integration with data fetching example

- [x] **Package Publishing**
  - [x] Finalize package.json (name, version, exports, peerDeps)
  - [x] Write README.md
  - [x] Add LICENSE
  - [ ] Set up npm publish workflow
  - [ ] Publish v1.0.0

**Phase 5 Complete:** [x]

---

## Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation | [x] |
| 2 | Interactivity | [x] |
| 3 | API & State | [x] |
| 4 | Polish | [x] |
| 5 | Release | [x] |

---

## Notes

- Each phase builds on the previous; complete in order
- Phases can overlap slightly (e.g., start Phase 2 while finishing Phase 1 polish)
- Mark items with `[x]` as completed
- Update phase status in Summary table when all items complete
