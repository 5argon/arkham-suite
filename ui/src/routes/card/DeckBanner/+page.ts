import { ahdbTabooToTaboo, linkedAhdbDeckToDeck, service, type Deck, type Taboo } from '@5argon/arkham-kohaku';
import type { PageLoad } from './$types.js';
import { CardResolver, type AhdbTaboo } from '@5argon/arkham-kohaku';
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
		testDecks: {
			mary: createDeckPromise('https://arkhamdb.com/deck/view/4386681'),
			mandy: createDeckPromise('https://arkhamdb.com/deck/view/4098464'),
			carson: createDeckPromise('https://arkhamdb.com/deck/view/3423162'),
			proland: createDeckPromise('https://arkhamdb.com/deck/view/3335114'),
			lola: createDeckPromise('https://arkhamdb.com/deck/view/3017659'),
			lily: createDeckPromise('https://arkhamdb.com/deck/view/2690372'),
			lily2: createDeckPromise('https://arkhamdb.com/deck/view/2284002'),
			amanda: createDeckPromise('4386024'),
			akachi: createDeckPromise('3008622'),
			pom2: createDeckPromise('2904156'),
			pom3: createDeckPromise('2660976'),
			pom4: createDeckPromise('2524297'),
			fern: createDeckPromise('https://arkhamdb.com/deck/view/4199021'),
			zoeyRichards: createDeckPromise('https://arkhamdb.com/deck/view/3651411'),
			wilson: createDeckPromise('https://arkhamdb.com/deck/view/3643009'),
			hank: createDeckPromise('https://arkhamdb.com/deck/view/3620289'),
			parDaisy: createDeckPromise('https://arkhamdb.com/deck/view/3532966'),
			chicago: createDeckPromise('https://arkhamdb.com/deck/view/3374550'),
			joeResearch: createDeckPromise('https://arkhamdb.com/deck/view/3256885'),
			anotherVincent: createDeckPromise('https://arkhamdb.com/deck/view/3095356'),
			rex: createDeckPromise('https://arkhamdb.com/deck/view/2892702'),
			seekerCarson: createDeckPromise('https://arkhamdb.com/deck/view/3039823'),
			pete: createDeckPromise('https://arkhamdb.com/deck/view/2690370'),
			agnesParallel: createDeckPromise('https://arkhamdb.com/deck/view/2627640')
		}
	};
};
