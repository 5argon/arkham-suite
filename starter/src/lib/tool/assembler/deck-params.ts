import { starterDeckFromRef } from '../../starter-content';

/**
 * Most decks one Team Assembler URL can make the server fetch from elsewhere.
 * Decks hosted on this site resolve locally, so they don't count.
 */
export const MAX_FETCHED_DECKS = 20;

/**
 * The decks to pre-load from Team Assembler's p1, p2, ... parameters, in that
 * order.
 */
export function deckParamsFrom(searchParams: URLSearchParams): string[] {
	const params = [...searchParams]
		.filter(([key, value]) => /^p\d+$/.test(key) && value !== '')
		.sort(([a], [b]) => Number(a.slice(1)) - Number(b.slice(1)))
		.map(([, value]) => value);

	const deckParams: string[] = [];
	let fetchedDecks = 0;
	for (const param of params) {
		if (starterDeckFromRef(param) !== undefined) {
			deckParams.push(param);
		} else if (fetchedDecks < MAX_FETCHED_DECKS) {
			deckParams.push(param);
			fetchedDecks++;
		}
	}
	return deckParams;
}
