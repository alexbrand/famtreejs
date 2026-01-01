import { describe, it, expect } from 'vitest';
import { validateFamilyTreeData } from './validation';
import type { FamilyTreeData } from '../types';

describe('validateFamilyTreeData', () => {
  it('accepts valid data', () => {
    const data: FamilyTreeData = {
      people: [
        { id: 'p1', data: { name: 'Alice' } },
        { id: 'p2', data: { name: 'Bob' } },
        { id: 'p3', data: { name: 'Charlie' } },
      ],
      partnerships: [
        { id: 'u1', partnerIds: ['p1', 'p2'], childIds: ['p3'] },
      ],
    };

    expect(() => validateFamilyTreeData(data)).not.toThrow();
  });

  it('accepts empty data', () => {
    const data: FamilyTreeData = {
      people: [],
      partnerships: [],
    };

    expect(() => validateFamilyTreeData(data)).not.toThrow();
  });

  it('accepts single-parent partnerships', () => {
    const data: FamilyTreeData = {
      people: [
        { id: 'p1', data: { name: 'Alice' } },
        { id: 'p2', data: { name: 'Child' } },
      ],
      partnerships: [
        { id: 'u1', partnerIds: ['p1', null], childIds: ['p2'] },
      ],
    };

    expect(() => validateFamilyTreeData(data)).not.toThrow();
  });

  describe('duplicate ID detection', () => {
    it('throws on duplicate person IDs', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'p1', data: { name: 'Alice' } },
          { id: 'p1', data: { name: 'Bob' } },
        ],
        partnerships: [],
      };

      expect(() => validateFamilyTreeData(data)).toThrow('Duplicate person ID: p1');
    });

    it('throws on duplicate partnership IDs', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'p1', data: { name: 'Alice' } },
          { id: 'p2', data: { name: 'Bob' } },
        ],
        partnerships: [
          { id: 'u1', partnerIds: ['p1', 'p2'], childIds: [] },
          { id: 'u1', partnerIds: ['p1', 'p2'], childIds: [] },
        ],
      };

      expect(() => validateFamilyTreeData(data)).toThrow('Duplicate partnership ID: u1');
    });
  });

  describe('missing reference detection', () => {
    it('throws when partnership references non-existent partner', () => {
      const data: FamilyTreeData = {
        people: [{ id: 'p1', data: { name: 'Alice' } }],
        partnerships: [
          { id: 'u1', partnerIds: ['p1', 'p999'], childIds: [] },
        ],
      };

      expect(() => validateFamilyTreeData(data)).toThrow(
        'Partnership u1 references non-existent person: p999'
      );
    });

    it('throws when partnership references non-existent child', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'p1', data: { name: 'Alice' } },
          { id: 'p2', data: { name: 'Bob' } },
        ],
        partnerships: [
          { id: 'u1', partnerIds: ['p1', 'p2'], childIds: ['p999'] },
        ],
      };

      expect(() => validateFamilyTreeData(data)).toThrow(
        'Partnership u1 references non-existent child: p999'
      );
    });

    it('throws when rootPersonId references non-existent person', () => {
      const data: FamilyTreeData = {
        people: [{ id: 'p1', data: { name: 'Alice' } }],
        partnerships: [],
        rootPersonId: 'p999',
      };

      expect(() => validateFamilyTreeData(data)).toThrow(
        'rootPersonId references non-existent person: p999'
      );
    });
  });

  describe('circular reference detection', () => {
    it('throws when person is their own ancestor (direct)', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'p1', data: { name: 'Alice' } },
          { id: 'p2', data: { name: 'Bob' } },
        ],
        partnerships: [
          { id: 'u1', partnerIds: ['p1', 'p2'], childIds: ['p1'] },
        ],
      };

      expect(() => validateFamilyTreeData(data)).toThrow('Circular reference detected');
    });

    it('throws when person is their own ancestor (indirect)', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'p1', data: { name: 'Alice' } },
          { id: 'p2', data: { name: 'Bob' } },
          { id: 'p3', data: { name: 'Charlie' } },
          { id: 'p4', data: { name: 'Diana' } },
        ],
        partnerships: [
          // p1 + p2 -> p3
          { id: 'u1', partnerIds: ['p1', 'p2'], childIds: ['p3'] },
          // p3 + p4 -> p1 (circular!)
          { id: 'u2', partnerIds: ['p3', 'p4'], childIds: ['p1'] },
        ],
      };

      expect(() => validateFamilyTreeData(data)).toThrow('Circular reference detected');
    });
  });

  describe('malformed data detection', () => {
    it('throws when person has empty ID', () => {
      const data: FamilyTreeData = {
        people: [{ id: '', data: { name: 'Alice' } }],
        partnerships: [],
      };

      expect(() => validateFamilyTreeData(data)).toThrow('Person has empty ID');
    });

    it('throws when partnership has empty ID', () => {
      const data: FamilyTreeData = {
        people: [
          { id: 'p1', data: { name: 'Alice' } },
          { id: 'p2', data: { name: 'Bob' } },
        ],
        partnerships: [{ id: '', partnerIds: ['p1', 'p2'], childIds: [] }],
      };

      expect(() => validateFamilyTreeData(data)).toThrow('Partnership has empty ID');
    });

    it('throws when partnership has no partners', () => {
      const data = {
        people: [{ id: 'p1', data: { name: 'Alice' } }],
        partnerships: [{ id: 'u1', partnerIds: [null, null], childIds: ['p1'] }],
      } as unknown as FamilyTreeData;

      expect(() => validateFamilyTreeData(data)).toThrow(
        'Partnership u1 must have at least one partner'
      );
    });
  });
});
