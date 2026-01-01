import { forwardRef, useImperativeHandle, useMemo, useState, useCallback, useRef } from 'react';
import type { FamilyTreeProps, FamilyTreeHandle, NodeComponentProps } from '../types';
import { validateFamilyTreeData } from '../utils/validation';
import { calculateLayout } from '../layout/engine';
import type { LayoutResult } from '../layout/engine';

// Default spacing values
const DEFAULT_SPACING = {
  generation: 120,
  siblings: 60,
  partners: 40,
};

// Default node size (for foreignObject)
const NODE_WIDTH = 120;
const NODE_HEIGHT = 80;

/**
 * FamilyTree component for rendering interactive family trees
 */
function FamilyTreeInner<T>(
  props: FamilyTreeProps<T>,
  ref: React.ForwardedRef<FamilyTreeHandle>
) {
  const {
    data,
    nodeComponent: NodeComponent,
    orientation = 'top-down',
    spacing: spacingProp,
    theme = 'light',
    lineStyle,
    className,
    style,
    onPersonClick,
    onPersonHover,
  } = props;

  // Merge spacing with defaults
  const spacing = useMemo(
    () => ({ ...DEFAULT_SPACING, ...spacingProp }),
    [spacingProp]
  );

  // State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedIds] = useState<Set<string>>(new Set());

  // Refs
  const svgRef = useRef<SVGSVGElement>(null);

  // Validate data on render
  validateFamilyTreeData(data);

  // Calculate layout
  const layout: LayoutResult = useMemo(() => {
    return calculateLayout(data, { spacing });
  }, [data, spacing]);

  // Calculate viewBox bounds
  const bounds = useMemo(() => {
    if (layout.nodes.length === 0) {
      return { minX: 0, minY: 0, width: 400, height: 300 };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const node of layout.nodes) {
      minX = Math.min(minX, node.x - NODE_WIDTH / 2);
      maxX = Math.max(maxX, node.x + NODE_WIDTH / 2);
      minY = Math.min(minY, node.y - NODE_HEIGHT / 2);
      maxY = Math.max(maxY, node.y + NODE_HEIGHT / 2);
    }

    const padding = 40;
    return {
      minX: minX - padding,
      minY: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }, [layout.nodes]);

  // Event handlers
  const handleNodeClick = useCallback(
    (personId: string) => {
      setSelectedId(personId);
      const person = data.people.find((p) => p.id === personId);
      if (person && onPersonClick) {
        onPersonClick(personId, person.data);
      }
    },
    [data.people, onPersonClick]
  );

  const handleNodeHover = useCallback(
    (personId: string | null) => {
      setHoveredId(personId);
      if (onPersonHover) {
        if (personId) {
          const person = data.people.find((p) => p.id === personId);
          onPersonHover(personId, person?.data ?? null);
        } else {
          onPersonHover(null, null);
        }
      }
    },
    [data.people, onPersonHover]
  );

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    zoomTo: () => {
      // TODO: Phase 2
    },
    zoomIn: () => {
      // TODO: Phase 2
    },
    zoomOut: () => {
      // TODO: Phase 2
    },
    centerOnPerson: () => {
      // TODO: Phase 2
    },
    fitToView: () => {
      // TODO: Phase 2
    },
    expandAll: () => {
      // TODO: Phase 2
    },
    collapseAll: () => {
      // TODO: Phase 2
    },
    toggleBranch: () => {
      // TODO: Phase 2
    },
    setRoot: () => {
      // TODO: Phase 2
    },
    getZoom: () => 1,
    getRoot: () => null,
  }));

  // Line styling
  const lineStroke = lineStyle?.stroke ?? (theme === 'dark' ? '#666' : '#333');
  const lineStrokeWidth = lineStyle?.strokeWidth ?? 2;

  return (
    <div
      className={`family-tree family-tree--${theme} ${className ?? ''}`}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style,
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Partnership lines */}
        <g className="ft-partnership-lines">
          {layout.partnershipConnections.map((conn) => {
            if (conn.partner2Id === null) return null;

            const p1 = layout.nodes.find((n) => n.id === conn.partner1Id);
            const p2 = layout.nodes.find((n) => n.id === conn.partner2Id);
            if (!p1 || !p2) return null;

            return (
              <line
                key={`partnership-${conn.partnershipId}`}
                className="ft-partnership-line"
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={lineStroke}
                strokeWidth={lineStrokeWidth}
              />
            );
          })}
        </g>

        {/* Child connection lines */}
        <g className="ft-child-lines">
          {layout.childConnections.map((conn) => {
            // Draw a path from partnership midpoint down to child
            const partnership = layout.partnershipConnections.find(
              (p) => p.partnershipId === conn.partnershipId
            );
            if (!partnership) return null;

            const midX = partnership.midpoint.x;
            const midY = partnership.midpoint.y;
            const childX = conn.childPoint.x;
            const childY = conn.childPoint.y;
            const dropY = conn.dropPoint.y;

            // Path: down from midpoint, horizontal to child x, down to child
            const path = `
              M ${midX} ${midY}
              L ${midX} ${dropY}
              L ${childX} ${dropY}
              L ${childX} ${childY - NODE_HEIGHT / 2}
            `;

            return (
              <path
                key={`child-${conn.partnershipId}-${conn.childId}`}
                className="ft-child-line"
                d={path}
                fill="none"
                stroke={lineStroke}
                strokeWidth={lineStrokeWidth}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g className="ft-nodes">
          {layout.nodes.map((node) => {
            const person = data.people.find((p) => p.id === node.id);
            if (!person) return null;

            const nodeProps: NodeComponentProps<T> = {
              id: node.id,
              data: person.data,
              isSelected: selectedId === node.id,
              isHovered: hoveredId === node.id,
              isExpanded: expandedIds.has(node.id),
              onToggleExpand: () => {
                // TODO: Phase 2
              },
            };

            return (
              <foreignObject
                key={node.id}
                x={node.x - NODE_WIDTH / 2}
                y={node.y - NODE_HEIGHT / 2}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                className="ft-node"
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => handleNodeHover(node.id)}
                onMouseLeave={() => handleNodeHover(null)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <NodeComponent {...nodeProps} />
                </div>
              </foreignObject>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export const FamilyTree = forwardRef(FamilyTreeInner) as <T>(
  props: FamilyTreeProps<T> & { ref?: React.ForwardedRef<FamilyTreeHandle> }
) => React.ReactElement;

export type { FamilyTreeProps, FamilyTreeHandle };
