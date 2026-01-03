// @alexbrand/famtreejs
// React library for rendering interactive family trees

// Main component (with provider for hook access)
export { FamilyTreeWithProvider as FamilyTree } from './components/FamilyTreeWithProvider';

// Raw component (without provider, for advanced usage)
export { FamilyTree as FamilyTreeCore } from './components/FamilyTree';

// Types
export type { FamilyTreeProps, FamilyTreeHandle } from './components/FamilyTree';

// Hooks
export { useFamilyTreeState, useFamilyTreeActions } from './hooks';

// Provider (for wrapping custom components)
export { FamilyTreeProvider } from './store/FamilyTreeContext';

// Default components
export { BasicPersonCard } from './components/defaults/BasicPersonCard';
export { DetailedPersonCard } from './components/defaults/DetailedPersonCard';

// Types
export type {
  PersonNode,
  Partnership,
  FamilyTreeData,
  NodeComponentProps,
  FamilyTreeState,
  Orientation,
  SpacingConfig,
  LineStyle,
  Theme,
} from './types';
