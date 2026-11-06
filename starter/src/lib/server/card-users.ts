import { type Card, card as cardUtils, environment, productEvergreen } from '@5argon/arkham-kohaku';

import { getAllCards } from '$lib/card-data';

import { fieldsOf, mismatchedFields, tokenizeBuildQl, unknownWords } from '$lib/review/buildql';

/**
 * Searches on arkham.build made for one card, dropped in its review folder as `buildql.json`.
 * Each preset is run once for every investigator who can take the card.
 */
export interface BuildQlJson {
	presets: BuildQlPresetJson[];
}

export interface BuildQlPresetJson {
	/**
	 * What the search finds, the same words for every investigator.
	 */
	label: string;
	/**
	 * A BuildQL query, without the chapter and the investigator. Those are added for each investigator.
	 */
	query: string;
	/**
	 * On a page for one investigator only, like a signature card's, also offer the search without
	 * them, for cards that help others too. The two are told apart as "(Usable)" and "(All)".
	 */
	all?: boolean;
}

export interface CardUserSlot {
	card: Card;
	canTake: boolean;
}

/**
 * Every investigator of the latest point of the Current environment, in rows, laid out two ways.
 */
export interface CardUsers {
	/**
	 * For narrow screens. A product's investigators share a row, as do investigators sold one per
	 * product. Rows are as wide as the product with the most investigators, at least 5, so each
	 * product starts a row of its own.
	 */
	columns: number;
	rows: CardUserSlot[][];
	/**
	 * For wide screens, at least 12 wide: the Evergreen investigators, then the rest.
	 */
	wideColumns: number;
	wideRows: CardUserSlot[][];
}

/**
 * One preset run for one investigator, or for none. The whole query is the prefix, a space, then
 * the topic's query.
 */
export interface BuildQlSearch {
	/**
	 * The investigator it's for, as a card square. Left out for the search without one.
	 */
	card?: Card;
	/**
	 * The start of the query every preset shares: the chapter, and the investigator if any.
	 */
	prefix: string;
	/**
	 * The row it goes on: the search without an investigator and the first product's investigators
	 * share the first, then each product's investigators start their own, like the Users grid.
	 */
	row: number;
	/**
	 * This search's own query, for a preset that names the investigator itself with `{ia}`.
	 * Otherwise the topic's query is used.
	 */
	query?: string;
}

/**
 * A preset: what it finds, then the search without an investigator, then one for each investigator
 * who can take the card.
 */
export interface BuildQlTopic {
	label: string;
	/**
	 * What the preset is about, in brackets, the same for every search.
	 */
	query: string;
	searches: BuildQlSearch[];
}

const buildQlFiles = import.meta.glob<BuildQlJson>(
	'../starter-content/review/card/*/buildql.json',
	{
		eager: true,
		import: 'default'
	}
);

const buildQlByCode = new Map(
	Object.entries(buildQlFiles).map(([path, json]) => [path.split('/').at(-2)!, json])
);

const allCards = getAllCards();

/**
 * The latest point as of building the site, so a rotation shows once the site is built again.
 */
const latestPoint = environment.currentEnvironmentVersions(new Date()).at(-1);

const heavyFields = ['deckOptions', 'deckRequirements', 'sideDeckOptions', 'sideDeckRequirements'];

/**
 * Leaves out empty fields and the given ones. A card has around 70 fields, mostly empty, and each
 * name is written out again for every card sent.
 */
function compact(card: Card, leaveOut: string[]): Card {
	return Object.fromEntries(
		Object.entries(card).filter(([key, value]) => value !== undefined && !leaveOut.includes(key))
	) as unknown as Card;
}

/**
 * A card to send to a page, for a card square, a card line or a scan. Deck-building details and the
 * investigators a signature card belongs to are most of an investigator's or a signature's data,
 * and nothing shown needs them: a card line only counts the investigators.
 */
export function slimCard(card: Card): Card {
	const slim = compact(card, heavyFields);
	if (card.restrictions) {
		slim.restrictions = {
			...card.restrictions,
			investigator: card.restrictions.investigator.map((investigator) =>
				compact(investigator, [...heavyFields, 'restrictions'])
			)
		};
	}
	return slim;
}

