/**
 * tdc.ts — The Drowned City bespoke per-campaign tallies. ONE builder, ONE
 * payload blob (`tdc`), mirroring `fhv.ts` / `tic.ts`. See `tdc-widgets-plan.md`.
 *
 *   • fold — The Fold: which way the expedition headed at Expedition to R'lyeh
 *     (`expedition_headed_west` / `_east`). The campaign's mirrored core: the same
 *     five sites are reached from either side, harder from the long way round.
 *   • glyphs — the 26 alien glyphs (`tdc_rune_a..z`, projected to
 *     `recordedSectionItems['glyphs']`), grouped by the scenario they're decrypted
 *     in. All 26 ⇒ `alien_grad` + one half of the better-ending gate.
 *   • artifacts — the 6 eldritch artifacts (`artifacts_earned`); all 6 ⇒
 *     `powers_combined` + the Part-II "repel" approach. `kept` = the ones carried
 *     into the finale (`hidden.kept_*`).
 *   • tasks — the side tasks taken at "An Offer You Can't Refuse": which of the 8
 *     were picked (`hidden.picked_*`), best/lifetime progress (`task_progress`),
 *     the `obligations` gate (≥5), and the per-investigator assignment (Extra:
 *     `one_last_job.task_assignment` ⨯ `_investigator`, mirroring PtC weaknesses).
 *   • scenarios — per expedition-scenario fork outcomes (One Last Job … Obsidian
 *     Canyons), each a note-key → plays tally, rendered by the generic passport.
 *   • sepulchre — Sepulchre of the Sleeper (the better-ending gate): the
 *     `halted_cthulhus_awakening` ending vs `did_not_confront_the_nightmare`.
 *   • doom — The Doom of Arkham finale: the Part-II approach fork, the four endings,
 *     and the flooded Arkham neighborhoods.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import { filterFamilyRecords } from '../records/campaign-family';
import { canonInvestigatorCode } from '../utils/card-filters';

const TDC_FAMILY = 'tdc';
const N = 'campaign_notes';
const k = (id: string) => `${N}.${id}`;
const GLYPHS = 'glyphs';
const H = 'hidden';

/** Resolve a TDC campaign-data entry's English text by composite key (e.g.
 *  `campaign_notes.cthulhu_was_driven_away`, `artifacts_earned.barrier_node`,
 *  `glyphs.tdc_rune_a`). Falls back to the key itself when no entry exists. */
export function tdcText(compositeKey: string): string {
	return getCampaignLog(TDC_FAMILY)?.en.entries[compositeKey]?.text ?? compositeKey;
}

/**
 * The 26 alien glyphs grouped by the scenario they're decrypted in (expedition
 * order). `tdc_rune_a` is found in One Last Job (DB-linked); the rest map to the
 * five mirrored sites + Court of the Ancients / Obsidian Canyons via the location
 * cards (references/pack/tdc/tdcc.json). Grouping is per-scenario, NOT per-side —
 * the same glyph is reachable from either approach.
 */
export const TDC_GLYPHS_BY_SCENARIO: { scenario: string; ids: string[] }[] = [
	{ scenario: 'one_last_job', ids: ['tdc_rune_a'] },
	{ scenario: 'the_western_wall', ids: ['tdc_rune_v', 'tdc_rune_w', 'tdc_rune_z'] },
	{ scenario: 'the_drowned_quarter', ids: ['tdc_rune_x', 'tdc_rune_y'] },
	{ scenario: 'the_apiary', ids: ['tdc_rune_q', 'tdc_rune_r', 'tdc_rune_s', 'tdc_rune_t', 'tdc_rune_u'] },
	{ scenario: 'the_grand_vault', ids: ['tdc_rune_l', 'tdc_rune_m', 'tdc_rune_n', 'tdc_rune_o', 'tdc_rune_p'] },
	{ scenario: 'court_of_the_ancients', ids: ['tdc_rune_g', 'tdc_rune_h', 'tdc_rune_i', 'tdc_rune_j', 'tdc_rune_k'] },
	{ scenario: 'obsidian_canyons', ids: ['tdc_rune_b', 'tdc_rune_c', 'tdc_rune_d', 'tdc_rune_e', 'tdc_rune_f'] }
];

