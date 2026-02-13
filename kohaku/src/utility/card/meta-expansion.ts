import { Card, DecodedMeta } from '../../type/index.js';
import { canUse } from './who.js';

export interface ExpandedInvestigator {
  investigator: Card;
  meta: DecodedMeta;
}

/**
 * Expands an investigator into all possible meta configurations based on their deck options.
 * This handles faction_select and option_select deck options.
 * 
 * @param investigator - The investigator card to expand
 * @returns Array of ExpandedInvestigator objects, each with a different meta configuration
 */
export function expandInvestigatorMetas(investigator: Card): ExpandedInvestigator[] {
  const result: ExpandedInvestigator[] = [];

  if (!investigator.deckOptions) {
    result.push({ investigator, meta: {} });
    return result;
  }

  const factionSelects = investigator.deckOptions.filter((opt) => opt.factionSelect !== undefined);
  const optionSelects = investigator.deckOptions.filter((opt) => opt.optionSelect !== undefined);

  // No selectable options - return single entry with empty meta
  if (factionSelects.length === 0 && optionSelects.length === 0) {
    result.push({ investigator, meta: {} });
    return result;
  }

  // Handle option_select (takes priority over faction_select)
  if (optionSelects.length > 0) {
    for (const optSelect of optionSelects) {
      for (const option of optSelect.optionSelect ?? []) {
        result.push({
          investigator,
          meta: { optionSelected: option.id },
        });
      }
    }
    return result;
  }

  // Handle single faction_select
  if (factionSelects.length === 1) {
    const fs = factionSelects[0];
    for (const faction of fs.factionSelect ?? []) {
      result.push({
        investigator,
        meta:
          fs.id === 'faction_1'
            ? { faction1: faction }
            : fs.id === 'faction_2'
              ? { faction2: faction }
              : { factionSelected: faction },
      });
    }
    return result;
  }

  // Handle two faction_selects (e.g., Lily Chen)
  if (factionSelects.length === 2) {
    const fs1 = factionSelects[0].factionSelect ?? [];
    const fs2 = factionSelects[1].factionSelect ?? [];
    for (let i = 0; i < fs1.length; i++) {
      for (let j = i + 1; j < fs2.length; j++) {
        result.push({
          investigator,
          meta: { faction1: fs1[i], faction2: fs2[j] },
        });
      }
    }
    return result;
  }

  // Fallback: return with empty meta
  result.push({ investigator, meta: {} });
  return result;
}

/**
 * Cycles to the next meta configuration for an investigator.
 * Returns null when cycling past the last configuration (to represent "no meta").
 * 
 * @param investigator - The investigator card
 * @param currentMeta - The current meta configuration (or null/undefined for no meta)
 * @returns The next meta configuration, or null to cycle back to no meta
 */
export function cycleInvestigatorMeta(
  investigator: Card,
  currentMeta: DecodedMeta | null | undefined
): DecodedMeta | null {
  const allMetas = expandInvestigatorMetas(investigator);
  
  // If only one meta option (empty meta), return null to cycle back
  if (allMetas.length === 1 && Object.keys(allMetas[0].meta).length === 0) {
    return null;
  }

  // If current meta is null/undefined, return the first meta
  if (!currentMeta || Object.keys(currentMeta).length === 0) {
    return allMetas[0].meta;
  }

  // Find current meta in the list
  const currentIndex = allMetas.findIndex((expanded) => 
    metaEquals(expanded.meta, currentMeta)
  );

  // If at the end or not found, cycle back to null (no meta)
  if (currentIndex === -1 || currentIndex === allMetas.length - 1) {
    return null;
  }

  // Return the next meta
  return allMetas[currentIndex + 1].meta;
}

/**
 * Checks if two DecodedMeta objects are equal.
 */
function metaEquals(meta1: DecodedMeta, meta2: DecodedMeta): boolean {
  return (
    meta1.factionSelected === meta2.factionSelected &&
    meta1.optionSelected === meta2.optionSelected &&
    meta1.faction1 === meta2.faction1 &&
    meta1.faction2 === meta2.faction2
  );
}

/**
 * Checks if a card can be used by an investigator with the given meta.
 * If meta is empty (no meta selected) and the investigator has meta options,
 * this will check if the card is usable with ANY of the possible meta configurations.
 * 
 * @param investigator - The investigator card
 * @param meta - The meta configuration (or empty object for "no meta selected")
 * @param card - The card to check usability for
 * @returns true if the card can be used
 */
export function canUseWithMetaExpansion(
  investigator: Card,
  meta: DecodedMeta,
  card: Card
): boolean {
  // Check if meta is empty (no specific meta selected)
  const isEmptyMeta = Object.keys(meta).length === 0;
  
  if (isEmptyMeta) {
    // Expand to all possible metas and check if ANY allows the card
    const allMetas = expandInvestigatorMetas(investigator);
    
    // If there's only one meta option and it's empty, just use the regular canUse
    if (allMetas.length === 1 && Object.keys(allMetas[0].meta).length === 0) {
      return canUse(investigator, meta, card);
    }
    
    // Check if card is usable with any of the possible meta configurations
    return allMetas.some((expanded) => canUse(investigator, expanded.meta, card));
  }
  
  // If a specific meta is selected, use it directly
  return canUse(investigator, meta, card);
}
