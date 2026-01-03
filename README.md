# @alexbrand09/famtreejs

[![npm version](https://img.shields.io/npm/v/@alexbrand09/famtreejs.svg)](https://www.npmjs.com/package/@alexbrand09/famtreejs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A React library for rendering interactive family trees with a partnership-centric data model. Unlike traditional family tree libraries where children belong to a single parent, this library treats partnerships (marriages, unions) as first-class entities, with children descending from partnerships rather than individuals.

## Features

- **Partnership-centric data model** - Children belong to partnerships, not individuals
- **Multiple orientations** - Top-down, bottom-up, left-right, right-left layouts
- **Interactive** - Pan, zoom, click, hover, expand/collapse branches
- **Keyboard accessible** - Full keyboard navigation with ARIA support
- **Themeable** - Light/dark themes with CSS variables for customization
- **Animated** - Smooth transitions with Framer Motion, respects `prefers-reduced-motion`
- **TypeScript** - Full type safety with generics for custom data

## Installation

```bash
npm install @alexbrand09/famtreejs
```

## Quick Start

```tsx
import { FamilyTree, BasicPersonCard } from '@alexbrand09/famtreejs';
import '@alexbrand09/famtreejs/styles.css';
import type { FamilyTreeData } from '@alexbrand09/famtreejs';

const data: FamilyTreeData<{ name: string }> = {
  people: [
    { id: 'p1', data: { name: 'John' } },
    { id: 'p2', data: { name: 'Mary' } },
    { id: 'c1', data: { name: 'Alice' } },
  ],
  partnerships: [
    { id: 'u1', partnerIds: ['p1', 'p2'], childIds: ['c1'] }
  ],
};

function App() {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <FamilyTree
        data={data}
        nodeComponent={BasicPersonCard}
        onPersonClick={(id, data) => console.log('Clicked:', id, data)}
      />
    </div>
  );
}
```

## Data Model

### PersonNode

```typescript
interface PersonNode<T = unknown> {
  id: string;      // Unique identifier
  data: T;         // Your custom data (passed to nodeComponent)
}
```

### Partnership

```typescript
interface Partnership {
  id: string;
  partnerIds: [string, string | null];  // [partner1, partner2] or [parent, null] for single parent
  childIds: string[];                    // Children from this partnership
  type?: 'marriage' | 'civil-union' | 'partnership' | 'other';
}
```

### FamilyTreeData

```typescript
interface FamilyTreeData<T = unknown> {
  people: PersonNode<T>[];
  partnerships: Partnership[];
  rootPersonId?: string;  // Optional starting point
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `FamilyTreeData<T>` | required | The family tree data |
| `nodeComponent` | `ComponentType<NodeComponentProps<T>>` | required | Component to render each person |
| `orientation` | `'top-down' \| 'bottom-up' \| 'left-right' \| 'right-left'` | `'top-down'` | Tree layout direction |
| `theme` | `'light' \| 'dark'` | `'light'` | Built-in theme |
| `spacing` | `SpacingConfig` | `{ generation: 120, siblings: 60, partners: 40 }` | Spacing between nodes |
| `lineStyle` | `LineStyle` | - | Custom line styling |
| `initialZoom` | `number` | `1` | Initial zoom level |
| `minZoom` | `number` | `0.1` | Minimum zoom level |
| `maxZoom` | `number` | `3` | Maximum zoom level |
| `disableAnimations` | `boolean` | `false` | Disable all animations |
| `animationDuration` | `number` | `300` | Animation duration in ms |
| `onPersonClick` | `(id: string, data: T) => void` | - | Called when a person is clicked |
| `onPersonHover` | `(id: string \| null, data: T \| null) => void` | - | Called on hover |
| `onPartnershipClick` | `(id: string) => void` | - | Called when a partnership line is clicked |
| `onZoomChange` | `(zoom: number) => void` | - | Called when zoom changes |

## Custom Node Components

Create your own node component by implementing `NodeComponentProps`:

```tsx
import type { NodeComponentProps } from '@alexbrand09/famtreejs';

interface MyPersonData {
  name: string;
  birthYear?: number;
  photoUrl?: string;
}

function MyPersonCard({ data, isSelected, isHovered, isExpanded, onToggleExpand }: NodeComponentProps<MyPersonData>) {
  return (
    <div style={{
      padding: '10px',
      border: isSelected ? '2px solid blue' : '1px solid gray',
      backgroundColor: isHovered ? '#f0f0f0' : 'white',
    }}>
      {data.photoUrl && <img src={data.photoUrl} alt={data.name} />}
      <div>{data.name}</div>
      {data.birthYear && <div>Born: {data.birthYear}</div>}
      <button onClick={onToggleExpand}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
    </div>
  );
}
```

## Built-in Components

### BasicPersonCard

Simple card showing just the name:

```tsx
import { BasicPersonCard } from '@alexbrand09/famtreejs';
```

### DetailedPersonCard

Card with photo, name, and dates:

```tsx
import { DetailedPersonCard } from '@alexbrand09/famtreejs';

// Data should include: name, birthDate?, deathDate?, photoUrl?
```

## Ref API

Access imperative methods via ref:

```tsx
import { useRef } from 'react';
import { FamilyTree } from '@alexbrand09/famtreejs';
import type { FamilyTreeHandle } from '@alexbrand09/famtreejs';

function App() {
  const treeRef = useRef<FamilyTreeHandle>(null);

  return (
    <>
      <button onClick={() => treeRef.current?.zoomIn()}>Zoom In</button>
      <button onClick={() => treeRef.current?.fitToView()}>Fit</button>
      <FamilyTree ref={treeRef} data={data} nodeComponent={BasicPersonCard} />
    </>
  );
}
```

### Available Methods

- `zoomTo(level: number)` - Set zoom level
- `zoomIn()` / `zoomOut()` - Zoom by step
- `centerOnPerson(id: string)` - Center view on a person
- `fitToView()` - Fit entire tree in view
- `expandAll()` / `collapseAll()` - Expand/collapse all branches
- `toggleBranch(id: string)` - Toggle a specific branch
- `setRoot(id: string)` - Re-root the tree
- `getZoom()` - Get current zoom level
- `getRoot()` - Get current root person ID

## Hooks

Use hooks inside the FamilyTree component tree:

```tsx
import { useFamilyTreeState, useFamilyTreeActions } from '@alexbrand09/famtreejs';

function MyControls() {
  const { zoomLevel, selectedPersonId } = useFamilyTreeState();
  const { zoomIn, zoomOut, fitToView } = useFamilyTreeActions();

  return (
    <div>
      <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
      <button onClick={zoomIn}>+</button>
      <button onClick={zoomOut}>-</button>
    </div>
  );
}
```

## Theming

### CSS Variables

Customize the appearance using CSS variables:

```css
.family-tree {
  --ft-line-color: #333;
  --ft-line-width: 2px;
  --ft-node-background: #fff;
  --ft-node-border: #ddd;
  --ft-node-text: #333;
  --ft-node-shadow: rgba(0, 0, 0, 0.1);
  --ft-node-hover-border: #999;
  --ft-node-selected-border: #0066cc;
  --ft-node-selected-shadow: rgba(0, 102, 204, 0.3);
}
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| Arrow keys | Navigate between nodes |
| Enter / Space | Select focused node |
| E | Toggle expand/collapse on focused node |
| + / - | Zoom in / out |
| 0 | Fit to view |
| Home / End | Jump to first / last node |

## Accessibility

- ARIA tree structure with `role="tree"` and `role="treeitem"`
- `aria-selected`, `aria-expanded` states
- Visible focus indicators
- Respects `prefers-reduced-motion` media query
- WCAG AA compliant contrast ratios

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- React 18+

## License

MIT
