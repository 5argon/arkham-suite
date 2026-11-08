import type { AhdbDeck } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { hasSideDeck, withSideDeckChoice } from './side-deck-choice';

const deck = { slots: { a: 2 }, sideSlots: { zero: 2, two: 1, none: 1 } } as unknown as AhdbDeck;
const xp: Record<string, number> = { zero: 0, two: 2 };

describe('side deck choice when downloading', () => {
	it('keeps the side deck as shown', () => {
		expect(withSideDeckChoice(deck, 'keep', (code) => xp[code])).toBe(deck);
	});

	it('leaves out the 0 XP cards, and those without a level', () => {
		expect(withSideDeckChoice(deck, 'noZeroXp', (code) => xp[code]).sideSlots).toEqual({ two: 1 });
	});

	it('leaves out the whole side deck, keeping the main deck', () => {
		const standalone = withSideDeckChoice(deck, 'none', (code) => xp[code]);
		expect(standalone.sideSlots).toEqual({});
		expect(standalone.slots).toEqual({ a: 2 });
	});

	it('knows when there is a side deck to choose about', () => {
		expect(hasSideDeck(deck)).toBe(true);
		expect(hasSideDeck({ slots: {}, sideSlots: {} } as unknown as AhdbDeck)).toBe(false);
	});
});
