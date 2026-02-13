import { Deck, CardQuantity } from '../../type/data/deck.js';
import { CardResolver } from '../../type/data/resolver.js';
import { coreCardToRcoreCard } from '../card/util.js';
import { applyTabooToDeck, TabooToDeckApplicationResult } from './taboo.js';

/**
 * Forward all Core Set cards in a deck to their Revised Core Set equivalents.
 * This ensures that overlap detection correctly identifies Core and Revised Core cards as the same.
 *
 * @param deck - The deck to forward
 * @param cardResolver - CardResolver instance to resolve card codes
 * @returns A new deck with all Core Set cards replaced by Revised Core Set cards
 */
export function forwardDeckToRcore(deck: Deck, cardResolver: CardResolver): Deck {
  function forwardCardQuantities(cardQuantities: CardQuantity[]): CardQuantity[] {
    return cardQuantities.map((cq) => ({
      card: coreCardToRcoreCard(cq.card, cardResolver),
      quantity: cq.quantity,
    }));
  }

  return {
    ...deck,
    investigator: coreCardToRcoreCard(deck.investigator, cardResolver),
    mainDeck: forwardCardQuantities(deck.mainDeck),
    sideDeck: forwardCardQuantities(deck.sideDeck),
    mainDeckIgnoreLimit: forwardCardQuantities(deck.mainDeckIgnoreLimit),
  };
}

export function forwardToLatest(deck: Deck): Deck {
  let current = deck;
  while (current.nextDeck !== undefined) {
    current = current.nextDeck;
  }
  return current;
}

/**
 * An opinionated steps to make the deck as 'good' as possible.
 */
export function forwardDefault(
  deck: Deck,
  cardResolver: CardResolver
): TabooToDeckApplicationResult {
  const rcore = forwardDeckToRcore(deck, cardResolver);
  const result = applyTabooToDeck(rcore);
  return result;
}
