import { Deck } from '../../type/index.js';
import { applyTabooToCard } from '../card/taboo.js';

export interface TabooToDeckApplicationResult {
  anyChanges: boolean;
  deck: Deck;
}

/**
 * If deck asked for any taboo, the deck object already has taboo inside it
 * but it is not yet applied to the cards.
 */
export function applyTabooToDeck(deck: Deck): TabooToDeckApplicationResult {
  let anyChanges = false;

  const modifiedMainDeck = deck.mainDeck.map((cardQuantity) => {
    const result = applyTabooToCard(cardQuantity.card, deck.taboo);
    if (result.anyChanges) {
      anyChanges = true;
    }
    return {
      ...cardQuantity,
      card: result.card,
    };
  });

  const modifiedSideDeck = deck.sideDeck.map((cardQuantity) => {
    const result = applyTabooToCard(cardQuantity.card, deck.taboo);
    if (result.anyChanges) {
      anyChanges = true;
    }
    return {
      ...cardQuantity,
      card: result.card,
    };
  });

  const modifiedIgnoreLimitDeck = deck.mainDeckIgnoreLimit.map((cardQuantity) => {
    const result = applyTabooToCard(cardQuantity.card, deck.taboo);
    if (result.anyChanges) {
      anyChanges = true;
    }
    return {
      ...cardQuantity,
      card: result.card,
    };
  });

  return {
    anyChanges: anyChanges,
    deck: {
      ...deck,
      mainDeck: modifiedMainDeck,
      sideDeck: modifiedSideDeck,
      mainDeckIgnoreLimit: modifiedIgnoreLimitDeck,
    },
  };
}
