import type { FamilyTreeData, SpacingConfig, Orientation } from '../types';

/**
 * A positioned node in the layout
 */
export interface LayoutNode {
  id: string;
  x: number;
  y: number;
}

/**
 * Connection between two partners
 */
export interface PartnershipConnection {
  partnershipId: string;
  partner1Id: string;
  partner2Id: string | null;
  /** Midpoint of the partnership line (where drop line starts) */
  midpoint: { x: number; y: number };
}

/**
 * Connection from partnership to child
 */
export interface ChildConnection {
  partnershipId: string;
  childId: string;
  /** Where the vertical drop line starts */
  dropPoint: { x: number; y: number };
  /** Where the line connects to the child */
  childPoint: { x: number; y: number };
}

/**
 * Complete layout result
 */
export interface LayoutResult {
  nodes: LayoutNode[];
  partnershipConnections: PartnershipConnection[];
  childConnections: ChildConnection[];
  /** The orientation used for this layout */
  orientation: Orientation;
}

/**
 * Options for layout calculation
 */
export interface LayoutOptions {
  spacing: SpacingConfig;
  orientation?: Orientation;
  rootPersonId?: string;
}

const DEFAULT_SPACING: Required<SpacingConfig> = {
  generation: 100,
  siblings: 50,
  partners: 30,
};

/**
 * Transform a point based on orientation
 * Top-down is the canonical orientation, others are transforms of it
 */
function transformPoint(
  point: { x: number; y: number },
  orientation: Orientation
): { x: number; y: number } {
  switch (orientation) {
    case 'top-down':
      return point;
    case 'bottom-up':
      // Flip y-axis (negate y so root is at bottom)
      return { x: point.x, y: -point.y };
    case 'left-right':
      // Swap x and y (root on left, descendants to right)
      return { x: point.y, y: point.x };
    case 'right-left':
      // Swap x and y, negate x (root on right, descendants to left)
      return { x: -point.y, y: point.x };
    default:
      return point;
  }
}

/**
 * Apply orientation transform to the entire layout result
 */
function transformLayout(
  result: Omit<LayoutResult, 'orientation'>,
  orientation: Orientation
): LayoutResult {
  if (orientation === 'top-down') {
    return { ...result, orientation };
  }

  return {
    nodes: result.nodes.map((node) => ({
      ...node,
      ...transformPoint(node, orientation),
    })),
    partnershipConnections: result.partnershipConnections.map((conn) => ({
      ...conn,
      midpoint: transformPoint(conn.midpoint, orientation),
    })),
    childConnections: result.childConnections.map((conn) => ({
      ...conn,
      dropPoint: transformPoint(conn.dropPoint, orientation),
      childPoint: transformPoint(conn.childPoint, orientation),
    })),
    orientation,
  };
}

/**
 * Calculate the layout for a family tree
 */
export function calculateLayout<T>(
  data: FamilyTreeData<T>,
  options: LayoutOptions
): LayoutResult {
  const spacing = { ...DEFAULT_SPACING, ...options.spacing };
  const orientation = options.orientation || 'top-down';

  // Build helper maps
  const childToPartnershipMap = buildChildToPartnershipMap(data);

  // Find root people (those who have no parents in the data)
  // When a partnership has both partners as roots, only count one
  const rootPeople = findRootPeople(data, childToPartnershipMap);

  // Position nodes
  const nodePositions = new Map<string, { x: number; y: number }>();
  const partnershipConnections: PartnershipConnection[] = [];
  const childConnections: ChildConnection[] = [];
  const processedPartnerships = new Set<string>();
  const processedPeople = new Set<string>();

  // Process each root family unit
  let currentX = 0;

  for (const rootId of rootPeople) {
    if (processedPeople.has(rootId)) continue;

    const width = layoutFamilyUnit(
      rootId,
      currentX,
      0,
      data,
      spacing,
      nodePositions,
      partnershipConnections,
      childConnections,
      processedPartnerships,
      processedPeople,
      childToPartnershipMap
    );
    currentX += width + spacing.siblings;
  }

  // Convert to result format
  const nodes: LayoutNode[] = data.people.map((person) => {
    const pos = nodePositions.get(person.id) || { x: 0, y: 0 };
    return { id: person.id, x: pos.x, y: pos.y };
  });

  // Apply orientation transform
  return transformLayout({ nodes, partnershipConnections, childConnections }, orientation);
}

