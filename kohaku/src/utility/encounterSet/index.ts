import { EncounterSet } from '../../type/game/encounter-set.js';
import { Product, productCoreSets, productReturnTo } from '../../type/game/product.js';
import {
  coreScenarioNameEncounterSets,
  scenarioNameEncounterSets,
  scenarioExclusiveEncounterSets,
  productEncounterSetsMap,
} from '../../type/game/encounter-set.js';

/**
 * Get the Product that contains a specific EncounterSet.
 */
export function encounterSetToProduct(encounterSet: EncounterSet): Product {
  for (const [product, encounterSets] of Object.entries(productEncounterSetsMap)) {
    if (encounterSets?.includes(encounterSet)) {
      return product as Product;
    }
  }
  throw new Error(`Unknown encounter set: ${encounterSet}`);
}

/**
 * Check if an encounter set is a core scenario name (from core set campaigns).
 */
export function isCoreScenarioNameEncounterSet(encounterSet: EncounterSet): boolean {
  return coreScenarioNameEncounterSets.includes(encounterSet);
}

/**
 * Check if an encounter set is a scenario name.
 */
export function isScenarioNameEncounterSet(encounterSet: EncounterSet): boolean {
  return scenarioNameEncounterSets.includes(encounterSet);
}

/**
 * Check if an encounter set is exclusive to one scenario.
 * This includes scenario name encounter sets and other scenario-specific sets.
 */
export function isScenarioExclusiveEncounterSet(encounterSet: EncounterSet): boolean {
  return scenarioExclusiveEncounterSets.includes(encounterSet);
}

/**
 * Check if an encounter set is from a Return To expansion product.
 */
export function isReturnToEncounterSet(encounterSet: EncounterSet): boolean {
  const product = encounterSetToProduct(encounterSet);
  return productReturnTo.includes(product);
}

/**
 * Check if an encounter set is from a Return To expansion, not
 * counting scenario-exclusive encounter sets.
 */
export function isReturnToCommonEncounterSet(encounterSet: EncounterSet): boolean {
  const product = encounterSetToProduct(encounterSet);
  return productReturnTo.includes(product) && !scenarioExclusiveEncounterSets.includes(encounterSet);
}

/**
 * Check if an encounter set is from a Core Set product.
 */
export function isCoreEncounterSet(encounterSet: EncounterSet): boolean {
  const product = encounterSetToProduct(encounterSet);
  return productCoreSets.includes(product);
}
