/**
 * recorded-state.ts — the single encode/decode bridge between
 *   • the generic DB rows (`campaign_logs` + `campaign_log_params`),
 *   • the live editor model (a flat `LocalLog[]`), and
 *   • campaign-data's `RecordedCampaignState` projection (for inference / validation).
 *
 * Storage model (unchanged from the pre-existing schema): one `campaign_logs`
 * row per recorded entry, carrying a `key` (the campaign-data composite
 * `"section.id"`) + a `section`, plus 0..N `campaign_log_params`. We keep the
 * flat list as the canonical editor state (so the existing `saveLogs` wholesale
 * replace + dirty-tracking keep working) and DERIVE everything else from it.
 *
 * Reserved meta-sections (prefix `__`, verified to never collide with a real
 * campaign-data section id) ride in the same tables:
 *   __chaos_bag  key = token string code,            param.number = count
 *   __ultimatums key = ultimatum id,                 (no params)
 *   __partner    key = "<sectionId>.<partnerId>",     param[0].string = status,
 *                                                      param[1].number = damage,
 *                                                      param[2].number = horror
 *
 * This module is pure + framework-free so it is unit-testable and reused by both
 * the recording editor and profile aggregation.
 */
import type {
	CampaignLog,
	LogSectionDef,
	RecordedCampaignState,
	SectionType,
} from '@5argon/arkham-campaign-data';
import { SCARLET_KEY_NPC_CODES } from './tsk';

// ─── Reserved meta-section ids ───────────────────────────────────────────────
// The chaos bag, active ultimatums, and difficulty are printed on every sheet
// but are NOT campaign-data sections, so they ride in these reserved sections.
// (Partner data, by contrast, lives under its real `partner` section id.)
export const RESERVED = {
	chaosBag: '__chaos_bag',
	ultimatums: '__ultimatums',
	/** Extra Imports: per-scenario victory-display total (key = scenario id, number arg). Historic id `__xp`. */
	scenarioXp: '__xp',
	/** Extra Imports: per-scenario named choice (key = "scenario.choiceId", string arg). */
	scenarioChoice: '__choice',
	/** Extra Imports: per-scenario resolution reached (key = scenario id, string arg = resolution id, e.g. "R1"). */
	scenarioResolution: '__resolution',
	/** Extra Imports: scenarios manually marked SKIPPED (key = scenario id, presence = skipped). */
	scenarioSkipped: '__skipped',
	/**
	 * Extra Imports: standalone scenarios played *inside* this campaign — an ordered
	 * list (key = zero-padded index), NOT keyed by host scenario (we record WHAT was
	 * played, not where). Positional string args: [standaloneId, resolutionId, victoryDisplay].
	 */
	standalones: '__standalone',
	/**
	 * Extra Imports: log entries recorded against a standalone scenario played inside
	 * this campaign (e.g. Fortune and Folly's "the cell meddled in Abarran's affairs").
	 * Key = `"<standaloneScenario>::<section>.<entryId>"` so we keep the provenance
	 * (which standalone) while still knowing the real entry key. `toRecordedState`
	 * merges the real key into `recordedLogs`, so widgets/achievements read the
	 * combined campaign + standalone log set. Args mirror the source entry's args.
	 */
	standaloneLog: '__standalone_log',
	/**
	 * Extra Imports: the TSK-solver "level" (time-scaling tier) / "version" (variant)
	 * a scenario was played at — facts the final log can't reveal (e.g. On Thin Ice's
	 * doom-per-5-time tier at the moment of play). Key = `"<scenarioId>.<kind>"`
	 * (kind = `level` | `version`); string arg = the solver option id (e.g. `OTI.t.5`).
	 * Enriches what widgets can compute about a non-linear TSK play.
	 */
	scenarioTier: '__scenario_tier',
} as const;

/** Separator between the standalone scenario id and the real `"section.id"` key. */
const STANDALONE_LOG_SEP = '::';

/** Reserved sections whose key (or key prefix before the first `.`) is a scenario id. */
const SCENARIO_KEYED_SECTIONS: readonly string[] = [
	RESERVED.scenarioXp,
	RESERVED.scenarioResolution,
	RESERVED.scenarioSkipped,
	RESERVED.scenarioChoice,
	RESERVED.scenarioTier,
];