/**
 * Build map of child ID -> partnership they come from
 */
function buildChildToPartnershipMap<T>(
  data: FamilyTreeData<T>
): Map<string, (typeof data.partnerships)[0]> {
  const map = new Map<string, (typeof data.partnerships)[0]>();

  for (const partnership of data.partnerships) {
    for (const childId of partnership.childIds) {
      map.set(childId, partnership);
    }
  }

  return map;
}

/**
 * Find root people (those who have no parents in the tree)
 * Only returns one partner per partnership to avoid duplicates
 */
function findRootPeople<T>(
  data: FamilyTreeData<T>,
  childToPartnershipMap: Map<string, (typeof data.partnerships)[0]>
): string[] {
  const roots: string[] = [];
  const partnersOfRoots = new Set<string>();

  for (const person of data.people) {
    if (!childToPartnershipMap.has(person.id) && !partnersOfRoots.has(person.id)) {
      roots.push(person.id);
      // Mark this person's partners so they don't get added as separate roots
      for (const partnership of data.partnerships) {
        const [p1, p2] = partnership.partnerIds;
        if (p1 === person.id && p2) {
          partnersOfRoots.add(p2);
        } else if (p2 === person.id && p1) {
          partnersOfRoots.add(p1);
        }
      }
    }
  }

  // If no roots found (shouldn't happen with valid data), use first person
  if (roots.length === 0 && data.people.length > 0) {
    roots.push(data.people[0].id);
  }

  return roots;
}

/**
 * Get partnerships for a person
 */
function getPartnershipsForPerson<T>(
  personId: string,
  data: FamilyTreeData<T>
): (typeof data.partnerships)[0][] {
  return data.partnerships.filter((p) => p.partnerIds[0] === personId || p.partnerIds[1] === personId);
}

/**
 * Layout a person and their family units (partnerships + children)
 * Returns the width used
 */
