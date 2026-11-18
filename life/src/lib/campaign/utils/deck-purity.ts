/**
 * The "Core-Set purist" feat shown on the Night of the Zealot widgets: a clear whose decks use only
 * Core / Revised Core / Core 2026 cards, the investigator included, with a non-parallel investigator.
 * Read from the recorded deck lists (slots and ignore-limit slots, never side slots).
 */
import { cardByCode } from '$lib/card-data';
import { CORE_PRODUCTS } from './card-filters';
import type { DeckRecord } from '$lib/database/document';

interface AhdbSlots {
	slots?: Record<string, number>;
	ignoreDeckLimitSlots?: Record<string, number>;
}

const isCore = (code: string): boolean => {
	const card = cardByCode(code);
	return card ? CORE_PRODUCTS.has(card.product) : false;
};

/** Whether every version of a deck holds only Core-Set cards; a deck with no recorded cards can't
 *  be verified and does not qualify. */
export function isCoreOnlyDeck(deck: DeckRecord): boolean {
	const inv = cardByCode(deck.investigator.investigatorCode);
	if (!inv || inv.alternateOfCardCode !== undefined || !CORE_PRODUCTS.has(inv.product)) return false;
	// A recorded alternate front or back is a parallel investigator.
	if (deck.investigator.alternateFrontCode || deck.investigator.alternateBackCode) return false;
	let sawCard = false;
	for (const v of deck.versions) {
		let ahdb: AhdbSlots;
		try {
			ahdb = JSON.parse(v.ahdbJson) as AhdbSlots;
		} catch {
			return false;
		}
		for (const slots of [ahdb.slots, ahdb.ignoreDeckLimitSlots])
			for (const code of Object.keys(slots ?? {})) {
				sawCard = true;
				if (!isCore(code)) return false;
			}
	}
	return sawCard;
}

/** Whether a campaign has decks and all of them are Core-only. */
export function isCoreOnlyCampaign(decks: DeckRecord[]): boolean {
	return decks.length > 0 && decks.every(isCoreOnlyDeck);
}
