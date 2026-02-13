import {
  linearizeLinkedAhdbDeck,
  LinkedAhdbDeck,
  predictDeckInput,
} from '../../utility/service/deck-input.js';
import { DeckSource } from './deck-source.js';
import { DecodedMeta, decodeMeta } from './meta.js';
import { Card } from './player-card.js';
import { CardResolver } from './resolver.js';
import { AhdbTaboo, ahdbTabooToTaboo, Taboo } from './taboo.js';

export interface AhdbDeck {
  /**
   * arkham.build uses string ID.
   */
  id: number | string;
  name: string;
  date_creation: string;
  date_update: string;
  description_md: string;
  user_id: number | null;
  investigator_code: string;
  investigator_name: string;
  slots: CardQuantityKvp;
  sideSlots: CardQuantityKvp;
  ignoreDeckLimitSlots: CardQuantityKvp;
  version: string;
  xp: number | null;
  xp_spent: number | null;
  xp_adjustment: number | null;
  exile_string: string | null;
  taboo_id: number;
  meta: string;
  tags: string;
  previous_deck: number | string | null;
  next_deck: number | string | null;
  problem?: string | null;
}

export interface Deck {
  id: number | string;
  source: DeckSource;
  name: string;
  dateCreate: Date;
  dateUpdate: Date;
  descriptionMd: string;
  userId?: number;

  /**
   * Always the base version. Check parallel front / back status in the decoded meta.
   */
  investigator: Card;

  mainDeck: CardQuantity[];
  sideDeck: CardQuantity[];
  mainDeckIgnoreLimit: CardQuantity[];
  version: string;
  xp?: number;
  xpSpent?: number;
  xpAdjustment?: number;
  exileString?: string;
  taboo: Taboo;
  meta: DecodedMeta;
  tags: string[];
  previousDeck?: Deck;
  nextDeck?: Deck;
  problems: DeckProblem[];
}

export function linearizeDeck(deck: Deck): Deck[] {
  const result: Deck[] = [];
  let current: Deck = deck;
  while (current.previousDeck) {
    current = current.previousDeck;
  }
  while (current) {
    result.push(current);
    if (!current.nextDeck) {
      break;
    }
    current = current.nextDeck;
  }
  return result;
}

export interface DeckProblem {
  type: DeckProblemType;
}

export type DeckProblemType = '';

export type CardQuantityKvp = { [k: string]: number } | null;

export interface CardQuantity {
  card: Card;
  quantity: number;
}

export function resolveCardQuantityKvp(
  kvp: CardQuantityKvp,
  cardResolver: CardResolver
): CardQuantity[] {
  if (!kvp) {
    return [];
  }
  return Object.entries(kvp).map(([cardCode, quantity]) => {
    return {
      card: cardResolver.resolve(cardCode),
      quantity: quantity,
    };
  });
}

/**
 * This function resolves all decks in the series, as well as replacing most card codes with
 * real card objects.
 */
export function ahdbDeckToDeck(
  ahdbDeck: AhdbDeck,
  resolveAhdbDeck: (deckId: number | string) => AhdbDeck,
  cardResolver: CardResolver,
  taboos: Taboo[],
  processedDecks: Map<number | string, Deck> = new Map()
): Deck {
  if (processedDecks.has(ahdbDeck.id)) {
    return processedDecks.get(ahdbDeck.id)!;
  }

  const deck: Deck = {
    id: ahdbDeck.id,
    name: ahdbDeck.name,
    source: predictDeckInput(ahdbDeck.id.toString()).source,
    dateCreate: new Date(ahdbDeck.date_creation),
    dateUpdate: new Date(ahdbDeck.date_update),
    descriptionMd: ahdbDeck.description_md,
    userId: ahdbDeck.user_id ?? undefined,
    investigator: cardResolver.resolve(ahdbDeck.investigator_code),
    mainDeck: resolveCardQuantityKvp(ahdbDeck.slots, cardResolver),
    sideDeck: resolveCardQuantityKvp(ahdbDeck.sideSlots, cardResolver),
    mainDeckIgnoreLimit: resolveCardQuantityKvp(ahdbDeck.ignoreDeckLimitSlots, cardResolver),
    version: ahdbDeck.version,
    xp: ahdbDeck.xp ?? undefined,
    xpSpent: ahdbDeck.xp_spent ?? undefined,
    xpAdjustment: ahdbDeck.xp_adjustment ?? undefined,
    exileString: ahdbDeck.exile_string ?? undefined,
    taboo: taboos.find((t) => t.id === ahdbDeck.taboo_id) ?? taboos[0],
    meta: decodeMeta(ahdbDeck.meta, cardResolver),
    tags: ahdbDeck.tags.split(',').map((tag) => tag.trim()),
    previousDeck: undefined, // Temporarily set to undefined
    nextDeck: undefined, // Temporarily set to undefined
    // TODO: Not really needed for this site but maybe complete it some time later.
    problems: ahdbDeck.problem ? [{ type: '' }] : [],
  };

  processedDecks.set(ahdbDeck.id, deck);

  deck.previousDeck = ahdbDeck.previous_deck
    ? ahdbDeckToDeck(
        resolveAhdbDeck(ahdbDeck.previous_deck),
        resolveAhdbDeck,
        cardResolver,
        taboos,
        processedDecks
      )
    : undefined;

  deck.nextDeck = ahdbDeck.next_deck
    ? ahdbDeckToDeck(
        resolveAhdbDeck(ahdbDeck.next_deck),
        resolveAhdbDeck,
        cardResolver,
        taboos,
        processedDecks
      )
    : undefined;

  return deck;
}

export function linkedAhdbDeckToDeck(
  ahdbDeck: LinkedAhdbDeck,
  cardResolver: CardResolver,
  taboos: Taboo[]
): Deck {
  const linearizeLinkedDecks: AhdbDeck[] = linearizeLinkedAhdbDeck(ahdbDeck);
  function deckResolver(deckId: number | string): AhdbDeck {
    const deck = linearizeLinkedDecks.find((d) => d.id === deckId);
    if (!deck) {
      throw new Error(`Deck ${deckId} not found in linked list`);
    }
    return deck;
  }
  return ahdbDeckToDeck(ahdbDeck.deck, deckResolver, cardResolver, taboos);
}
