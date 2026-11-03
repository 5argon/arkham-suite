import { type CardCode, Product, productInvestigatorDeck } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { getAllCards } from '$lib/card-data';
import type { PrebuiltTeamSummary } from '$lib/starter-content';

import {
	deckCardCodes,
	matchesCards,
	matchesInvestigators,
	pickedNothing,
	pickableCards,
	pickRandom,
	type StarterFilterValue,
	tagChoices,
	teamCardCodes,
	teamHasTags
} from './filter';

const roland = '01001' as CardCode;
const daisy = '01002' as CardCode;
const skids = '01003' as CardCode;
const agnes = '01004' as CardCode;
const wendy = '01005' as CardCode;

function filter(investigators: CardCode[], mustIncludeAll: boolean): StarterFilterValue {
	return { products: new Set<Product>(), investigators: new Set(investigators), mustIncludeAll };
}

describe('pre-built team investigator filter', () => {
	it('matches any selected investigator by default', () => {
		expect(matchesInvestigators([roland, daisy], filter([roland, skids], false))).toBe(true);
	});

	it('requires every selected investigator when Must Include All is checked', () => {
		expect(matchesInvestigators([roland, daisy], filter([roland, daisy], true))).toBe(true);
		expect(matchesInvestigators([roland, daisy], filter([roland, skids], true))).toBe(false);
	});

	it('rejects more selected investigators than a four-player team can contain', () => {
		expect(
			matchesInvestigators(
				[roland, daisy, skids, agnes],
				filter([roland, daisy, skids, agnes, wendy], true)
			)
		).toBe(false);
	});

	it('does not match results when every investigator is deselected', () => {
		expect(matchesInvestigators([roland, daisy], filter([], false))).toBe(false);
		expect(matchesInvestigators([roland, daisy], filter([], true))).toBe(false);
	});
});

describe('pickRandom', () => {
	it('never repeats the previous pick when there is another choice', () => {
		for (let i = 0; i < 50; i++) {
			expect(pickRandom([roland, daisy], roland)).toBe(daisy);
		}
	});

	it('repeats the only item and returns null for nothing', () => {
		expect(pickRandom([roland], roland)).toBe(roland);
		expect(pickRandom([], null)).toBe(null);
	});
});

describe('pre-built team tags', () => {
	const entry = (...tags: string[]) => ({ tags }) as unknown as PrebuiltTeamSummary;
	const entries = [
		entry('HC Cross Series', '2C+2ID'),
		entry('HC Cross Series', '3C+1ID'),
		entry('HC Chapter 2 Core Only', '2C+0ID'),
		entry('HC Chapter 2 Core Only', '1C+1ID'),
		entry('HC Cross Series', '2C+2ID', 'Non-Adjacent Core'),
		entry('HC Cross Series', '2C+2ID', 'Adjacent Core')
	];

	it('offers series first, then mixes by player count with the most Core Set first', () => {
		expect(tagChoices(entries, []).map((choice) => choice.label)).toEqual([
			'HC Chapter 2 Core Only',
			'HC Cross Series',
			'2C+0ID',
			'1C+1ID',
			'3C+1ID',
			'2C+2ID',
			'Adjacent Core',
			'Non-Adjacent Core'
		]);
	});

	it('needs a team to have every tag in effect', () => {
		expect(teamHasTags(entries[0], ['HC Cross Series', '2C+2ID'])).toBe(true);
		expect(teamHasTags(entries[0], ['HC Cross Series', '3C+1ID'])).toBe(false);
		expect(teamHasTags(entries[0], [])).toBe(true);
	});

	it('offers only tags of the teams left, with what adding each would leave', () => {
		expect(tagChoices(entries, ['HC Cross Series'])).toEqual([
			{ label: '3C+1ID', count: 1 },
			{ label: '2C+2ID', count: 3 },
			{ label: 'Adjacent Core', count: 1 },
			{ label: 'Non-Adjacent Core', count: 1 }
		]);
	});
});

