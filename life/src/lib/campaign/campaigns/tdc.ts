/**
 * tdc.ts — The Drowned City bespoke per-campaign tallies. ONE builder, ONE
 * payload blob (`tdc`), mirroring `tic.ts` / `fhv.ts`. Fully log-derived. See
 * `tdc-widgets-plan.md`.
 *
 *   • fold — The Fold: which way the expedition headed at Expedition to R'lyeh
 *     (`expedition_headed_west` / `_east`). The campaign's mirrored core: the same
 *     five sites are reached from either side, harder from the long way round.
 *   • glyphs — the 26 alien glyphs (`tdc_rune_a..z`, projected to
 *     `recordedSectionItems['glyphs']`), grouped by the scenario they're decrypted
 *     in. Complements the card-art `tdcGlyphWall`; this is the per-scenario tally +
 *     the all-26 gate (one half of the better-ending requirement).
 *   • artifacts — the 6 eldritch artifacts (`artifacts_earned`); all 6 ⇒ the
 *     `powers_combined` achievement and the Part-II "repel" approach.
 *   • tasks — the side tasks taken at "An Offer You Can't Refuse"
 *     (`logCounts['task_progress']`): best single-play progress + lifetime total.
 *   • sepulchre — Sepulchre of the Sleeper (west-only, skippable): the
 *     `halted_cthulhus_awakening` BETTER ending (all 5 artifacts + all 26 glyphs +
 *     the inner sanctum unsealed) vs `did_not_confront_the_nightmare` (skipped).
 *   • per-scenario forks — One Last Job / Western Wall / Drowned Quarter / Apiary /
 *     Grand Vault decisions.
 *   • doom — The Doom of Arkham finale: Part I interludes + the four Part-II
 *     endings (drove off / banished / banished-but-Arkham-destroyed / annihilated).
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import { filterFamilyRecords } from '../records/campaign-family';

const TDC_FAMILY = 'tdc';
const N = 'campaign_notes';
const k = (id: string) => `${N}.${id}`;
const GLYPHS = 'glyphs';

/** Resolve a TDC campaign-data entry's English text by composite key (e.g.
 *  `campaign_notes.cthulhu_was_driven_away`, `artifacts_earned.barrier_node`).
 *  Falls back to the key itself when no entry exists. */
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

export interface CampaignTdc {
	/** Always 'tdc'. */
	family: string;
	plays: number;
	/** The Fold — which direction the expedition took (mirrored routes). */
	fold: { west: number; east: number };
	/** Glyphs — rune id → plays decrypted; everCollected = distinct runes; allTwentySix = full-set plays. */
	glyphs: { collected: Record<string, number>; everCollected: number; allTwentySix: number };
	/** Artifacts — artifact id → plays earned; everEarned distinct; allSix = full-set plays. */
	artifacts: { earned: Record<string, number>; everEarned: number; allSix: number };
	/** Side tasks (An Offer You Can't Refuse) — best single-play progress + lifetime total. */
	tasks: { best: number; total: number };
	/** Sepulchre of the Sleeper (west-only, skippable) — the better-ending gate. */
	sepulchre: { halted: number; didNotConfront: number };
	oneLastJob: { discoveredLanguage: number; rubyWon: number; rubyLost: number };
	westernWall: { creatureDefeated: number; helpedPilgrim: number; abandonedPilgrim: number };
	drownedQuarter: { powerDiverted: number };
	apiary: { pilgrimsSaved: number; pilgrimsDevoured: number; exterminatedParasites: number };
	grandVault: { innerSanctumUnsealed: number };
	/** The Doom of Arkham — Part I interludes + the four Part-II endings. */
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
	let allSix = 0;
	let taskBest = 0;
	let taskTotal = 0;
	const sepulchre = { halted: 0, didNotConfront: 0 };
	const oneLastJob = { discoveredLanguage: 0, rubyWon: 0, rubyLost: 0 };
	const westernWall = { creatureDefeated: 0, helpedPilgrim: 0, abandonedPilgrim: 0 };
	const drownedQuarter = { powerDiverted: 0 };
	const apiary = { pilgrimsSaved: 0, pilgrimsDevoured: 0, exterminatedParasites: 0 };
	const grandVault = { innerSanctumUnsealed: 0 };
	const doom = { stoodTogether: 0, alliesPlan: 0, drivenAway: 0, banished: 0, banishedButDestroyed: 0, annihilated: 0 };

