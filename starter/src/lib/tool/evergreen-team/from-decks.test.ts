import { Product } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { getAllCards } from '../../card-data';
import { starterDeck } from '../../starter-content';
import { decodeEvergreen } from './codec';
import { decksToEvergreen } from './from-decks';

const allCards = getAllCards();

describe('decksToEvergreen', () => {
	it('keeps only the Investigator Decks the decks draw from', () => {
		// Core-only Trish + Daniela's guide deck (Core + Miguel + Tommy).
		const trish = starterDeck(
			'hungry-colquhoun',
			'ch2-core-only',
			'trish-scarborough-i-spy-a-seeker'
		)!;
		const daniela = starterDeck('hungry-colquhoun', 'ch2-starter-guide', 'hurting-for-clues')!;
		const only = decodeEvergreen(decksToEvergreen([trish.primary], allCards), allCards)!;
		expect(only.setup.deckProducts).toEqual([]);
		const both = decodeEvergreen(
			decksToEvergreen([trish.primary, daniela.primary], allCards),
			allCards
		)!;
		expect(both.setup.deckProducts.sort()).toEqual(
			[Product.TommyMuldoon, Product.MiguelDeLaCruz].sort()
		);
		expect(both.decks.map((d) => d.investigator)).toEqual(['12007', '12001']);
	});
});
