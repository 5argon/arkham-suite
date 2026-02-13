import type { Card } from '../../type/data/index.js';
import { CardType } from '../../type/game/card-type.js';

/**
 * Filter for player cards that are not from campaign boxes.
 * Excludes cards with encounter sets and hidden cards.
 */
export function playerCardsNonCampaignFilter(card: Card): boolean {
  return card.encounterSet === undefined && card.hidden !== true;
}

/**
 * Filter for cards from campaign boxes.
 * Includes cards with encounter sets (excluding hidden cards).
 */
export function campaignCardsFilter(card: Card): boolean {
  return card.encounterSet !== undefined && card.hidden !== true;
}

/**
 * Filter for potential player cards found in campaign boxes.
 * Includes investigators, assets, and weaknesses from encounter sets.
 */
export function potentialPlayerCardsInCampaignBoxFilter(card: Card): boolean {
  return (
    card.encounterSet !== undefined &&
    card.hidden !== true &&
    (card.cardType === CardType.Investigator ||
      card.cardType === CardType.Asset ||
      card.subtypeCode === 'weakness')
  );
}

/**
 * Filter for basic weakness cards.
 */
export function basicWeaknessesFilter(card: Card): boolean {
  return card.subtypeCode === 'basicweakness';
}

export function weaknessesFilter(card: Card): boolean {
  return card.subtypeCode === 'basicweakness' || card.subtypeCode === 'weakness';
}

/**
 * Filter for investigator-restricted cards.
 * Includes cards that have investigator restrictions.
 */
export function investigatorRestrictedCardsFilter(card: Card): boolean {
  return (
    card.encounterSet === undefined &&
    card.hidden !== true &&
    card.restrictions !== undefined &&
    card.restrictions.investigator.length > 0
  );
}

/**
 * Filter for investigator cards used in deckbuilding.
 * Excludes campaign investigators and hidden cards.
 */
export function deckbuildingInvestigatorCardsFilter(card: Card): boolean {
  return (
    card.cardType === CardType.Investigator &&
    card.encounterSet === undefined &&
    card.hidden !== true
  );
}

/**
 * Filter for player cards used in deckbuilding.
 * Excludes investigators, basic weaknesses, investigator-restricted cards,
 * and cards with no level (which includes all Bonded cards). 
 */
export function deckbuildingPlayerCardsFilter(card: Card): boolean {
  return (
    playerCardsNonCampaignFilter(card) &&
    !deckbuildingInvestigatorCardsFilter(card) &&
    !weaknessesFilter(card) &&
    !investigatorRestrictedCardsFilter(card) &&
    card.xp !== undefined
  );
}
