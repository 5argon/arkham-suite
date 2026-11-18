/**
 * The codec between a record's stored log entries, the editor's flat `LocalLog[]`, and
 * campaign-data's `RecordedCampaignState`. Reserved `__*` sections ride in the same list. Readers
 * take stored entries or editor logs alike.
 */
import type {
	CampaignLog,
	LogSectionDef,
	RecordedCampaignState,
	SectionType,
} from '@5argon/arkham-campaign-data';
import type { CampaignLogEntry } from '$lib/database/document';
import { SCARLET_KEY_NPC_CODES } from '../campaigns/tsk/bearers';

/** Reserved sections for sheet data campaign-data has no section for. Ids never collide with real
 *  section ids. */
export const RESERVED = {
	/** Token code → count. */
	chaosBag: '__chaos_bag',
	ultimatums: '__ultimatums',
	/** Extra: scenario id → victory display (or Experience total). */
	scenarioXp: '__xp',
	/** Extra, standalone archives: scenario id → experience earned on top of the victory display. */
	standaloneEarnedXp: '__earned_xp',
	/** Extra: `"scenario.choiceId"` → chosen value. */
	scenarioChoice: '__choice',
	/** Extra: scenario id → resolution id. */
	scenarioResolution: '__resolution',
	/** Extra: scenario id, present = skipped. */
	scenarioSkipped: '__skipped',
	/** Extra: side stories played in the campaign, in order (key = zero-padded index). */
	standalones: '__standalone',
	/** Read-only: `"<standalone>::<section>.<id>"` entries from records made before side-story entries
	 *  were recorded into their real section. No editor writes it. */
	standaloneLog: '__standalone_log',
	/** Extra, TSK: `"<scenario>.<level|version>"` → tsk-solver option id. */
	scenarioTier: '__scenario_tier',
} as const;

export function isReservedSection(section: string): boolean {
	return section.startsWith('__');
}

export type LogArg = CampaignLogEntry['args'][number];

/** A stored log entry plus an editor-local id for keyed rendering. */
export interface LocalLog extends CampaignLogEntry {
	clientId: string;
}

let clientSeq = 0;
function nextClientId(): string {
	return `l${clientSeq++}`;
}

export function hydrate(entries: CampaignLogEntry[]): LocalLog[] {
	return entries.map((e) => makeEntry(e.section, e.key, e.args.map((a) => ({ ...a }))));
}

/** Entry order is kept: it is the play order (e.g. the TSK route). */
export function toSavePayload(localLogs: LocalLog[]): CampaignLogEntry[] {
	return localLogs.map((l) => ({ key: l.key, section: l.section, args: l.args }));
}

export function makeEntry(section: string, key: string, args: LogArg[] = []): LocalLog {
	return { clientId: nextClientId(), section, key, args };
}

export function entriesInSection<T extends CampaignLogEntry>(logs: readonly T[], section: string): T[] {
	return logs.filter((l) => l.section === section);
}

/** Replace a section's entries with `next` (appended after every other section's entries). */
export function replaceSection(localLogs: LocalLog[], section: string, next: LocalLog[]): LocalLog[] {
	return [...localLogs.filter((l) => l.section !== section), ...next];
}

// ─── Args ────────────────────────────────────────────────────────────────────

export function firstNumber(args: LogArg[]): number | undefined {
	const a = args.find((x) => x.type === 'number');
	if (!a) return undefined;
	const n = Number(a.value);
	return Number.isFinite(n) ? n : undefined;
}

export function firstString(args: LogArg[]): string | undefined {
	return args.find((a) => a.type === 'string')?.value;
}

/** String arg marking a `crossOut` entry as crossed off: still recorded, but spent. */
export const CROSSED_MARK = '__crossed__';

export function hasCrossedMark(args: LogArg[]): boolean {
	return args.some((a) => a.type === 'string' && a.value === CROSSED_MARK);
}