/**
 * All a card square and the card line shown when hovering it need.
 */
function squareCard(card: Card): Card {
	const { code, name, subname, cardClass, cardType, product, position, xp } = card;
	return compact({ code, name, subname, cardClass, cardType, product, position, xp } as Card, []);
}

function investigatorsOf(products: readonly string[]): Card[][] {
	return products
		.map((product) =>
			allCards
				.filter(
					(card) => card.product === product && cardUtils.deckbuildingInvestigatorCardsFilter(card)
				)
				.sort((a, b) => a.code.localeCompare(b.code))
		)
		.filter((investigators) => investigators.length > 0);
}

function groupsOf(products: readonly string[]): Card[][] {
	const result: Card[][] = [];
	let singles: Card[] = [];
	for (const investigators of investigatorsOf(products)) {
		if (investigators.length === 1) {
			singles.push(investigators[0]);
			continue;
		}
		if (singles.length > 0) result.push(singles);
		singles = [];
		result.push(investigators);
	}
	if (singles.length > 0) result.push(singles);
	return result;
}

const latestProducts = latestPoint?.products ?? [];
const evergreenGroups = groupsOf(latestProducts.filter((p) => productEvergreen.includes(p)));
const rotatingGroups = groupsOf(latestProducts.filter((p) => !productEvergreen.includes(p)));
const groups = [...evergreenGroups, ...rotatingGroups];

const columns = Math.max(
	5,
	...investigatorsOf(latestProducts).map((investigators) => investigators.length)
);

const wideColumns = Math.max(12, evergreenGroups.flat().length, rotatingGroups.flat().length);

const currentInvestigators = groups.flat();

/**
 * Which row of a preset an investigator's square goes on, by the product group they're in.
 */
const rowOf = new Map(groups.flatMap((group, i) => group.map((card) => [card.code, i] as const)));

/**
 * Whether any choice the investigator makes when building a deck lets them take the card.
 */
function canTake(investigator: Card, card: Card): boolean {
	return cardUtils
		.expandInvestigatorMetas(investigator)
		.some((expanded) => cardUtils.canUse(expanded.investigator, expanded.meta, card));
}

/**
 * Investigators and weaknesses aren't something to take into a deck.
 */
function hasUsers(card: Card): boolean {
	return !cardUtils.deckbuildingInvestigatorCardsFilter(card) && !cardUtils.weaknessesFilter(card);
}

export function cardUsers(card: Card): CardUsers | undefined {
	if (!hasUsers(card) || currentInvestigators.length === 0) return undefined;
	// The same slots in both layouts, so the page carries each investigator once.
	const slotOf = new Map(
		currentInvestigators.map((investigator) => [
			investigator.code,
			{ card: squareCard(investigator), canTake: canTake(investigator, card) }
		])
	);
	const slotsOf = (investigators: Card[]) => investigators.map((i) => slotOf.get(i.code)!);
	const rows = groups.flatMap((group) => {
		const slots = slotsOf(group);
		const chunks: CardUserSlot[][] = [];
		for (let i = 0; i < slots.length; i += columns) chunks.push(slots.slice(i, i + columns));
		return chunks;
	});
	const wideRows = [evergreenGroups.flat(), rotatingGroups.flat()]
		.filter((investigators) => investigators.length > 0)
		.map(slotsOf);
	return { columns, rows, wideColumns, wideRows };
}

/**
 * Who a card's presets are run for: an investigator for themselves, no one for a weakness, and
 * otherwise each investigator of the latest point who can take it.
 */
function presetInvestigators(card: Card): Card[] {
	if (cardUtils.deckbuildingInvestigatorCardsFilter(card)) return [card];
	if (cardUtils.weaknessesFilter(card)) return [];
	return currentInvestigators.filter((investigator) => canTake(investigator, card));
}

