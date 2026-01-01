import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
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

// Default zoom settings
const DEFAULT_MIN_ZOOM = 0.1;
const DEFAULT_MAX_ZOOM = 3;
const DEFAULT_ZOOM_STEP = 0.2;

interface Transform {
  x: number;
  y: number;
  scale: number;
}

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
    initialZoom = 1,
    minZoom = DEFAULT_MIN_ZOOM,
    maxZoom = DEFAULT_MAX_ZOOM,
    onPersonClick,
    onPersonHover,
    onPartnershipClick,
    onZoomChange,
    onRootChange,
  } = props;

  // Merge spacing with defaults
  const spacing = useMemo(
    () => ({ ...DEFAULT_SPACING, ...spacingProp }),
    [spacingProp]
  );

  // State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: initialZoom,
  });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lastPinchDistance = useRef<number | null>(null);

  // Validate data on render
  validateFamilyTreeData(data);

  // Calculate layout
  const layout: LayoutResult = useMemo(() => {
    return calculateLayout(data, { spacing });
  }, [data, spacing]);

  // Calculate content bounds
  const bounds = useMemo(() => {
    if (layout.nodes.length === 0) {
      return { minX: 0, minY: 0, width: 400, height: 300, centerX: 200, centerY: 150 };
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
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    };
  }, [layout.nodes]);

  // Clamp zoom level
  const clampZoom = useCallback(
    (zoom: number) => Math.min(maxZoom, Math.max(minZoom, zoom)),
    [minZoom, maxZoom]
  );

  // Zoom to a specific level
  const zoomTo = useCallback(
    (level: number) => {
      const newScale = clampZoom(level);
      setTransform((prev) => ({ ...prev, scale: newScale }));
      onZoomChange?.(newScale);
    },
    [clampZoom, onZoomChange]
  );

  // Zoom in by step
  const zoomIn = useCallback(() => {
    zoomTo(transform.scale + DEFAULT_ZOOM_STEP);
  }, [transform.scale, zoomTo]);

  // Zoom out by step
  const zoomOut = useCallback(() => {
    zoomTo(transform.scale - DEFAULT_ZOOM_STEP);
  }, [transform.scale, zoomTo]);

  // Center on a person
  const centerOnPerson = useCallback(
    (personId: string) => {
      const node = layout.nodes.find((n) => n.id === personId);
      if (!node || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      setTransform((prev) => ({
        ...prev,
        x: centerX - node.x * prev.scale,
        y: centerY - node.y * prev.scale,
      }));
    },
    [layout.nodes]
  );

  // Fit tree to view
  const fitToView = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const scaleX = rect.width / bounds.width;
    const scaleY = rect.height / bounds.height;
    const newScale = clampZoom(Math.min(scaleX, scaleY) * 0.9);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setTransform({
      x: centerX - bounds.centerX * newScale,
      y: centerY - bounds.centerY * newScale,
      scale: newScale,
    });
    onZoomChange?.(newScale);
  }, [bounds, clampZoom, onZoomChange]);

  // Expand all branches
  const expandAll = useCallback(() => {
    const allIds = new Set(data.people.map((p) => p.id));
    setExpandedIds(allIds);
  }, [data.people]);

  // Collapse all branches
  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Toggle a specific branch
  const toggleBranch = useCallback((personId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(personId)) {
        next.delete(personId);
      } else {
        next.add(personId);
      }
      return next;
    });
  }, []);

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    zoomTo,
    zoomIn,
    zoomOut,
    centerOnPerson,
    fitToView,
    expandAll,
    collapseAll,
    toggleBranch,
    setRoot: (personId: string) => {
      onRootChange?.(personId);
    },
    getZoom: () => transform.scale,
    getRoot: () => null,
  }));

  // Initialize view centered on content
  useEffect(() => {
    fitToView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mouse event handlers for pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };

    setTransform((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Wheel event for zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate zoom
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = clampZoom(transform.scale * zoomFactor);

      if (newScale === transform.scale) return;

      // Zoom toward mouse position
      const scaleRatio = newScale / transform.scale;
      const newX = mouseX - (mouseX - transform.x) * scaleRatio;
      const newY = mouseY - (mouseY - transform.y) * scaleRatio;

      setTransform({ x: newX, y: newY, scale: newScale });
      onZoomChange?.(newScale);
    },
    [transform, clampZoom, onZoomChange]
  );

  // Touch event handlers for pan and pinch-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      // Pinch zoom start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && isDragging.current) {
        const dx = e.touches[0].clientX - lastPointer.current.x;
        const dy = e.touches[0].clientY - lastPointer.current.y;
        lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        setTransform((prev) => ({
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      } else if (e.touches.length === 2 && lastPinchDistance.current !== null) {
        // Pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const scale = distance / lastPinchDistance.current;
        const newScale = clampZoom(transform.scale * scale);
        lastPinchDistance.current = distance;

        if (newScale !== transform.scale) {
          // Zoom toward pinch center
          const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

          const container = containerRef.current;
          if (container) {
            const rect = container.getBoundingClientRect();
            const pinchX = centerX - rect.left;
            const pinchY = centerY - rect.top;

            const scaleRatio = newScale / transform.scale;
            const newX = pinchX - (pinchX - transform.x) * scaleRatio;
            const newY = pinchY - (pinchY - transform.y) * scaleRatio;

            setTransform({ x: newX, y: newY, scale: newScale });
            onZoomChange?.(newScale);
          }
        }
      }
    },
    [transform, clampZoom, onZoomChange]
  );

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    lastPinchDistance.current = null;
  }, []);

  // Event handlers for nodes
  const handleNodeClick = useCallback(
    (e: React.MouseEvent, personId: string) => {
      e.stopPropagation();
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

  const handlePartnershipClick = useCallback(
    (e: React.MouseEvent, partnershipId: string) => {
      e.stopPropagation();
      onPartnershipClick?.(partnershipId);
    },
    [onPartnershipClick]
  );

  // Line styling
  const lineStroke = lineStyle?.stroke ?? (theme === 'dark' ? '#666' : '#333');
  const lineStrokeWidth = lineStyle?.strokeWidth ?? 2;

  return (
    <div
      ref={containerRef}
      className={`family-tree family-tree--${theme} ${className ?? ''}`}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: isDragging.current ? 'grabbing' : 'grab',
        touchAction: 'none',
        ...style,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
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
                  onClick={(e) => handlePartnershipClick(e, conn.partnershipId)}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
          </g>

          {/* Child connection lines */}
          <g className="ft-child-lines">
            {layout.childConnections.map((conn) => {
              const partnership = layout.partnershipConnections.find(
                (p) => p.partnershipId === conn.partnershipId
              );
              if (!partnership) return null;

              const midX = partnership.midpoint.x;
              const midY = partnership.midpoint.y;
              const childX = conn.childPoint.x;
              const childY = conn.childPoint.y;
              const dropY = conn.dropPoint.y;

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
                onToggleExpand: () => toggleBranch(node.id),
              };

              return (
                <foreignObject
                  key={node.id}
                  x={node.x - NODE_WIDTH / 2}
                  y={node.y - NODE_HEIGHT / 2}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  className="ft-node"
                  onClick={(e) => handleNodeClick(e, node.id)}
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
        </g>
      </svg>
    </div>
  );
}

export const FamilyTree = forwardRef(FamilyTreeInner) as <T>(
  props: FamilyTreeProps<T> & { ref?: React.ForwardedRef<FamilyTreeHandle> }
) => React.ReactElement;

export type { FamilyTreeProps, FamilyTreeHandle };
