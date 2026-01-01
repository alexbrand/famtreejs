import { describe, it, expect, beforeEach } from 'vitest';
import { createTreeStore } from './treeStore';

describe('treeStore', () => {
  let store: ReturnType<typeof createTreeStore>;

  beforeEach(() => {
    store = createTreeStore(0.1, 3);
  });

  describe('zoom actions', () => {
    it('sets zoom level', () => {
      store.getState().setZoom(1.5);
      expect(store.getState().zoom).toBe(1.5);
    });

    it('clamps zoom to minZoom', () => {
      store.getState().setZoom(0.01);
      expect(store.getState().zoom).toBe(0.1);
    });

    it('clamps zoom to maxZoom', () => {
      store.getState().setZoom(10);
      expect(store.getState().zoom).toBe(3);
    });

    it('zooms in by step', () => {
      store.getState().setZoom(1);
      store.getState().zoomIn(0.2);
      expect(store.getState().zoom).toBe(1.2);
    });

    it('zooms out by step', () => {
      store.getState().setZoom(1);
      store.getState().zoomOut(0.2);
      expect(store.getState().zoom).toBe(0.8);
    });
  });

  describe('pan actions', () => {
    it('sets pan position', () => {
      store.getState().setPan(100, 200);
      expect(store.getState().panX).toBe(100);
      expect(store.getState().panY).toBe(200);
    });

    it('pans by delta', () => {
      store.getState().setPan(100, 100);
      store.getState().panBy(50, -30);
      expect(store.getState().panX).toBe(150);
      expect(store.getState().panY).toBe(70);
    });
  });

  describe('selection actions', () => {
    it('sets selected person ID', () => {
      store.getState().setSelectedPersonId('person-1');
      expect(store.getState().selectedPersonId).toBe('person-1');
    });

    it('clears selected person ID', () => {
      store.getState().setSelectedPersonId('person-1');
      store.getState().setSelectedPersonId(null);
      expect(store.getState().selectedPersonId).toBeNull();
    });

    it('sets hovered person ID', () => {
      store.getState().setHoveredPersonId('person-2');
      expect(store.getState().hoveredPersonId).toBe('person-2');
    });
  });

  describe('expand/collapse actions', () => {
    it('toggles branch expanded state', () => {
      store.getState().toggleBranch('person-1');
      expect(store.getState().expandedIds.has('person-1')).toBe(true);

      store.getState().toggleBranch('person-1');
      expect(store.getState().expandedIds.has('person-1')).toBe(false);
    });

    it('expands all branches', () => {
      store.getState().expandAll(['a', 'b', 'c']);
      expect(store.getState().expandedIds.size).toBe(3);
      expect(store.getState().expandedIds.has('a')).toBe(true);
      expect(store.getState().expandedIds.has('b')).toBe(true);
      expect(store.getState().expandedIds.has('c')).toBe(true);
    });

    it('collapses all branches', () => {
      store.getState().expandAll(['a', 'b', 'c']);
      store.getState().collapseAll();
      expect(store.getState().expandedIds.size).toBe(0);
    });
  });

  describe('root actions', () => {
    it('sets root person ID', () => {
      store.getState().setRootPersonId('person-1');
      expect(store.getState().rootPersonId).toBe('person-1');
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      store.getState().setZoom(2);
      store.getState().setPan(100, 200);
      store.getState().setSelectedPersonId('person-1');
      store.getState().toggleBranch('person-2');

      store.getState().reset();

      expect(store.getState().zoom).toBe(1);
      expect(store.getState().panX).toBe(0);
      expect(store.getState().panY).toBe(0);
      expect(store.getState().selectedPersonId).toBeNull();
      expect(store.getState().expandedIds.size).toBe(0);
    });
  });
});
