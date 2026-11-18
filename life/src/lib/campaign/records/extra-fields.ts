/**
 * The Extra tab's per-scenario fields. Each rides one reserved section, keyed by the scenario id
 * (`choice.*` and `tier.*` add a `.<sub>` suffix), with at most one arg.
 */
import {
	RESERVED,
	firstString,
	makeEntry,
	replaceSection,
	entriesInSection,
	type LocalLog,
	type LogArg,
} from './recorded-state';

export type ExtraField =
	| 'xp'
	| 'earnedXp'
	| 'resolution'
	| 'skipped'
	| `choice.${string}`
	| `tier.${'level' | 'version'}`;

/** Scenarios that can be skipped (EotE's Ice and Death Parts II and III). campaign-data has no flag
 *  for this, and the log cannot show it. */
export const SKIPPABLE_SCENARIOS: ReadonlySet<string> = new Set([
	'ice_and_death_part_2',
	'ice_and_death_part_3',
]);

type FieldKind = 'xp' | 'earnedXp' | 'resolution' | 'skipped' | 'choice' | 'tier';

const FIELDS: Record<FieldKind, { section: string; arg: 'number' | 'string' | null }> = {
	xp: { section: RESERVED.scenarioXp, arg: 'number' },
	earnedXp: { section: RESERVED.standaloneEarnedXp, arg: 'number' },
	resolution: { section: RESERVED.scenarioResolution, arg: 'string' },
	skipped: { section: RESERVED.scenarioSkipped, arg: null },
	choice: { section: RESERVED.scenarioChoice, arg: 'string' },
	tier: { section: RESERVED.scenarioTier, arg: 'string' },
};

const KIND_BY_SECTION = new Map(
	(Object.entries(FIELDS) as [FieldKind, (typeof FIELDS)[FieldKind]][]).map(([k, f]) => [f.section, k]),
);

function locate(scenario: string, field: ExtraField) {
	const dot = field.indexOf('.');
	const kind = (dot < 0 ? field : field.slice(0, dot)) as FieldKind;
	return { ...FIELDS[kind], key: dot < 0 ? scenario : scenario + field.slice(dot) };
}

/** The field an entry records for `scenario`, or null when it is not one of its Extra fields. */
function fieldOf(l: LocalLog, scenario: string): ExtraField | null {
	const kind = KIND_BY_SECTION.get(l.section);
	if (!kind) return null;
	if (l.key === scenario) return kind as ExtraField;
	return l.key.startsWith(scenario + '.') ? (`${kind}${l.key.slice(scenario.length)}` as ExtraField) : null;
}

function valueOf(l: LocalLog, arg: 'number' | 'string' | null): string {
	if (arg === null) return '1';
	if (arg === 'string') return firstString(l.args) ?? '';
	return l.args.find((a) => a.type === 'number')?.value ?? '';
}

/** A scenario's recorded Extra values by field (`'1'` for a set flag); unset fields are absent. */
export function readExtras(logs: LocalLog[], scenario: string): Partial<Record<ExtraField, string>> {
	const out: Partial<Record<ExtraField, string>> = {};
	for (const l of logs) {
		const field = fieldOf(l, scenario);
		if (!field) continue;
		const v = valueOf(l, FIELDS[KIND_BY_SECTION.get(l.section)!].arg);
		if (v !== '') out[field] = v;
	}
	return out;
}

export function hasExtras(logs: LocalLog[], scenario: string): boolean {
	return logs.some((l) => fieldOf(l, scenario) !== null);
}

/** Set one field; `null` or a blank value clears it. Numbers are stored as typed (non-numeric → 0). */
export function setExtra(
	logs: LocalLog[],
	scenario: string,
	field: ExtraField,
	value: string | null,
): LocalLog[] {
	const { section, arg, key } = locate(scenario, field);
	const others = entriesInSection(logs, section).filter((l) => l.key !== key);
	const v = value?.trim() ?? '';
	if (v === '') return replaceSection(logs, section, others);
	const args: LogArg[] =
		arg === 'number'
			? [{ type: 'number', value: String(Number(v) || 0) }]
			: arg === 'string'
				? [{ type: 'string', value: v }]
				: [];
	return replaceSection(logs, section, [...others, makeEntry(section, key, args)]);
}

/** Remove every Extra field of a scenario (an empty form, which is not the same as zeros). */
export function clearExtras(logs: LocalLog[], scenario: string): LocalLog[] {
	return logs.filter((l) => fieldOf(l, scenario) === null);
}

// ─── Choices with a bearer list ──────────────────────────────────────────────

/** A `cards` choice `X` may have a companion `X_investigator` choice naming who drew each card. */
const BEARER_SUFFIX = '_investigator';

/** The choices to render: bearer companions fold into their `cards` choice. */
export function withBearerLists<C extends { id: string; control: string }>(
	choices: C[],
): { choice: C; bearers?: C }[] {
	const byId = new Map(choices.map((c) => [c.id, c]));
	return choices
		.filter((c) => !(c.id.endsWith(BEARER_SUFFIX) && byId.has(c.id.slice(0, -BEARER_SUFFIX.length))))
		.map((c) => {
			const bearers = c.control === 'cards' ? byId.get(c.id + BEARER_SUFFIX) : undefined;
			return bearers ? { choice: c, bearers } : { choice: c };
		});
}

export function bearerChoiceId(choiceId: string): string {
	return choiceId + BEARER_SUFFIX;
}

/** Comma-joined card codes of a multi-pick `cards` choice. */
export function splitCodes(csv: string): string[] {
	return csv ? csv.split(',').filter(Boolean) : [];
}

/** Investigator → card, from the two index-paired lists (card[i] was drawn by investigator[i]). */
export function decodeCardPairs(cardCsv: string, investigatorCsv: string): Map<string, string> {
	const cards = splitCodes(cardCsv);
	const pairs = new Map<string, string>();
	splitCodes(investigatorCsv).forEach((inv, i) => {
		if (cards[i]) pairs.set(inv, cards[i]);
	});
	return pairs;
}

export function encodeCardPairs(pairs: Map<string, string>): { cards: string; investigators: string } {
	return { cards: [...pairs.values()].join(','), investigators: [...pairs.keys()].join(',') };
}
