/**
 * scenario-stats.ts — the UNIFIED per-scenario record. One structure per campaign holding
 * everything the scenario passport (and external `.ahlifepro` readers) need, uniformly across
 * every campaign: plays, victory-display highscore, the resolutions reached (+ each one's
 * win/loss verdict from campaign-data), the resolution-derived Succeed / Failed, and the Extra
 * choices. It REPLACES the separate `scenarioXp` + `resolutionCoverage` payload structures so the
 * compiled profile reads uniformly — campaigns → scenarios → { plays, succeed, failed, … }.
 *
 * Built by merging the two existing (tested) aggregations — `buildScenarioXp` (XP / choices /
 * scenario order + names) and `buildResolutionCoverage` (resolutions reached + Succeed/Failed) —
 * then computing an accurate generic `plays` (records that recorded the scenario via XP OR a
 * resolution) and layering each scenario's `resolutionOutcomes` verdict. The two builders stay as
 * internal helpers (still unit-tested); only this merged structure is serialized.
 */
import { getCampaignLog, playableScenarios } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import { familyOf } from '../records/campaign-family';
import {
	buildScenarioXp,
	scenarioDisplayName,
	type ScenarioChoiceAgg,
	type ScenarioXpStat
} from './extra-imports';
import { buildResolutionCoverage, type ResolutionTally } from '../outcomes/resolution-coverage';
import { buildVersionStats, VERSION_AXES, type VersionStat } from './version-stats';

export type ResolutionVerdict = 'win' | 'loss' | 'neutral';

export interface ScenarioStat {
	scenario: string;
	/** Display name (campaign-data `scenarioNames`), de-slugged id as fallback. */
	name: string;
	/** Victory-display highscore + its per-difficulty breakdown, and the lifetime XP sum. */
	best: number;
	total: number;
	bestByTier: Record<string, number>;
	/** Plays that recorded this scenario in ANY way (XP or a resolution), with difficulty breakdown. */
	plays: number;
	playsByTier: Record<string, number>;
	/** Every first-choice resolution id (book order), the subset reached, and per-resolution tallies. */
	resolutions: string[];
	visited: string[];
	tallies: Record<string, ResolutionTally>;
	/** Per-resolution Succeed/Failure verdict (campaign-data `resolutionOutcomes`). */
	verdicts: Record<string, ResolutionVerdict>;
	/** Resolution-derived Succeed / Failed across plays (each by difficulty); null when unscored. */
	succeed: ResolutionTally | null;
	failed: ResolutionTally | null;
	/** Per-scenario Extra choices (e.g. PtC Hastur version) with played/won split. */
	choices?: ScenarioChoiceAgg[];
	/** Per-version breakdown (plays / Succeed / Failed / resolutions / XP) for scenarios played in
	 *  several versions — present only for scenarios in the version-axis registry. */
	versions?: VersionStat[];
}
export interface CampaignScenarios {
	family: string;
	name: string;
	scenarios: ScenarioStat[];
	/** Sum of best XP across scenarios (Scenario XP Highscore widget header). */
	totalBest: number;
	/** Distinct resolutions visited / total available (Resolution Coverage widget header). */
	resolutionsVisited: number;
	resolutionsTotal: number;
}

/** Per (family → scenario) play count — records that recorded the scenario via XP OR a resolution,
 *  per difficulty. This is the accurate generic "played" count (XP alone undershoots when a play
 *  recorded only a resolution). */
function playsByFamilyScenario(
	records: CampaignRecord[]
): Map<string, Map<string, ResolutionTally>> {
	const out = new Map<string, Map<string, ResolutionTally>>();
	for (const rec of records) {
		const log = getCampaignLog(rec.campaignCode);
		if (!log) continue;
		const family = familyOf(log);
		const tier = rec.recorded.difficulty ?? 'standard';
		const touched = new Set([
			...Object.keys(rec.scenarioXp ?? {}),
			...Object.keys(rec.scenarioResolutions ?? {})
		]);
		if (!touched.size) continue;
		let fam = out.get(family);
		if (!fam) {
			fam = new Map();
			out.set(family, fam);
		}
		for (const scenario of touched) {
			let p = fam.get(scenario);
			if (!p) {
				p = { total: 0, byTier: {} };
				fam.set(scenario, p);
			}
			p.total += 1;
			p.byTier[tier] = (p.byTier[tier] ?? 0) + 1;
		}
	}
	return out;
}