/** Flat list of all 26 glyph ids (derived from the per-scenario grouping). */
export const TDC_GLYPH_IDS: string[] = TDC_GLYPHS_BY_SCENARIO.flatMap((g) => g.ids);

/** The 6 eldritch artifacts (display order); all 6 ⇒ `powers_combined`. */
export const TDC_ARTIFACTS: string[] = [
	'barrier_node',
	'grisly_mask',
	'tidal_tablet',
	'shard',
	'obsidian_claw',
	'clah_horror'
];

/** The 5 artifacts that can be CARRIED into the finale (`hidden.kept_*`). The sixth,
 *  `clah_horror`, is earned during Part II itself, so it has no `kept_` twin. */
export const TDC_KEPT_ARTIFACTS: string[] = [
	'barrier_node',
	'grisly_mask',
	'tidal_tablet',
	'shard',
	'obsidian_claw'
];

/** The 8 side tasks assigned at "An Offer You Can't Refuse": the `hidden.picked_*`
 *  log id ⨯ the task's player-card code (the Extra picker's pool, and the tile art). */
export const TDC_TASKS: { id: string; code: string }[] = [
	{ id: 'no_place_like_home', code: '11753a' },
	{ id: 'walk_in_faith', code: '11754a' },
	{ id: 'toe_the_line', code: '11755a' },
	{ id: 'good_money', code: '11756a' },
	{ id: 'prove_your_worth', code: '11757a' },
	{ id: 'do_no_harm', code: '11758a' },
	{ id: 'dreams_of_destruction', code: '11759a' },
	{ id: 'plumb_the_depths', code: '11760a' }
];

/** The 7 Arkham neighborhoods that can flood in the finale (`flooded_neighborhoods`). */
export const TDC_FLOODED: string[] = [
	'downtown',
	'easttown',
	'miskatonic_university',
	'northside',
	'rivertown',
	'southside',
	'st_marys_hospital'
];

/**
 * Per expedition-scenario fork outcomes, rendered by the generic `TdcScenario`
 * passport. `notes` are FULL composite log keys (mixed sections — `campaign_notes.*`,
 * `artifacts_earned.*`, `hidden.*`), each a lit/greyed line resolved via {@link tdcText}.
 * The Doom finale and the Sepulchre are handled by their own bespoke widgets.
 */
export const TDC_SCENARIOS: { id: string; notes: string[] }[] = [
	{ id: 'one_last_job', notes: [
		'campaign_notes.discovered_an_alien_language',
		'campaign_notes.ruby_won_the_bet',
		'campaign_notes.ruby_lost_the_bet'
	] },
	{ id: 'the_western_wall', notes: [
		'campaign_notes.the_creature_was_defeated',
		'campaign_notes.expedition_helped_pilgrim',
		'campaign_notes.expedition_abandoned_pilgrim'
	] },
	{ id: 'the_drowned_quarter', notes: [
		'artifacts_earned.barrier_node',
		'campaign_notes.the_power_was_diverted'
	] },
	{ id: 'the_apiary', notes: [
		'campaign_notes.pilgrims_were_saved',
		'campaign_notes.pilgrims_were_devoured',
		'campaign_notes.exterminated_the_alien_parasites',
		'artifacts_earned.grisly_mask'
	] },
	{ id: 'the_grand_vault', notes: [
		'campaign_notes.the_inner_sanctum_was_unsealed',
		'artifacts_earned.tidal_tablet'
	] },
	{ id: 'court_of_the_ancients', notes: [
		'artifacts_earned.shard'
	] },
	{ id: 'obsidian_canyons', notes: [
		'artifacts_earned.obsidian_claw',
		'hidden.tdc_helped_with_the_ropes'
	] }
];

/** One recorded side-task assignment: the task's player-card code, the investigator who
 *  took it (Extra `_investigator` companion; null when unrecorded — the task still shows),
 *  and the finish date of the play. ONE entry per pick, newest-first. */
