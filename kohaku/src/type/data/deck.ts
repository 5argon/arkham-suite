import {
  linearizeLinkedAhdbDeck,
  LinkedAhdbDeck,
  predictDeckInput,
} from '../../utility/service/deck-input.js';
import { compressDeck } from '../../utility/deck/compress.js';
import { DeckSource } from './deck-source.js';
import { DecodedMeta, decodeMeta } from './meta.js';
import type { ArkhamBuildMetaHiddenSlots } from './meta.js';
import { Card } from './player-card.js';
import { CardResolver } from './resolver.js';
import { Taboo } from './taboo.js';

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
  taboo_id: number | null;
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
  compressedJson?: string;
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

function mergeCardQuantityKvp(base: CardQuantityKvp, additional: CardQuantityKvp): CardQuantityKvp {
  if (!base && !additional) {
    return null;
  }
  if (!base) {
    return { ...additional };
  }
  if (!additional) {
    return { ...base };
  }
  const merged: Record<string, number> = { ...base };
  Object.entries(additional).forEach(([code, quantity]) => {
    merged[code] = (merged[code] ?? 0) + quantity;
  });
  return merged;
}

function getHiddenSlotsFromMeta(metaString: string): ArkhamBuildMetaHiddenSlots | undefined {
  try {
    const parsedMeta = JSON.parse(metaString) as { hidden_slots?: ArkhamBuildMetaHiddenSlots };
    return parsedMeta.hidden_slots;
  } catch {
    return undefined;
  }
}

function applyHiddenSlotsToAhdbDeck(ahdbDeck: AhdbDeck): AhdbDeck {
  const hiddenSlots = getHiddenSlotsFromMeta(ahdbDeck.meta);
  if (!hiddenSlots) {
    return ahdbDeck;
  }
  if (hiddenSlots.investigator_code !== ahdbDeck.investigator_code) {
    return ahdbDeck;
  }

  return {
    ...ahdbDeck,
    slots: mergeCardQuantityKvp(ahdbDeck.slots, hiddenSlots.slots),
    sideSlots: mergeCardQuantityKvp(ahdbDeck.sideSlots, hiddenSlots.sideSlots),
    ignoreDeckLimitSlots: mergeCardQuantityKvp(
      ahdbDeck.ignoreDeckLimitSlots,
      hiddenSlots.ignoreDeckLimitSlots
    ),
  };
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
  const processedAhdbDeck = applyHiddenSlotsToAhdbDeck(ahdbDeck);

  if (processedDecks.has(processedAhdbDeck.id)) {
    return processedDecks.get(processedAhdbDeck.id)!;
  }

  const deck: Deck = {
    id: processedAhdbDeck.id,
    name: processedAhdbDeck.name,
    source: predictDeckInput(processedAhdbDeck.id.toString()).source,
    dateCreate: new Date(processedAhdbDeck.date_creation),
    dateUpdate: new Date(processedAhdbDeck.date_update),
    descriptionMd: processedAhdbDeck.description_md,
    userId: processedAhdbDeck.user_id ?? undefined,
    investigator: cardResolver.resolve(processedAhdbDeck.investigator_code),
    mainDeck: resolveCardQuantityKvp(processedAhdbDeck.slots, cardResolver),
    sideDeck: resolveCardQuantityKvp(processedAhdbDeck.sideSlots, cardResolver),
    mainDeckIgnoreLimit: resolveCardQuantityKvp(
      processedAhdbDeck.ignoreDeckLimitSlots,
      cardResolver
    ),
    version: processedAhdbDeck.version,
    xp: processedAhdbDeck.xp ?? undefined,
    xpSpent: processedAhdbDeck.xp_spent ?? undefined,
    xpAdjustment: processedAhdbDeck.xp_adjustment ?? undefined,
    exileString: processedAhdbDeck.exile_string ?? undefined,
    taboo: taboos.find((t) => t.id === processedAhdbDeck.taboo_id) ?? taboos[0],
    meta: decodeMeta(processedAhdbDeck.meta, cardResolver),
    tags: processedAhdbDeck.tags.split(',').map((tag) => tag.trim()),
    previousDeck: undefined, // Temporarily set to undefined
    nextDeck: undefined, // Temporarily set to undefined
    // TODO: Not really needed for this site but maybe complete it some time later.
    problems: processedAhdbDeck.problem ? [{ type: '' }] : [],
    compressedJson: compressDeck(processedAhdbDeck),
  };

  processedDecks.set(processedAhdbDeck.id, deck);

  deck.previousDeck = processedAhdbDeck.previous_deck
    ? ahdbDeckToDeck(
        resolveAhdbDeck(processedAhdbDeck.previous_deck),
        resolveAhdbDeck,
        cardResolver,
        taboos,
        processedDecks
      )
    : undefined;

  deck.nextDeck = processedAhdbDeck.next_deck
    ? ahdbDeckToDeck(
        resolveAhdbDeck(processedAhdbDeck.next_deck),
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