/**
 * Prune Extra entries keyed by a scenario id that the campaign no longer knows —
 * deprecated artifacts from older recordings (e.g. TSK's early bug that keyed
 * scenarios by ArkhamCards location id `anchorage`/`buenos_aires` instead of the
 * canonical `on_thin_ice`/`sanguine_shadows`). Validating against the campaign's
 * current `scenarioMeta` makes a re-save self-healing: the stale rows that used to
 * leak into the profile's Scenario XP / resolution widgets are dropped on write.
 *
 * Only scenario-keyed reserved sections are touched (the scenario id is the whole
 * key, or the part before the first `.` for the composite `__choice`/`__tier`
 * keys). Every other section — real log entries, chaos bag, standalones, ultimatums
 * — passes through untouched. If the campaign declares no `scenarioMeta` (data not
 * loaded), nothing is pruned, so we never wipe valid data on a missing catalogue.
 */
export function pruneDeprecatedScenarioEntries(localLogs: LocalLog[], log: CampaignLog): LocalLog[] {
	const valid = new Set((log.db.scenarioMeta ?? []).map((m) => m.id));
	if (!valid.size) return localLogs; // catalogue absent → don't risk pruning anything
	return localLogs.filter((l) => {
		if (!SCENARIO_KEYED_SECTIONS.includes(l.section)) return true;
		const dot = l.key.indexOf('.');
		const scenarioId = dot > 0 ? l.key.slice(0, dot) : l.key;
		return valid.has(scenarioId);
	});
}

/** Compose a `__standalone_log` key from a standalone scenario id + a real entry key. */
export function makeStandaloneLogKey(standalone: string, realKey: string): string {
	return `${standalone}${STANDALONE_LOG_SEP}${realKey}`;
}

/** Split a `__standalone_log` key back into its standalone id and real entry key. */
export function parseStandaloneLogKey(key: string): { standalone: string; realKey: string } {
	const i = key.indexOf(STANDALONE_LOG_SEP);
	if (i < 0) return { standalone: '', realKey: key };
	return { standalone: key.slice(0, i), realKey: key.slice(i + STANDALONE_LOG_SEP.length) };
}

export function isReservedSection(section: string): boolean {
	return section.startsWith('__');
}

// ─── Wire shapes ─────────────────────────────────────────────────────────────

/** A single param of a log row (one of the two columns is non-null). */
export interface LogArg {
	type: 'string' | 'number';
	value: string;
}

/** The flat, canonical editor entry. `clientId` is editor-local only. */
export interface LocalLog {
	clientId: string;
	/** campaign-data composite `"section.id"` (or section id alone for whole-section counters). */
	key: string;
	/** owning section id (real campaign-data section, or a `RESERVED.*` meta-section). */
	section: string;
	args: LogArg[];
}

/** A DB log row as returned by the page `load` (key + section + params). */
export interface DbLogRow {
	key: string;
	section: string | null;
	params: { valueString: string | null; valueNumber: number | null }[];
}

/** One recorded log entry, as stored on a campaign. */
export interface SaveLogEntry {
	key: string;
	section: string;
	args: LogArg[];
}

// ─── Hydrate (DB rows → editor model) ────────────────────────────────────────

let clientSeq = 0;
function nextClientId(): string {
	return `l${clientSeq++}`;
}

/** Convert persisted DB rows into the flat editor model. */
export function hydrate(rows: DbLogRow[]): LocalLog[] {
	return rows.map((r) => ({
		clientId: nextClientId(),
		key: r.key,
		section: r.section ?? 'campaign_notes',
		args: r.params.map((p) => ({
			type: (p.valueNumber !== null ? 'number' : 'string') as 'string' | 'number',
			value: p.valueString ?? (p.valueNumber !== null ? String(p.valueNumber) : ''),
		})),
	}));
}

// ─── Save payload (editor model → stored log entries) ───────────────────────

/**
 * Project the editor model to the `saveLogs` payload, PRESERVING entry order.
 * Order is meaningful: the sequence campaign-log entries were recorded in implies
 * the play order (e.g. which TSK scenarios were visited, in what sequence — the
 * "route"). The editor lets the player reorder entries, so a different order is a
 * real change; dirty-tracking (via {@link serializePayload}) is order-sensitive.
 */
