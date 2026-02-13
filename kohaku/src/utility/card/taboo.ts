import { Card, Taboo } from '../../type/index.js';

export interface TabooApplicationResult {
  anyChanges: boolean;
  card: Card;
}

/**
 * Apply taboo modifications to a card.
 * Returns a new card object with taboo modifications applied.
 */
export function applyTabooToCard(card: Card, taboo: Taboo | null): TabooApplicationResult {
  if (!taboo) return { anyChanges: false, card };

  const tabooCard = taboo.cards.find((tc) => tc.code === card.code);
  if (!tabooCard) return { anyChanges: false, card };

  // Create a modified copy of the card
  const modifiedCard: Card = { ...card };

  let anyChanges = false;
  if (tabooCard.xp !== undefined) {
    modifiedCard.chained = tabooCard.xp;
    anyChanges = true;
  }

  if (tabooCard.exceptional !== undefined) {
    modifiedCard.exceptional = !!tabooCard.exceptional;
    anyChanges = true;
  }

  if (tabooCard.deck_limit !== undefined) {
    modifiedCard.deckLimit = tabooCard.deck_limit;
    anyChanges = true;
  }

  // TODO: There are other kind of taboos.

  return { anyChanges, card: modifiedCard };
}
