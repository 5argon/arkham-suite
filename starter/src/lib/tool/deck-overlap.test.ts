import { CardResolver, deck as deckUtils, linkedAhdbDeckToDeck } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { getAllCards, loadAllTabooLists } from '../card-data';
import { starterDeck } from '../starter-content';

describe('findQuantityOverlaps', () => {
	it('adds copies per deck and flags totals beyond what is available', () => {
		const overlaps = deckUtils.findQuantityOverlaps(
			[
				[
					['a', 2],
					['b', 1],
					['a', 1]
				],
				[['a', 2]],
				[['b', 1]]
			],
			(code) => (code === 'a' ? 4 : 2)
		);
		expect(overlaps).toEqual([{ code: 'a', used: 5, available: 4, perDeck: [3, 2, 0] }]);
	});

	it('leaves out cards without availability', () => {
		expect(deckUtils.findQuantityOverlaps([[['a', 9]]], () => undefined)).toEqual([]);
	});
});

describe('findDeckOverlaps', () => {
	const resolver = new CardResolver(getAllCards(), null);
	// The same deck twice: every card in it is claimed twice over.
	const entry = starterDeck('hungry-colquhoun', 'ch2-starter-guide', 'blood-money')!;
	const deck = linkedAhdbDeckToDeck({ deck: entry.primary }, resolver, loadAllTabooLists());
	const sideOnly = deck.sideDeck.find(
		(cq) => cq.card.quantity > 0 && !deck.mainDeck.some((main) => main.card.code === cq.card.code)
	)!;

	it('counts only main decks by default', () => {
		const codes = deckUtils.findDeckOverlaps([deck, deck]).map((o) => o.cardCode);
		expect(codes).not.toContain(sideOnly.card.code);
	});

	it('counts side decks when asked', () => {
		const overlap = deckUtils
			.findDeckOverlaps([deck, deck], { includeSideDeck: true })
			.find((o) => o.cardCode === sideOnly.card.code);
		expect(overlap?.totalQuantity).toBe(sideOnly.quantity * 2);
	});
});
