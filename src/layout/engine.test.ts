import { describe, it, expect } from 'vitest';
import { calculateLayout } from './engine';
import type { FamilyTreeData, SpacingConfig, Orientation } from '../types';

const DEFAULT_SPACING: SpacingConfig = {
  generation: 100,
  siblings: 50,
  partners: 30,
};

describe('calculateLayout', () => {
  describe('single person', () => {
    it('positions a single person at origin', () => {
      const data: FamilyTreeData = {
        people: [{ id: 'p1', data: { name: 'Alice' } }],
        partnerships: [],
      };

      const layout = calculateLayout(data, { spacing: DEFAULT_SPACING });

      expect(layout.nodes).toHaveLength(1);
      expect(layout.nodes[0].id).toBe('p1');
      expect(layout.nodes[0].x).toBe(0);
      expect(layout.nodes[0].y).toBe(0);
    });
  });

  describe('partnership positioning', () => {
    it('positions partners side by side', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'p1', data: { name: 'Alice' } },
          { id: 'p2', data: { name: 'Bob' } },
        ],
        partnerships: [{ id: 'u1', partnerIds: ['p1', 'p2'], childIds: [] }],
      };

      const layout = calculateLayout(data, { spacing: DEFAULT_SPACING });

      // Partners should be at same y level
      const p1 = layout.nodes.find((n) => n.id === 'p1')!;
      const p2 = layout.nodes.find((n) => n.id === 'p2')!;
      expect(p1.y).toBe(p2.y);

      // Partners should be separated by partner spacing
      expect(Math.abs(p2.x - p1.x)).toBe(DEFAULT_SPACING.partners);
    });

    it('creates partnership connection', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'p1', data: { name: 'Alice' } },
          { id: 'p2', data: { name: 'Bob' } },
        ],
        partnerships: [{ id: 'u1', partnerIds: ['p1', 'p2'], childIds: [] }],
      };

      const layout = calculateLayout(data, { spacing: DEFAULT_SPACING });

      expect(layout.partnershipConnections).toHaveLength(1);
      const conn = layout.partnershipConnections[0];
      expect(conn.partnershipId).toBe('u1');
      expect(conn.partner1Id).toBe('p1');
      expect(conn.partner2Id).toBe('p2');
    });
  });

  describe('children positioning', () => {
    it('positions child below parents', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'p1', data: { name: 'Alice' } },
          { id: 'p2', data: { name: 'Bob' } },
          { id: 'c1', data: { name: 'Charlie' } },
        ],
        partnerships: [{ id: 'u1', partnerIds: ['p1', 'p2'], childIds: ['c1'] }],
      };

      const layout = calculateLayout(data, { spacing: DEFAULT_SPACING });

      const p1 = layout.nodes.find((n) => n.id === 'p1')!;
      const c1 = layout.nodes.find((n) => n.id === 'c1')!;

      // Child should be below parents by generation spacing
      expect(c1.y).toBe(p1.y + DEFAULT_SPACING.generation);
    });

    it('centers single child below partnership midpoint', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'p1', data: { name: 'Alice' } },
          { id: 'p2', data: { name: 'Bob' } },
          { id: 'c1', data: { name: 'Charlie' } },
        ],
        partnerships: [{ id: 'u1', partnerIds: ['p1', 'p2'], childIds: ['c1'] }],
      };

      const layout = calculateLayout(data, { spacing: DEFAULT_SPACING });

      const p1 = layout.nodes.find((n) => n.id === 'p1')!;
      const p2 = layout.nodes.find((n) => n.id === 'p2')!;
      const c1 = layout.nodes.find((n) => n.id === 'c1')!;

      const partnershipMidpoint = (p1.x + p2.x) / 2;
      expect(c1.x).toBe(partnershipMidpoint);
    });

    it('spaces multiple children horizontally', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'p1', data: { name: 'Alice' } },
          { id: 'p2', data: { name: 'Bob' } },
          { id: 'c1', data: { name: 'Charlie' } },
          { id: 'c2', data: { name: 'Diana' } },
        ],
        partnerships: [{ id: 'u1', partnerIds: ['p1', 'p2'], childIds: ['c1', 'c2'] }],
      };

      const layout = calculateLayout(data, { spacing: DEFAULT_SPACING });

      const c1 = layout.nodes.find((n) => n.id === 'c1')!;
      const c2 = layout.nodes.find((n) => n.id === 'c2')!;

      // Children should be at same y level
      expect(c1.y).toBe(c2.y);

      // Children should be separated by sibling spacing
      expect(Math.abs(c2.x - c1.x)).toBe(DEFAULT_SPACING.siblings);
    });

    it('creates child connections with drop line', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'p1', data: { name: 'Alice' } },
          { id: 'p2', data: { name: 'Bob' } },
          { id: 'c1', data: { name: 'Charlie' } },
        ],
        partnerships: [{ id: 'u1', partnerIds: ['p1', 'p2'], childIds: ['c1'] }],
      };

      const layout = calculateLayout(data, { spacing: DEFAULT_SPACING });

      expect(layout.childConnections).toHaveLength(1);
      const conn = layout.childConnections[0];
      expect(conn.partnershipId).toBe('u1');
      expect(conn.childId).toBe('c1');
      // Drop point should be at partnership midpoint
      expect(conn.dropPoint.y).toBeLessThan(layout.nodes.find((n) => n.id === 'c1')!.y);
    });
  });

  describe('single parent', () => {
    it('positions child below single parent', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'p1', data: { name: 'Alice' } },
          { id: 'c1', data: { name: 'Charlie' } },
        ],
        partnerships: [{ id: 'u1', partnerIds: ['p1', null], childIds: ['c1'] }],
      };

      const layout = calculateLayout(data, { spacing: DEFAULT_SPACING });

      const p1 = layout.nodes.find((n) => n.id === 'p1')!;
      const c1 = layout.nodes.find((n) => n.id === 'c1')!;

      expect(c1.y).toBe(p1.y + DEFAULT_SPACING.generation);
      expect(c1.x).toBe(p1.x); // Centered under single parent
    });
  });

  describe('multi-generational tree', () => {
    it('correctly positions grandchildren', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'gp1', data: { name: 'Grandpa' } },
          { id: 'gp2', data: { name: 'Grandma' } },
          { id: 'p1', data: { name: 'Parent' } },
          { id: 'p2', data: { name: 'Spouse' } },
          { id: 'c1', data: { name: 'Child' } },
        ],
        partnerships: [
          { id: 'u1', partnerIds: ['gp1', 'gp2'], childIds: ['p1'] },
          { id: 'u2', partnerIds: ['p1', 'p2'], childIds: ['c1'] },
        ],
      };

      const layout = calculateLayout(data, { spacing: DEFAULT_SPACING });

      const gp1 = layout.nodes.find((n) => n.id === 'gp1')!;
      const p1 = layout.nodes.find((n) => n.id === 'p1')!;
      const c1 = layout.nodes.find((n) => n.id === 'c1')!;

      // Each generation should be spaced by generation spacing
      expect(p1.y).toBe(gp1.y + DEFAULT_SPACING.generation);
      expect(c1.y).toBe(p1.y + DEFAULT_SPACING.generation);
    });
  });

  describe('orientation', () => {
    const treeData: FamilyTreeData = {
      people: [
        { id: 'p1', data: { name: 'Parent1' } },
        { id: 'p2', data: { name: 'Parent2' } },
        { id: 'c1', data: { name: 'Child' } },
      ],
      partnerships: [{ id: 'u1', partnerIds: ['p1', 'p2'], childIds: ['c1'] }],
    };

    it('returns top-down orientation by default', () => {
      const layout = calculateLayout(treeData, { spacing: DEFAULT_SPACING });
      expect(layout.orientation).toBe('top-down');
    });

    it('child is below parents in top-down orientation', () => {
      const layout = calculateLayout(treeData, {
        spacing: DEFAULT_SPACING,
        orientation: 'top-down',
      });

      const p1 = layout.nodes.find((n) => n.id === 'p1')!;
      const c1 = layout.nodes.find((n) => n.id === 'c1')!;

      expect(c1.y).toBeGreaterThan(p1.y);
    });

    it('child is above parents in bottom-up orientation', () => {
      const layout = calculateLayout(treeData, {
        spacing: DEFAULT_SPACING,
        orientation: 'bottom-up',
      });

      const p1 = layout.nodes.find((n) => n.id === 'p1')!;
      const c1 = layout.nodes.find((n) => n.id === 'c1')!;

      expect(c1.y).toBeLessThan(p1.y);
      expect(layout.orientation).toBe('bottom-up');
    });

    it('child is to the right of parents in left-right orientation', () => {
      const layout = calculateLayout(treeData, {
        spacing: DEFAULT_SPACING,
        orientation: 'left-right',
      });

      const p1 = layout.nodes.find((n) => n.id === 'p1')!;
      const c1 = layout.nodes.find((n) => n.id === 'c1')!;

      expect(c1.x).toBeGreaterThan(p1.x);
      expect(layout.orientation).toBe('left-right');
    });

    it('child is to the left of parents in right-left orientation', () => {
      const layout = calculateLayout(treeData, {
        spacing: DEFAULT_SPACING,
        orientation: 'right-left',
      });

      const p1 = layout.nodes.find((n) => n.id === 'p1')!;
      const c1 = layout.nodes.find((n) => n.id === 'c1')!;

      expect(c1.x).toBeLessThan(p1.x);
      expect(layout.orientation).toBe('right-left');
    });

    it('preserves spacing relationships across orientations', () => {
      const orientations: Orientation[] = ['top-down', 'bottom-up', 'left-right', 'right-left'];

      for (const orientation of orientations) {
        const layout = calculateLayout(treeData, {
          spacing: DEFAULT_SPACING,
          orientation,
        });

        const p1 = layout.nodes.find((n) => n.id === 'p1')!;
        const p2 = layout.nodes.find((n) => n.id === 'p2')!;
        const c1 = layout.nodes.find((n) => n.id === 'c1')!;

        // Calculate distances based on orientation
        if (orientation === 'top-down' || orientation === 'bottom-up') {
          // Partners should be horizontally separated
          expect(Math.abs(p2.x - p1.x)).toBe(DEFAULT_SPACING.partners);
          // Child should be vertically separated from parents
          expect(Math.abs(c1.y - p1.y)).toBe(DEFAULT_SPACING.generation);
        } else {
          // Partners should be vertically separated
          expect(Math.abs(p2.y - p1.y)).toBe(DEFAULT_SPACING.partners);
          // Child should be horizontally separated from parents
          expect(Math.abs(c1.x - p1.x)).toBe(DEFAULT_SPACING.generation);
        }
      }
    });

    it('transforms connection points correctly', () => {
      const topDown = calculateLayout(treeData, {
        spacing: DEFAULT_SPACING,
        orientation: 'top-down',
      });

      const bottomUp = calculateLayout(treeData, {
        spacing: DEFAULT_SPACING,
        orientation: 'bottom-up',
      });

      // Partnership midpoints should have same x but negated y
      const tdConn = topDown.partnershipConnections[0];
      const buConn = bottomUp.partnershipConnections[0];
      expect(buConn.midpoint.x).toBe(tdConn.midpoint.x);
      expect(buConn.midpoint.y).toBe(-tdConn.midpoint.y);

      // Child connections should also be transformed
      const tdChild = topDown.childConnections[0];
      const buChild = bottomUp.childConnections[0];
      expect(buChild.dropPoint.y).toBe(-tdChild.dropPoint.y);
      expect(buChild.childPoint.y).toBe(-tdChild.childPoint.y);
    });
  });
});
