import { DeckSource } from '../../type/data/deck-source.js';
import { AhdbDeck, Deck } from '../../type/index.js';
import {
  createArkhamBuildAdditionalMetadataUrl,
  createArkhamBuildShareUrl,
  createArkhamDbPublicDeckUrl,
  createArkhamDbPublishedDeckUrl,
  createArkhamBuildShareBrowserUrl,
  createArkhamBuildViewBrowserUrl,
  createArkhamDbPublicDeckBrowserUrl,
  createArkhamDbPublishedDeckBrowserUrl,
} from './url.js';

export interface PredictDeckInputResult {
  deck: string;
  url: string;
  browserUrl: string;
  source: DeckSource;
}

type DeckMetaWithAmk = {
  amk?: string;
};

function getAmk(metaString: string): string | undefined {
  try {
    const parsedMeta = JSON.parse(metaString) as DeckMetaWithAmk;
    return typeof parsedMeta.amk === 'string' && parsedMeta.amk !== '' ? parsedMeta.amk : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Handles either URL string or plain string of deck ID of any source.
 * It tries to predict the right source. Unknown source can be used to disable
 * the submission of the form.
 */
export function predictDeckInput(input: string | number): PredictDeckInputResult {
  const inputString = input.toString();
  // Format: https://arkham.build/share/3CEq396JgzuYvyb
  {
    const urlRegex = new RegExp(/arkham\.build\/share\/([^/]*)/gm);
    const matchResult = urlRegex.exec(inputString);
    if (matchResult !== null) {
      return {
        deck: matchResult[1],
        url: createArkhamBuildShareUrl(matchResult[1]),
        browserUrl: createArkhamBuildShareBrowserUrl(matchResult[1]),
        source: DeckSource.ArkhamBuildShared,
      };
    }
  }
  {
    const urlRegex = new RegExp(/decklist\/view\/([^/]*)/gm);
    const matchResult = urlRegex.exec(inputString);
    if (matchResult !== null) {
      return {
        deck: matchResult[1],
        url: createArkhamDbPublishedDeckUrl(matchResult[1]),
        browserUrl: createArkhamDbPublishedDeckBrowserUrl(matchResult[1]),
        source: DeckSource.ArkhamDbPublished,
      };
    }
  }
  {
    const urlRegex = new RegExp(/decklist\/edit\/([^/]*)/gm);
    const matchResult = urlRegex.exec(inputString);
    if (matchResult !== null) {
      return {
        deck: matchResult[1],
        url: createArkhamDbPublishedDeckUrl(matchResult[1]),
        browserUrl: createArkhamDbPublishedDeckBrowserUrl(matchResult[1]),
        source: DeckSource.ArkhamDbPublished,
      };
    }
  }
  {
    const urlRegex = new RegExp(/deck\/view\/([^/]*)/gm);
    const matchResult = urlRegex.exec(inputString);
    if (matchResult !== null) {
      const deckId = matchResult[1];
      if (isArkhamBuildDeckId(deckId)) {
        return {
          deck: deckId,
          url: createArkhamBuildShareUrl(deckId),
          browserUrl: createArkhamBuildViewBrowserUrl(deckId),
          source: DeckSource.ArkhamBuildShared,
        };
      }
      return {
        deck: deckId,
        url: createArkhamDbPublicDeckUrl(deckId),
        browserUrl: createArkhamDbPublicDeckBrowserUrl(deckId),
        source: DeckSource.ArkhamDbPublic,
      };
    }
  }
  {
    const urlRegex = new RegExp(/edit\/([^/]*)/gm);
    const matchResult = urlRegex.exec(inputString);
    if (matchResult !== null) {
      return {
        deck: matchResult[1],
        url: createArkhamDbPublicDeckUrl(matchResult[1]),
        browserUrl: createArkhamDbPublicDeckBrowserUrl(matchResult[1]),
        source: DeckSource.ArkhamDbPublic,
      };
    }
  }

  if (isArkhamBuildDeckId(inputString)) {
    return {
      deck: inputString,
      url: createArkhamBuildShareUrl(inputString),
      browserUrl: createArkhamBuildShareBrowserUrl(inputString),
      source: DeckSource.ArkhamBuildShared,
    };
  } else if (isLikelyArkhamDbPublicDeck(inputString)) {
    return {
      deck: inputString,
      url: createArkhamDbPublicDeckUrl(inputString),
      browserUrl: createArkhamDbPublicDeckBrowserUrl(inputString),
      source: DeckSource.ArkhamDbPublic,
    };
  }
  if (isLikelyArkhamDbDeck(inputString)) {
    return {
      deck: inputString,
      url: createArkhamDbPublishedDeckUrl(inputString),
      browserUrl: createArkhamDbPublishedDeckBrowserUrl(inputString),
      source: DeckSource.ArkhamDbPublished,
    };
  }
  return { deck: inputString, url: '', browserUrl: '', source: DeckSource.Unknown };
}

export function isArkhamBuildDeckId(deckId: string): boolean {
  return deckId.length === 15;
}

/**
 * Guess that it is a public (non-published) deck if the string is a number of over 1 million.
 */
export function isLikelyArkhamDbPublicDeck(deckId: string): boolean {
  return parseInt(deckId) > 1000000;
}

export function isLikelyArkhamDbDeck(deckId: string): boolean {
  return parseInt(deckId) > 0;
}

export interface LinkedAhdbDeck {
  deck: AhdbDeck;
  next?: LinkedAhdbDeck;
  previous?: LinkedAhdbDeck;
}

export interface DeckFetchingError {
  message: string;
}

export function isDeckFetchingError(
  fetched: AhdbDeck | DeckFetchingError
): fetched is DeckFetchingError {
  return 'message' in fetched;
}

export function linearizeLinkedAhdbDeck(linked: LinkedAhdbDeck): AhdbDeck[] {
  const decks: AhdbDeck[] = [];
  let current: LinkedAhdbDeck | undefined = linked;

  // Traverse to the beginning of the linked list
  while (current.previous) {
    current = current.previous;
  }

  // Collect all decks in the linked list
  while (current) {
    decks.push(current.deck);
    current = current.next;
  }
  return decks;
}

/**
 * Fetch all next and previous decks of the requested deck. Next and previous deck will
 * use the same source as the requested deck.
 * The returned data is a linked list containing all decks in the chain.
 */
export async function fetchDeckRecursive(
  fetchFunction: (...p: Parameters<typeof fetch>) => ReturnType<typeof fetch>,
  input: string | number
): Promise<LinkedAhdbDeck> {
  async function resolveArkhamBuildDeckWhenAmkPresent(
    deck: AhdbDeck,
    source: DeckSource
  ): Promise<AhdbDeck> {
    if (source !== DeckSource.ArkhamDbPublic && source !== DeckSource.ArkhamDbPublished) {
      return deck;
    }
    if (!deck.meta) {
      return deck;
    }
    const amk = getAmk(deck.meta);
    if (!amk) {
      return deck;
    }
    try {
      const response = await fetchFunction(createArkhamBuildAdditionalMetadataUrl(amk));
      if (!response.ok) {
        return deck;
      }
      const additional = (await response.json()) as unknown;
      if (typeof additional !== 'object' || additional === null || Array.isArray(additional)) {
        return deck;
      }
      const merged = { ...(JSON.parse(deck.meta) as Record<string, unknown>), ...additional };
      return { ...deck, meta: JSON.stringify(merged) };
    } catch {
      return deck;
    }
  }

  async function fetchLogic(input: string | number): Promise<AhdbDeck | DeckFetchingError> {
    const predicted = predictDeckInput(input);
    if (predicted.source === DeckSource.Unknown) {
      throw new Error('Unknown deck source');
    }
    const response = await fetchFunction(predicted.url);
    const deck = (await response.json()) as AhdbDeck;
    return resolveArkhamBuildDeckWhenAmkPresent(deck, predicted.source);
  }

  async function fetchDeckRecursiveLogic(
    input: string | number,
    direction: 'next' | 'previous',
    forBacklink: LinkedAhdbDeck
  ): Promise<LinkedAhdbDeck> {
    const deck = await fetchLogic(input);
    if (isDeckFetchingError(deck)) {
      throw new Error(`Failed to fetch deck: ${deck.message}`);
    }
    const linkedDeck: LinkedAhdbDeck = { deck };

    if (direction === 'next') {
      linkedDeck.previous = forBacklink;
      forBacklink.next = linkedDeck;
      if (deck.next_deck) {
        linkedDeck.next = await fetchDeckRecursiveLogic(deck.next_deck, direction, linkedDeck);
      }
    } else {
      linkedDeck.next = forBacklink;
      forBacklink.previous = linkedDeck;
      if (deck.previous_deck) {
        linkedDeck.previous = await fetchDeckRecursiveLogic(
          deck.previous_deck,
          direction,
          linkedDeck
        );
      }
    }
    return linkedDeck;
  }

  const startingDeck = await fetchLogic(input);
  if (isDeckFetchingError(startingDeck)) {
    throw new Error(`Failed to fetch deck: ${startingDeck.message}`);
  }
  const linkedDeck: LinkedAhdbDeck = { deck: startingDeck };
  // Spread both sides from the starting deck.
  if (startingDeck.next_deck) {
    linkedDeck.next = await fetchDeckRecursiveLogic(startingDeck.next_deck, 'next', linkedDeck);
  }
  if (startingDeck.previous_deck) {
    linkedDeck.previous = await fetchDeckRecursiveLogic(
      startingDeck.previous_deck,
      'previous',
      linkedDeck
    );
  }
  return linkedDeck;
}
