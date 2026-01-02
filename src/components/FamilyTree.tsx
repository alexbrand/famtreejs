import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { FamilyTreeProps, FamilyTreeHandle, NodeComponentProps } from '../types';
import { validateFamilyTreeData } from '../utils/validation';
import { calculateLayout } from '../layout/engine';
import type { LayoutResult } from '../layout/engine';
import '../styles/theme.css';

// Colors for distinguishing multiple marriages (colorblind-friendly palette)
const MULTI_MARRIAGE_COLORS = [
  '#2563eb', // blue
  '#dc2626', // red
  '#16a34a', // green
  '#9333ea', // purple
  '#ea580c', // orange
];

// Dash patterns for additional distinction
const MULTI_MARRIAGE_DASHES = [
  '',        // solid
  '8,4',     // dashed
  '4,4',     // short dash
  '12,4,4,4', // dash-dot
  '2,2',     // dotted
];

// Default spacing values (must be >= NODE_WIDTH to prevent overlap)
const DEFAULT_SPACING = {
  generation: 150,
  siblings: 140,   // NODE_WIDTH + 20px gap
  partners: 130,   // NODE_WIDTH + 10px gap (partners closer together)
};

// Default node size
const NODE_WIDTH = 120;
const NODE_HEIGHT = 120; // Increased to accommodate DetailedPersonCard with photo+name+dates

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
 * Uses HTML divs for nodes (cross-browser compatible) and SVG for connection lines
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
    disableAnimations = false,
    animationDuration = 300,
    onPersonClick,
    onPersonHover,
    onPartnershipClick,
    onZoomChange,
    onRootChange,
  } = props;

  // Respect prefers-reduced-motion
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !disableAnimations && !prefersReducedMotion;
  const duration = shouldAnimate ? animationDuration / 1000 : 0;

  // Merge spacing with defaults
  const spacing = useMemo(
    () => ({ ...DEFAULT_SPACING, ...spacingProp }),
    [spacingProp]
  );

  // State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: initialZoom,
  });
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lastPinchDistance = useRef<number | null>(null);
  const hasInitializedView = useRef(false);
  const lastOrientation = useRef(orientation);

  // Validate data on render
  validateFamilyTreeData(data);

  // Calculate layout
  const layout: LayoutResult = useMemo(() => {
    return calculateLayout(data, { spacing, orientation });
  }, [data, spacing, orientation]);

  // Compute multi-marriage styling: detect people with multiple partnerships
  // and assign distinct colors/styles to each partnership
  const multiMarriageStyles = useMemo(() => {
    // Build map: person ID -> list of partnership IDs they're in
    const personToPartnerships = new Map<string, string[]>();
    for (const partnership of data.partnerships) {
      for (const partnerId of partnership.partnerIds) {
        if (partnerId) {
          const existing = personToPartnerships.get(partnerId) || [];
          existing.push(partnership.id);
          personToPartnerships.set(partnerId, existing);
        }
      }
    }

    // Find partnerships that need styling (where at least one partner has multiple marriages)
    const partnershipStyles = new Map<string, { color: string; dash: string; index: number }>();

    for (const [, partnershipIds] of personToPartnerships) {
      if (partnershipIds.length > 1) {
        // This person has multiple marriages - style each one
        partnershipIds.forEach((partnershipId, index) => {
          // Only set style if not already set (first person with multiple marriages wins)
          if (!partnershipStyles.has(partnershipId)) {
            partnershipStyles.set(partnershipId, {
              color: MULTI_MARRIAGE_COLORS[index % MULTI_MARRIAGE_COLORS.length],
              dash: MULTI_MARRIAGE_DASHES[index % MULTI_MARRIAGE_DASHES.length],
              index: index + 1, // 1-based for display
            });
          }
        });
      }
    }

    return {
      partnershipStyles,
      hasMultipleMarriages: partnershipStyles.size > 0,
    };
  }, [data.partnerships]);

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
    getRoot: () => data.rootPersonId ?? null,
  }));

  // Initialize view centered on content, and re-fit when orientation changes
  useEffect(() => {
    // Only run fitToView on initial mount or when orientation actually changes
    const orientationChanged = lastOrientation.current !== orientation;

    if (!hasInitializedView.current || orientationChanged) {
      // Use requestAnimationFrame to ensure DOM is ready
      const rafId = requestAnimationFrame(() => {
        if (containerRef.current) {
          // Inline the fitToView logic to avoid dependency on the callback
          const container = containerRef.current;
          const rect = container.getBoundingClientRect();

          if (rect.width > 0 && rect.height > 0) {
            const scaleX = rect.width / bounds.width;
            const scaleY = rect.height / bounds.height;
            const newScale = Math.min(maxZoom, Math.max(minZoom, Math.min(scaleX, scaleY) * 0.9));

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            setTransform({
              x: centerX - bounds.centerX * newScale,
              y: centerY - bounds.centerY * newScale,
              scale: newScale,
            });
            onZoomChange?.(newScale);

            hasInitializedView.current = true;
            lastOrientation.current = orientation;
          }
        }
      });

      return () => cancelAnimationFrame(rafId);
    }
  }, [orientation, bounds, minZoom, maxZoom, onZoomChange]);

  // Mouse event handlers for pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    lastPointer.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };

    setTransform((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
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
      setIsDragging(true);
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
      if (e.touches.length === 1 && isDragging) {
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
    [isDragging, transform, clampZoom, onZoomChange]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
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

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const nodeIds = layout.nodes.map((n) => n.id);
      const currentIndex = focusedId ? nodeIds.indexOf(focusedId) : -1;

      switch (e.key) {
        case 'Tab':
          // Let default tab behavior work, but track focus
          break;

        case 'ArrowDown':
        case 'ArrowRight': {
          e.preventDefault();
          const nextIndex = currentIndex < nodeIds.length - 1 ? currentIndex + 1 : 0;
          setFocusedId(nodeIds[nextIndex]);
          break;
        }

        case 'ArrowUp':
        case 'ArrowLeft': {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : nodeIds.length - 1;
          setFocusedId(nodeIds[prevIndex]);
          break;
        }

        case 'Enter':
        case ' ': {
          e.preventDefault();
          if (focusedId) {
            setSelectedId(focusedId);
            const person = data.people.find((p) => p.id === focusedId);
            if (person && onPersonClick) {
              onPersonClick(focusedId, person.data);
            }
          }
          break;
        }

        case 'e':
        case 'E': {
          // Toggle expand on focused node
          if (focusedId) {
            toggleBranch(focusedId);
          }
          break;
        }

        case '+':
        case '=': {
          e.preventDefault();
          zoomIn();
          break;
        }

        case '-':
        case '_': {
          e.preventDefault();
          zoomOut();
          break;
        }

        case '0': {
          e.preventDefault();
          fitToView();
          break;
        }

        case 'Home': {
          e.preventDefault();
          if (nodeIds.length > 0) {
            setFocusedId(nodeIds[0]);
          }
          break;
        }

        case 'End': {
          e.preventDefault();
          if (nodeIds.length > 0) {
            setFocusedId(nodeIds[nodeIds.length - 1]);
          }
          break;
        }
      }
    },
    [layout.nodes, focusedId, data.people, onPersonClick, toggleBranch, zoomIn, zoomOut, fitToView]
  );

  // Handle focus on node
  const handleNodeFocus = useCallback((personId: string) => {
    setFocusedId(personId);
  }, []);

  // Line styling - use CSS variables, with props as override
  const lineStroke = lineStyle?.stroke ?? 'var(--ft-line-color)';
  const lineStrokeWidth = lineStyle?.strokeWidth ?? 2;

  // Transform string for both SVG and HTML layers
  const transformStyle = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;

  // Estimated card offset for line connections
  const estimatedCardOffset = 25;

  return (
    <div
      ref={containerRef}
      className={`family-tree family-tree--${theme} ${className ?? ''}`}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        outline: 'none',
        ...style,
      }}
      tabIndex={0}
      role="application"
      aria-label="Family tree diagram. Use arrow keys to navigate, Enter to select, +/- to zoom."
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      {/* SVG layer for connection lines only */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <g style={{ transform: transformStyle, transformOrigin: '0 0' }}>
          {/* Partnership lines */}
          <g className="ft-partnership-lines">
            {layout.partnershipConnections.map((conn) => {
              if (conn.partner2Id === null) return null;

              const p1 = layout.nodes.find((n) => n.id === conn.partner1Id);
              const p2 = layout.nodes.find((n) => n.id === conn.partner2Id);
              if (!p1 || !p2) return null;

              // Check if this partnership needs multi-marriage styling
              const multiStyle = multiMarriageStyles.partnershipStyles.get(conn.partnershipId);
              const stroke = multiStyle ? multiStyle.color : lineStroke;
              const strokeDash = multiStyle ? multiStyle.dash : undefined;

              return (
                <motion.line
                  key={`partnership-${conn.partnershipId}`}
                  className="ft-partnership-line"
                  initial={false}
                  animate={{ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }}
                  transition={{ duration, ease: 'easeInOut' }}
                  stroke={stroke}
                  strokeWidth={multiStyle ? 3 : lineStrokeWidth}
                  strokeDasharray={strokeDash}
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  onClick={(e) => handlePartnershipClick(e, conn.partnershipId)}
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
              const dropX = conn.dropPoint.x;
              const dropY = conn.dropPoint.y;

              // Check if this partnership needs multi-marriage styling
              const multiStyle = multiMarriageStyles.partnershipStyles.get(conn.partnershipId);
              const stroke = multiStyle ? multiStyle.color : lineStroke;
              const strokeDash = multiStyle ? multiStyle.dash : undefined;

              let path: string;
              const isHorizontal = orientation === 'left-right' || orientation === 'right-left';

              if (isHorizontal) {
                const nodeOffset = orientation === 'left-right'
                  ? -estimatedCardOffset
                  : estimatedCardOffset;
                path = `
                  M ${midX} ${midY}
                  L ${dropX} ${midY}
                  L ${dropX} ${childY}
                  L ${childX + nodeOffset} ${childY}
                `;
              } else {
                const nodeOffset = orientation === 'top-down'
                  ? -estimatedCardOffset
                  : estimatedCardOffset;
                path = `
                  M ${midX} ${midY}
                  L ${midX} ${dropY}
                  L ${childX} ${dropY}
                  L ${childX} ${childY + nodeOffset}
                `;
              }

              return (
                <motion.path
                  key={`child-${conn.partnershipId}-${conn.childId}`}
                  className="ft-child-line"
                  initial={false}
                  animate={{ d: path }}
                  transition={{ duration, ease: 'easeInOut' }}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={multiStyle ? 3 : lineStrokeWidth}
                  strokeDasharray={strokeDash}
                />
              );
            })}
          </g>
        </g>
      </svg>

      {/* HTML layer for nodes - renders on top of SVG lines */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            transform: transformStyle,
            transformOrigin: '0 0',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          role="tree"
          aria-label="Family members"
        >
          {layout.nodes.map((node, index) => {
            const person = data.people.find((p) => p.id === node.id);
            if (!person) return null;

            const isFocused = focusedId === node.id;
            const isSelected = selectedId === node.id;
            const isExpanded = expandedIds.has(node.id);

            const nodeProps: NodeComponentProps<T> = {
              id: node.id,
              data: person.data,
              isSelected,
              isHovered: hoveredId === node.id,
              isExpanded,
              onToggleExpand: () => toggleBranch(node.id),
            };

            const personData = person.data as { name?: string };
            const ariaLabel = personData?.name || `Person ${node.id}`;

            // Calculate node position (center the node on the coordinates)
            const nodeX = node.x - NODE_WIDTH / 2;
            const nodeY = node.y - NODE_HEIGHT / 2;

            return (
              <motion.div
                key={node.id}
                initial={false}
                animate={{ x: nodeX, y: nodeY }}
                transition={{ duration, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  width: NODE_WIDTH,
                  height: NODE_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                }}
                role="treeitem"
                aria-label={ariaLabel}
                aria-selected={isSelected}
                aria-expanded={isExpanded}
                aria-setsize={layout.nodes.length}
                aria-posinset={index + 1}
                tabIndex={isFocused ? 0 : -1}
                onClick={(e) => handleNodeClick(e, node.id)}
                onMouseEnter={() => handleNodeHover(node.id)}
                onMouseLeave={() => handleNodeHover(null)}
                onFocus={() => handleNodeFocus(node.id)}
              >
                {/* Focus ring */}
                {isFocused && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -4,
                      left: -4,
                      right: -4,
                      bottom: -4,
                      border: '3px solid var(--ft-node-selected-border)',
                      borderRadius: 12,
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <NodeComponent {...nodeProps} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const FamilyTree = forwardRef(FamilyTreeInner) as <T>(
  props: FamilyTreeProps<T> & { ref?: React.ForwardedRef<FamilyTreeHandle> }
) => React.ReactElement;

export type { FamilyTreeProps, FamilyTreeHandle };