/** Key of a manual achievement tick: the achievement id, or `id::itemId` for one list item. */
export function manualTickKey(achievementId: string, itemId?: string | null): string {
	return itemId ? `${achievementId}::${itemId}` : achievementId;
}

// ─── Partner roster (EotE Expedition Team) ───────────────────────────────────

/** A partner's marks, stored as string flags followed by [damage, horror]. */
export interface PartnerMarks {
	/** Killed or removed. */
	nameCrossed: boolean;
	resolute: boolean;
	mia: boolean;
	/** "MIA" crossed off: rescued. */
	miaCrossed: boolean;
	damage: number;
	horror: number;
}

const PARTNER_FLAGS = {
	nameCrossed: 'name_crossed',
	resolute: 'resolute',
	mia: 'mia',
	miaCrossed: 'mia_crossed',
} as const;

export function readPartner(args: LogArg[]): PartnerMarks {
	const flags = new Set(args.filter((a) => a.type === 'string').map((a) => a.value));
	const nums = args.filter((a) => a.type === 'number').map((a) => Number(a.value) || 0);
	return {
		nameCrossed: flags.has(PARTNER_FLAGS.nameCrossed),
		resolute: flags.has(PARTNER_FLAGS.resolute),
		mia: flags.has(PARTNER_FLAGS.mia),
		miaCrossed: flags.has(PARTNER_FLAGS.miaCrossed),
		damage: nums[0] ?? 0,
		horror: nums[1] ?? 0,
	};
}

/** The args recording `marks`, or null when there is nothing to record. */
export function partnerArgs(marks: PartnerMarks): LogArg[] | null {
	const flags = (Object.keys(PARTNER_FLAGS) as (keyof typeof PARTNER_FLAGS)[])
		.filter((k) => marks[k])
		.map((k) => PARTNER_FLAGS[k]);
	if (!flags.length && marks.damage <= 0 && marks.horror <= 0) return null;
	return [
		...flags.map((value) => ({ type: 'string' as const, value })),
		{ type: 'number', value: String(marks.damage) },
		{ type: 'number', value: String(marks.horror) },
	];
}

// ─── Chaos bag + setup flags ─────────────────────────────────────────────────

/** Chaos-bag entries for a token-code → count bag. */
export function chaosBagEntries(bag: Record<string, number>): LocalLog[] {
	return Object.entries(bag).map(([code, n]) =>
		makeEntry(RESERVED.chaosBag, code, [{ type: 'number', value: String(n) }]),
	);
}

/** The Dream-Eaters setup flags: interconnected play vs one half played alone. */
const INTERCONNECTED = 'hidden.interconnected_campaign';
const HALF_CAMPAIGN = 'hidden.half_campaign';

export function isInterconnected(localLogs: readonly CampaignLogEntry[]): boolean {
	return localLogs.some((l) => l.key === INTERCONNECTED);
}

export function withInterconnected(localLogs: LocalLog[], on: boolean): LocalLog[] {
	const rest = localLogs.filter((l) => l.key !== INTERCONNECTED && l.key !== HALF_CAMPAIGN);
	return [...rest, makeEntry('hidden', on ? INTERCONNECTED : HALF_CAMPAIGN)];
}

// ─── RecordedCampaignState ───────────────────────────────────────────────────

const ITEM_SET_TYPES: ReadonlySet<SectionType> = new Set<SectionType>([
	'cards',
	'supplies',
	'scarletKeys',
	'glyphs',
	'checklist',
	'investigatorChecklist',
]);

const COUNT_TYPES: ReadonlySet<SectionType> = new Set<SectionType>(['count', 'investigatorCount']);

function sectionTypeMap(log: CampaignLog): Map<string, LogSectionDef> {
	return new Map(log.db.sections.map((s) => [s.id, s]));
}

/** The item id of a composite `"section.id"` key. */
function itemIdOf(key: string, section: string): string {
	const prefix = section + '.';
	return key.startsWith(prefix) ? key.slice(prefix.length) : key;
}

