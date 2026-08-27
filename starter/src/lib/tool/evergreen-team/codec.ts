import { type Card, type CardCode, Product } from '@5argon/arkham-kohaku';

import { EvergreenTeamProto } from '../../proto/generated/evergreen_team';
import { buildPool, deckProductsForCore, investigatorsForSetup } from './pool';
import { deckLimitOf, routeZone } from './rules';
import { clampTeamInfo } from './team-info';
import type { EvergreenCore, EvergreenDeckState, EvergreenState } from './types';

/**
 * Card entry packing, same layout as CompactDeck in deck.proto:
 * (card_code << 4) | ((quantity - 1) << 2) | zone   (zone: 0=main, 1=side)
 */
function packEntry(code: CardCode, quantity: number, zone: 0 | 1): number {
	return (parseInt(code, 10) << 4) | ((quantity - 1) << 2) | zone;
}

function unpackEntry(entry: number): { code: CardCode; quantity: number; zone: number } {
	return {
		code: ((entry >> 4) & 0x1ffff).toString().padStart(5, '0'),
		quantity: ((entry >> 2) & 0x3) + 1,
		zone: entry & 0x3
	};
}

function binaryToBase64url(binary: Uint8Array): string {
	const base64 = btoa(String.fromCharCode(...binary));
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlToBinary(encoded: string): Uint8Array {
	let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
	while (base64.length % 4) {
		base64 += '=';
	}
	const binaryString = atob(base64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

export function encodeEvergreen(state: EvergreenState): string {
	const productOrder = deckProductsForCore(state.setup.core);
	let deckProductsMask = 0;
	productOrder.forEach((product, i) => {
		if (state.setup.deckProducts.includes(product)) {
			deckProductsMask |= 1 << i;
		}
	});

	const proto = EvergreenTeamProto.create({
		core: state.setup.core === Product.CoreSet2026 ? 1 : 0,
		deckProducts: deckProductsMask,
		extraProducts: state.setup.extraProducts,
		mergeProducts: state.mergeProducts,
		name: state.info.name,
		author: state.info.author,
		description: state.info.description,
		decks: state.decks.map((deck) => ({
			investigator: parseInt(deck.investigator, 10),
			cards: [
				...Object.entries(deck.main).map(([code, qty]) => packEntry(code, qty, 0)),
				...Object.entries(deck.side).map(([code, qty]) => packEntry(code, qty, 1))
			]
		}))
	});

	return binaryToBase64url(EvergreenTeamProto.toBinary(proto));
}

/**
 * Decode a shared team string. Defensive: unknown investigators or cards are
 * dropped, quantities are clamped to deck limits and to the physical pool,
 * and zones are re-derived from card level. Returns null when the string is
 * unparseable or holds no valid deck.
 */
export function decodeEvergreen(encoded: string, allCards: Card[]): EvergreenState | null {
	let proto;
	try {
		proto = EvergreenTeamProto.fromBinary(base64urlToBinary(encoded));
	} catch {
		return null;
	}

	const core: EvergreenCore = proto.core === 1 ? Product.CoreSet2026 : Product.RevisedCoreSet;
	const productOrder = deckProductsForCore(core);
	const deckProducts = productOrder.filter((_, i) => (proto.deckProducts & (1 << i)) !== 0);
	const validProducts = new Set<string>(Object.values(Product));
	const extraProducts = [
		...new Set(
			proto.extraProducts.filter(
				(p) => validProducts.has(p) && p !== core && !productOrder.includes(p as Product)
			)
		)
	] as Product[];

	const setup = { core, deckProducts, extraProducts, investigators: [] as CardCode[] };
	const rosterCodes = new Set(investigatorsForSetup(setup, allCards).map((c) => c.code));
	const pool = buildPool(setup, allCards);

	const decks: EvergreenDeckState[] = [];
	const draftedSoFar = new Map<CardCode, number>();
	for (const protoDeck of proto.decks.slice(0, 4)) {
		const investigator = protoDeck.investigator.toString().padStart(5, '0');
		if (!rosterCodes.has(investigator) || setup.investigators.includes(investigator)) {
			continue;
		}
		const deck: EvergreenDeckState = { investigator, main: {}, side: {} };
		const titleCounts = new Map<string, number>();
		for (const entry of protoDeck.cards) {
			const { code, quantity } = unpackEntry(entry);
			const poolEntry = pool.get(code);
			if (poolEntry === undefined) continue;
			const inThisTitle = titleCounts.get(poolEntry.titleKey) ?? 0;
			const drafted = draftedSoFar.get(code) ?? 0;
			const qty = Math.min(
				quantity,
				deckLimitOf(poolEntry.card) - inThisTitle,
				poolEntry.total - drafted
			);
			if (qty <= 0) continue;
			const zone = routeZone(poolEntry.card);
			deck[zone][code] = (deck[zone][code] ?? 0) + qty;
			titleCounts.set(poolEntry.titleKey, inThisTitle + qty);
			draftedSoFar.set(code, drafted + qty);
		}
		setup.investigators.push(investigator);
		decks.push(deck);
	}

	if (decks.length === 0) {
		return null;
	}

	// Pick mode is a per-session preference and is not carried by the link.
	return {
		setup,
		decks,
		pickMode: 'max',
		mergeProducts: proto.mergeProducts,
		info: clampTeamInfo({
			name: proto.name,
			author: proto.author,
			description: proto.description
		})
	};
}
