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
    // Forwarding can map distinct codes onto the same Revised Core code (e.g. a
    // deck holding both the Core 01088 and Revised Core 01588 printings). Merge
    // entries that collide after forwarding so a card never appears twice.
    const merged = new Map<string, CardQuantity>();
    for (const cq of cardQuantities) {
      const card = coreCardToRcoreCard(cq.card, cardResolver);
      const existing = merged.get(card.code);
      if (existing) {
        existing.quantity += cq.quantity;
      } else {
        merged.set(card.code, { card, quantity: cq.quantity });
      }
    }
    return [...merged.values()];
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