export interface ToRecordedOptions {
	difficulty?: string;
}

/** Project the editor logs onto campaign-data's `RecordedCampaignState`, classifying each entry by
 *  its section's type. A number arg on any other entry also lands in `logCounts[key]`. */
export function toRecordedState(
	log: CampaignLog,
	localLogs: readonly CampaignLogEntry[],
	options: ToRecordedOptions = {},
): RecordedCampaignState {
	const types = sectionTypeMap(log);

	const recordedLogs = new Set<string>();
	const crossedLogs = new Set<string>();
	const logCounts: Record<string, number> = {};
	const recordedSectionItems: Record<string, Set<string>> = {};
	const finalChaosBag: Record<string, number> = {};
	const ultimatums: string[] = [];
	const partnerStatuses: Record<string, Record<string, Set<string>>> = {};
	const scenarioChoiceValues: Record<string, string> = {};

	for (const l of localLogs) {
		if (l.section === RESERVED.scenarioChoice) {
			const v = firstString(l.args);
			if (v) scenarioChoiceValues[l.key] = v;
			continue;
		}
		if (l.section === RESERVED.chaosBag) {
			// Store even when n = 0 — zero-count scoped tokens (e.g. frost cleared to
			// zero in EotE) must appear as 0, not undefined, so that `chaosToken`
			// achievement inference can distinguish "zero" from "bag not recorded".
			finalChaosBag[l.key] = firstNumber(l.args) ?? 0;
			continue;
		}
		if (l.section === RESERVED.ultimatums) {
			ultimatums.push(l.key);
			continue;
		}
		if (l.section === RESERVED.standaloneLog) {
			const sep = l.key.indexOf('::');
			const realKey = sep < 0 ? l.key : l.key.slice(sep + 2);
			recordedLogs.add(realKey);
			const n = firstNumber(l.args);
			if (n !== undefined) logCounts[realKey] = n;
			continue;
		}
		if (isReservedSection(l.section)) continue;

		const type = types.get(l.section)?.type;

		if (type === 'partner') {
			// A member can carry several status flags at once (e.g. resolute + mia).
			const statuses = l.args.filter((a) => a.type === 'string' && a.value).map((a) => a.value);
			if (statuses.length) {
				const bySection = (partnerStatuses[l.section] ??= {});
				const set = (bySection[itemIdOf(l.key, l.section)] ??= new Set<string>());
				for (const s of statuses) set.add(s);
			}
			recordedLogs.add(l.key);
			continue;
		}

		if (type && COUNT_TYPES.has(type)) {
			// The section id holds the max, so `logCount <section>` matches a per-investigator counter.
			const n = firstNumber(l.args) ?? 0;
			logCounts[l.section] = Math.max(logCounts[l.section] ?? 0, n);
			if (l.key !== l.section) logCounts[l.key] = n;
			recordedLogs.add(l.key);
			continue;
		}

		if (type && ITEM_SET_TYPES.has(type)) {
			recordedLogs.add(l.key);
			// A Scarlet Key only counts as collected when one of the players' investigators bears it.
			if (type === 'scarletKeys') {
				const bearer = firstString(l.args) ?? '';
				if (!bearer || SCARLET_KEY_NPC_CODES.has(bearer)) continue;
			}
			(recordedSectionItems[l.section] ??= new Set<string>()).add(itemIdOf(l.key, l.section));
			continue;
		}

		recordedLogs.add(l.key);
		if (hasCrossedMark(l.args)) crossedLogs.add(l.key);
		const n = firstNumber(l.args);
		if (n !== undefined) logCounts[l.key] = n;
	}

	const state: RecordedCampaignState = {
		recordedLogs,
		logCounts,
		recordedSectionItems,
		finalChaosBag,
	};
	if (crossedLogs.size) state.crossedLogs = crossedLogs;
	if (options.difficulty) state.difficulty = options.difficulty;
	if (ultimatums.length) state.ultimatums = ultimatums;
	if (Object.keys(partnerStatuses).length) state.partnerStatuses = partnerStatuses;
	if (Object.keys(scenarioChoiceValues).length) state.scenarioChoiceValues = scenarioChoiceValues;
	return state;
}

