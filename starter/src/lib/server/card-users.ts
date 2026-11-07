import { type Card, card as cardUtils, environment, productEvergreen } from '@5argon/arkham-kohaku';
import { FaIconType } from '@5argon/arkham-life-ui/icon-type';

import { getAllCards } from '$lib/card-data';

import {
	chainedComparisons,
	fieldsOf,
	mismatchedFields,
	tokenizeBuildQl,
	unknownWords
} from '$lib/review/buildql';

import sharedPresetsJson from '../starter-content/review/buildql-presets.json';

/**
 * Searches on arkham.build made for one card, dropped in its review folder as `buildql.json`.
 * Each preset is run once for every investigator who can take the card.
 */
export interface BuildQlJson {
	presets: BuildQlPresetUse[];
}

/**
 * A preset from the shared ones by its key, the same with `all` or a range set for this page, or one
 * written out for this card only.
 */
export type BuildQlPresetUse =
	| string
	| ({ preset: string; all?: boolean } & BuildQlRanges)
	| (BuildQlPresetJson & BuildQlRanges);

/**
 * Narrowing a preset down to some levels or costs. The label and the query both get it in the same
 * words everywhere, "Lv. 1~5" in front and "costed 2 or more" behind.
 */
export interface BuildQlRanges {
	/**
	 * From and to, both included, from 0 to 5. The same number twice is that level only.
	 */
	level?: [number, number];
	/**
	 * From and to, both included. To is null for no upper end, and a from of 0 leaves out X costs.
	 */
	cost?: [number, number | null];
	/**
	 * Only cards that give 2 or more icons to a test of one skill, counting [wild], so they're worth
	 * committing. The label gets "for a double commit".
	 */
	doubleCommit?: true;
}

/**
 * A card giving 2 or more icons to a test of one skill, counting [wild].
 */
const doubleCommitQuery = ['willpower', 'intellect', 'combat', 'agility']
	.map((skill) => `${skill} + wild >= 2`)
	.join(' | ');

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
	/**
	 * A `FaIconType` name shown before the label, for a search every investigator has, like
	 * "Health". A preset with one comes before those without.
	 */
	icon?: string;
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
	 * A `FaIconType` name, shown before the label.
	 */
	icon?: string;
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

/**
 * Presets used on more than one card, by key, in `buildql-presets.json` next to the card folders.
 */
const sharedPresets: Record<string, BuildQlPresetJson> = sharedPresetsJson;

/**
 * The preset a use stands for, or undefined for a key that isn't one.
 */
function presetOf(
	use: BuildQlPresetUse,
	shared: Record<string, BuildQlPresetJson> = sharedPresets
): BuildQlPresetJson | undefined {
	if (typeof use === 'string') return shared[use];
	if ('preset' in use) {
		const found = shared[use.preset];
		return found && withRanges({ ...found, all: use.all ?? found.all }, use);
	}
	return withRanges({ label: use.label, query: use.query, all: use.all, icon: use.icon }, use);
}

/**
 * A query whose outermost clauses are joined by `|`, which needs brackets before another `&`.
 */
function hasOuterOr(query: string): boolean {
	let depth = 0;
	for (const token of tokenizeBuildQl(query)) {
		if (token.text === '(') depth++;
		else if (token.text === ')') depth--;
		else if (token.kind === 'operator' && token.text === '|' && depth === 0) return true;
	}
	return false;
}

/**
 * "Asset" reads "asset" after "Lv. 1~5", while "[[Spell]] event" and "NPC" stay as they are.
 */
const afterPrefix = (label: string) =>
	/^[A-Z][a-z]/.test(label) ? label.charAt(0).toLowerCase() + label.slice(1) : label;

function withRanges(
	preset: BuildQlPresetJson,
	{ level, cost, doubleCommit }: BuildQlRanges
): BuildQlPresetJson {
	if (level === undefined && cost === undefined && doubleCommit === undefined) return preset;
	let label = preset.label;
	const clauses = [hasOuterOr(preset.query) ? `(${preset.query})` : preset.query];
	if (level !== undefined) {
		const [from, to] = level;
		label = `Lv. ${from === to ? from : `${from}~${to}`} ${afterPrefix(label)}`;
		clauses.push(from === to ? `xp = ${from}` : `xp >= ${from} & xp <= ${to}`);
	}
	if (cost !== undefined) {
		const [from, to] = cost;
		if (from === to) {
			label = `${label} costed exactly ${from}`;
			clauses.push(`cost = ${from}`);
		} else if (to === null) {
			label = `${label} costed ${from} or more`;
			clauses.push(`cost >= ${from}`);
		} else {
			label = `${label} costed ${from === 0 ? `${to} or less` : `${from}~${to}`}`;
			clauses.push(`cost >= ${from} & cost <= ${to}`);
		}
	}
	if (doubleCommit) {
		label = `${label} for a double commit`;
		clauses.push(`(${doubleCommitQuery})`);
	}
	return { ...preset, label, query: clauses.join(' & ') };
}