export interface TdcTaskAssignment {
	code: string;
	investigator: string | null;
	finishDate: number | null;
}

export interface CampaignTdc {
	/** Always 'tdc'. */
	family: string;
	plays: number;
	/** The Fold — which direction the expedition took (mirrored routes). */
	fold: { west: number; east: number };
	/** Glyphs — rune id → plays decrypted; everCollected = distinct runes; allTwentySix = full-set plays. */
	glyphs: { collected: Record<string, number>; everCollected: number; allTwentySix: number };
	/** Artifacts — id → plays earned; kept = plays carried into the finale; allSix = full-set plays. */
	artifacts: {
		earned: Record<string, number>;
		kept: Record<string, number>;
		everEarned: number;
		allSix: number;
	};
	/** Side tasks — best single-play progress + lifetime total, plays reaching the `obligations`
	 *  gate (≥5), which of the 8 were picked, and the per-investigator assignment (Extra). */
	tasks: {
		best: number;
		total: number;
		obligations: number;
		picked: Record<string, number>;
		assignments: TdcTaskAssignment[];
	};
	/** Sepulchre of the Sleeper (the better-ending gate). */
	sepulchre: { halted: number; didNotConfront: number };
	/** Per expedition-scenario fork outcomes: scenario id → note key → plays. */
	scenarios: Record<string, Record<string, number>>;
	/** The Doom of Arkham — the Part-II approach fork, four endings, and flooded neighborhoods. */
	doom: {
		stoodTogether: number;
		alliesPlan: number;
		/** win — drove Cthulhu off (the "fight" approach, < 5 artifacts). */
		drivenAway: number;
		/** win — banished (the "repel" approach, ≥ 5 artifacts). */
		banished: number;
		/** win — banished but Arkham was destroyed. */
		banishedButDestroyed: number;
		/** loss — Cthulhu annihilated Arkham. */
		annihilated: number;
		/** neighborhood id → plays flooded. */
		flooded: Record<string, number>;
	};
}

