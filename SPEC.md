# Family Tree Renderer - Technical Specification

## Overview

A React library for rendering interactive family trees in the browser. Unlike existing solutions that model trees with single-parent nodes, this library treats **partnerships as first-class entities** with children descending from unions rather than individuals.

**Package**: `@yourorg/family-tree`
**License**: TBD
**React Version**: 18+
**Browser Support**: Modern browsers (latest 2 versions of Chrome, Firefox, Safari, Edge)

---

## Core Concepts

### Data Model

The library uses a relationship-centric model where partnerships are explicit entities:

```
Person A ──── Partnership ──── Person B
                  │
         ┌───────┴───────┐
      Child 1         Child 2
```

**Key entities**:
- **Person**: An individual in the tree
- **Partnership**: A union between two people (marriage, civil union, or informal relationship)
- **Children**: Belong to partnerships, not individuals

This model naturally handles:
- Multiple marriages/partnerships per person
- Children from different unions
- Same-sex partnerships
- Non-marital partnerships
- Single-parent situations (partnership with one partner)

---

## Data Interface

The library defines a minimal contract for rendering. Users map their backend data to this shape:

```typescript
interface PersonNode<T = unknown> {
  /** Unique identifier */
  id: string;
  /** User's data object, passed to NodeComponent */
  data: T;
}

interface Partnership {
  /** Unique identifier */
  id: string;
  /** IDs of the two partners. Use [id, null] for single-parent situations */
  partnerIds: [string, string | null];
  /** IDs of children from this partnership */
  childIds: string[];
  /** Optional metadata */
  type?: 'marriage' | 'civil-union' | 'partnership' | 'other';
  startDate?: string;
  endDate?: string;
}

interface FamilyTreeData<T = unknown> {
  /** All people in the tree */
  people: PersonNode<T>[];
  /** All partnerships */
  partnerships: Partnership[];
  /** Optional starting point for rendering */
  rootPersonId?: string;
}
```

### Validation

The library performs strict validation and **throws errors** for:
- Partnership referencing non-existent person IDs
- Circular references (person as their own ancestor)
- Duplicate IDs
- Malformed data structures

This fail-fast approach ensures data issues are caught early with clear error messages.

---

## Visual Design

### Layout Orientations

The library supports multiple orientations (configurable):

| Orientation | Description |
|-------------|-------------|
| `top-down` | Ancestors at top, descendants below (default) |
| `bottom-up` | Ancestors at bottom, descendants above |
| `left-right` | Ancestors on left, descendants to the right |
| `right-left` | Ancestors on right, descendants to the left |

### Partnership Rendering

Partners are connected with a **horizontal line at the same level**:

```
┌─────────┐         ┌─────────┐
│ Partner │─────────│ Partner │
│    A    │         │    B    │
└─────────┘         └─────────┘
```

### Children Connection

Children connect via a **vertical drop line from the center of the partnership line**, branching to each child:

```
┌─────────┐         ┌─────────┐
│ Partner │────┬────│ Partner │
│    A    │    │    │    B    │
└─────────┘    │    └─────────┘
               │
       ┌───────┴───────┐
       │               │
  ┌─────────┐     ┌─────────┐
  │ Child 1 │     │ Child 2 │
  └─────────┘     └─────────┘
```

---

## Component API

### Basic Usage

```tsx
import { FamilyTree } from '@yourorg/family-tree';

function App() {
  return (
    <FamilyTree
      data={familyData}
      nodeComponent={PersonCard}
    />
  );
}
```

### Full Props Interface