describe('looking for cards', () => {
	const cards = (picked: string[], mustIncludeAll = false): StarterFilterValue => ({
		products: new Set<Product>(),
		investigators: new Set(),
		pickBy: 'cards',
		cards: new Set(picked),
		mustIncludeAll
	});

	it('matches any picked card by default', () => {
		expect(matchesCards(['a', 'b'], cards(['b', 'z']))).toBe(true);
		expect(matchesCards(['a', 'b'], cards(['z']))).toBe(false);
	});

	it('needs every picked card when must include all', () => {
		expect(matchesCards(['a', 'b'], cards(['a', 'b'], true))).toBe(true);
		expect(matchesCards(['a', 'b'], cards(['a', 'z'], true))).toBe(false);
	});

	it('matches nothing until a card is picked', () => {
		expect(matchesCards(['a'], cards([]))).toBe(false);
		expect(matchesCards(['a'], cards([], true))).toBe(false);
	});

	it('counts as nothing picked only for the kind being looked for', () => {
		const roland = new Set(['01001']);
		expect(pickedNothing({ products: new Set(), investigators: roland })).toBe(false);
		expect(pickedNothing({ ...cards([]), investigators: roland })).toBe(true);
		expect(pickedNothing(cards(['a']))).toBe(false);
	});

	it('finds the same decks whichever printing of a reprint is picked', () => {
		const coreDeck = deckCardCodes({ slots: { '12039': 2 }, sideSlots: {} });
		const carolynDeck = deckCardCodes({ slots: { '60267': 2 }, sideSlots: {} });
		for (const played of [coreDeck, carolynDeck]) {
			expect(matchesCards(played, cards(['12039']))).toBe(true);
			expect(matchesCards(played, cards(['60267']))).toBe(true);
		}
	});

	it('counts both printings of a reprint as one card when all are required', () => {
		expect(matchesCards(deckCardCodes({ slots: { '12039': 2 }, sideSlots: {} }), cards(['12039', '60267'], true))).toBe(true);
	});

	it('finds a reprint through its Core Set printing, and upgrades in the side deck', () => {
		expect(deckCardCodes({ slots: { '60267': 2 }, sideSlots: { '60275': 2 } })).toEqual([
			'12039',
			'60275'
		]);
	});
});

describe('cards to look for', () => {
	const all = getAllCards();
	const owned = pickableCards(all, new Set(productInvestigatorDeck));

	it('leaves out investigators, signature cards and weaknesses', () => {
		expect(owned.length).toBeGreaterThan(0);
		for (const card of owned) {
			expect(card.restrictions, card.name).toBeUndefined();
			expect(card.weakness, card.name).toBeUndefined();
			expect(card.cardType, card.name).not.toBe('investigator');
		}
	});

	it('only has the chosen products', () => {
		const products = new Set(owned.map((c) => c.product));
		expect([...products].sort()).toEqual([Product.CoreSet2026, ...productInvestigatorDeck].sort());
		const coreOnly = pickableCards(all, new Set());
		expect(new Set(coreOnly.map((c) => c.product))).toEqual(new Set([Product.CoreSet2026]));
		expect(coreOnly.length).toBeLessThan(owned.length);
	});

	it('lists each printing of a reprint when its product is chosen', () => {
		const printings = (cards: { name: string; xp?: number; code: string }[]) =>
			cards.filter((c) => c.name === 'Deduction' && c.xp === 0).map((c) => c.code);
		expect(printings(owned).sort()).toEqual(['12039', '60267']);
		expect(printings(pickableCards(all, new Set()))).toEqual(['12039']);
	});
});

describe('how each team member plays the picked cards', () => {
	const summary = (members: PrebuiltTeamSummary['members']) =>
		({ members }) as unknown as PrebuiltTeamSummary;
	const rambo = 'hungry-colquhoun/ch2-starter-guide/rancher-rambo';
	const team = summary([
		{ source: rambo, changes: [{ remove: '12094', add: '12080', copies: 2 }] },
		{ source: rambo }
	]);

	it('searches the team by what any member plays', () => {
		expect(teamCardCodes(team)).toContain('12080');
		expect(teamCardCodes(team)).toContain('12094');
		expect(teamCardCodes(summary([{ source: rambo, changes: [{ remove: '12094', add: '12080', copies: 2 }] }]))).not.toContain('12094');
	});
});
