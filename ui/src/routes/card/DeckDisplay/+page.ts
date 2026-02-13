import { ahdbTabooToTaboo, linkedAhdbDeckToDeck, service, type Deck, type Taboo } from '@5argon/arkham-kohaku';
import type { PageLoad } from './$types.js';
import { CardResolver } from '@5argon/arkham-kohaku';
import { allCards, allAhdbTaboos } from '../card-data';

export const load: PageLoad = ({ fetch }) => {
	const resolver = new CardResolver(allCards);
	const allTaboo : Taboo[] = allAhdbTaboos.map((t) => ahdbTabooToTaboo(t));
	function createDeckPromise(inputString: string): Promise<Deck> {
		return service.fetchDeckRecursive(fetch, inputString).then((deck) => {
			return linkedAhdbDeckToDeck(deck, resolver, allTaboo);
		});
	}
	return {
		resolvedCards: resolver.allResolvedCards(),
		testDecks: {
			mary: createDeckPromise('https://arkhamdb.com/deck/view/4386681'),
			mandy: createDeckPromise('https://arkhamdb.com/deck/view/4098464'),
			carson: createDeckPromise('https://arkhamdb.com/deck/view/3423162'),
		}
	};
};
