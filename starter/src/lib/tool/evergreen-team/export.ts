import {
	type AhdbDeck,
	type Card,
	type CardCode,
	type CardResolver,
	randomBasicWeakness
} from '@5argon/arkham-kohaku';

import { poolProducts } from './pool';
import type { EvergreenState } from './types';

/**
 * Build one player's deck as ArkhamDB-flavored JSON, the shape deck builder
 * sites like arkham.build import. Fixed items (signatures + the random basic
 * weakness placeholder) are added to slots; meta.card_pool carries the
 * Evergreen pool so arkham.build's limited-pool feature understands it.
 */
export function toAhdbDeck(args: {
	state: EvergreenState;
	deckIndex: number;
	resolver: CardResolver;
	name: string;
	description: string;
}): AhdbDeck {
	const { state, deckIndex, resolver, name, description } = args;
	const deck = state.decks[deckIndex];
	const investigator = resolver.resolve(deck.investigator);

	const slots: Record<CardCode, number> = {};
	for (const signature of investigator.deckRequirements?.card ?? []) {
		slots[signature.code] = (slots[signature.code] ?? 0) + 1;
	}
	const randomCount =
		investigator.deckRequirements?.random?.filter((r) => r === 'basicweakness').length ?? 0;
	if (randomCount > 0) {
		slots[randomBasicWeakness] = randomCount;
	}
	for (const [code, quantity] of Object.entries(deck.main)) {
		slots[code] = (slots[code] ?? 0) + quantity;
	}

	const now = new Date().toISOString();
	return {
		id: 0,
		name,
		date_creation: now,
		date_update: now,
		description_md: description,
		user_id: null,
		investigator_code: deck.investigator,
		investigator_name: investigator.name,
		slots,
		sideSlots: { ...deck.side },
		ignoreDeckLimitSlots: {},
		version: '0.1',
		xp: null,
		xp_spent: null,
		xp_adjustment: null,
		exile_string: null,
		taboo_id: null,
		meta: JSON.stringify({ card_pool: poolProducts(state.setup).join(',') }),
		tags: 'evergreen',
		previous_deck: null,
		next_deck: null,
		problem: null
	};
}

export function deckFileName(investigator: Card): string {
	const slug = investigator.name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
	return `team-builder-${slug}.json`;
}
