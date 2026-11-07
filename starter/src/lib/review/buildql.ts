import { service } from '@5argon/arkham-kohaku';

/**
 * Just enough of arkham.build's BuildQL to color a query and say what its fields are. Pages get
 * queries as text and do this in the browser: the pieces are many times the size of the text.
 * https://github.com/arkham-build/arkham.build/blob/main/frontend/src/store/lib/buildql/buildql.md
 */

export type BuildQlTokenKind =
	| 'field'
	| 'operator'
	| 'string'
	| 'regex'
	| 'number'
	| 'keyword'
	| 'paren'
	| 'list'
	| 'space'
	| 'other';

export interface BuildQlToken {
	kind: BuildQlTokenKind;
	text: string;
}

export interface BuildQlField {
	/**
	 * As written in the query.
	 */
	alias: string;
	/**
	 * The field's full name, like "Investigator Access".
	 */
	name: string;
	/**
	 * How a text or string field is compared. `=` looks for the words in order a little apart, each
	 * maybe part of a longer word; `==` for the text exactly as written. Either against a regex is a
	 * pattern instead. Left out for numbers,
	 * true-or-false fields and codes, where the two are the same in practice.
	 */
	match?: 'fuzzy' | 'exact' | 'pattern';
	/**
	 * Compared with `!=`, `!==` or a negated list, which finds the cards that don't match.
	 */
	negated?: boolean;
	/**
	 * Compared with a list, `?` or `??`, which matches any of it, or with `!?` or `!??`, none of it.
	 */
	list?: boolean;
	/**
	 * The operator it was first used with, for a field listed once for each way it's compared.
	 */
	operator?: string;
}

/**
 * Each field by its full name, with the shorter names it also goes by.
 */
const fieldAliases: Record<string, string[]> = {
	agility: ['ag', 'foot', 'a'],
	bonded: ['bo'],
	chapter: ['ch'],
	clues: ['cl'],
	combat: ['cb', 'fist', 'c'],
	cost: ['co', 'o'],
	customizable: ['cus'],
	cycle: ['cy', 'y'],
	damage: ['dmg'],
	deck_limit: ['dl', 'limit'],
	doom: ['do'],
	encounter_set: ['en', 'encounter', 'set'],
	errata: [],
	evade: ['ev'],
	exceptional: ['ex'],
	exile: ['exl'],
	faction: ['cls', 'class', 'f'],
	fight: ['fi'],
	flavor: ['fl', 'v'],
	has_upgrade: ['hu'],
	heals_damage: ['hd'],
	heals_horror: ['hh'],
	health: ['hp', 'h'],
	horror: ['ho'],
	id: ['code'],
	illustrator: ['il', 'illu', 'l'],
	intellect: ['in', 'int', 'book', 'i'],
	investigator_access: ['ia'],
	in_deck: [],
	in_side_deck: [],
	favorite: ['fav'],
	is_upgrade: ['iu'],
	level: ['lvl', 'p'],
	multiclass: ['mu', 'multi'],
	myriad: ['my'],
	name: ['na'],
	pack: ['pa', 'e'],
	permanent: ['pe', 'perm'],
	quantity: ['qt', 'qty'],
	reverse_type: ['rt'],
	sanity: ['sa', 's'],
	shroud: ['sh'],
	slot: ['sl', 'z'],
	specialist: ['sp'],
	stage: ['sg'],
	subname: ['sn'],
	subtype: ['st', 'b'],
	taboo_set: ['ts'],
	tag: [],
	text: ['txt', 'x'],
	trait: ['tr', 'k'],
	type: ['ty', 't'],
	unique: ['un', 'u'],
	vengeance: ['ve'],
	victory: ['vp', 'j'],
	wild: ['wd', 'd'],
	willpower: ['wp', 'will', 'brain', 'w'],
	xp: []
};

/**
 * Fields whose `=` is fuzzy, from the field list of the BuildQL docs. Codes are left out.
 */
const comparedAsText = new Set([
	'cycle',
	'encounter_set',
	'faction',
	'illustrator',
	'name',
	'pack',
	'reverse_type',
	'slot',
	'subname',
	'subtype',
	'taboo_set',
	'tag',
	'trait',
	'type',
	'flavor',
	'text'
]);

const fuzzyOperators = ['=', '!=', '?', '!?'];
const exactOperators = ['==', '!==', '??', '!??'];

const fieldByAlias = new Map<string, string>(
	Object.entries(fieldAliases).flatMap(([field, aliases]) =>
		[field, ...aliases].map((alias) => [alias, field] as const)
	)
);

/**
 * Names written in capitals rather than as a word.
 */
