import { CardResolver, linkedAhdbDeckToDeck } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { getAllCards, loadAllTabooLists } from '../../card-data';
import { starterDeck } from '../../starter-content';
import { hasUniqueInvestigatorClasses } from './filter';

const resolver = new CardResolver(getAllCards(), null);

function deck(slug: string) {
	const entry = starterDeck('hungry-colquhoun', 'ch2-starter-guide', slug)!;
	return linkedAhdbDeckToDeck({ deck: entry.primary }, resolver, loadAllTabooLists());
}

describe('Team Assembler filters', () => {
	it('accepts a team whose investigators all have different primary classes', () => {
		expect(
			hasUniqueInvestigatorClasses([
				deck('hurting-for-clues'),
				deck('shoot-first-questions-later'),
				deck('pocket-sand'),
				deck('a-faustian-bargain')
			])
		).toBe(true);
	});

	it('rejects a team when an investigator class repeats', () => {
		expect(
			hasUniqueInvestigatorClasses([deck('hurting-for-clues'), deck('got-yourself-a-gun')])
		).toBe(false);
	});
});
