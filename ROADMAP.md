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

- [ ] **Multi-Orientation**
  - [ ] Refactor layout engine to support orientation parameter
  - [ ] Implement `bottom-up` orientation
  - [ ] Implement `left-right` orientation
  - [ ] Implement `right-left` orientation
  - [ ] Add `orientation` prop

- [ ] **Theming & Styling**
  - [ ] Define CSS variables (`--ft-line-color`, `--ft-line-width`, etc.)
  - [ ] Implement `light` theme
  - [ ] Implement `dark` theme
  - [ ] Add `theme` prop
  - [ ] Add `lineStyle` prop
  - [ ] Add `spacing` prop (generation, siblings, partners)
  - [ ] Add `className` / `style` props for overrides

- [ ] **Default Components**
  - [ ] Create `BasicPersonCard` component
  - [ ] Create `DetailedPersonCard` component (photo, name, dates)
  - [ ] Export from package

- [ ] **Animations**
  - [ ] Integrate Framer Motion
  - [ ] Animate node position changes
  - [ ] Animate expand/collapse transitions
  - [ ] Animate pan/zoom smoothly
  - [ ] Animate re-rooting transition
  - [ ] Add `disableAnimations` prop
  - [ ] Add `animationDuration` prop
  - [ ] Respect `prefers-reduced-motion` media query

**Phase 4 Complete:** [ ]

---

## Phase 5: Release

> Public release

- [ ] **Accessibility**
  - [ ] Add `role` attributes to tree structure
  - [ ] Add `aria-label` to nodes
  - [ ] Add `aria-expanded` to collapsible branches
  - [ ] Add `aria-level`, `aria-posinset`, `aria-setsize`
  - [ ] Implement keyboard navigation (Tab, Arrow keys)
  - [ ] Implement Enter/Space to select
  - [ ] Implement +/- to zoom
  - [ ] Add visible focus indicators
  - [ ] Verify WCAG AA contrast in default themes

- [ ] **Documentation Site**
  - [ ] Set up docs framework (Docusaurus, Nextra, or similar)
  - [ ] Write Getting Started guide
  - [ ] Write Data Modeling guide
  - [ ] Write Custom Components guide
  - [ ] Write Styling & Theming guide
  - [ ] Write TypeScript guide
  - [ ] Generate API reference from TSDoc
  - [ ] Deploy docs site

- [ ] **Storybook**
  - [ ] Set up Storybook
  - [ ] Create stories for `<FamilyTree>` variants
  - [ ] Create stories for default components
  - [ ] Add controls for all props
  - [ ] Deploy Storybook

- [ ] **Examples**
  - [ ] Basic family tree example
  - [ ] Multi-generational example
  - [ ] Custom styled example
  - [ ] Large tree example
  - [ ] Integration with data fetching example

- [ ] **Package Publishing**
  - [ ] Finalize package.json (name, version, exports, peerDeps)
  - [ ] Write README.md
  - [ ] Add LICENSE
  - [ ] Set up npm publish workflow
  - [ ] Publish v1.0.0

**Phase 5 Complete:** [ ]

---

## Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation | [x] |
| 2 | Interactivity | [x] |
| 3 | API & State | [x] |
| 4 | Polish | [ ] |
| 5 | Release | [ ] |

---

## Notes

- Each phase builds on the previous; complete in order
- Phases can overlap slightly (e.g., start Phase 2 while finishing Phase 1 polish)
- Mark items with `[x]` as completed
- Update phase status in Summary table when all items complete