export function buildQlTopics(card: Card): BuildQlTopic[] {
	const json = buildQlByCode.get(card.code);
	if (json === undefined) return [];
	// The same objects in every topic, so the page carries each once.
	const investigators = presetInvestigators(card).map((investigator) => ({
		code: investigator.code,
		card: squareCard(investigator)
	}));
	const forInvestigators = investigators.map(({ code, card }) => ({
		card,
		prefix: `ch = 2 & ia = "${code}" &`,
		row: rowOf.get(code) ?? 0
	}));
	// An investigator's own page, or a card only certain investigators can take like a signature
	// card, is about them already, so there's no search without them.
	const onlyFor =
		cardUtils.deckbuildingInvestigatorCardsFilter(card) ||
		(card.restrictions?.investigatorCardCodes.length ?? 0) > 0;
	const searches: BuildQlSearch[] = onlyFor
		? forInvestigators
		: [{ prefix: 'ch = 2 &', row: 0 }, ...forInvestigators];
	return json.presets.flatMap(({ label, query, all }) => {
		if (onlyFor && all && !query.includes(investigatorPlaceholder)) {
			return [
				{ label: `${label} (Usable)`, query: `(${query})`, searches },
				{ label: `${label} (All)`, query: `(${query})`, searches: [{ prefix: 'ch = 2 &', row: 0 }] }
			];
		}
		if (!query.includes(investigatorPlaceholder)) return { label, query: `(${query})`, searches };
		// The query says itself what to do with the investigator, like `ia != "{ia}"` for what they
		// can't take yet, so it isn't limited to what they can take, and there's no search without one.
		return {
			label,
			query: `(${query})`,
			searches: investigators.map(({ code, card }) => ({
				card,
				prefix: 'ch = 2 &',
				row: rowOf.get(code) ?? 0,
				query: `(${query.replaceAll(investigatorPlaceholder, code)})`
			}))
		};
	});
}

/**
 * Stands for the investigator of each search in a preset's query.
 */
const investigatorPlaceholder = '{ia}';

function balanced(query: string): boolean {
	let depth = 0;
	for (const char of query.replace(/"[^"]*"|'[^']*'|\/[^/]*\//g, '')) {
		if (char === '(') depth++;
		if (char === ')') depth--;
		if (depth < 0) return false;
	}
	return depth === 0;
}

export function buildQlProblems(pageCodes: ReadonlySet<string>): string[] {
	const problems: string[] = [];
	for (const [code, json] of buildQlByCode) {
		const where = `${code}/buildql.json`;
		if (!pageCodes.has(code)) problems.push(`${where}: ${code} has no card page`);
		if (!Array.isArray(json.presets) || json.presets.length === 0) {
			problems.push(`${where}: needs presets`);
			continue;
		}
		const labels = new Set<string>();
		for (const preset of json.presets) {
			if (typeof preset.label !== 'string' || preset.label.trim() === '') {
				problems.push(`${where}: a preset needs a label`);
			} else if (labels.has(preset.label)) {
				problems.push(`${where}: repeats the label ${preset.label}`);
			} else {
				labels.add(preset.label);
			}
			if (typeof preset.query !== 'string' || preset.query.trim() === '') {
				problems.push(`${where}: ${preset.label} needs a query`);
				continue;
			}
			const tokens = tokenizeBuildQl(preset.query);
			const added = fieldsOf(tokens).filter(
				(field) =>
					field.name === 'Chapter' ||
					(field.name === 'Investigator Access' && !preset.query.includes(investigatorPlaceholder))
			);
			if (added.length > 0) {
				problems.push(
					`${where}: ${preset.label} sets the chapter or investigator, which is added for it`
				);
			}
			for (const word of unknownWords(tokens)) {
				problems.push(`${where}: ${preset.label} has ${word}, which isn't a BuildQL field`);
			}
			for (const comparison of mismatchedFields(tokens)) {
				problems.push(
					`${where}: ${preset.label} compares ${comparison}, fields of different types, which arkham.build can't`
				);
			}
			if (!balanced(preset.query)) {
				problems.push(`${where}: ${preset.label} has unbalanced parentheses`);
			}
		}
	}
	return problems;
}
