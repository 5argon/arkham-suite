import { stringify } from 'devalue';
import { describe, expect, it } from 'vitest';

import { buildQlSearchUrl, fieldsOf, mismatchedFields, tokenizeBuildQl } from '$lib/review/buildql';

import { buildQlProblems, buildQlTopics, cardUsers } from './card-users';
import { reviewCardCodes, reviewCardPage } from './reviews';

const rightTool = () => reviewCardPage('12023')!.card;

describe('BuildQL', () => {
	it('colors fields, operators, strings and groups', () => {
		const tokens = tokenizeBuildQl('ch = 2 & ia = "12001" & (tr != "tool")');
		const kinds = tokens.filter((t) => t.kind !== 'space').map((t) => `${t.kind}:${t.text}`);
		expect(kinds).toEqual([
			'field:ch',
			'operator:=',
			'number:2',
			'operator:&',
			'field:ia',
			'operator:=',
			'string:"12001"',
			'operator:&',
			'paren:(',
			'field:tr',
			'operator:!=',
			'string:"tool"',
			'paren:)'
		]);
		expect(tokens.map((t) => t.text).join('')).toBe('ch = 2 & ia = "12001" & (tr != "tool")');
	});

	it('tells a regex from a division', () => {
		const kinds = tokenizeBuildQl('trait = /^(spell|ritual)$/ & cost / 2 > 1').map((t) => t.kind);
		expect(kinds.filter((k) => k === 'regex')).toHaveLength(1);
	});

	it('names each field once, by its full name', () => {
		expect(fieldsOf(tokenizeBuildQl('ch = 2 & ia = "1" & (tr = "a" | tr = "b")'))).toEqual([
			{ alias: 'ch', name: 'Chapter' },
			{ alias: 'ia', name: 'Investigator Access' },
			{ alias: 'tr', name: 'Trait', match: 'fuzzy', operator: '=' }
		]);
	});

	it('calls a comparison with a regex a pattern', () => {
		expect(
			fieldsOf(tokenizeBuildQl('text = "[agility])" | text = /add[^.]{0,30}\\[agility\\]/'))
		).toEqual([
			{ alias: 'text', name: 'Text', match: 'fuzzy', operator: '=' },
			{ alias: 'text', name: 'Text', match: 'pattern', operator: '=' }
		]);
	});

	it('catches comparing fields of different types, which arkham.build silently ignores', () => {
		expect(mismatchedFields(tokenizeBuildQl('text == "discard" & text == name'))).toEqual([
			'text == name'
		]);
		expect(mismatchedFields(tokenizeBuildQl('health > sanity & tr = "ally"'))).toEqual([]);
	});

	it('lists a text field once for fuzzy and once for exact', () => {
		expect(
			fieldsOf(tokenizeBuildQl('text = "succeed by" & text !== "by 0" & text != "x"'))
		).toEqual([
			{ alias: 'text', name: 'Text', match: 'fuzzy', operator: '=' },
			{ alias: 'text', name: 'Text', match: 'exact', operator: '!==' }
		]);
	});

	it('links to a search on arkham.build the way its share button does', () => {
		expect(buildQlSearchUrl('ch = 2 & ia = "12001" & (tr != "tool" & tr = "weapon")')).toBe(
			'https://arkham.build/search?q=ch+%3D+2+%26+ia+%3D+%2212001%22+%26+%28tr+%21%3D+%22tool%22+%26+tr+%3D+%22weapon%22%29&card_type=player'
		);
	});

	it('has no problems in the presets', () => {
		expect(buildQlProblems(new Set(reviewCardCodes()))).toEqual([]);
	});

	it('makes each preset a topic, searched without an investigator and then for each who can take the card', () => {
		const topics = buildQlTopics(rightTool());
		expect(topics.length).toBeGreaterThan(0);
		for (const topic of topics) {
			const [free, ...rest] = topic.searches;
			expect(free.card).toBeUndefined();
			expect(free.prefix).toBe('ch = 2 &');
			expect(rest.map((s) => s.card!.code)).toEqual(
				expect.arrayContaining(['12001', '12004', '60151'])
			);
			for (const search of rest) {
				expect(search.prefix).toBe(`ch = 2 & ia = "${search.card!.code}" &`);
			}
			expect(topic.query.startsWith('(') && topic.query.endsWith(')')).toBe(true);
		}
	});
});

