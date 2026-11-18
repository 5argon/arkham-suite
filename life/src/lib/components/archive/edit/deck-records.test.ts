import { describe, expect, it } from 'vitest';
import { linearizeDeck, type AhdbDeck } from '@5argon/arkham-kohaku';
import { createCardResolver } from '$lib/card-data';
import type { DeckVersion } from '$lib/database/document';
import { buildDeckFromVersions } from './deck-records';

function version(
	sequenceIndex: number,
	id: number | string,
	links: Pick<AhdbDeck, 'previous_deck' | 'next_deck'> = { previous_deck: null, next_deck: null }
): DeckVersion {
	const deck: AhdbDeck = {
		id,
		name: `Roland v${sequenceIndex}`,
		date_creation: '2024-01-01T00:00:00Z',
		date_update: '2024-01-01T00:00:00Z',
		description_md: '',
		user_id: null,
		investigator_code: '01001',
		investigator_name: 'Roland Banks',
		slots: { '01006': 1 },
		sideSlots: null,
		ignoreDeckLimitSlots: null,
		version: '1.0',
		xp: sequenceIndex,
		xp_spent: null,
		xp_adjustment: null,
		exile_string: null,
		taboo_id: null,
		meta: '{}',
		tags: '',
		...links
	};
	return { sequenceIndex, ahdbJson: JSON.stringify(deck) };
}

const chainOf = (versions: DeckVersion[]) => {
	const deck = buildDeckFromVersions(versions, createCardResolver(), []);
	return deck ? linearizeDeck(deck).map((d) => d.name) : null;
};

describe('buildDeckFromVersions', () => {
	it('chains versions by their order when they carry no links', () => {
		expect(chainOf([version(2, 30), version(0, 10), version(1, 20)])).toEqual([
			'Roland v0',
			'Roland v1',
			'Roland v2'
		]);
	});

	it('builds a kept last version whose links point at dropped versions', () => {
		expect(chainOf([version(0, 30, { previous_deck: 20, next_deck: null })])).toEqual([
			'Roland v0'
		]);
	});

	it('keeps versions that share an id apart', () => {
		expect(chainOf([version(0, 'x'), version(1, 'x')])).toEqual(['Roland v0', 'Roland v1']);
	});
});
