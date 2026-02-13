import { Deck } from '../../type/index.js';

/**
 * If you need chained taboo cards applied, it should already be applied to the deck's cards.
 */
export function calculateDeckXp(deck: Deck): number {
  const xp = deck.mainDeck.reduce((a, b) => {
    const card = b.card;
    if (card === null) {
      return a;
    }
    const baseXp = (card.xp ?? 0) + (card.chained ?? 0);
    const realXp = card.exceptional ? baseXp * 2 : baseXp;
    return a + realXp * b.quantity;
  }, 0);
  const customizableXp =
    deck.meta.customizableMetas?.reduce((a, b) => {
      return a + b.checked;
    }, 0) ?? 0;
  return xp + customizableXp;
}