function layoutFamilyUnit<T>(
  personId: string,
  startX: number,
  y: number,
  data: FamilyTreeData<T>,
  spacing: Required<SpacingConfig>,
  nodePositions: Map<string, { x: number; y: number }>,
  partnershipConnections: PartnershipConnection[],
  childConnections: ChildConnection[],
  processedPartnerships: Set<string>,
  processedPeople: Set<string>,
  childToPartnershipMap: Map<string, (typeof data.partnerships)[0]>
): number {
  if (processedPeople.has(personId)) {
    const existingPos = nodePositions.get(personId);
    return existingPos ? 0 : 0;
  }

  const partnerships = getPartnershipsForPerson(personId, data);

  // If no partnerships, just position this person
  if (partnerships.length === 0) {
    nodePositions.set(personId, { x: startX, y });
    processedPeople.add(personId);
    return 0;
  }

  let totalWidth = 0;
  let currentX = startX;

  for (const partnership of partnerships) {
    // Skip already processed partnerships
    if (processedPartnerships.has(partnership.id)) {
      continue;
    }
    processedPartnerships.add(partnership.id);

    const [p1Id, p2Id] = partnership.partnerIds;
    const children = partnership.childIds;

    // Calculate width needed for children
    let childrenTotalWidth = 0;
    const childWidths: number[] = [];

    // First pass: calculate width of each child's subtree
    for (const childId of children) {
      const childSubtreeWidth = calculateSubtreeWidth(
        childId,
        data,
        spacing,
        processedPartnerships,
        new Set(processedPeople)
      );
      childWidths.push(childSubtreeWidth);
      childrenTotalWidth += childSubtreeWidth;
    }

    // Add spacing between children
    if (children.length > 1) {
      childrenTotalWidth += (children.length - 1) * spacing.siblings;
    }

    // Calculate partner width
    const partnerWidth = p2Id !== null ? spacing.partners : 0;

    // Unit width is max of partner width and children width
    const unitWidth = Math.max(partnerWidth, childrenTotalWidth);

    // Position partners centered above children
    const unitCenter = currentX + unitWidth / 2;
    const p1X = unitCenter - partnerWidth / 2;
    const p2X = unitCenter + partnerWidth / 2;

    // Set partner positions
    if (!nodePositions.has(p1Id!)) {
      nodePositions.set(p1Id!, { x: p1X, y });
      processedPeople.add(p1Id!);
    }
    if (p2Id !== null && !nodePositions.has(p2Id)) {
      nodePositions.set(p2Id, { x: p2X, y });
      processedPeople.add(p2Id);
    }

    // Add partnership connection
    const midpointX = p2Id !== null ? (p1X + p2X) / 2 : p1X;
    partnershipConnections.push({
      partnershipId: partnership.id,
      partner1Id: p1Id!,
      partner2Id: p2Id,
      midpoint: { x: midpointX, y },
    });

    // Position children
    if (children.length > 0) {
      const childY = y + spacing.generation;
      let childX = currentX + (unitWidth - childrenTotalWidth) / 2;

      for (let i = 0; i < children.length; i++) {
        const childId = children[i];
        const childWidth = childWidths[i];

        // Center child within its subtree width
        const childCenterX = childX + childWidth / 2;

        // Add child connection
        childConnections.push({
          partnershipId: partnership.id,
          childId,
          dropPoint: { x: midpointX, y: y + spacing.generation / 2 },
          childPoint: { x: childCenterX, y: childY },
        });

        // Recursively layout child's family
        layoutFamilyUnit(
          childId,
          childX,
          childY,
          data,
          spacing,
          nodePositions,
          partnershipConnections,
          childConnections,
          processedPartnerships,
          processedPeople,
          childToPartnershipMap
        );

        childX += childWidth + spacing.siblings;
      }
    }

    currentX += unitWidth + spacing.siblings;
    totalWidth = currentX - startX - spacing.siblings;
  }

  return Math.max(0, totalWidth);
}

/**
 * Calculate the width a subtree will need
 */
function calculateSubtreeWidth<T>(
  personId: string,
  data: FamilyTreeData<T>,
  spacing: Required<SpacingConfig>,
  processedPartnerships: Set<string>,
  visited: Set<string>
): number {
  if (visited.has(personId)) {
    return 0;
  }
  visited.add(personId);

  const partnerships = getPartnershipsForPerson(personId, data).filter(
    (p) => !processedPartnerships.has(p.id)
  );

  if (partnerships.length === 0) {
    return 0; // Single person with no partnerships takes no extra width
  }

  let totalWidth = 0;

  for (const partnership of partnerships) {
    const [, p2Id] = partnership.partnerIds;
    const children = partnership.childIds;

    // Calculate children width
    let childrenWidth = 0;
    for (const childId of children) {
      const childWidth = calculateSubtreeWidth(
        childId,
        data,
        spacing,
        processedPartnerships,
        visited
      );
      childrenWidth += childWidth;
    }
    if (children.length > 1) {
      childrenWidth += (children.length - 1) * spacing.siblings;
    }

    // Partner width
    const partnerWidth = p2Id !== null ? spacing.partners : 0;

    totalWidth += Math.max(partnerWidth, childrenWidth);
  }

  if (partnerships.length > 1) {
    totalWidth += (partnerships.length - 1) * spacing.siblings;
  }

  return totalWidth;
}