export function buildTdc(records: CampaignRecord[]): CampaignTdc[] {
	const baseLog = getCampaignLog(TDC_FAMILY);
	if (!baseLog) return [];
	const tdcRecords = filterFamilyRecords(records, TDC_FAMILY);
	if (tdcRecords.length === 0) return [];

	const fold = { west: 0, east: 0 };
	const glyphCollected: Record<string, number> = {};
	let allTwentySix = 0;
	const artifactEarned: Record<string, number> = {};
	const artifactKept: Record<string, number> = {};
	let allSix = 0;
	let taskBest = 0;
	let taskTotal = 0;
	let obligations = 0;
	const taskPicked: Record<string, number> = {};
	const assignments: TdcTaskAssignment[] = [];
	const sepulchre = { halted: 0, didNotConfront: 0 };
	const scenarios: Record<string, Record<string, number>> = {};
	for (const sc of TDC_SCENARIOS) scenarios[sc.id] = {};
	const doom = {
		stoodTogether: 0,
		alliesPlan: 0,
		drivenAway: 0,
		banished: 0,
		banishedButDestroyed: 0,
		annihilated: 0,
		flooded: {} as Record<string, number>
	};

	for (const rec of tdcRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const counts = rec.recorded.logCounts ?? {};
		const items = rec.recorded.recordedSectionItems ?? {};
		const has = (key: string) => logs.has(key);
		const subjCanon = new Set((rec.subjectInvestigators ?? []).map(canonInvestigatorCode));
		const when = rec.finishDate ?? null;

		// The Fold.
		if (has(k('expedition_headed_west'))) fold.west += 1;
		if (has(k('expedition_headed_east'))) fold.east += 1;

		// Glyphs (recordedSectionItems['glyphs'] holds bare rune ids).
		const glyphSet = items[GLYPHS] ?? new Set<string>();
		let glyphCount = 0;
		for (const id of TDC_GLYPH_IDS) {
			if (glyphSet.has(id)) {
				glyphCollected[id] = (glyphCollected[id] ?? 0) + 1;
				glyphCount += 1;
			}
		}
		if (glyphCount === TDC_GLYPH_IDS.length) allTwentySix += 1;

		// Artifacts (earned + carried into the finale).
		let artifactCount = 0;
		for (const id of TDC_ARTIFACTS) {
			if (has(`artifacts_earned.${id}`)) {
				artifactEarned[id] = (artifactEarned[id] ?? 0) + 1;
				artifactCount += 1;
			}
		}
		if (artifactCount === TDC_ARTIFACTS.length) allSix += 1;
		for (const id of TDC_KEPT_ARTIFACTS) {
			if (has(`${H}.kept_${id}`)) artifactKept[id] = (artifactKept[id] ?? 0) + 1;
		}

		// Side tasks — progress (count) + which picked (hidden) + assignment (Extra).
		const taskN = counts['task_progress'] ?? 0;
		if (taskN > taskBest) taskBest = taskN;
		taskTotal += taskN;
		if (taskN >= 5) obligations += 1;
		for (const t of TDC_TASKS) {
			if (has(`${H}.picked_${t.id}`)) taskPicked[t.id] = (taskPicked[t.id] ?? 0) + 1;
		}
		{
			// The task and investigator lists are positionally paired, so split WITHOUT filtering —
			// filtering each independently would collapse an empty investigator slot and mis-pair every
			// later task with the wrong bearer. An empty investigator at a position means "unattributed".
			const codes = (rec.scenarioChoices?.['one_last_job.task_assignment'] ?? '').split(',');
			const invs = (
				rec.scenarioChoices?.['one_last_job.task_assignment_investigator'] ?? ''
			).split(',');
			for (let i = 0; i < codes.length; i++) {
				const code = codes[i];
				if (!code) continue;
				const inv = invs[i] ? canonInvestigatorCode(invs[i]) : null;
				// Keep unattributed picks (can't scope); drop a teammate's known investigator.
				if (inv && !subjCanon.has(inv)) continue;
				assignments.push({ code, investigator: inv, finishDate: when });
			}
		}

		// Sepulchre of the Sleeper (the better-ending gate).
		if (has(k('halted_cthulhus_awakening'))) sepulchre.halted += 1;
		if (has(k('did_not_confront_the_nightmare'))) sepulchre.didNotConfront += 1;

		// Per expedition-scenario fork outcomes.
		for (const sc of TDC_SCENARIOS) {
			for (const note of sc.notes) if (has(note)) scenarios[sc.id][note] = (scenarios[sc.id][note] ?? 0) + 1;
		}

		// The Doom of Arkham.
		if (has(k('stood_together'))) doom.stoodTogether += 1;
		if (has(k('your_allies_have_a_plan'))) doom.alliesPlan += 1;
		if (has(k('cthulhu_was_driven_away'))) doom.drivenAway += 1;
		if (has(k('cthulhu_was_banished'))) doom.banished += 1;
		if (has(k('cthulhu_was_banished_but_arkham_was_destroyed'))) doom.banishedButDestroyed += 1;
		if (has(k('cthulhu_annihilated_the_city_of_arkham'))) doom.annihilated += 1;
		for (const id of TDC_FLOODED) {
			if (has(`flooded_neighborhoods.${id}`)) doom.flooded[id] = (doom.flooded[id] ?? 0) + 1;
		}
	}

	const everCollected = TDC_GLYPH_IDS.filter((id) => (glyphCollected[id] ?? 0) > 0).length;
	const everEarned = TDC_ARTIFACTS.filter((id) => (artifactEarned[id] ?? 0) > 0).length;
	// Assignments newest-first (the roster is a chronological log; date both orders and labels).
	assignments.sort((a, b) => (b.finishDate ?? 0) - (a.finishDate ?? 0));

	return [
		{
			family: TDC_FAMILY,
			plays: tdcRecords.length,
			fold,
			glyphs: { collected: glyphCollected, everCollected, allTwentySix },
			artifacts: { earned: artifactEarned, kept: artifactKept, everEarned, allSix },
			tasks: { best: taskBest, total: taskTotal, obligations, picked: taskPicked, assignments },
			sepulchre,
			scenarios,
			doom
		}
	];
}
