import type { ComponentType, CSSProperties } from 'react';

/**
 * A person node in the family tree
 */
export interface PersonNode<T = unknown> {
  /** Unique identifier */
  id: string;
  /** User's data object, passed to NodeComponent */
  data: T;
}

/**
 * A partnership (marriage, civil union, or informal relationship)
 */
export interface Partnership {
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

/**
 * Complete family tree data structure
 */
export interface FamilyTreeData<T = unknown> {
  /** All people in the tree */
  people: PersonNode<T>[];
  /** All partnerships */
  partnerships: Partnership[];
  /** Optional starting point for rendering */
  rootPersonId?: string;
}

/**
 * Props passed to user's custom node component
 */
export interface NodeComponentProps<T = unknown> {
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

/**
 * Tree orientation options
 */
export type Orientation = 'top-down' | 'bottom-up' | 'left-right' | 'right-left';

/**
 * Spacing configuration
 */
export interface SpacingConfig {
  /** Vertical space between generations (px) */
  generation?: number;
  /** Horizontal space between siblings (px) */
  siblings?: number;
  /** Space between partners (px) */
  partners?: number;
}

/**
 * Line styling configuration
 */
export interface LineStyle {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

/**
 * Theme options
 */
export type Theme = 'light' | 'dark';

/**
 * Main FamilyTree component props
 */
export interface FamilyTreeProps<T = unknown> {
  /** Tree data */
  data: FamilyTreeData<T>;

  /** Custom component to render each person node */
  nodeComponent: ComponentType<NodeComponentProps<T>>;

  // === Layout ===

  /** Tree orientation */
  orientation?: Orientation;

  /** Spacing configuration */
  spacing?: SpacingConfig;

  // === Rendering Scope ===

  /** Person ID to center the tree on */
  rootPersonId?: string;

  /** Number of ancestor generations to show (undefined = all) */
  ancestorDepth?: number;

  /** Number of descendant generations to show (undefined = all) */
  descendantDepth?: number;

  // === Styling ===

  /** Built-in theme */
  theme?: Theme;

  /** Line/connection styling */
  lineStyle?: LineStyle;

  /** Additional CSS class for the container */
  className?: string;

  /** Inline styles for the container */
  style?: CSSProperties;

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

/**
 * Imperative handle for FamilyTree component
 */
export interface FamilyTreeHandle {
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

/**
 * State returned by useFamilyTreeState hook
 */
export interface FamilyTreeState {
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
}