```typescript
interface FamilyTreeProps<T = unknown> {
  /** Tree data */
  data: FamilyTreeData<T>;

  /** Custom component to render each person node */
  nodeComponent: React.ComponentType<NodeComponentProps<T>>;

  // === Layout ===

  /** Tree orientation */
  orientation?: 'top-down' | 'bottom-up' | 'left-right' | 'right-left';

  /** Spacing configuration */
  spacing?: {
    /** Vertical space between generations (px) */
    generation?: number;
    /** Horizontal space between siblings (px) */
    siblings?: number;
    /** Space between partners (px) */
    partners?: number;
  };

  // === Rendering Scope ===

  /** Person ID to center the tree on */
  rootPersonId?: string;

  /** Number of ancestor generations to show (undefined = all) */
  ancestorDepth?: number;

  /** Number of descendant generations to show (undefined = all) */
  descendantDepth?: number;

  // === Styling ===

  /** Built-in theme */
  theme?: 'light' | 'dark';

  /** Line/connection styling */
  lineStyle?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };

  /** Additional CSS class for the container */
  className?: string;

  /** Inline styles for the container */
  style?: React.CSSProperties;

  // === Behavior ===

  /** Disable all animations */
  disableAnimations?: boolean;

  /** Animation duration in ms (default: 300) */
  animationDuration?: number;

  /** Initial zoom level (default: 1) */
  initialZoom?: number;

  /** Zoom range */
  minZoom?: number;
  maxZoom?: number;

  // === Callbacks ===

  /** Called when a person node is clicked */
  onPersonClick?: (personId: string, data: T) => void;

  /** Called when a person node is hovered */
  onPersonHover?: (personId: string | null, data: T | null) => void;

  /** Called when a partnership is clicked */
  onPartnershipClick?: (partnershipId: string) => void;

  /** Called when zoom level changes */
  onZoomChange?: (zoom: number) => void;

  /** Called when the centered person changes */
  onRootChange?: (personId: string) => void;
}

interface NodeComponentProps<T> {
  /** The person's ID */
  id: string;
  /** The user's data object */
  data: T;
  /** Whether this node is currently selected */
  isSelected: boolean;
  /** Whether this node is currently hovered */
  isHovered: boolean;
  /** Whether this node's branch is expanded */
  isExpanded: boolean;
  /** Toggle branch expansion */
  onToggleExpand: () => void;
}
```

### Ref API (Imperative Controls)

```typescript
interface FamilyTreeHandle {
  /** Set zoom level */
  zoomTo(level: number): void;

  /** Zoom in by a step */
  zoomIn(): void;

  /** Zoom out by a step */
  zoomOut(): void;

  /** Center the view on a specific person */
  centerOnPerson(personId: string): void;

  /** Fit the entire tree (or visible portion) in view */
  fitToView(): void;

  /** Expand all collapsed branches */
  expandAll(): void;

  /** Collapse all branches */
  collapseAll(): void;

  /** Expand/collapse a specific person's branch */
  toggleBranch(personId: string): void;

  /** Re-root the tree on a different person */
  setRoot(personId: string): void;

  /** Get current zoom level */
  getZoom(): number;

  /** Get current root person ID */
  getRoot(): string | null;
}
```

Usage:

```tsx
const treeRef = useRef<FamilyTreeHandle>(null);

<FamilyTree ref={treeRef} data={data} nodeComponent={PersonCard} />

// Later...
treeRef.current?.centerOnPerson('person-123');
treeRef.current?.zoomTo(1.5);
```

### Hooks

```typescript
/** Access tree state reactively */
function useFamilyTreeState(): {
  /** Current zoom level */
  zoomLevel: number;
  /** Currently centered person ID */
  rootPersonId: string | null;
  /** Currently selected person ID */
  selectedPersonId: string | null;
  /** IDs of currently visible nodes */
  visibleNodeIds: string[];
  /** IDs of expanded branches */
  expandedNodeIds: string[];
};

/** Access tree actions */
function useFamilyTreeActions(): FamilyTreeHandle;
```

These hooks must be used within a `<FamilyTree>` component (or wrapped in a provider).

---

## Styling

### CSS Variables

The library exposes CSS variables for theming:

```css
.family-tree {
  /* Colors */
  --ft-bg-color: #ffffff;
  --ft-line-color: #333333;
  --ft-line-hover-color: #666666;

  /* Lines */
  --ft-line-width: 2px;
  --ft-line-style: solid;

  /* Spacing (can also be set via props) */
  --ft-generation-gap: 80px;
  --ft-sibling-gap: 40px;
  --ft-partner-gap: 20px;

  /* Animation */
  --ft-animation-duration: 300ms;
  --ft-animation-easing: ease-out;
}
```

### Built-in Themes

```tsx
<FamilyTree theme="light" ... />  // Default
<FamilyTree theme="dark" ... />
```

Themes set appropriate CSS variable values. Users can override individual variables.

### Custom Styling

Full CSS control via `className`:

```tsx
<FamilyTree className="my-tree" ... />
```

```css
.my-tree {
  --ft-line-color: #0066cc;
}

.my-tree .ft-node {
  /* Custom node container styles */
}

.my-tree .ft-partnership-line {
  /* Custom partnership line styles */
}
```

---

## Default Components

The library provides ready-to-use node components:

### BasicPersonCard

Simple card with name display:

