import { describe, expect, it } from 'vitest';

import { allStarterDecks, importedStarterDeck } from '../../starter-content';
import { deckParamsFrom, MAX_FETCHED_DECKS } from './deck-params';

const starterIds = allStarterDecks().map((entry) => String(importedStarterDeck(entry).deck.id));
const outsideIds = (count: number) => Array.from({ length: count }, (_, i) => String(1000 + i));

function paramsOf(decks: string[]): URLSearchParams {
	return new URLSearchParams(decks.map((deck, i) => [`p${i + 1}`, deck]));
}

describe('Team Assembler deck parameters', () => {
	it('keeps every deck hosted here, however many', () => {
		expect(starterIds.length).toBeGreaterThan(MAX_FETCHED_DECKS);
		expect(deckParamsFrom(paramsOf(starterIds))).toEqual(starterIds);
	});

	it('caps decks fetched from elsewhere', () => {
		const outside = outsideIds(MAX_FETCHED_DECKS + 5);
		expect(deckParamsFrom(paramsOf(outside))).toEqual(outside.slice(0, MAX_FETCHED_DECKS));
	});

	it('does not count hosted decks towards the cap', () => {
		const outside = outsideIds(MAX_FETCHED_DECKS + 1);
		const mixed = [...starterIds, ...outside];
		expect(deckParamsFrom(paramsOf(mixed))).toEqual([
			...starterIds,
			...outside.slice(0, MAX_FETCHED_DECKS)
		]);
	});

	it('reads parameters in number order and ignores anything else', () => {
		const params = new URLSearchParams([
			['p10', 'ten'],
			['p2', 'two'],
			['p1', 'one'],
			['p3', ''],
			['page', 'nope'],
			['q', 'nope']
		]);
		expect(deckParamsFrom(params)).toEqual(['one', 'two', 'ten']);
	});
});
