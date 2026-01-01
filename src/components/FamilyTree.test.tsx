import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { FamilyTree } from './FamilyTree';
import type { FamilyTreeData, NodeComponentProps } from '../types';

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
});