```tsx
import { FamilyTree, BasicPersonCard } from '@yourorg/family-tree';

<FamilyTree
  data={data}
  nodeComponent={BasicPersonCard}
/>
```

### DetailedPersonCard

Card with photo, name, and dates:

```tsx
import { DetailedPersonCard } from '@yourorg/family-tree';

// Requires data shape:
interface PersonData {
  name: string;
  photoUrl?: string;
  birthDate?: string;
  deathDate?: string;
}
```

### Creating Custom Components

```tsx
interface MyPersonData {
  firstName: string;
  lastName: string;
  avatar: string;
  birthYear: number;
}

function MyPersonCard({ data, isSelected, isHovered }: NodeComponentProps<MyPersonData>) {
  return (
    <div className={`person-card ${isSelected ? 'selected' : ''}`}>
      <img src={data.avatar} alt={data.firstName} />
      <h3>{data.firstName} {data.lastName}</h3>
      <span>b. {data.birthYear}</span>
    </div>
  );
}

<FamilyTree<MyPersonData>
  data={familyData}
  nodeComponent={MyPersonCard}
/>
```

---

## Interactivity

### Navigation

| Action | Behavior |
|--------|----------|
| **Pan** | Click and drag to move around the tree |
| **Zoom** | Scroll wheel or pinch to zoom in/out |
| **Fit to view** | Via ref API: `treeRef.current.fitToView()` |
| **Center on node** | Click node (configurable) or via ref API |

### Node Interactions

| Action | Behavior |
|--------|----------|
| **Click** | Select node, trigger `onPersonClick` callback |
| **Hover** | Apply hover state, trigger `onPersonHover` callback |
| **Expand/Collapse** | Toggle visibility of descendants (via node UI or ref API) |

### Re-rooting

Users can click a node to re-root the tree on that person, making them the visual center with their ancestors above and descendants below.

```tsx
<FamilyTree
  onPersonClick={(id) => treeRef.current?.setRoot(id)}
  ...
/>
```

---

## Animations

### Default Behavior

- **Tree changes**: Nodes animate smoothly into position when data changes or branches expand/collapse
- **Navigation**: Smooth pan and zoom transitions
- **Re-rooting**: Animated transition when centering on a new person

### Configuration

```tsx
// Disable all animations
<FamilyTree disableAnimations />

// Custom duration
<FamilyTree animationDuration={500} />
```

### Reduced Motion

The library automatically respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .family-tree {
    --ft-animation-duration: 0ms;
  }
}
```

---

## Accessibility

### Best-Effort Support

The library provides sensible accessibility defaults:

**Keyboard Navigation**:
- `Tab`: Move focus between nodes
- `Enter` / `Space`: Select focused node
- `Arrow keys`: Navigate between nodes
- `+` / `-`: Zoom in/out
- `Escape`: Deselect

**ARIA**:
- Nodes have appropriate `role` and `aria-label` attributes
- Tree structure is conveyed via `aria-level`, `aria-posinset`, `aria-setsize`
- Expanded/collapsed state via `aria-expanded`

**Visual**:
- Default themes meet WCAG AA contrast ratios
- Focus indicators on interactive elements

---

## Architecture

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Layout Engine** | D3.js (layout calculations, positioning algorithms) |
| **Rendering** | React 18 (components, state, lifecycle) |
| **State Management** | Zustand (internal state, exposed via hooks) |
| **Animations** | Framer Motion (smooth transitions) |
| **Styling** | CSS Modules + CSS Variables |
| **Types** | TypeScript (full type coverage) |

### Rendering Strategy

**Hybrid SVG + HTML**:
- SVG for lines and connections (paths between nodes)
- HTML via `<foreignObject>` for node content (enables rich, styled components)
- React manages the component tree, D3 calculates positions

```
┌─────────────────────────────────────────────┐
│ <FamilyTree>                                │
│ ┌─────────────────────────────────────────┐ │
│ │ <svg>                                   │ │
│ │   <g class="connections">               │ │
│ │     <path /> <!-- partnership lines --> │ │
│ │     <path /> <!-- child drop lines -->  │ │
│ │   </g>                                  │ │
│ │   <g class="nodes">                     │ │
│ │     <foreignObject>                     │ │
│ │       <NodeComponent /> <!-- HTML -->   │ │
│ │     </foreignObject>                    │ │
│ │   </g>                                  │ │
│ │ </svg>                                  │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### State Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Props      │────▶│  Zustand     │────▶│   React      │
│   (data)     │     │  Store       │     │   Render     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    ▲                     │
       │                    │                     │
       │              ┌─────┴──────┐              │
       │              │ D3 Layout  │              │
       │              │ Engine     │              │
       │              └────────────┘              │
       │                                          │
       └────────────── User Actions ◀─────────────┘