/** The real (non-reserved) keys recorded, for the validation gate. */
export function recordedLogKeys(localLogs: readonly CampaignLogEntry[]): Set<string> {
	const set = new Set<string>();
	for (const l of localLogs) if (!isReservedSection(l.section)) set.add(l.key);
	return set;
}

// ─── Readers of what `RecordedCampaignState` drops ───────────────────────────

/** Scarlet Key item id → its investigator bearers, in log order (NPC and unassigned excluded). */
export function scarletKeyBearersFromLogs(
	log: CampaignLog,
	localLogs: readonly CampaignLogEntry[],
): Record<string, string[]> {
	const types = sectionTypeMap(log);
	const out: Record<string, string[]> = {};
	for (const l of localLogs) {
		if (types.get(l.section)?.type !== 'scarletKeys') continue;
		const bearer = firstString(l.args) ?? '';
		if (!bearer || SCARLET_KEY_NPC_CODES.has(bearer)) continue;
		(out[itemIdOf(l.key, l.section)] ??= []).push(bearer);
	}
	return out;
}

function valuesByKey<T>(
	localLogs: readonly CampaignLogEntry[],
	section: string,
	read: (l: CampaignLogEntry) => T | undefined,
): Record<string, T> {
	const out: Record<string, T> = {};
	for (const l of localLogs) {
		if (l.section !== section) continue;
		const v = read(l);
		if (v !== undefined && v !== '') out[l.key] = v;
	}
	return out;
}

export function scenarioXpFromLogs(localLogs: readonly CampaignLogEntry[]): Record<string, number> {
	return valuesByKey(localLogs, RESERVED.scenarioXp, (l) => firstNumber(l.args));
}

export function scenarioChoicesFromLogs(localLogs: readonly CampaignLogEntry[]): Record<string, string> {
	return valuesByKey(localLogs, RESERVED.scenarioChoice, (l) => firstString(l.args));
}

export function scenarioResolutionsFromLogs(localLogs: readonly CampaignLogEntry[]): Record<string, string> {
	return valuesByKey(localLogs, RESERVED.scenarioResolution, (l) => firstString(l.args));
}

export function scenarioTiersFromLogs(localLogs: readonly CampaignLogEntry[]): Record<string, string> {
	return valuesByKey(localLogs, RESERVED.scenarioTier, (l) => firstString(l.args));
}

export function scenarioSkippedFromLogs(localLogs: readonly CampaignLogEntry[]): string[] {
	return entriesInSection(localLogs, RESERVED.scenarioSkipped).map((l) => l.key);
}

/** The picked item id of each cards-choice (`#name#`) entry, e.g. EotE's "#name# was killed in the
 *  plane crash.", keyed by the composite entry key. */
export function nameChoicesFromLogs(log: CampaignLog, localLogs: readonly CampaignLogEntry[]): Record<string, string> {
	const choiceKeys = new Set<string>();
	for (const def of log.db.entries) {
		if (def.param?.type === 'cards' && def.param.cards?.mode === 'choice') {
			choiceKeys.add(`${def.section}.${def.id}`);
		}
	}
	if (!choiceKeys.size) return {};
	const out: Record<string, string> = {};
	for (const l of localLogs) {
		if (!choiceKeys.has(l.key)) continue;
		const v = l.args.find((a) => a.type === 'string' && a.value !== CROSSED_MARK)?.value;
		if (v) out[l.key] = v;
	}
	return out;
}

/** Every uncrossed string arg of the entries matching `match`, in log order. */
function stringArgs(localLogs: readonly CampaignLogEntry[], match: (key: string) => boolean): string[] {
	const out: string[] = [];
	for (const l of localLogs) {
		if (!match(l.key)) continue;
		for (const a of l.args) {
			if (a.type === 'string' && a.value && a.value !== CROSSED_MARK) out.push(a.value);
		}
	}
	return out;
}