describe('presets on other pages', () => {
	it('puts each investigator into a query that names them itself, without the usual prefix', () => {
		const [topic] = reviewCardPage('12181')!.buildQl;
		expect(topic.searches.every((s) => s.card !== undefined)).toBe(true);
		const daniela = topic.searches.find((s) => s.card!.code === '12001')!;
		expect(daniela.prefix).toBe('ch = 2 &');
		expect(daniela.query).toContain('ia != "12001"');
	});

	it('offers the search without the owner too when a preset asks for all', () => {
		const labels = reviewCardPage('60252')!.buildQl.map((t) => t.label);
		expect(labels.filter((l) => l.endsWith('(Usable)') || l.endsWith('(All)'))).toHaveLength(2);
		const all = reviewCardPage('60252')!.buildQl.find((t) => t.label.endsWith('(All)'))!;
		expect(all.searches).toEqual([{ prefix: 'ch = 2 &', row: 0 }]);
	});

	it('puts the search without an investigator and the Core Set ones on the first row', () => {
		const [topic] = reviewCardPage('12091')!.buildQl;
		const rows = new Map<number, string[]>();
		for (const s of topic.searches) rows.set(s.row, [...(rows.get(s.row) ?? []), s.card?.code ?? 'free']);
		expect(rows.get(0)).toEqual(expect.arrayContaining(['free', '12001', '12013']));
		expect(rows.get(1)).toEqual(expect.arrayContaining(['60151', '60551']));
	});

	it('searches only for the owner on a signature card page', () => {
		const [topic] = reviewCardPage('12011')!.buildQl;
		expect(topic.searches.map((s) => s.card?.code)).toEqual(['12010']);
	});

	it('searches only for the investigator on their own page', () => {
		const [topic] = reviewCardPage('60351')!.buildQl;
		expect(topic.searches.map((s) => s.card?.code)).toEqual(['60351']);
		expect(topic.searches[0].prefix).toBe('ch = 2 & ia = "60351" &');
	});
});

describe('users', () => {
	it('greys out whoever cannot take the card', () => {
		const users = cardUsers(rightTool())!;
		const slots = users.rows.flat();
		const canTake = slots.filter((s) => s.canTake).map((s) => s.card.code);
		expect(canTake).toEqual(expect.arrayContaining(['12001', '12004', '60151']));
		expect(canTake).not.toContain('12007');
		expect(slots.find((s) => s.card.code === '12007')?.canTake).toBe(false);
	});

	it('gives each product a row at least 5 wide', () => {
		const users = cardUsers(rightTool())!;
		expect(users.columns).toBeGreaterThanOrEqual(5);
		for (const row of users.rows) expect(row.length).toBeLessThanOrEqual(users.columns);
		const core = users.rows.find((row) => row.some((s) => s.card.code === '12001'))!;
		expect(core.every((s) => s.card.product === 'core_2026')).toBe(true);
	});

	it('puts the Evergreen investigators on one wide row', () => {
		const users = cardUsers(rightTool())!;
		expect(users.wideColumns).toBeGreaterThanOrEqual(12);
		expect(users.wideRows[0].map((s) => s.card.code)).toEqual(
			expect.arrayContaining(['12001', '12013', '60151', '60551'])
		);
		expect(users.wideRows.flat()).toHaveLength(users.rows.flat().length);
	});

	it("isn't there for investigators and weaknesses", () => {
		expect(reviewCardPage('12001')?.users).toBeUndefined();
		expect(reviewCardPage('12015')?.users).toBeUndefined();
	});
});

describe('card page data', () => {
	/**
	 * Every card has a page, so whatever one page carries is carried hundreds of times over.
	 */
	it('stays small on every card page without reviews written here', () => {
		const sizes = reviewCardCodes()
			.map((code) => reviewCardPage(code)!)
			.filter((page) => page.entries.every((entry) => entry.parts === undefined))
			.map((page) => ({ code: page.card.code, size: stringify(page).length }));
		const largest = sizes.sort((a, b) => b.size - a.size)[0];
		expect(largest.size, largest.code).toBeLessThan(25_000);
	});

	it('sends each card without its empty fields or deck-building details', () => {
		const page = reviewCardPage('12073')!;
		const isabelle = page.mentioned['12013'];
		expect(isabelle.deckRequirements).toBeUndefined();
		expect('deckOptions' in isabelle).toBe(false);
		expect(stringify(isabelle).length).toBeLessThan(1_000);
		for (const slot of page.users!.rows.flat()) {
			expect(stringify(slot.card).length, slot.card.code).toBeLessThan(300);
		}
	});
});