	for (const rec of tdcRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const counts = rec.recorded.logCounts ?? {};
		const items = rec.recorded.recordedSectionItems ?? {};
		const has = (key: string) => logs.has(key);

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

		// Artifacts.
		let artifactCount = 0;
		for (const id of TDC_ARTIFACTS) {
			if (has(`artifacts_earned.${id}`)) {
				artifactEarned[id] = (artifactEarned[id] ?? 0) + 1;
				artifactCount += 1;
			}
		}
		if (artifactCount === TDC_ARTIFACTS.length) allSix += 1;

		// Side tasks (count-kind → logCounts['task_progress']).
		const taskN = counts['task_progress'] ?? 0;
		if (taskN > taskBest) taskBest = taskN;
		taskTotal += taskN;

		// Sepulchre of the Sleeper (the better-ending gate).
		if (has(k('halted_cthulhus_awakening'))) sepulchre.halted += 1;
		if (has(k('did_not_confront_the_nightmare'))) sepulchre.didNotConfront += 1;

		// Per-scenario forks.
		if (has(k('discovered_an_alien_language'))) oneLastJob.discoveredLanguage += 1;
		if (has(k('ruby_won_the_bet'))) oneLastJob.rubyWon += 1;
		if (has(k('ruby_lost_the_bet'))) oneLastJob.rubyLost += 1;

		if (has(k('the_creature_was_defeated'))) westernWall.creatureDefeated += 1;
		if (has(k('expedition_helped_pilgrim'))) westernWall.helpedPilgrim += 1;
		if (has(k('expedition_abandoned_pilgrim'))) westernWall.abandonedPilgrim += 1;

		if (has(k('the_power_was_diverted'))) drownedQuarter.powerDiverted += 1;

		if (has(k('pilgrims_were_saved'))) apiary.pilgrimsSaved += 1;
		if (has(k('pilgrims_were_devoured'))) apiary.pilgrimsDevoured += 1;
		if (has(k('exterminated_the_alien_parasites'))) apiary.exterminatedParasites += 1;

		if (has(k('the_inner_sanctum_was_unsealed'))) grandVault.innerSanctumUnsealed += 1;

		// The Doom of Arkham.
		if (has(k('stood_together'))) doom.stoodTogether += 1;
		if (has(k('your_allies_have_a_plan'))) doom.alliesPlan += 1;
		if (has(k('cthulhu_was_driven_away'))) doom.drivenAway += 1;
		if (has(k('cthulhu_was_banished'))) doom.banished += 1;
		if (has(k('cthulhu_was_banished_but_arkham_was_destroyed'))) doom.banishedButDestroyed += 1;
		if (has(k('cthulhu_annihilated_the_city_of_arkham'))) doom.annihilated += 1;
	}

	const everCollected = TDC_GLYPH_IDS.filter((id) => (glyphCollected[id] ?? 0) > 0).length;
	const everEarned = TDC_ARTIFACTS.filter((id) => (artifactEarned[id] ?? 0) > 0).length;

	return [
		{
			family: TDC_FAMILY,
			plays: tdcRecords.length,
			fold,
			glyphs: { collected: glyphCollected, everCollected, allTwentySix },
			artifacts: { earned: artifactEarned, everEarned, allSix },
			tasks: { best: taskBest, total: taskTotal },
			sepulchre,
			oneLastJob,
			westernWall,
			drownedQuarter,
			apiary,
			grandVault,
			doom
		}
	];
}
