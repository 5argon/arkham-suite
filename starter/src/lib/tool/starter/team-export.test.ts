import { Product } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { getAllCards } from '$lib/card-data';
import { starterDeck } from '$lib/starter-content';
import { defaultTeamInfo } from '$lib/tool/evergreen-team/team-info';

import { starterTeamState } from './team-export';

function stateOf(series: string, slug: string) {
	return starterTeamState({
		entries: [starterDeck('hungry-colquhoun', series, slug)!],
		allCards: getAllCards(),
		info: defaultTeamInfo()
	}).state;
}

describe('starterTeamState', () => {
	it('adds nothing beyond the Core Set for a deck that only needs it', () => {
		const { setup } = stateOf('ch2-core-only', 'daniela-reyes-arkham-linebacker');
		expect(setup.core).toBe(Product.CoreSet2026);
		expect(setup.deckProducts).toEqual([]);
		expect(setup.extraProducts).toEqual([]);
	});

	it('includes the products a deck needs', () => {
		const { setup } = stateOf('ch2-starter-guide', 'rancher-rambo');
		expect(setup.deckProducts).toEqual([Product.MiguelDeLaCruz]);
	});
});
