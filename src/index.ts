// @yourorg/family-tree
// React library for rendering interactive family trees

export { FamilyTree } from './components/FamilyTree';
export type { FamilyTreeProps, FamilyTreeHandle } from './components/FamilyTree';

export { useFamilyTreeState, useFamilyTreeActions } from './hooks';

export type {
  PersonNode,
  Partnership,
  FamilyTreeData,
  NodeComponentProps,
} from './types';
