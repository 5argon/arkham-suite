/**
 * The bridge to the researched TSK data in `@5argon/arkham-tsk-solver`: each scenario's time
 * "levels" and "versions", the Congress judgments and votes, and per-scenario reference info. The
 * solver keys scenarios by FileCode (`33-K`); its file titles equal campaign-data's scenario names.
 */
import {
	catalog,
	characterName,
	coterieVoteGuide,
	getEnFile,
	getFile,
	keyName,
	locationName,
	logText,
	resolutionGating,
	type CoterieMemberVotes,
	type Vote
} from '@5argon/arkham-tsk-solver';
import { CardType, EncounterSet, getScenarioData, Scenario } from '@5argon/arkham-kohaku';
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { cardByCode, getAllCards } from '$lib/card-data';
import type { CampaignRecord } from '../../records/campaign-record';
import { noteKey } from '../../records/play';
import { congressVersionForJudgment } from './rules';

const TSK = 'tskc';

export interface TierOption {
	id: string;
	label: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

let _cat: ReturnType<typeof catalog> | null = null;

function cat() {
	return (_cat ??= catalog());
}

const options = (list: { id: string; label: string }[] | undefined): TierOption[] =>
	(list ?? []).map((o) => ({ id: o.id, label: o.label }));

// ─── The Congress of the Keys ─────────────────────────────────────────────────

export interface CongressJudgment {
	id: string;
	/** The trial's outcome, e.g. "Deemed a liability". */
	label: string;
	/** The finale version it leads to. */
	version: string;
}

/** The six trial outcomes, which lead to the finale's three versions. */
export function congressJudgments(): CongressJudgment[] {
	return cat().judgments.map((j) => ({
		id: j.id,
		label: j.label.replace(/\s*→.*$/, ''),
		version: congressVersionForJudgment(j.id) ?? ''
	}));
}

/** The solver's vote-trigger log ids → campaign-data note ids. */
const VOTE_TRIGGER_NOTE: Record<string, string> = {
	'log.aidedKnight': 'cell_aided_the_knight',
	'log.failedBeast': 'cell_failed_to_fend_off_the_beast',
	'log.notSeenClaretKnight': 'have_not_seen_the_last_of_the_claret_knight',
	'log.dogsAtWar': 'dogs_are_at_war',
	'log.eceTrusts': 'ece_trusts_the_cell',
	'log.eceDistrusts': 'ece_does_not_trust_the_cell',
	'log.loversReunited': 'lovers_are_reunited',
	'log.notSeenAmaranth': 'have_not_seen_the_last_of_amaranth',
	'log.amaranthLeftCoterie': 'amaranth_has_left_the_coterie',
	'log.dealWithThorne': 'cell_made_a_deal_with_thorne',
	'log.notSeenThorne': 'have_not_seen_the_last_of_thorne',
	'log.thorneDisappeared': 'thorne_disappeared',
	'log.alikiOnYourSide': 'aliki_is_on_your_side',
	'log.notSeenAliki': 'have_not_seen_the_last_of_aliki_zoni_uperetria',
	'log.desiInDebt': 'desi_is_in_your_debt',
	'log.notSeenDesi': 'have_not_seen_the_last_of_desi',
	'log.notSeenSanguineWatcher': 'have_not_seen_the_last_of_the_sanguine_watcher',
	'log.watcherTormentContinues': 'sanguine_watchers_torment_continues',
	'log.notSeenLaChicaRoja': 'have_not_seen_the_last_of_la_chica_roja',
	'log.tzuUnderYourSway': 'tzu_san_niang_is_under_your_sway',
	'log.tuwileOnYourSide': 'tuwile_masai_is_on_your_side',
	'log.meddledAbarran': 'cell_meddled_in_abarrans_affairs'
};

/** Each Coterie member's art: their finale card; Tuwile Masai has none and borrows The Bale Engine. */
const MEMBER_CARD: Record<string, string> = {
	redGlovedMan: '09752',
	laChicaRoja: '09753',
	sanguineWatcher: '09754',
	beast: '09755',
	claretKnight: '09756',
	thorne: '09757',
	desi: '09758',
	amaranth: '09759',
	tzuSanNiang: '09760',
	aliki: '09761',
	ece: '09584',
	razinFarhi: '09538',
	abarran: '88034a',
	tuwileMasai: '09769a'
};

export interface CoterieVoteRow {
	/** The solver's character id. */
	member: string;
	memberName: string;
	cardCode?: string;
	/** `absent`: votes only under a condition (Razin Farhi, when the lovers reunite). */
	defaultVote: Vote | 'absent';
	toVote: Vote;
	/** Full log keys, any of which moves the member to `toVote`. */
	triggerNoteKeys: string[];
	triggerLabel: string;
	/** The member kept their default vote. */
	isDefault?: boolean;
}

const capitalize = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

let _voteRows: CoterieVoteRow[] | null = null;
/** Every member's default vote and each recordable way to change it, in vote-table order. */
export function coterieVoteRows(): CoterieVoteRow[] {
	if (_voteRows) return _voteRows;
	const out: CoterieVoteRow[] = [];
	for (const mem of coterieVoteGuide()) {
		const base = { member: mem.member, memberName: characterName(mem.member), cardCode: MEMBER_CARD[mem.member], defaultVote: mem.defaultVote };
		if (mem.defaultVote !== 'absent')
			out.push({ ...base, toVote: mem.defaultVote, triggerNoteKeys: [], triggerLabel: '', isDefault: true });
		for (const t of mem.transitions) {
			const noteIds = t.triggerLogs.map((l) => VOTE_TRIGGER_NOTE[l]).filter((n): n is string => !!n);
			if (!noteIds.length) continue;
			out.push({
				...base,
				toVote: t.toVote,
				triggerNoteKeys: noteIds.map(noteKey),
				triggerLabel: capitalize(t.triggerLogs.map((l) => logText(l)).join(' / '))
			});
		}
	}
	return (_voteRows = out);
}

export interface CoterieBoardMember {
	member: string;
	memberName: string;
	cardCode?: string;
}

// A Nay voter joins the final battle only with a Conspirator asset, a Yea voter only with an enemy
// card; the Red-Gloved Man is always an enemy.
const ALLY_NO_CARD = new Set(['tuwileMasai']);
const ENEMY_NO_CARD = new Set(['tuwileMasai', 'abarran', 'razinFarhi']);
const ALWAYS_ENEMY = ['redGlovedMan'];

const canVote = (m: CoterieMemberVotes, vote: Vote) =>
	m.defaultVote === vote || m.transitions.some((t) => t.toVote === vote);
const boardMember = (member: string): CoterieBoardMember => ({
	member,
	memberName: characterName(member),
	cardCode: MEMBER_CARD[member]
});

let _allyMembers: CoterieBoardMember[] | null = null;
/** The members who can fight the final battle alongside the cell. */
export function coterieAllyMembers(): CoterieBoardMember[] {
	return (_allyMembers ??= coterieVoteGuide()
		.filter((m) => canVote(m, 'nay') && !ALLY_NO_CARD.has(m.member))
		.map((m) => boardMember(m.member)));
}

let _enemyMembers: CoterieBoardMember[] | null = null;
/** The members who can stand against the cell in the final battle, the Red-Gloved Man last. */
export function coterieEnemyMembers(): CoterieBoardMember[] {
	if (_enemyMembers) return _enemyMembers;
	const voters = coterieVoteGuide()
		.filter((m) => canVote(m, 'yea') && !ENEMY_NO_CARD.has(m.member) && !ALWAYS_ENEMY.includes(m.member))
		.map((m) => m.member);
	return (_enemyMembers = [...voters, ...ALWAYS_ENEMY].map(boardMember));
}

// ─── Scenario variants ────────────────────────────────────────────────────────

/** The ten story scenarios → solver FileCode, in campaign-book order. */
const TSK_SCENARIO_FILECODE: Record<string, string> = {
	riddles_and_rain: '5-A',
	dead_heat: '11-B',
	sanguine_shadows: '16-D',
	dealings_in_the_dark: '21-F',
	dancing_mad: '28-I',
	on_thin_ice: '33-K',
	dogs_of_war: '38-N',
	shades_of_suffering: '46-Q',
	without_a_trace: '56-Y',
	congress_of_the_keys: '59-Z'
};

/** The scenarios with a per-variant table (version and time-tier rows). */
export const TSK_VARIANT_SCENARIOS = Object.keys(TSK_SCENARIO_FILECODE);

/** Versions readable from the log, note → the version's ordinal: Dancing Mad's deal with Desi is
 *  Version I, the ambush Version II. */
const VERSION_LOG_ORDINAL: Record<string, Record<string, number>> = {
	dancing_mad: { cell_made_a_deal_with_desi: 1, cell_has_been_ambushed: 2 }
};

export function isVersionLogInferable(scenarioId: string): boolean {
	return scenarioId in VERSION_LOG_ORDINAL;
}

/** The version option id a log-inferable scenario's notes imply; null otherwise. */
export function scenarioVersionFromLogs(scenarioId: string, logs: ReadonlySet<string>): string | null {
	const map = VERSION_LOG_ORDINAL[scenarioId];
	if (!map) return null;
	for (const [logId, ordinal] of Object.entries(map)) {
		if (logs.has(noteKey(logId))) return scenarioReference(scenarioId)?.versions[ordinal - 1]?.id ?? null;
	}
	return null;
}

/** The version or level a play recorded for a scenario, a version falling back to the log. */
export function tskRecordedVariant(
	rec: CampaignRecord,
	scenarioId: string,
	tierKind: 'version' | 'level'
): string | null {
	const recorded = rec.scenarioTiers?.[`${scenarioId}.${tierKind}`];
	if (recorded) return recorded;
	if (tierKind !== 'version') return null;
	return scenarioVersionFromLogs(scenarioId, rec.recorded.recordedLogs ?? new Set<string>());
}

/** Restricts a scenario's resolutions to those reachable in a version. Only Dogs of War gates them;
 *  resolutions the solver leaves ungated (the cooperate wins it folds together, `no_resolution`)
 *  stay on every version. */
export function resolutionsReachableIn(scenarioId: string, versionId: string | undefined, all: string[]): string[] {
	const fileCode = TSK_SCENARIO_FILECODE[scenarioId];
	if (!fileCode || !versionId) return all;
	const gating = resolutionGating(fileCode);
	if (!Object.keys(gating).length) return all;
	// The solver's `DOW.R3` is campaign-data's `R3`.
	const suffix = (id: string) => id.split('.').pop() ?? id;
	const gated = new Set(Object.values(gating).flat().map(suffix));
	const reachable = new Set((gating[versionId] ?? []).map(suffix));
	return all.filter((r) => !gated.has(r) || reachable.has(r));
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const toRoman = (n: number): string => ROMAN[n] ?? String(n);

/** A version's table label: "v.I – Deal with Desi (before 20 time)" from the solver's
 *  "Version I – Deal with Desi (before 20 time)". */
export function versionTableLabel(scenarioId: string, versionId: string): string | null {
	const versions = scenarioReference(scenarioId)?.versions ?? [];
	const i = versions.findIndex((v) => v.id === versionId);
	if (i < 0) return null;
	const short = `v.${toRoman(i + 1)}`;
	const desc = versions[i].label.replace(/^Version\s+[IVXLCDM\d]+\s*[–-]?\s*/i, '').trim();
	return desc ? `${short} – ${desc}` : short;
}

// ─── Route steps ──────────────────────────────────────────────────────────────

const KOHAKU_SCENARIOS = new Set<string>(Object.values(Scenario));

export interface RouteStepInfo {
	scenarioId: string;
	name: string;
	/** Null when the stop is not a kohaku scenario. */
	iconSet: EncounterSet | null;
	/** The tier marker under the icon, e.g. `v.II` or `Lv.3/7`. */
	badge?: string;
	tooltip: string;
}

export function routeStepInfo(step: {
	scenarioId: string;
	level?: string;
	version?: string;
	finaleVersion?: string;
}): RouteStepInfo {
	const id = step.scenarioId;
	const name = getCampaignLog(TSK)?.en.scenarioNames?.[id] ?? id;
	let iconSet: EncounterSet | null = null;
	if (KOHAKU_SCENARIOS.has(id)) {
		try {
			iconSet = getScenarioData(id as Scenario)?.representativeSet ?? null;
		} catch {
			iconSet = null;
		}
	}
	const ref = scenarioReference(id);
	let badge: string | undefined;
	let tierLabel = '';
	if (step.finaleVersion) {
		badge = `v.${step.finaleVersion}`;
		tierLabel = `Version ${step.finaleVersion}`;
	} else if (step.version && ref) {
		const i = ref.versions.findIndex((v) => v.id === step.version);
		if (i >= 0) badge = `v.${toRoman(i + 1)}`;
		tierLabel = ref.versions[i]?.label ?? '';
	} else if (step.level && ref) {
		const i = ref.levels.findIndex((l) => l.id === step.level);
		if (i >= 0) badge = `Lv.${i + 1}/${ref.levels.length}`;
		tierLabel = ref.levels[i]?.label ?? '';
	}
	return { scenarioId: id, name, iconSet, badge, tooltip: tierLabel ? `${name} — ${tierLabel}` : name };
}

// ─── Per-scenario reference ───────────────────────────────────────────────────

let _keyCardByName: Map<string, string> | null = null;
/** A Scarlet Key's front card code by its name. */
export function keyCardCodeForName(name: string): string | null {
	if (!_keyCardByName) {
		_keyCardByName = new Map();
		for (const c of getAllCards()) {
			if (c.cardType !== CardType.Key) continue;
			const key = norm(c.name);
			if (!_keyCardByName.has(key) || c.code.endsWith('a')) _keyCardByName.set(key, c.code);
		}
	}
	return _keyCardByName.get(norm(name)) ?? null;
}

/** A Scarlet Key's front card code by its campaign-log item id. */
export function scarletKeyCardCode(itemId: string): string | null {
	const name = getCampaignLog(TSK)?.en.items?.[itemId];
	return name ? keyCardCodeForName(name) : null;
}

/** The Red Coterie members a scenario revolves around (antagonists, or an ally like Ece); Dogs of
 *  War's cast depends on its version. */
const TSK_COTERIE: Record<string, { codes: string[]; byVersion?: Record<string, string[]> }> = {
	riddles_and_rain: { codes: ['09518'] }, // The Red-Gloved Man
	dead_heat: { codes: ['09537'] }, // Amaranth
	sanguine_shadows: { codes: ['09557', '09563'] }, // La Chica Roja · The Sanguine Watcher
	dealings_in_the_dark: { codes: ['09584'] }, // Ece Şahin
	dancing_mad: { codes: ['09606a'] }, // Desiderio Delgado Álvarez
	on_thin_ice: { codes: ['09625a'] }, // Thorne
	dogs_of_war: {
		codes: ['09654a'], // The Claret Knight
		byVersion: {
			'DOW.v1': ['09654a', '09655a'], // defend the Claret Knight from the Beast (Ravager)
			'DOW.v2': ['09654a'],
			'DOW.v3': ['09655b'] // recover the Light from the Beast (Wolf in Sheep's Clothing)
		}
	},
	shades_of_suffering: { codes: ['09679a'] }, // Tzu San Niang
	without_a_trace: { codes: ['09761', '09518'] } // Aliki Zoni Uperetria · The Red-Gloved Man
};

export interface ScenarioCoterieMember {
	code: string;
	name: string;
}

export function scenarioCoterie(scenarioId: string, versionId?: string | null): ScenarioCoterieMember[] {
	const def = TSK_COTERIE[scenarioId];
	if (!def) return [];
	const codes = (versionId && def.byVersion?.[versionId]) || def.codes;
	return codes.map((code) => ({ code, name: cardByCode(code)?.name ?? '' }));
}

/** Riddles and Rain's prologue declares no Key at stake, but the Eye of Ravens is the one in play. */
const TSK_KEY_OVERRIDE: Record<string, { name: string; code: string }> = {
	riddles_and_rain: { name: 'The Eye of Ravens', code: '09519a' }
};

export interface ScenarioReference {
	scenarioId: string;
	fileCode: string;
	title: string;
	location: string;
	note: string;
	keyId: string;
	keyName: string;
	keyCardCode: string | null;
	versions: TierOption[];
	levels: TierOption[];
}

export function scenarioReference(scenarioId: string): ScenarioReference | null {
	const fileCode = TSK_SCENARIO_FILECODE[scenarioId];
	if (!fileCode) return null;
	const en = getEnFile(fileCode);
	const file = getFile(fileCode);
	const keyId = file?.keyAtStakeId;
	const override = TSK_KEY_OVERRIDE[scenarioId];
	const kName = override?.name ?? (keyId ? keyName(keyId) : '');
	return {
		scenarioId,
		fileCode,
		title: en?.title ?? scenarioId,
		location: en?.location ?? (file?.locationIds?.[0] ? locationName(file.locationIds[0]) : ''),
		note: en?.note ?? '',
		keyId: keyId ?? '',
		keyName: kName,
		keyCardCode: override?.code ?? (kName ? keyCardCodeForName(kName) : null),
		versions: options(cat().versions[fileCode]),
		levels: options(cat().levels[fileCode])
	};
}