export function buildScenarioStats(records: CampaignRecord[]): CampaignScenarios[] {
	const xp = buildScenarioXp(records);
	const coverage = buildResolutionCoverage(records);
	const plays = playsByFamilyScenario(records);
	// Records grouped by family — the per-version builder buckets a family's plays by version.
	const recordsByFamily = new Map<string, CampaignRecord[]>();
	for (const rec of records) {
		const log = getCampaignLog(rec.campaignCode);
		if (!log) continue;
		const fam = familyOf(log);
		let list = recordsByFamily.get(fam);
		if (!list) recordsByFamily.set(fam, (list = []));
		list.push(rec);
	}
	const xpByFamily = new Map(xp.map((c) => [c.family, c]));
	const covByFamily = new Map(coverage.map((c) => [c.family, c]));

	const out: CampaignScenarios[] = [];
	for (const family of new Set([...xpByFamily.keys(), ...covByFamily.keys()])) {
		const cx = xpByFamily.get(family) ?? null;
		const cov = covByFamily.get(family) ?? null;
		const log = getCampaignLog(family);
		const meta = log?.db.scenarioMeta ?? [];
		const verdictsById = new Map(
			meta.map((m) => [m.id, (m.resolutionOutcomes ?? {}) as Record<string, ResolutionVerdict>])
		);
		const covByScenario = new Map((cov?.scenarios ?? []).map((s) => [s.scenario, s]));
		const famPlays = plays.get(family) ?? new Map<string, ResolutionTally>();
		const famRecords = recordsByFamily.get(family) ?? [];

		const merge = (s: ScenarioXpStat): ScenarioStat => {
			const sc = covByScenario.get(s.scenario);
			const p = famPlays.get(s.scenario);
			const axis = VERSION_AXES[s.scenario];
			const versions = axis && log ? buildVersionStats(famRecords, s.scenario, axis, log) : undefined;
			return {
				scenario: s.scenario,
				name: s.name,
				best: s.best,
				total: s.total,
				bestByTier: s.bestByTier,
				plays: p?.total ?? 0,
				playsByTier: p?.byTier ?? {},
				resolutions: sc?.all ?? [],
				visited: sc?.visited ?? [],
				tallies: sc?.tallies ?? {},
				verdicts: verdictsById.get(s.scenario) ?? {},
				succeed: sc?.succeed ?? null,
				failed: sc?.failed ?? null,
				choices: s.choices,
				...(versions && versions.length ? { versions } : {})
			};
		};

		let scenarios: ScenarioStat[];
		let name: string;
		let totalBest: number;
		if (cx) {
			// Common path: the XP aggregation already lists every playable scenario in book order.
			scenarios = cx.scenarios.map(merge);
			name = cx.name;
			totalBest = cx.totalBest;
		} else {
			// Rare: a campaign played with ONLY resolutions recorded (no XP / choices), so the XP
			// aggregation skipped it. Build the scenario list from the campaign-data playable order.
			const order = log ? playableScenarios(log) : (cov?.scenarios ?? []).map((s) => s.scenario);
			const orderIndex = new Map(order.map((id, i) => [id, i]));
			const names = log?.en.scenarioNames ?? {};
			scenarios = order.map((scenario) =>
				merge({
					scenario,
					name: scenarioDisplayName(scenario, names, orderIndex),
					best: 0,
					total: 0,
					plays: 0,
					bestByTier: {},
					playsByTier: {}
				})
			);
			name = cov?.name ?? log?.db.name ?? family;
			totalBest = 0;
		}

		out.push({
			family,
			name,
			scenarios,
			totalBest,
			resolutionsVisited: cov?.visitedCount ?? 0,
			resolutionsTotal: cov?.totalCount ?? 0
		});
	}
	return out;
}
