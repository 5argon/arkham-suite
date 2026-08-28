import { browser } from '$app/environment';
import { type AhdbDeck, type Deck, deck as deckUtils } from '@5argon/arkham-kohaku';

import { getFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from '$lib/storage';

/**
 * Hand-over channel between tools in this browser: a tool stashes deck JSON
 * here and opens another tool, which reads the stash instead of fetching
 * decks by id. The receiving tool shows a banner and a clear control while
 * the stash exists, and ignores its normal deck-id inputs meanwhile.
 */
export function stashDecks(decks: AhdbDeck[]): void {
	if (!browser) return;
	// Receivers key their lists by deck id; decks built by a tool (rather
	// than fetched) may all share a placeholder id, so ids are made unique.
	const seen = new Set<string>();
	const unique = decks.map((deck) => {
		let id = String(deck.id);
		while (seen.has(id)) id = `${id}-${seen.size}`;
		seen.add(id);
		return id === String(deck.id) ? deck : { ...deck, id };
	});
	saveToStorage(STORAGE_KEYS.TRANSIENT_DECKS, unique);
}

export function readStashedDecks(): AhdbDeck[] | null {
	if (!browser) return null;
	const stored = getFromStorage<AhdbDeck[] | null>(STORAGE_KEYS.TRANSIENT_DECKS, null);
	return Array.isArray(stored) && stored.length > 0 ? stored : null;
}

export function clearStashedDecks(): void {
	if (!browser) return;
	removeFromStorage(STORAGE_KEYS.TRANSIENT_DECKS);
}

/**
 * The ArkhamDB-shaped JSON a kohaku Deck was built from.
 */
export function deckToAhdb(deck: Deck): AhdbDeck | null {
	return deck.compressedJson === undefined ? null : deckUtils.decompressDeck(deck.compressedJson);
}

/**
 * Hands decks to Deck Gather in a new tab.
 */
export function openInDeckGather(decks: AhdbDeck[]): void {
	stashDecks(decks);
	window.open('/tool/gather', '_blank', 'noopener');
}
