/**
 * deck-purity.ts — classify a campaign's imported decks by product provenance.
 *
 * The "Core-Set purist" feat (surfaced by the NotZ widgets — NotZ is the tutorial bundled with the
 * Core Set): was a clear achieved using ONLY Core / Revised Core / Core 2026 cards, the investigator
 * included, with a NON-parallel investigator (no alternate front/back)? Detected from the recorded
 * deck lists (`ahdbJson` slots + ignore-limit; never side slots). A campaign with no verifiable
 * decks does not qualify.
 */
import { Product } from '@5argon/arkham-kohaku';
import type { Card } from '@5argon/arkham-kohaku';
import { getAllCards } from '$lib/card-data';
import type { DeckRecord } from '$lib/database/document';

/** The three Core-Set printings — old Core, Revised Core, and the 2026 Core Set. */
const CORE_PRODUCTS = new Set<Product>([Product.CoreSet, Product.RevisedCoreSet, Product.CoreSet2026]);

interface AhdbSlots {
	slots?: Record<string, number>;
	ignoreDeckLimitSlots?: Record<string, number>;
}

let cardMapCache: Map<string, Card> | null = null;
function cardMap(): Map<string, Card> {
	if (!cardMapCache) cardMapCache = new Map(getAllCards().map((c) => [c.code, c]));
	return cardMapCache;
}

const isCore = (code: string, m: Map<string, Card>): boolean => {
	const card = m.get(code);
	return card ? CORE_PRODUCTS.has(card.product) : false;
};

/** Whether one deck chain uses only Core-Set cards and a non-parallel Core-Set investigator. */
export function isCoreOnlyDeck(deck: DeckRecord): boolean {
	const m = cardMap();
	const inv = m.get(deck.investigator.investigatorCode);
	// Investigator must be a known, non-parallel, Core-Set printing…
	if (!inv || inv.alternateOfCardCode !== undefined || !CORE_PRODUCTS.has(inv.product)) return false;
	// …and a recorded alternate front/back is a parallel investigator too.
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
				if (!isCore(code, m)) return false;
			}
	}
	// No recorded card list ⇒ nothing to verify; an unverifiable deck does not qualify.
	return sawCard;
}

/** Whether EVERY (subject-filtered) deck in a campaign is Core-only. False when there are none. */
export function isCoreOnlyCampaign(decks: DeckRecord[]): boolean {
	return decks.length > 0 && decks.every(isCoreOnlyDeck);
}
