import type { ClassSlots } from '../../type/game/card-class.js';
import { CardType } from '../../type/game/card-type.js';
import { productOrdering, productRepackaged, type Product } from '../../type/game/product.js';
import type { Card } from '../../type/data/player-card.js';
import * as cardClass from '../cardClass/index.js';

/**
 * Compare function for sorting cards within investigator expansion products.
 * 
 * Sorting logic:
 * 1. Sort by product according to productOrdering
 * 2. Within each product:
 *    - For non-repackaged products: sort by position
 *    - For repackaged products:
 *      - Investigator and their restricted cards grouped together (by position)
 *      - Then remaining cards sorted by: class → level → position
 *      - Weakness cards come last regardless of class/level
 * 
 * @example
 * ```typescript
 * const sortedCards = cards.sort(investigatorExpansionSorter);
 * ```
 */
export function investigatorExpansionSorter(a: Card, b: Card): number {
  // First sort by product
  const productIndexA = productOrdering.indexOf(a.product);
  const productIndexB = productOrdering.indexOf(b.product);
  
  if (productIndexA !== productIndexB) {
    return productIndexA - productIndexB;
  }

  // Same product - check if it's a repackaged product
  const isRepackaged = productRepackaged.includes(a.product);

  if (!isRepackaged) {
    // Not repackaged - just sort by position
    return a.position - b.position;
  }

  // Repackaged product - use special logic
  const aIsInvestigator = a.cardType === CardType.Investigator;
  const bIsInvestigator = b.cardType === CardType.Investigator;
  const aIsRestricted = a.restrictions !== undefined && a.restrictions.investigator.length > 0;
  const bIsRestricted = b.restrictions !== undefined && b.restrictions.investigator.length > 0;

  const aIsInvestigatorOrRestricted = aIsInvestigator || aIsRestricted;
  const bIsInvestigatorOrRestricted = bIsInvestigator || bIsRestricted;

  // Investigators and restricted cards come first
  if (aIsInvestigatorOrRestricted !== bIsInvestigatorOrRestricted) {
    return aIsInvestigatorOrRestricted ? -1 : 1;
  }

  // Both are investigators or restricted
  if (aIsInvestigatorOrRestricted && bIsInvestigatorOrRestricted) {
    // Get the investigator code for grouping
    const aInvestigatorCode = aIsInvestigator ? a.code : a.restrictions!.investigator[0];
    const bInvestigatorCode = bIsInvestigator ? b.code : b.restrictions!.investigator[0];
    
    // If different investigators, sort by position of the investigator card itself
    if (aInvestigatorCode !== bInvestigatorCode) {
      // Compare by investigator position (lower position investigator comes first)
      // For restricted cards, we need to find their investigator's position
      // For now, use the investigator code as a proxy
      return aInvestigatorCode.localeCompare(bInvestigatorCode);
    }
    
    // Same investigator - investigator card comes before its restricted cards
    if (aIsInvestigator !== bIsInvestigator) {
      return aIsInvestigator ? -1 : 1;
    }
    
    // Both are either investigators or restricted cards of the same investigator
    return a.position - b.position;
  }

  // Both are regular cards (not investigators, not restricted)
  // Weakness cards come last
  const aIsWeakness = a.weakness !== undefined;
  const bIsWeakness = b.weakness !== undefined;
  
  if (aIsWeakness !== bIsWeakness) {
    return aIsWeakness ? 1 : -1;
  }

  // First sort by class
  const classComparison = cardClass.classSlotsSorter(a.cardClass, b.cardClass);
  if (classComparison !== 0) {
    return classComparison;
  }

  // Same class - sort by level (low to high)
  const aLevel = a.xp ?? 0;
  const bLevel = b.xp ?? 0;
  if (aLevel !== bLevel) {
    return aLevel - bLevel;
  }

  // Same level - sort by position
  return a.position - b.position;
}