/** Card codes erased from existence (TSK Dancing Mad `_dm`, On Thin Ice `_oti`), in log order. */
export function erasedFromExistenceFromLogs(localLogs: readonly CampaignLogEntry[]): string[] {
	return stringArgs(localLogs, (key) => key.startsWith('campaign_notes.erased_from_existence'));
}

/** Investigator codes possessed at the end of Dim Carcosa. */
export function possessedInvestigatorsFromLogs(localLogs: readonly CampaignLogEntry[]): string[] {
	return stringArgs(localLogs, (key) => key === 'campaign_notes.possessed');
}

// ─── Side stories played inside a campaign ───────────────────────────────────

/** One side story played inside a campaign; stored as args [standalone, resolution, victory
 *  display, ...`choiceId=value`]. */
export interface StandaloneEntry {
	/** A campaign-data standalone scenario id; empty on a row the player has not picked yet. */
	standalone: string;
	resolution?: string;
	victoryDisplay?: number;
	/** Extra choices of this play (kept per play: a side story can be played more than once). */
	choices?: Record<string, string>;
}

function decodeStandalone(l: CampaignLogEntry): StandaloneEntry {
	const standalone = l.args[0]?.value ?? '';
	const resolution = l.args[1]?.value || undefined;
	const vRaw = l.args[2]?.value ?? '';
	const v = Number(vRaw);
	const victoryDisplay = vRaw !== '' && Number.isFinite(v) ? v : undefined;
	const choices: Record<string, string> = {};
	for (const a of l.args.slice(3)) {
		const eq = a.value.indexOf('=');
		if (eq > 0) choices[a.value.slice(0, eq)] = a.value.slice(eq + 1);
	}
	return {
		standalone,
		resolution,
		victoryDisplay,
		choices: Object.keys(choices).length ? choices : undefined,
	};
}

/** The side-story rows in order, including rows with no scenario picked yet. */
export function standaloneDraftsFromLogs(localLogs: readonly CampaignLogEntry[]): StandaloneEntry[] {
	return entriesInSection(localLogs, RESERVED.standalones)
		.sort((a, b) => a.key.localeCompare(b.key))
		.map(decodeStandalone);
}

export function standalonesFromLogs(localLogs: readonly CampaignLogEntry[]): StandaloneEntry[] {
	return standaloneDraftsFromLogs(localLogs).filter((e) => e.standalone);
}

export function standalonesToEntries(list: StandaloneEntry[]): LocalLog[] {
	return list.map((e, i) =>
		makeEntry(RESERVED.standalones, String(i).padStart(2, '0'), [
			{ type: 'string', value: e.standalone },
			{ type: 'string', value: e.resolution ?? '' },
			{ type: 'string', value: e.victoryDisplay != null ? String(e.victoryDisplay) : '' },
			...Object.entries(e.choices ?? {})
				.filter(([, v]) => v !== '')
				.map(([k, v]) => ({ type: 'string' as const, value: `${k}=${v}` })),
		]),
	);
}

// ─── Play order ──────────────────────────────────────────────────────────────

/** The scenarios played, in the order their first log entry was recorded (story and interlude
 *  scenarios only). */
export function scenarioSequence(log: CampaignLog, localLogs: readonly CampaignLogEntry[]): string[] {
	const scenarioByKey = new Map<string, string>();
	for (const e of log.db.entries) {
		if (e.scenario) scenarioByKey.set(`${e.section}.${e.id}`, e.scenario);
	}
	const playable = new Set(
		(log.db.scenarioMeta ?? [])
			.filter((m) => m.type === 'story' || m.type === 'interlude')
			.map((m) => m.id),
	);
	const out: string[] = [];
	for (const l of localLogs) {
		const sc = scenarioByKey.get(l.key);
		if (sc && playable.has(sc) && !out.includes(sc)) out.push(sc);
	}
	return out;
}
