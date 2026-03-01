/**
 * resolution-coverage.ts — lifetime "which endings have I seen?" aggregation
 * over the opt-in resolution recorded in the editor's Extra tab (reserved
 * `__resolution` section). For each campaign family, every scenario's full set
 * of first-choice resolutions (from campaign-data `scenarioMeta`) is paired with
 * the subset the player has reached across ALL their plays — so a widget can
 * light up the visited endings and show coverage like "7 / 20 seen".
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from './achievement-aggregate';

/** How many times one resolution was reached, broken down by difficulty tier. */
export interface ResolutionTally {
	/** Total times this resolution was reached across plays. */
	total: number;
	/** Times reached per difficulty tier, e.g. `{ standard: 4, hard: 1 }`. */
	byTier: Record<string, number>;
}
export interface ScenarioResolutionCoverage {
	scenario: string;
	/** Every first-choice resolution id for this scenario, in book order. */
	all: string[];
	/** The subset of `all` reached across the player's plays. */
	visited: string[];
	/** Per-resolution visit counts (only resolutions actually reached have an entry). */
	tallies: Record<string, ResolutionTally>;
}
export interface CampaignResolutionCoverage {
	family: string;
	name: string;
	scenarios: ScenarioResolutionCoverage[];
	/** Distinct resolutions visited across all scenarios. */
	visitedCount: number;
	/** Total resolutions available across all scenarios. */
	totalCount: number;
}

export function buildResolutionCoverage(records: CampaignRecord[]): CampaignResolutionCoverage[] {
	// family -> scenario -> resolution id -> tally (count + per-difficulty), across plays.
	const talliesByFamily = new Map<string, Map<string, Map<string, ResolutionTally>>>();
	const familiesSeen = new Set<string>();
	for (const rec of records) {
		const log = getCampaignLog(rec.campaignCode);
		if (!log) continue;
		const family = log.db.originalId ?? log.db.code;
		familiesSeen.add(family);
		const tier = rec.recorded.difficulty ?? 'standard'; // match clear-status bucketing
		const res = rec.scenarioResolutions ?? {};
		for (const [scenario, resolution] of Object.entries(res)) {
			let fam = talliesByFamily.get(family);
			if (!fam) {
				fam = new Map();
				talliesByFamily.set(family, fam);
			}
			let sc = fam.get(scenario);
			if (!sc) {
				sc = new Map();
				fam.set(scenario, sc);
			}
			let t = sc.get(resolution);
			if (!t) {
				t = { total: 0, byTier: {} };
				sc.set(resolution, t);
			}
			t.total += 1;
			t.byTier[tier] = (t.byTier[tier] ?? 0) + 1;
		}
	}

	const out: CampaignResolutionCoverage[] = [];
	for (const family of familiesSeen) {
		const baseLog = getCampaignLog(family);
		if (!baseLog) continue;
		const famTallies =
			talliesByFamily.get(family) ?? new Map<string, Map<string, ResolutionTally>>();
		const scenarios: ScenarioResolutionCoverage[] = [];
		let visitedCount = 0;
		let totalCount = 0;
		for (const sm of baseLog.db.scenarioMeta ?? []) {
			const all = sm.resolutions ?? [];
			if (!all.length) continue;
			const scTallies = famTallies.get(sm.id) ?? new Map<string, ResolutionTally>();
			const vis: string[] = [];
			const tallies: Record<string, ResolutionTally> = {};
			for (const r of all) {
				const t = scTallies.get(r);
				if (t) {
					vis.push(r);
					tallies[r] = t;
				}
			}
			scenarios.push({ scenario: sm.id, all, visited: vis, tallies });
			visitedCount += vis.length;
			totalCount += all.length;
		}
		if (scenarios.length) {
			out.push({ family, name: baseLog.db.name, scenarios, visitedCount, totalCount });
		}
	}
	return out;
}