const abbreviations: Record<string, string> = { xp: 'XP', id: 'ID' };

/**
 * Fields read out differently from their name: on a player card the skill fields count its icons.
 */
const names: Record<string, string> = {
	willpower: 'Willpower icon',
	intellect: 'Intellect icon',
	combat: 'Combat icon',
	agility: 'Agility icon',
	wild: 'Wild icon'
};

function displayName(field: string): string {
	if (names[field] !== undefined) return names[field];
	return field
		.split('_')
		.map((word) => abbreviations[word] ?? word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

const operators = ['!??', '!==', '!=', '==', '!?', '??', '>=', '<=', '=', '?', '>', '<', '&', '|'];
const arithmetic = ['+', '-', '*', '/', '%'];

export function tokenizeBuildQl(query: string): BuildQlToken[] {
	const tokens: BuildQlToken[] = [];
	const lastMeaningful = () => tokens.filter((token) => token.kind !== 'space').at(-1);
	let i = 0;
	while (i < query.length) {
		const rest = query.slice(i);
		const take = (kind: BuildQlTokenKind, text: string) => {
			tokens.push({ kind, text });
			i += text.length;
		};
		const space = /^\s+/.exec(rest);
		if (space) {
			take('space', space[0]);
			continue;
		}
		const quoted = /^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/.exec(rest);
		if (quoted) {
			take('string', quoted[0]);
			continue;
		}
		const previous = lastMeaningful();
		const regexAllowed =
			previous === undefined ||
			previous.kind === 'operator' ||
			(previous.kind === 'paren' && previous.text === '(') ||
			(previous.kind === 'list' && previous.text !== ']');
		const regex = /^\/(?:[^/\\]|\\.)+\//.exec(rest);
		if (regex && regexAllowed) {
			take('regex', regex[0]);
			continue;
		}
		const operator = [...operators, ...arithmetic].find((op) => rest.startsWith(op));
		if (operator) {
			take('operator', operator);
			continue;
		}
		if (rest[0] === '(' || rest[0] === ')') {
			take('paren', rest[0]);
			continue;
		}
		if (rest[0] === '[' || rest[0] === ']' || rest[0] === ',') {
			take('list', rest[0]);
			continue;
		}
		const number = /^\d+(?:\.\d+)?/.exec(rest);
		if (number) {
			take('number', number[0]);
			continue;
		}
		const word = /^[A-Za-z_]\w*/.exec(rest);
		if (word) {
			const lower = word[0].toLowerCase();
			take(
				['true', 'false', 'null'].includes(lower)
					? 'keyword'
					: fieldByAlias.has(lower)
						? 'field'
						: 'other',
				word[0]
			);
			continue;
		}
		take('other', rest[0]);
	}
	return tokens;
}

/**
 * The fields a query uses, in the order they first appear. A text or string field is listed once
 * for each way it's compared, fuzzy, exact or a pattern, and matching or not.
 */
export function fieldsOf(tokens: BuildQlToken[]): BuildQlField[] {
	const fields: BuildQlField[] = [];
	const meaningful = tokens.filter((token) => token.kind !== 'space');
	meaningful.forEach((token, i) => {
		if (token.kind !== 'field') return;
		const alias = token.text.toLowerCase();
		const field = fieldByAlias.get(alias)!;
		const next = meaningful[i + 1];
		const operator = next?.kind === 'operator' ? next.text : undefined;
		const value = operator ? meaningful[i + 2] : undefined;
		const match = !comparedAsText.has(field)
			? undefined
			: value?.kind === 'regex'
				? 'pattern'
				: operator && fuzzyOperators.includes(operator)
					? 'fuzzy'
					: operator && exactOperators.includes(operator)
						? 'exact'
						: undefined;
		const negated = match !== undefined && operator!.startsWith('!');
		const list = match !== undefined && operator!.includes('?');
		if (
			fields.some(
				(f) =>
					f.alias === alias && f.match === match && !!f.negated === negated && !!f.list === list
			)
		) {
			return;
		}
		fields.push({
			alias,
			name: displayName(field),
			...(match && { match, operator }),
			...(negated && { negated }),
			...(list && { list })
		});
	});
	return fields;
}

/**
 * BuildQL's field types, from its docs. Fields not listed are strings.
 */
const textFields = new Set(['text', 'flavor']);
const numberFields = new Set([
	'agility',
	'chapter',
	'clues',
	'combat',
	'cost',
	'damage',
	'deck_limit',
	'doom',
	'evade',
	'fight',
	'health',
	'horror',
	'intellect',
	'in_deck',
	'in_side_deck',
	'level',
	'quantity',
	'sanity',
	'shroud',
	'stage',
	'vengeance',
	'victory',
	'wild',
	'willpower',
	'xp'
]);
const booleanFields = new Set([
	'bonded',
	'customizable',
	'errata',
	'exceptional',
	'exile',
	'has_upgrade',
	'heals_damage',
	'heals_horror',
	'favorite',
	'is_upgrade',
	'multiclass',
	'myriad',
	'permanent',
	'specialist',
	'unique'
]);

function typeOf(field: string): string {
	if (textFields.has(field)) return 'text';
	if (numberFields.has(field)) return 'number';
	if (booleanFields.has(field)) return 'boolean';
	return 'string';
}

/**
 * Two fields compared that BuildQL can't compare, like `text = name`. arkham.build throws on these
 * while filtering and then quietly shows every card, so they have to be caught here.
 */
export function mismatchedFields(tokens: BuildQlToken[]): string[] {
	const meaningful = tokens.filter((token) => token.kind !== 'space');
	const problems: string[] = [];
	meaningful.forEach((token, i) => {
		const operator = meaningful[i + 1];
		const other = meaningful[i + 2];
		if (token.kind !== 'field' || other?.kind !== 'field') return;
		if (
			!operator ||
			![...fuzzyOperators, ...exactOperators, '>', '<', '>=', '<='].includes(operator.text)
		) {
			return;
		}
		const left = fieldByAlias.get(token.text.toLowerCase())!;
		const right = fieldByAlias.get(other.text.toLowerCase())!;
		if (typeOf(left) !== typeOf(right)) {
			problems.push(`${token.text} ${operator.text} ${other.text}`);
		}
	});
	return problems;
}

/**
 * Words in a query that aren't a field BuildQL knows.
 */
export function unknownWords(tokens: BuildQlToken[]): string[] {
	return tokens.filter((token) => token.kind === 'other').map((token) => token.text);
}

/**
 * A search on arkham.build with the query applied, the way its share button links one.
 */
export function buildQlSearchUrl(query: string): string {
	const params = new URLSearchParams({ q: query, card_type: 'player' });
	return `${service.arkhamBuildBaseUrl}/search?${params}`;
}

interface ChainNode {
	joiner?: '&' | '|';
	children?: ChainNode[];
	/**
	 * A comparison of a field with a single string, like `text = "draw"`. A regex stays on its own,
	 * so the legend can still call it a pattern.
	 */
	comparison?: { field: string; operator: string };
}

/**
 * Comparisons a list would say in one: two of a field with `=` or `==` joined by `|`, which
 * `?` or `??` does, or with `!=` or `!==` joined by `&`, which `!?` or `!??` does. Each is given
 * as the field and the operator, like `text =`.
 */
export function chainedComparisons(tokens: BuildQlToken[]): string[] {
	const meaningful = tokens.filter((token) => token.kind !== 'space');
	let i = 0;
	const found: string[] = [];
	const joined = (joiner: '&' | '|', next: () => ChainNode): ChainNode => {
		const children = [next()];
		while (meaningful[i]?.text === joiner) {
			i++;
			children.push(next());
		}
		return children.length === 1 ? children[0] : { joiner, children };
	};
	const orExpr = (): ChainNode => joined('|', andExpr);
	const andExpr = (): ChainNode => joined('&', unary);
	const unary = (): ChainNode => {
		if (meaningful[i]?.text === '(') {
			i++;
			const inner = orExpr();
			i++;
			return inner;
		}
		const start = i;
		let depth = 0;
		while (i < meaningful.length) {
			const text = meaningful[i].text;
			if (text === '[') depth++;
			if (text === ']') depth--;
			if (depth === 0 && (text === '&' || text === '|' || text === ')')) break;
			i++;
		}
		const [field, operator, value, ...rest] = meaningful.slice(start, i);
		const single =
			field?.kind === 'field' &&
			operator?.kind === 'operator' &&
			value?.kind === 'string' &&
			rest.length === 0;
		return single ? { comparison: { field: field.text, operator: operator.text } } : {};
	};
	const visit = (node: ChainNode) => {
		if (!node.children) return;
		const wanted = node.joiner === '|' ? ['=', '=='] : ['!=', '!=='];
		const counts = new Map<string, number>();
		for (const child of node.children) {
			if (child.comparison && wanted.includes(child.comparison.operator)) {
				const key = `${child.comparison.field} ${child.comparison.operator}`;
				counts.set(key, (counts.get(key) ?? 0) + 1);
			}
			visit(child);
		}
		for (const [key, count] of counts) if (count > 1) found.push(key);
	};
	try {
		visit(orExpr());
	} catch {
		return [];
	}
	return found;
}
