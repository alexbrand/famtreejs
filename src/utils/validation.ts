import type { FamilyTreeData } from '../types';

/**
 * Validation error thrown when family tree data is invalid
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates family tree data and throws on any issues
 * @throws ValidationError if data is invalid
 */
export function validateFamilyTreeData<T>(data: FamilyTreeData<T>): void {
  const personIds = new Set<string>();
  const partnershipIds = new Set<string>();

  // Validate people and collect IDs
  for (const person of data.people) {
    if (!person.id || person.id.trim() === '') {
      throw new ValidationError('Person has empty ID');
    }
    if (personIds.has(person.id)) {
      throw new ValidationError(`Duplicate person ID: ${person.id}`);
    }
    personIds.add(person.id);
  }

  // Validate partnerships
  for (const partnership of data.partnerships) {
    if (!partnership.id || partnership.id.trim() === '') {
      throw new ValidationError('Partnership has empty ID');
    }
    if (partnershipIds.has(partnership.id)) {
      throw new ValidationError(`Duplicate partnership ID: ${partnership.id}`);
    }
    partnershipIds.add(partnership.id);

    // Check that at least one partner exists
    const [partner1, partner2] = partnership.partnerIds;
    if (partner1 === null && partner2 === null) {
      throw new ValidationError(`Partnership ${partnership.id} must have at least one partner`);
    }

    // Validate partner references
    if (partner1 !== null && !personIds.has(partner1)) {
      throw new ValidationError(
        `Partnership ${partnership.id} references non-existent person: ${partner1}`
      );
    }
    if (partner2 !== null && !personIds.has(partner2)) {
      throw new ValidationError(
        `Partnership ${partnership.id} references non-existent person: ${partner2}`
      );
    }

    // Validate child references
    for (const childId of partnership.childIds) {
      if (!personIds.has(childId)) {
        throw new ValidationError(
          `Partnership ${partnership.id} references non-existent child: ${childId}`
        );
      }
    }
  }

  // Validate rootPersonId if provided
  if (data.rootPersonId !== undefined && !personIds.has(data.rootPersonId)) {
    throw new ValidationError(
      `rootPersonId references non-existent person: ${data.rootPersonId}`
    );
  }

  // Check for circular references
  detectCircularReferences(data);
}

/**
 * Build a map of person ID -> parent person IDs
 */
function buildParentMap<T>(data: FamilyTreeData<T>): Map<string, Set<string>> {
  const parentMap = new Map<string, Set<string>>();

  // Initialize all people with empty parent sets
  for (const person of data.people) {
    parentMap.set(person.id, new Set());
  }

  // Populate parent relationships from partnerships
  for (const partnership of data.partnerships) {
    const [partner1, partner2] = partnership.partnerIds;
    const parents: string[] = [];
    if (partner1 !== null) parents.push(partner1);
    if (partner2 !== null) parents.push(partner2);

    for (const childId of partnership.childIds) {
      const childParents = parentMap.get(childId);
      if (childParents) {
        for (const parent of parents) {
          childParents.add(parent);
        }
      }
    }
  }

  return parentMap;
}

/**
 * Detect circular references in the family tree
 * @throws ValidationError if a circular reference is detected
 */
function detectCircularReferences<T>(data: FamilyTreeData<T>): void {
  const parentMap = buildParentMap(data);

  // For each person, check if they appear in their own ancestry
  for (const person of data.people) {
    const visited = new Set<string>();
    const queue = [...parentMap.get(person.id)!];

    while (queue.length > 0) {
      const ancestorId = queue.shift()!;

      if (ancestorId === person.id) {
        throw new ValidationError(
          `Circular reference detected: ${person.id} is their own ancestor`
        );
      }

      if (!visited.has(ancestorId)) {
        visited.add(ancestorId);
        const ancestorParents = parentMap.get(ancestorId);
        if (ancestorParents) {
          queue.push(...ancestorParents);
        }
      }
    }
  }
}