```

---

## Package Structure

```
@yourorg/family-tree/
├── dist/
│   ├── index.mjs          # ESM bundle
│   ├── index.d.ts         # TypeScript declarations
│   └── styles.css         # Optional stylesheet (if not using CSS-in-JS)
├── src/
│   ├── components/
│   │   ├── FamilyTree.tsx
│   │   ├── TreeNode.tsx
│   │   ├── Connections.tsx
│   │   └── defaults/
│   │       ├── BasicPersonCard.tsx
│   │       └── DetailedPersonCard.tsx
│   ├── hooks/
│   │   ├── useFamilyTreeState.ts
│   │   └── useFamilyTreeActions.ts
│   ├── layout/
│   │   ├── engine.ts      # D3 layout logic
│   │   └── algorithms.ts  # Positioning algorithms
│   ├── store/
│   │   └── treeStore.ts   # Zustand store
│   ├── types/
│   │   └── index.ts       # Public type exports
│   ├── utils/
│   │   ├── validation.ts  # Data validation
│   │   └── helpers.ts
│   └── index.ts           # Public API exports
├── package.json
├── tsconfig.json
└── README.md
```

### Exports

```typescript
// Main component
export { FamilyTree } from './components/FamilyTree';
export type { FamilyTreeProps, FamilyTreeHandle } from './components/FamilyTree';

// Hooks
export { useFamilyTreeState, useFamilyTreeActions } from './hooks';

// Default components
export { BasicPersonCard, DetailedPersonCard } from './components/defaults';

// Types
export type {
  PersonNode,
  Partnership,
  FamilyTreeData,
  NodeComponentProps,
} from './types';
```

---

## Build & Distribution

### Bundle Format

- **ESM only** (no CommonJS)
- Tree-shakeable
- Minified production build

### Dependencies

**Peer Dependencies**:
- `react` ^18.0.0
- `react-dom` ^18.0.0

**Dependencies**:
- `d3` (layout algorithms)
- `zustand` (state management)
- `framer-motion` (animations)

### Size Budget

Target: < 50KB gzipped (excluding peer dependencies)

---

## Documentation

### Documentation Site

Full documentation site including:

1. **Getting Started**
   - Installation
   - Quick start example
   - Basic concepts

2. **Guides**
   - Data modeling
   - Custom node components
   - Styling and theming
   - Handling large trees
   - TypeScript usage

3. **API Reference**
   - Component props
   - Ref methods
   - Hooks
   - Types

4. **Examples**
   - Basic family tree
   - Multi-generational tree
   - Custom styled tree
   - Interactive explorer
   - With external data source

5. **Cookbook**
   - Common patterns
   - Troubleshooting
   - Performance tips

### Storybook

Interactive component playground with:
- All component variants
- Prop controls
- Theme switching
- Responsive testing

---

## Testing Strategy

### Unit Tests

- Data validation logic
- Layout algorithm correctness
- State management
- Utility functions

### Component Tests

- Rendering with various data shapes
- Interaction handlers
- Accessibility attributes
- Ref API methods

### Integration Tests

- Full tree rendering
- Pan/zoom behavior
- Expand/collapse flows
- Re-rooting behavior

### Visual Regression

- Screenshot comparison for layout changes
- Theme rendering
- Animation states

---

## Future Considerations

These features are **out of scope for v1** but may be considered later:

- **Export**: PNG, SVG, PDF export functionality
- **Editing**: In-tree CRUD operations
- **Drag-and-drop**: Rearranging nodes manually
- **Search**: Built-in search/filter for large trees
- **Minimap**: Overview navigation for large trees
- **Multiple roots**: Display multiple family lines simultaneously
- **Virtualization**: Render only visible nodes for very large trees (1000+)
- **Server components**: React Server Components support

---

## Glossary

| Term | Definition |
|------|------------|
| **Partnership** | A union between two people (marriage, civil union, or informal) from which children descend |
| **Node** | Visual representation of a person in the tree |
| **Root** | The person currently centered in the view, with ancestors above and descendants below |
| **Branch** | A person and all their descendants |
| **Generation** | A horizontal level in the tree (parents, children, grandchildren, etc.) |

---

## Version History

| Version | Status | Description |
|---------|--------|-------------|
| 1.0.0 | Planned | Initial release with core functionality |