export function toSavePayload(localLogs: LocalLog[]): SaveLogEntry[] {
	return localLogs.map((l) => ({ key: l.key, section: l.section, args: l.args }));
}

/** Stable string form of the save payload, for dirty-tracking. */
export function serializePayload(localLogs: LocalLog[]): string {
	return JSON.stringify(toSavePayload(localLogs));
}

// ─── Section-type classification ─────────────────────────────────────────────

/** Section types whose recorded entries are tracked as a *set of item ids*. */
const ITEM_SET_TYPES: ReadonlySet<SectionType> = new Set<SectionType>([
	'cards',
	'supplies',
	'scarletKeys',
	'glyphs',
	'checklist',
	'investigatorChecklist',
]);

/** Section types that hold a single (or per-investigator) numeric counter. */
const COUNT_TYPES: ReadonlySet<SectionType> = new Set<SectionType>(['count', 'investigatorCount']);

function sectionTypeMap(log: CampaignLog): Map<string, LogSectionDef> {
	return new Map(log.db.sections.map((s) => [s.id, s]));
}

/** The `id` part of a composite `"section.id"` key (or the whole key if no dot). */
function itemIdOf(key: string, section: string): string {
	const prefix = section + '.';
	return key.startsWith(prefix) ? key.slice(prefix.length) : key;
}

function firstNumber(args: LogArg[]): number | undefined {
	const a = args.find((x) => x.type === 'number');
	if (!a) return undefined;
	const n = Number(a.value);
	return Number.isFinite(n) ? n : undefined;
}

/**
 * Sentinel string arg marking a cross-off-able entry (campaign-data `crossOut`)
 * as crossed off — the entry stays on record (still counted in `recordedLogs`)
 * but is "spent / lost". Shared by the notes editor (which sets it) and
 * `toRecordedState` (which projects it to `RecordedCampaignState.crossedLogs`).
 */
export const CROSSED_MARK = '__crossed__';

/** Whether an entry's args carry the cross-off sentinel. */
export function hasCrossedMark(args: LogArg[]): boolean {
	return args.some((a) => a.type === 'string' && a.value === CROSSED_MARK);
}

// ─── Build RecordedCampaignState (the projection campaign-data evaluates) ─────

export interface ToRecordedOptions {
	/** Campaign difficulty ('easy' | 'standard' | 'hard' | 'expert'). */
	difficulty?: string;
}

/**
 * Derive a `RecordedCampaignState` from the flat editor model + the campaign's
 * log definition. Classifies each entry by its section's type:
 *   notes/relationship/header  → `recordedLogs` (composite key presence)
 *   count/investigatorCount    → `logCounts`
 *   cards/supplies/keys/glyphs/checklist → `recordedSectionItems`
 *   __chaos_bag                → `finalChaosBag`
 *   __ultimatums               → `ultimatums`
 *   __partner                  → `partnerStatuses`
 * Numeric entry args additionally populate `logCounts[key]` (count-kind entries
 * inside notes sections, e.g. `campaign_notes.paths_known`).
 */
