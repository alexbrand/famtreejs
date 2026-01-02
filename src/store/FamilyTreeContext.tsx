import { createContext, useContext, useRef, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { createTreeStore, type TreeStore, type TreeState, type TreeActions } from './treeStore';

// Context for the store
const FamilyTreeContext = createContext<ReturnType<typeof createTreeStore> | null>(null);

export interface FamilyTreeProviderProps {
  children: ReactNode;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * Provider component that creates and provides a tree store instance
 */
export function FamilyTreeProvider({
  children,
  minZoom = 0.1,
  maxZoom = 3,
}: FamilyTreeProviderProps) {
  const storeRef = useRef<ReturnType<typeof createTreeStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createTreeStore(minZoom, maxZoom);
  }

  return (
    <FamilyTreeContext.Provider value={storeRef.current}>
      {children}
    </FamilyTreeContext.Provider>
  );
}

/**
 * Hook to access the tree store
 * @throws Error if used outside of FamilyTreeProvider
 */
function useTreeStoreContext() {
  const store = useContext(FamilyTreeContext);
  if (!store) {
    throw new Error('useFamilyTreeState/useFamilyTreeActions must be used within a FamilyTree component');
  }
  return store;
}

/**
 * Hook to access tree state reactively
 */
export function useFamilyTreeState() {
  const store = useTreeStoreContext();

  return useStore(store, (state): {
    zoomLevel: number;
    rootPersonId: string | null;
    selectedPersonId: string | null;
    visibleNodeIds: string[];
    expandedNodeIds: string[];
  } => ({
    zoomLevel: state.zoom,
    rootPersonId: state.rootPersonId,
    selectedPersonId: state.selectedPersonId,
    visibleNodeIds: state.visibleNodeIds,
    expandedNodeIds: Array.from(state.expandedIds),
  }));
}

/**
 * Hook to access tree actions
 */
export function useFamilyTreeActions() {
  const store = useTreeStoreContext();

  return useStore(store, (state): {
    zoomTo: (level: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    centerOnPerson: (personId: string) => void;
    fitToView: () => void;
    expandAll: () => void;
    collapseAll: () => void;
    toggleBranch: (personId: string) => void;
    setRoot: (personId: string) => void;
    getZoom: () => number;
    getRoot: () => string | null;
  } => ({
    zoomTo: state.setZoom,
    zoomIn: () => state.zoomIn(),
    zoomOut: () => state.zoomOut(),
    centerOnPerson: (personId: string) => {
      const callback = state._centerOnPersonCallback;
      if (callback) {
        callback(personId);
      } else {
        console.warn('centerOnPerson: FamilyTree component not mounted');
      }
    },
    fitToView: () => {
      const callback = state._fitToViewCallback;
      if (callback) {
        callback();
      } else {
        console.warn('fitToView: FamilyTree component not mounted');
      }
    },
    expandAll: () => state.expandAll([]),
    collapseAll: state.collapseAll,
    toggleBranch: state.toggleBranch,
    setRoot: state.setRootPersonId,
    getZoom: () => state.zoom,
    getRoot: () => state.rootPersonId,
  }));
}

/**
 * Internal hook to get full store access (for FamilyTree component)
 */
export function useTreeStoreInternal() {
  const store = useTreeStoreContext();
  return useStore(store);
}

/**
 * Internal hook to get the raw store reference (for callback registration)
 * This avoids subscribing to state changes, preventing infinite loops
 */
export function useTreeStoreRaw() {
  return useTreeStoreContext();
}

export { FamilyTreeContext };