function isIconName(name: string): boolean {
	return Object.keys(FaIconType).includes(name) && Number.isNaN(Number(name));
}

function rangeProblems({ level, cost, doubleCommit }: BuildQlRanges, where: string): string[] {
	const problems: string[] = [];
	if (doubleCommit !== undefined && doubleCommit !== true) {
		problems.push(`${where}: doubleCommit is only ever true`);
	}
	const whole = (n: unknown) => Number.isInteger(n) && (n as number) >= 0;
	if (level !== undefined) {
		const [from, to] = Array.isArray(level) ? level : [];
		if (!whole(from) || !whole(to) || from! > to! || to! > 5) {
			problems.push(`${where}: level needs [from, to], from 0 to 5`);
		}
	}
	if (cost !== undefined) {
		const [from, to] = Array.isArray(cost) ? cost : [];
		if (!whole(from) || (to !== null && (!whole(to) || from! > to!))) {
			problems.push(`${where}: cost needs [from, to], with to null for no upper end`);
		}
	}
	return problems;
}

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
	const presets = json.presets.map((use) => presetOf(use)).filter((preset) => preset !== undefined);
	return presets.flatMap(({ label, query, all, icon }) => {
		const shown = icon === undefined ? {} : { icon };
		if (onlyFor && all && !query.includes(investigatorPlaceholder)) {
			return [
				{ label: `${label} (Usable)`, ...shown, query: `(${query})`, searches },
				{
					label: `${label} (All)`,
					...shown,
					query: `(${query})`,
					searches: [{ prefix: 'ch = 2 &', row: 0 }]
				}
			];
		}
		if (!query.includes(investigatorPlaceholder)) {
			return { label, ...shown, query: `(${query})`, searches };
		}
		// The query says itself what to do with the investigator, like `ia != "{ia}"` for what they
		// can't take yet, so it isn't limited to what they can take, and there's no search without one.
		return {
			label,
			...shown,
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

/**
 * What's wrong with one preset's label and query, written out on a card or shared.
 */
function presetProblems(preset: BuildQlPresetJson, where: string): string[] {
	const problems: string[] = [];
	if (preset.icon !== undefined && !isIconName(preset.icon)) {
		problems.push(
			`${where}: ${preset.label} has the icon ${preset.icon}, which isn't a FaIconType`
		);
	}
	if (typeof preset.label !== 'string' || preset.label.trim() === '') {
		problems.push(`${where}: a preset needs a label`);
	}
	if (typeof preset.query !== 'string' || preset.query.trim() === '') {
		problems.push(`${where}: ${preset.label} needs a query`);
		return problems;
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
	for (const chained of chainedComparisons(tokens)) {
		const list = { '=': '?', '==': '??', '!=': '!?', '!==': '!??' }[chained.split(' ')[1]];
		problems.push(
			`${where}: ${preset.label} chains ${chained} more than once, use ${chained.split(' ')[0]} ${list} [...]`
		);
	}
	if (!balanced(preset.query)) {
		problems.push(`${where}: ${preset.label} has unbalanced parentheses`);
	}
	// Traits, the type and factions are each a whole value, so only an exact comparison is right,
	// and the legend then tells a reader so. A slot isn't: `slot = "hand"` also finds "Hand x2".
	const whole: Record<string, string> = {
		Trait: 'a trait',
		Type: 'the type',
		Faction: 'a faction'
	};
	for (const field of fieldsOf(tokens)) {
		if (field.name in whole && field.match === 'fuzzy') {
			problems.push(
				`${where}: ${preset.label} compares ${whole[field.name]} with = or !=, use == or !==`
			);
		}
	}
	if (fieldsOf(tokens).some((field) => ['XP', 'Level', 'Cost'].includes(field.name))) {
		problems.push(`${where}: ${preset.label} narrows the level or cost itself, use level or cost`);
	}
	return problems;
}

/**
 * @param files Each card's `buildql.json` by card code, the real ones unless testing.
 * @param shared The shared presets, the real ones unless testing.
 */
export function buildQlProblems(
	pageCodes: ReadonlySet<string>,
	files: ReadonlyMap<string, BuildQlJson> = buildQlByCode,
	shared: Record<string, BuildQlPresetJson> = sharedPresets
): string[] {
	const problems: string[] = [];
	const sharedFile = 'buildql-presets.json';
	const sharedKeyOf = new Map<string, string>();
	const sharedLabels = new Map<string, string>();
	for (const [key, preset] of Object.entries(shared)) {
		problems.push(...presetProblems(preset, `${sharedFile} ${key}`));
		if ('level' in preset || 'cost' in preset || 'doubleCommit' in preset) {
			problems.push(`${sharedFile} ${key}: a range goes where the preset is used`);
		}
		sharedKeyOf.set(`${preset.label}\n${preset.query}`, key);
		const other = sharedLabels.get(preset.label);
		if (other !== undefined) problems.push(`${sharedFile}: ${other} and ${key} share a label`);
		sharedLabels.set(preset.label, key);
	}
	const usedKeys = new Set<string>();
	// Written out the same on more than one card, ranges aside: it belongs with the shared ones.
	const writtenOn = new Map<string, Set<string>>();
	for (const [code, json] of files) {
		const where = `${code}/buildql.json`;
		if (!pageCodes.has(code)) problems.push(`${where}: ${code} has no card page`);
		if (!Array.isArray(json.presets) || json.presets.length === 0) {
			problems.push(`${where}: needs presets`);
			continue;
		}
		const labels = new Set<string>();
		// Presets with an icon, which every investigator has, come first. Then within those and
		// within the rest, shared presets come in the order of the shared file, so related ones sit
		// together.
		let lastShared: { key: string; index: number } | undefined;
		let withoutIcon: string | undefined;
		let inIconBlock = true;
		for (const use of json.presets) {
			const key = typeof use === 'string' ? use : 'preset' in use ? use.preset : undefined;
			if (key !== undefined) usedKeys.add(key);
			const preset = presetOf(use, shared);
			if (preset === undefined) {
				problems.push(`${where}: ${key} isn't a shared preset`);
				continue;
			}
			const misplacedIcon = preset.icon !== undefined && withoutIcon !== undefined;
			if (misplacedIcon) {
				problems.push(`${where}: ${preset.label} has an icon, so it goes before ${withoutIcon}`);
			}
			if (preset.icon === undefined && inIconBlock) {
				inIconBlock = false;
				withoutIcon = preset.label;
				lastShared = undefined;
			}
			const index = key === undefined ? -1 : Object.keys(shared).indexOf(key);
			if (index >= 0 && !misplacedIcon) {
				if (lastShared !== undefined && index < lastShared.index) {
					problems.push(
						`${where}: ${key} comes before ${lastShared.key} in ${sharedFile}, so put it first here too`
					);
				}
				lastShared = { key: key!, index };
			}
			if (labels.has(preset.label)) problems.push(`${where}: repeats the label ${preset.label}`);
			labels.add(preset.label);
			if (typeof use !== 'string') problems.push(...rangeProblems(use, where));
			if (key !== undefined || typeof use === 'string' || 'preset' in use) continue;
			// Checked as written, before any range is added.
			problems.push(...presetProblems(use, where));
			const written = `${use.label}\n${use.query}`;
			const sameAs = sharedKeyOf.get(written);
			if (sameAs !== undefined) {
				problems.push(`${where}: ${use.label} is the shared preset ${sameAs}, use its key`);
			} else if (sharedLabels.has(use.label)) {
				problems.push(
					`${where}: ${use.label} has the label of the shared preset ${sharedLabels.get(use.label)} with another query`
				);
			}
			writtenOn.set(written, (writtenOn.get(written) ?? new Set()).add(code));
		}
	}
	for (const [written, codes] of writtenOn) {
		if (codes.size > 1) {
			problems.push(
				`${[...codes].join(', ')}: ${written.split('\n')[0]} is written out on each, share it in ${sharedFile}`
			);
		}
	}
	for (const key of Object.keys(shared)) {
		if (!usedKeys.has(key)) problems.push(`${sharedFile}: ${key} isn't used by any card`);
	}
	return problems;
}
