import { describe, expect, it } from 'vitest';
import type { Card } from '@5argon/arkham-kohaku';
import { cardPoolFor } from './card-pool';

const card = (code: string, cardType: string, extra: Partial<Card> = {}) =>
	({ code, cardType, ...extra }) as unknown as Card;

const CARDS = [
	card('01001', 'investigator'),
	card('01002', 'investigator'),
	card('01018', 'asset', { traits: ['Ally', 'Miskatonic'] }),
	card('01030', 'asset', { traits: ['Item'] }),
	card('01096', 'treachery', { subtypeCode: 'basicweakness', traits: ['Madness'] } as Partial<Card>),
	card('01097', 'treachery', { subtypeCode: 'basicweakness', traits: ['Injury'] } as Partial<Card>),
];
const codes = (cards: Card[]) => cards.map((c) => c.code);
const NO_ROSTER = new Set<string>();

describe('cardPoolFor', () => {
	it('offers everything without a filter', () => {
		expect(cardPoolFor(undefined, CARDS, NO_ROSTER)).toBe(CARDS);
	});

	it('matches traits case-insensitively OR explicit codes', () => {
		expect(codes(cardPoolFor({ traits: ['ally'] }, CARDS, NO_ROSTER))).toEqual(['01018']);
		expect(codes(cardPoolFor({ traits: ['Ally'], codes: ['01030'] }, CARDS, NO_ROSTER))).toEqual([
			'01018',
			'01030',
		]);
	});

	it('ANDs types and subtypes with the trait/code test', () => {
		expect(codes(cardPoolFor({ types: ['asset'] }, CARDS, NO_ROSTER))).toEqual(['01018', '01030']);
		expect(
			codes(cardPoolFor({ subtypes: ['basicweakness'], traits: ['Madness'] }, CARDS, NO_ROSTER)),
		).toEqual(['01096']);
		expect(codes(cardPoolFor({ types: ['asset'], codes: ['01096'] }, CARDS, NO_ROSTER))).toEqual([]);
	});

	it('narrows an investigator-only picker to the roster when there is one', () => {
		const filter = { types: ['investigator'] };
		expect(codes(cardPoolFor(filter, CARDS, new Set(['01002'])))).toEqual(['01002']);
		expect(codes(cardPoolFor(filter, CARDS, NO_ROSTER))).toEqual(['01001', '01002']);
	});
});
