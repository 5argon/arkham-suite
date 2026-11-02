import { environment, Product, productInvestigatorDeck } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { getAllCards } from '$lib/card-data';

import {
	chapterTwoChoice,
	environmentChoicePath,
	environmentChoices,
	environmentPointPages,
	matchingChoice,
	publishedEnvironmentPoints,
	releasedPoints,
	rotatingProducts
} from './environment-choices';

/**
 * Card data that has every product of the official catalog.
 */
const allOfficialCards = [
	Product.CoreSet2026,
	...productInvestigatorDeck,
	Product.PowerOfTheDreamlands
].map((product) => ({ product }));

describe('official catalog', () => {
	it('offers only Core Set and Evergreen products before anything rotating is released', () => {
		expect(environmentChoices('2026-11-01', allOfficialCards)).toEqual([
			{ kind: 'core', products: [] },
			{ kind: 'evergreen', id: 'evergreen', products: productInvestigatorDeck }
		]);
		expect(rotatingProducts('2026-11-01', allOfficialCards)).toEqual([]);
	});

	it('adds a Current choice once Power of the Dreamlands is released', () => {
		expect(environmentChoices('2027-02-19', allOfficialCards).at(-1)).toEqual({
			kind: 'current',
			id: 'potd',
			product: Product.PowerOfTheDreamlands,
			products: [...productInvestigatorDeck, Product.PowerOfTheDreamlands]
		});
		expect(rotatingProducts('2027-02-19', allOfficialCards)).toEqual([
			Product.PowerOfTheDreamlands
		]);
	});

	it('has every Evergreen product in Chapter 2 before anything rotating is released', () => {
		expect(chapterTwoChoice('2026-11-01', allOfficialCards)).toEqual({
			kind: 'chapter-two',
			products: productInvestigatorDeck
		});
	});

	it('adds each released rotating product to Chapter 2', () => {
		expect(chapterTwoChoice('2027-02-19', allOfficialCards).products).toEqual([
			...productInvestigatorDeck,
			Product.PowerOfTheDreamlands
		]);
	});

	it('waits for the card data of a released product', () => {
		const withoutItsCards = allOfficialCards.filter(
			(card) => card.product !== Product.PowerOfTheDreamlands
		);
		expect(
			publishedEnvironmentPoints('2027-02-19', withoutItsCards).map((point) => point.id)
		).toEqual(['evergreen']);
		expect(environmentChoices('2027-02-19', withoutItsCards).map((c) => c.kind)).toEqual([
			'core',
			'evergreen'
		]);
		expect(rotatingProducts('2027-02-19', withoutItsCards)).toEqual([]);
	});

	it('builds a page ahead of the release date once the card data has it', () => {
		expect(environmentPointPages(allOfficialCards).map((point) => point.id)).toEqual([
			'evergreen',
			'potd'
		]);
		expect(
			publishedEnvironmentPoints('2026-11-01', allOfficialCards).map((point) => point.id)
		).toEqual(['evergreen']);
	});

	it('lists a page only from its release date', () => {
		const pages = environmentPointPages(allOfficialCards);
		expect(releasedPoints(pages, '2027-02-18').map((point) => point.id)).toEqual(['evergreen']);
		expect(releasedPoints(pages, '2027-02-19').map((point) => point.id)).toEqual([
			'evergreen',
			'potd'
		]);
	});

	it('always has the Evergreen page in the real card data', () => {
		expect(environmentPointPages(getAllCards()).map((point) => point.id)).toContain('evergreen');
	});

	it('sends each choice to where its cards are', () => {
		const paths = environmentChoices('2027-02-19', allOfficialCards).map(environmentChoicePath);
		expect(paths).toEqual(['/player/core-2026', '/player/env/evergreen', '/player/env/potd']);
	});
});

describe('saturated catalog', () => {
	const [deckbuildingA, deckbuildingB, deckbuildingC] = [
		Product.CurseOfTheRougarou,
		Product.CarnevaleOfHorrors,
		Product.TheLabyrinthsOfLunacy
	];
	const [investigatorA, investigatorB] = [
		Product.TheDunwichLegacyInvestigatorExpansion,
		Product.ThePathToCarcosaInvestigatorExpansion
	];
	const catalog: environment.CurrentEnvironmentCatalog = {
		chapterTwo: [
			Product.CoreSet2026,
			Product.TommyMuldoon,
			deckbuildingA,
			deckbuildingB,
			deckbuildingC,
			investigatorA,
			investigatorB
		],
		evergreen: [Product.CoreSet2026, Product.TommyMuldoon],
		deckbuildingExpansions: [deckbuildingA, deckbuildingB, deckbuildingC],
		investigatorExpansions: [investigatorA, investigatorB],
		releaseDates: {
			[Product.CoreSet2026]: '2026-03-20',
			[Product.TommyMuldoon]: '2026-04-17',
			[deckbuildingA]: '2027-02-19',
			[investigatorA]: '2027-06-01',
			[deckbuildingB]: '2027-10-01',
			[investigatorB]: '2028-02-01',
			[deckbuildingC]: '2028-06-01'
		}
	};
	const cards = catalog.chapterTwo.map((product) => ({ product }));
	const currentProducts = (asOf: string) =>
		environmentChoices(asOf, cards, catalog)
			.filter((choice) => choice.kind === 'current')
			.map((choice) => choice.product);

	it('adds a Current choice for each release, keeping the older ones', () => {
		expect(currentProducts('2027-02-19')).toEqual([deckbuildingA]);
		expect(currentProducts('2027-06-01')).toEqual([deckbuildingA, investigatorA]);
		expect(currentProducts('2028-06-01')).toEqual([
			deckbuildingA,
			investigatorA,
			deckbuildingB,
			investigatorB,
			deckbuildingC
		]);
	});

	it('gives each Current choice its own pool, with older ones smaller until saturating', () => {
		const choices = environmentChoices('2027-06-01', cards, catalog);
		expect(choices.at(-2)?.products).toEqual([Product.TommyMuldoon, deckbuildingA]);
		expect(choices.at(-1)?.products).toEqual([Product.TommyMuldoon, deckbuildingA, investigatorA]);
		expect(matchingChoice(choices, [Product.TommyMuldoon, deckbuildingA])?.product).toBe(
			deckbuildingA
		);
	});

	it('keeps offering rotating products that rotated out, oldest first', () => {
		expect(rotatingProducts('2028-06-01', cards, catalog)).toEqual([
			deckbuildingA,
			investigatorA,
			deckbuildingB,
			investigatorB,
			deckbuildingC
		]);
	});
});

describe('matchingChoice', () => {
	const choices = environmentChoices('2027-02-19', allOfficialCards);

	it('matches regardless of order', () => {
		expect(matchingChoice(choices, [])?.kind).toBe('core');
		expect(matchingChoice(choices, [...productInvestigatorDeck].reverse())?.kind).toBe('evergreen');
		expect(
			matchingChoice(choices, [Product.PowerOfTheDreamlands, ...productInvestigatorDeck])?.kind
		).toBe('current');
	});

	it('matches nothing for a combination of products that is not a choice', () => {
		expect(matchingChoice(choices, [Product.TommyMuldoon])).toBeUndefined();
		expect(matchingChoice(choices, [Product.PowerOfTheDreamlands])).toBeUndefined();
	});
});