export function toRecordedState(
	log: CampaignLog,
	localLogs: LocalLog[],
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
		// Reserved meta-sections first.
		if (l.section === RESERVED.scenarioChoice) {
			// Per-scenario Extra choice (key = "scenario.choiceId") — exposed to achievement
			// inference (`scenarioChoice` rule), e.g. Dead Heat's slain-civilian count.
			const v = l.args.find((a) => a.type === 'string')?.value;
			if (v !== undefined && v !== '') scenarioChoiceValues[l.key] = v;
			continue;
		}
		if (l.section === RESERVED.chaosBag) {
			const n = firstNumber(l.args) ?? 0;
			// Store even when n = 0 — zero-count scoped tokens (e.g. frost cleared to
			// zero in EotE) must appear as 0, not undefined, so that `chaosToken`
			// achievement inference can distinguish "zero" from "bag not recorded".
			finalChaosBag[l.key] = n;
			continue;
		}
		if (l.section === RESERVED.ultimatums) {
			ultimatums.push(l.key);
			continue;
		}
		// Standalone-played logs merge into the combined recorded set under their real
		// entry key, so widgets/achievements see campaign + standalone logs together.
		if (l.section === RESERVED.standaloneLog) {
			const { realKey } = parseStandaloneLogKey(l.key);
			recordedLogs.add(realKey);
			const n = firstNumber(l.args);
			if (n !== undefined) logCounts[realKey] = n;
			continue;
		}
		if (isReservedSection(l.section)) continue;

		const def = types.get(l.section);
		const type = def?.type;

		if (type === 'partner') {
			// key = "<section>.<partnerId>"; the string params are the partner's
			// status flags (a member can carry several at once — e.g. resolute + mia).
			const partnerId = itemIdOf(l.key, l.section);
			const statuses = l.args.filter((a) => a.type === 'string').map((a) => a.value).filter(Boolean);
			if (statuses.length) {
				(partnerStatuses[l.section] ??= {});
				const set = (partnerStatuses[l.section][partnerId] ??= new Set<string>());
				for (const s of statuses) set.add(s);
			}
			recordedLogs.add(l.key);
			continue;
		}

		if (type && COUNT_TYPES.has(type)) {
			// Whole-section (or per-investigator) counter. Keep the max recorded
			// value under the section id so `logCount <section>` matches.
			const n = firstNumber(l.args) ?? 0;
			logCounts[l.section] = Math.max(logCounts[l.section] ?? 0, n);
			// Per-investigator rows may also be addressed by their composite key.
			if (l.key !== l.section) logCounts[l.key] = n;
			recordedLogs.add(l.key);
			continue;
		}

		if (type && ITEM_SET_TYPES.has(type)) {
			// A Scarlet Key (`scarletKeys`, trackBearer) only counts as *collected* —
			// e.g. for the "Key to My Heart" achievement — when one of the players'
			// investigators bears it. A key held by a Red Coterie NPC (or left
			// unassigned) stays on record but is NOT a collected key. The bearer code
			// rides as the entry's string arg.
			if (type === 'scarletKeys') {
				const bearer = l.args.find((a) => a.type === 'string')?.value ?? '';
				recordedLogs.add(l.key);
				if (!bearer || SCARLET_KEY_NPC_CODES.has(bearer)) continue;
			} else {
				recordedLogs.add(l.key);
			}
			(recordedSectionItems[l.section] ??= new Set<string>()).add(itemIdOf(l.key, l.section));
			continue;
		}

		// notes / relationship / header / unknown → presence + optional count arg
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

/**
 * Per Scarlet Key (item id) → the non-NPC bearer investigator codes recorded across
 * this campaign's logs, in log order (the bearer rides as the key entry's string arg).
 * NPC / unassigned bearers are excluded — a Key held by a Red Coterie member isn't
 * obtained by the cell. Feeds the Scarlet Keys widgets (the bearer art + the
 * obtained-by-the-cell vs borne-by-your-own-investigator split).
 */
export function scarletKeyBearersFromLogs(
	log: CampaignLog,
	localLogs: LocalLog[],
): Record<string, string[]> {
	const types = sectionTypeMap(log);
	const out: Record<string, string[]> = {};
	for (const l of localLogs) {
		if (types.get(l.section)?.type !== 'scarletKeys') continue;
		const bearer = l.args.find((a) => a.type === 'string')?.value ?? '';
		if (!bearer || SCARLET_KEY_NPC_CODES.has(bearer)) continue;
		(out[itemIdOf(l.key, l.section)] ??= []).push(bearer);
	}
	return out;
}

/** Per-scenario earned XP from the reserved `__xp` section (key = scenario id). */
export function scenarioXpFromLogs(localLogs: LocalLog[]): Record<string, number> {
	const out: Record<string, number> = {};
	for (const l of localLogs) {
		if (l.section !== RESERVED.scenarioXp) continue;
		const n = firstNumber(l.args);
		if (n !== undefined) out[l.key] = n;
	}
	return out;
}

/** Per-scenario named choices from the reserved `__choice` section (key = "scenario.choiceId"). */
export function scenarioChoicesFromLogs(localLogs: LocalLog[]): Record<string, string> {
	const out: Record<string, string> = {};
	for (const l of localLogs) {
		if (l.section !== RESERVED.scenarioChoice) continue;
		const v = l.args.find((a) => a.type === 'string')?.value;
		if (v) out[l.key] = v;
	}
	return out;
}

/** Per-scenario resolution reached from the reserved `__resolution` section (key = scenario id → resolution id). */
export function scenarioResolutionsFromLogs(localLogs: LocalLog[]): Record<string, string> {
	const out: Record<string, string> = {};
	for (const l of localLogs) {
		if (l.section !== RESERVED.scenarioResolution) continue;
		const v = l.args.find((a) => a.type === 'string')?.value;
		if (v) out[l.key] = v;
	}
	return out;
}

/** Scenario ids manually marked SKIPPED, from the reserved `__skipped` section. */
export function scenarioSkippedFromLogs(localLogs: LocalLog[]): string[] {
	return localLogs.filter((l) => l.section === RESERVED.scenarioSkipped).map((l) => l.key);
}

/**
 * The chosen item id for each cards-CHOICE entry — a `#name#` member pick like
 * EotE's "#name# was killed in the plane crash." The picked id rides in the raw
 * string arg, which the derived `RecordedCampaignState` drops (it keeps only the
 * entry's presence), so a per-member tally must read it here. Keyed by the
 * composite `"section.id"`; one value per entry (notes entries don't repeat).
 */
export function nameChoicesFromLogs(log: CampaignLog, localLogs: LocalLog[]): Record<string, string> {
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

/** `campaign_notes` ids that record cards erased from existence (TSK Dancing Mad `_dm`, On Thin
 *  Ice `_oti`) — matched by prefix so any scenario's variant is covered. */
const ERASED_FROM_EXISTENCE_PREFIX = 'campaign_notes.erased_from_existence';

/**
 * Card codes erased from existence (TSK Dancing Mad / On Thin Ice `campaign_log_cards` entries),
 * in log order. These are unique cards the cell exiled; the codes ride as the entry's string args,
 * which the derived `RecordedCampaignState` drops (it keeps only the entry's presence) — so a
 * card-level widget reads them here. A campaign-level fact, shared across the cell.
 */
export function erasedFromExistenceFromLogs(localLogs: LocalLog[]): string[] {
	const out: string[] = [];
	for (const l of localLogs) {
		if (!l.key.startsWith(ERASED_FROM_EXISTENCE_PREFIX)) continue;
		for (const a of l.args) {
			if (a.type === 'string' && a.value && a.value !== CROSSED_MARK) out.push(a.value);
		}
	}
	return out;
}

/**
 * One standalone scenario recorded as played inside a campaign (reserved
 * `__standalone` section). `standalone` is a campaign-data standalone scenario id
 * (see `standaloneScenarios()`); resolution + victory display are optional, mirroring
 * a regular scenario's Extra inputs.
 */
export interface StandaloneEntry {
	standalone: string;
	resolution?: string;
	victoryDisplay?: number;
	/**
	 * Custom Extra-tab control values for this standalone play (choiceId → recorded
	 * value), exactly like a regular scenario's choices but stored on the standalone
	 * instance (a standalone can be played more than once, so it can't ride the
	 * scenario-keyed `__choice` section). Persisted as trailing "choiceId=value" args.
	 */
	choices?: Record<string, string>;
}

/** The id part of a reserved key padded for stable lexical ordering (00, 01, …). */
function standaloneKey(index: number): string {
	return String(index).padStart(2, '0');
}

function decodeStandalone(l: LocalLog): StandaloneEntry {
	const standalone = l.args[0]?.value ?? '';
	const resolution = l.args[1]?.value || undefined;
	const vRaw = l.args[2]?.value ?? '';
	const v = Number(vRaw);
	const victoryDisplay = vRaw !== '' && Number.isFinite(v) ? v : undefined;
	// Trailing args (index ≥ 3) carry custom Extra choices as "choiceId=value" pairs.
	const choices: Record<string, string> = {};
	for (let i = 3; i < l.args.length; i++) {
		const raw = l.args[i]?.value ?? '';
		const eq = raw.indexOf('=');
		if (eq > 0) choices[raw.slice(0, eq)] = raw.slice(eq + 1);
	}
	return {
		standalone,
		resolution,
		victoryDisplay,
		choices: Object.keys(choices).length ? choices : undefined,
	};
}

/**
 * The ordered standalone list as recorded, INCLUDING incomplete (no scenario
 * chosen yet) rows — for the editor, where a freshly-added empty row must persist
 * until the player picks a standalone.
 */
export function standaloneDraftsFromLogs(localLogs: LocalLog[]): StandaloneEntry[] {
	return localLogs
		.filter((l) => l.section === RESERVED.standalones)
		.sort((a, b) => a.key.localeCompare(b.key))
		.map(decodeStandalone);
}

/** The recorded standalones with a scenario chosen (blank rows dropped) — for aggregation. */
export function standalonesFromLogs(localLogs: LocalLog[]): StandaloneEntry[] {
	return standaloneDraftsFromLogs(localLogs).filter((e) => e.standalone);
}

/** Encode a standalone list into reserved `__standalone` entries (indexed, in order). */
export function standalonesToEntries(list: StandaloneEntry[]): LocalLog[] {
	return list.map((e, i) =>
		makeEntry(RESERVED.standalones, standaloneKey(i), [
			{ type: 'string', value: e.standalone },
			{ type: 'string', value: e.resolution ?? '' },
			{ type: 'string', value: e.victoryDisplay != null ? String(e.victoryDisplay) : '' },
			...Object.entries(e.choices ?? {})
				.filter(([, v]) => v !== '')
				.map(([k, v]) => ({ type: 'string' as const, value: `${k}=${v}` })),
		]),
	);
}

/** The set of recorded composite keys for *real* sections (for the validation gate). */
export function recordedLogKeys(localLogs: LocalLog[]): Set<string> {
	const set = new Set<string>();
	for (const l of localLogs) {
		if (!isReservedSection(l.section)) set.add(l.key);
	}
	return set;
}

// ─── Editor mutation helpers (flat list ⟷ per-section slices) ─────────────────
// Components own their section's slice: they read `entriesInSection(...)` and
// push a whole replacement via `replaceSection(...)`. Keeping the flat list as
// the single source of truth means the existing save/dirty/hydrate path is
// untouched, while components get an ergonomic per-section API.

/** Build a fresh editor entry (allocates a client id). */
export function makeEntry(section: string, key: string, args: LogArg[] = []): LocalLog {
	return { clientId: nextClientId(), section, key, args };
}

/** All entries belonging to a section (real or reserved). */
export function entriesInSection(localLogs: LocalLog[], section: string): LocalLog[] {
	return localLogs.filter((l) => l.section === section);
}

/** Replace every entry of `section` with `next`, preserving all other sections' order. */
export function replaceSection(
	localLogs: LocalLog[],
	section: string,
	next: LocalLog[],
): LocalLog[] {
	return [...localLogs.filter((l) => l.section !== section), ...next];
}

/** Convenience: is a composite key currently recorded (presence)? */
export function hasKey(localLogs: LocalLog[], key: string): boolean {
	return localLogs.some((l) => l.key === key);
}

// ─── Scenario route (play order, from entry-ordered logs) ────────────────────

/**
 * The sequence of scenarios played, derived from the ORDER campaign-log entries
 * were recorded in: a scenario joins the route at the first recorded entry tagged
 * to it. Only playable scenarios (story / interlude) count; campaign-wide and
 * hidden-bookkeeping entries are ignored. The order is the player's travel path —
 * the basis for TSK "Routings". Requires {@link toSavePayload} to preserve order.
 */
export function scenarioSequence(log: CampaignLog, localLogs: LocalLog[]): string[] {
	const scenarioByKey = new Map<string, string>();
	for (const e of log.db.entries) {
		if (e.scenario) scenarioByKey.set(`${e.section}.${e.id}`, e.scenario);
	}
	const playable = new Set(
		(log.db.scenarioMeta ?? [])
			.filter((m) => m.type === 'story' || m.type === 'interlude')
			.map((m) => m.id),
	);
	const seen = new Set<string>();
	const out: string[] = [];
	for (const l of localLogs) {
		const sc = scenarioByKey.get(l.key);
		if (sc && playable.has(sc) && !seen.has(sc)) {
			seen.add(sc);
			out.push(sc);
		}
	}
	return out;
}

// ─── Scenario tier (TSK-solver level / version) ──────────────────────────────

export type ScenarioTierKind = 'level' | 'version';

/** Recorded scenario tiers: `"<scenarioId>.<kind>"` → solver option id. */
export function scenarioTiersFromLogs(localLogs: LocalLog[]): Record<string, string> {
	const out: Record<string, string> = {};
	for (const l of entriesInSection(localLogs, RESERVED.scenarioTier)) {
		const v = l.args.find((a) => a.type === 'string')?.value;
		if (v) out[l.key] = v;
	}
	return out;
}
