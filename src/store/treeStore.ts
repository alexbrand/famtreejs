import { create } from 'zustand';

export interface TreeState {
  // Transform state
  zoom: number;
  panX: number;
  panY: number;

  // Selection state
  selectedPersonId: string | null;
  hoveredPersonId: string | null;

  // Expanded branches
  expandedIds: Set<string>;

  // Root person for re-rooting
  rootPersonId: string | null;

  // Visible nodes (computed based on root and depth)
  visibleNodeIds: string[];
}

export interface TreeActions {
  // Zoom actions
  setZoom: (zoom: number) => void;
  zoomIn: (step?: number) => void;
  zoomOut: (step?: number) => void;

  // Pan actions
  setPan: (x: number, y: number) => void;
  panBy: (dx: number, dy: number) => void;

  // Selection actions
  setSelectedPersonId: (id: string | null) => void;
  setHoveredPersonId: (id: string | null) => void;

  // Expand/collapse actions
  toggleBranch: (personId: string) => void;
  expandAll: (allIds: string[]) => void;
  collapseAll: () => void;
  setExpandedIds: (ids: Set<string>) => void;

  // Root actions
  setRootPersonId: (id: string | null) => void;

  // Visible nodes
  setVisibleNodeIds: (ids: string[]) => void;

  // Component callbacks (registered by FamilyTree component)
  _centerOnPersonCallback: ((personId: string) => void) | null;
  _fitToViewCallback: (() => void) | null;
  _registerCallbacks: (
    centerOnPerson: (personId: string) => void,
    fitToView: () => void
  ) => void;
  _unregisterCallbacks: () => void;

  // Reset
  reset: () => void;
}

export type TreeStore = TreeState & TreeActions;

const DEFAULT_ZOOM_STEP = 0.2;

const initialState: TreeState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  selectedPersonId: null,
  hoveredPersonId: null,
  expandedIds: new Set(),
  rootPersonId: null,
  visibleNodeIds: [],
};

export const createTreeStore = (minZoom = 0.1, maxZoom = 3) =>
  create<TreeStore>((set, get) => ({
    ...initialState,

    // Component callbacks (initially null)
    _centerOnPersonCallback: null,
    _fitToViewCallback: null,

    _registerCallbacks: (centerOnPerson, fitToView) =>
      set({ _centerOnPersonCallback: centerOnPerson, _fitToViewCallback: fitToView }),

    _unregisterCallbacks: () =>
      set({ _centerOnPersonCallback: null, _fitToViewCallback: null }),

    setZoom: (zoom) =>
      set({ zoom: Math.min(maxZoom, Math.max(minZoom, zoom)) }),

    zoomIn: (step = DEFAULT_ZOOM_STEP) =>
      set((state) => ({
        zoom: Math.min(maxZoom, state.zoom + step),
      })),

    zoomOut: (step = DEFAULT_ZOOM_STEP) =>
      set((state) => ({
        zoom: Math.max(minZoom, state.zoom - step),
      })),

    setPan: (x, y) => set({ panX: x, panY: y }),

    panBy: (dx, dy) =>
      set((state) => ({
        panX: state.panX + dx,
        panY: state.panY + dy,
      })),

    setSelectedPersonId: (id) => set({ selectedPersonId: id }),

    setHoveredPersonId: (id) => set({ hoveredPersonId: id }),

    toggleBranch: (personId) =>
      set((state) => {
        const next = new Set(state.expandedIds);
        if (next.has(personId)) {
          next.delete(personId);
        } else {
          next.add(personId);
        }
        return { expandedIds: next };
      }),

    expandAll: (allIds) => set({ expandedIds: new Set(allIds) }),

    collapseAll: () => set({ expandedIds: new Set() }),

    setExpandedIds: (ids) => set({ expandedIds: ids }),

    setRootPersonId: (id) => set({ rootPersonId: id }),

    setVisibleNodeIds: (ids) => set({ visibleNodeIds: ids }),

    reset: () => set(initialState),
  }));

// Default store instance for simple usage
export const useTreeStore = createTreeStore();
