import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { FamilyTree } from './FamilyTree';
import { FamilyTreeWithProvider } from './FamilyTreeWithProvider';
import type { FamilyTreeData, NodeComponentProps, Orientation } from '../types';
import { useState } from 'react';

// Simple test node component
function TestNode({ data, isSelected, isHovered }: NodeComponentProps<{ name: string }>) {
  return (
    <div
      data-testid={`node-${data.name}`}
      data-selected={isSelected}
      data-hovered={isHovered}
    >
      {data.name}
    </div>
  );
}

const sampleData: FamilyTreeData<{ name: string }> = {
  people: [
    { id: 'p1', data: { name: 'Alice' } },
    { id: 'p2', data: { name: 'Bob' } },
    { id: 'c1', data: { name: 'Charlie' } },
  ],
  partnerships: [{ id: 'u1', partnerIds: ['p1', 'p2'], childIds: ['c1'] }],
};

describe('FamilyTree', () => {
  it('renders all nodes', () => {
    const { getByTestId } = render(
      <FamilyTree data={sampleData} nodeComponent={TestNode} />
    );

    expect(getByTestId('node-Alice')).toBeInTheDocument();
    expect(getByTestId('node-Bob')).toBeInTheDocument();
    expect(getByTestId('node-Charlie')).toBeInTheDocument();
  });

  it('calls onPersonClick when a node is clicked', () => {
    const onPersonClick = vi.fn();
    const { getByTestId } = render(
      <FamilyTree data={sampleData} nodeComponent={TestNode} onPersonClick={onPersonClick} />
    );

    fireEvent.click(getByTestId('node-Alice'));

    expect(onPersonClick).toHaveBeenCalledWith('p1', { name: 'Alice' });
  });

  it('calls onPersonHover when a node is hovered', () => {
    const onPersonHover = vi.fn();
    const { getByTestId } = render(
      <FamilyTree data={sampleData} nodeComponent={TestNode} onPersonHover={onPersonHover} />
    );

    fireEvent.mouseEnter(getByTestId('node-Bob'));
    expect(onPersonHover).toHaveBeenCalledWith('p2', { name: 'Bob' });

    fireEvent.mouseLeave(getByTestId('node-Bob'));
    expect(onPersonHover).toHaveBeenCalledWith(null, null);
  });

  it('updates selected state on click', () => {
    const { getByTestId } = render(
      <FamilyTree data={sampleData} nodeComponent={TestNode} />
    );

    const node = getByTestId('node-Alice');
    expect(node).toHaveAttribute('data-selected', 'false');

    fireEvent.click(node);
    expect(node).toHaveAttribute('data-selected', 'true');
  });

  it('throws on invalid data', () => {
    const invalidData: FamilyTreeData<{ name: string }> = {
      people: [{ id: 'p1', data: { name: 'Alice' } }],
      partnerships: [{ id: 'u1', partnerIds: ['p1', 'p999'], childIds: [] }],
    };

    expect(() => render(<FamilyTree data={invalidData} nodeComponent={TestNode} />)).toThrow(
      /non-existent person/
    );
  });

  it('respects minZoom and maxZoom props', () => {
    const ref = { current: null as any };
    render(
      <FamilyTree
        ref={ref}
        data={sampleData}
        nodeComponent={TestNode}
        minZoom={0.5}
        maxZoom={2}
      />
    );

    // Try to zoom beyond limits
    ref.current?.zoomTo(5);
    expect(ref.current?.getZoom()).toBeLessThanOrEqual(2);

    ref.current?.zoomTo(0.1);
    expect(ref.current?.getZoom()).toBeGreaterThanOrEqual(0.5);
  });

  describe('multi-marriage styling', () => {
    const multiMarriageData: FamilyTreeData<{ name: string }> = {
      people: [
        { id: 'henry', data: { name: 'Henry' } },
        { id: 'wife1', data: { name: 'Catherine' } },
        { id: 'wife2', data: { name: 'Anne' } },
        { id: 'wife3', data: { name: 'Jane' } },
        { id: 'child1', data: { name: 'Mary' } },
        { id: 'child2', data: { name: 'Elizabeth' } },
        { id: 'child3', data: { name: 'Edward' } },
      ],
      partnerships: [
        { id: 'u1', partnerIds: ['henry', 'wife1'], childIds: ['child1'] },
        { id: 'u2', partnerIds: ['henry', 'wife2'], childIds: ['child2'] },
        { id: 'u3', partnerIds: ['henry', 'wife3'], childIds: ['child3'] },
      ],
    };

    it('renders partnership lines with different colors when multiple marriages exist', () => {
      const { container } = render(
        <FamilyTree data={multiMarriageData} nodeComponent={TestNode} />
      );

      // Find partnership lines
      const partnershipLines = container.querySelectorAll('.ft-partnership-line');
      expect(partnershipLines.length).toBe(3);

      // Check that lines have different stroke colors (multi-marriage styling)
      const colors = new Set<string>();
      partnershipLines.forEach((line) => {
        const stroke = line.getAttribute('stroke');
        if (stroke) colors.add(stroke);
      });

      // Should have 3 different colors for 3 marriages
      expect(colors.size).toBe(3);
    });

    it('renders child lines with matching colors to their partnership', () => {
      const { container } = render(
        <FamilyTree data={multiMarriageData} nodeComponent={TestNode} />
      );

      // Find child lines
      const childLines = container.querySelectorAll('.ft-child-line');
      expect(childLines.length).toBe(3);

      // Check that child lines have colors (multi-marriage styling)
      const colors = new Set<string>();
      childLines.forEach((line) => {
        const stroke = line.getAttribute('stroke');
        if (stroke) colors.add(stroke);
      });

      // Should have 3 different colors for 3 child connections
      expect(colors.size).toBe(3);
    });

    it('uses default line style when no multiple marriages exist', () => {
      const { container } = render(
        <FamilyTree data={sampleData} nodeComponent={TestNode} />
      );

      // Find partnership line
      const partnershipLine = container.querySelector('.ft-partnership-line');
      expect(partnershipLine).toBeInTheDocument();

      // Should use CSS variable (default style), not a specific color
      const stroke = partnershipLine?.getAttribute('stroke');
      expect(stroke).toBe('var(--ft-line-color)');
    });

    it('applies dash patterns to differentiate marriages', () => {
      const { container } = render(
        <FamilyTree data={multiMarriageData} nodeComponent={TestNode} />
      );

      // Find partnership lines
      const partnershipLines = container.querySelectorAll('.ft-partnership-line');

      // Collect dash patterns (some may be empty/null for solid lines)
      const dashes = new Set<string | null>();
      partnershipLines.forEach((line) => {
        dashes.add(line.getAttribute('stroke-dasharray'));
      });

      // Should have at least 2 different dash patterns (including solid)
      expect(dashes.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('stability and infinite loop prevention', () => {
    it('does not cause infinite re-renders on mount', async () => {
      const renderCount = { current: 0 };

      function CountingNode({ data }: NodeComponentProps<{ name: string }>) {
        renderCount.current++;
        return <div>{data.name}</div>;
      }

      render(
        <FamilyTree data={sampleData} nodeComponent={CountingNode} />
      );

      // Wait a tick for any async effects to settle
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // Each node renders once initially, plus potentially once more for state updates
      // But should NOT be hundreds of renders (which would indicate infinite loop)
      // With 3 nodes, we expect roughly 3-12 renders max (initial + potential re-renders)
      expect(renderCount.current).toBeLessThan(30);
    });

    it('handles rapid orientation changes without infinite loop', () => {
      const orientations: Orientation[] = ['top-down', 'left-right', 'bottom-up', 'right-left'];

      function OrientationChanger() {
        const [orientation, setOrientation] = useState<Orientation>('top-down');
        return (
          <>
            <FamilyTree
              data={sampleData}
              nodeComponent={TestNode}
              orientation={orientation}
            />
            <button
              data-testid="change-orientation"
              onClick={() => {
                const currentIndex = orientations.indexOf(orientation);
                setOrientation(orientations[(currentIndex + 1) % orientations.length]);
              }}
            />
          </>
        );
      }

      const { getByTestId } = render(<OrientationChanger />);
      const button = getByTestId('change-orientation');

      // Rapidly change orientation multiple times
      // This should NOT throw "Maximum update depth exceeded"
      expect(() => {
        act(() => {
          fireEvent.click(button);
          fireEvent.click(button);
          fireEvent.click(button);
          fireEvent.click(button);
        });
      }).not.toThrow();
    });

    it('does not re-run fitToView when bounds change from same data', () => {
      const onZoomChange = vi.fn();

      const { rerender } = render(
        <FamilyTree
          data={sampleData}
          nodeComponent={TestNode}
          onZoomChange={onZoomChange}
        />
      );

      // Clear initial calls
      onZoomChange.mockClear();

      // Re-render with same data - should not trigger fitToView again
      rerender(
        <FamilyTree
          data={sampleData}
          nodeComponent={TestNode}
          onZoomChange={onZoomChange}
        />
      );

      // onZoomChange should not be called on re-render with same data
      expect(onZoomChange).not.toHaveBeenCalled();
    });
  });

  describe('FamilyTreeWithProvider', () => {
    it('renders without causing infinite loops', async () => {
      const renderCount = { current: 0 };

      function CountingNode({ data }: NodeComponentProps<{ name: string }>) {
        renderCount.current++;
        return <div>{data.name}</div>;
      }

      // This should NOT throw "Maximum update depth exceeded"
      expect(() => {
        render(
          <FamilyTreeWithProvider data={sampleData} nodeComponent={CountingNode} />
        );
      }).not.toThrow();

      // Wait for effects to settle
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // Should have reasonable render count (not hundreds from infinite loop)
      expect(renderCount.current).toBeLessThan(30);
    });

    it('handles multiple re-renders without infinite loop', async () => {
      const { rerender } = render(
        <FamilyTreeWithProvider data={sampleData} nodeComponent={TestNode} />
      );

      // Multiple re-renders should NOT cause infinite loop
      expect(() => {
        act(() => {
          rerender(
            <FamilyTreeWithProvider data={sampleData} nodeComponent={TestNode} />
          );
          rerender(
            <FamilyTreeWithProvider data={sampleData} nodeComponent={TestNode} />
          );
          rerender(
            <FamilyTreeWithProvider data={sampleData} nodeComponent={TestNode} />
          );
        });
      }).not.toThrow();

      // Wait for effects to settle
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
    });
  });
});
