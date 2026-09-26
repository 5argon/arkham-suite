/**
 * The per-scenario record behind every scenario passport and external `.ahlifepro` readers:
 * plays, reward highscore, resolutions reached with their verdicts, Succeed / Failed, Extra choices
 * and per-version breakdowns, merged from the XP and resolution-coverage aggregations.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../records/campaign-record';
import {
	contributingFamilies,
	familyScenarioMeta,
	familyScenarioNames,
	recordsByFamily
} from '../records/campaign-family';
import {
	buildScenarioXp,
	scenarioDisplayName,
	type ScenarioChoiceAgg,
	type ScenarioXpStat
} from './extra-imports';
import { buildResolutionCoverage } from '../outcomes/resolution-coverage';
import type { Tally } from '../utils/tally';
import { scenarioVerdicts, type ResolutionVerdict } from '../utils/scenario-meta';
import { buildVersionStats, VERSION_AXES, type VersionStat } from './version-stats';

export interface ScenarioStat {
	scenario: string;
	name: string;
	/** Extra: highest reward (VP or XP, see `isVictoryDisplay`) and the lifetime sum. */
	best: number;
	total: number;
	bestByTier: Record<string, number>;
	/** Plays that recorded the scenario's reward or resolution. */
	/** Plays that recorded the scenario's reward, a resolution or a TSK tier. */
	plays: number;
	playsByTier: Record<string, number>;
	/** Every first-choice resolution id in book order. */
	resolutions: string[];
	visited: string[];
	tallies: Record<string, Tally>;
	verdicts: Record<string, ResolutionVerdict>;
	/** Null when no reached resolution has a win / loss verdict. */
	succeed: Tally | null;
	failed: Tally | null;
	choices?: ScenarioChoiceAgg[];
	/** Only for scenarios with a `VERSION_AXES` entry. */
	versions?: VersionStat[];
}
export interface CampaignScenarios {
	family: string;
	name: string;
	scenarios: ScenarioStat[];
	/** Sum of `best` across scenarios. */
	totalBest: number;
	resolutionsVisited: number;
	resolutionsTotal: number;
}

/** Per (family → scenario) play count, per difficulty: records that recorded the scenario's XP, a
 *  resolution or a tier (TSK's time level / version). */
function playsByFamilyScenario(
	records: CampaignRecord[],
	mergeReturnTo: boolean
): Map<string, Map<string, Tally>> {
	const out = new Map<string, Map<string, Tally>>();
	for (const rec of records) {
		const log = getCampaignLog(rec.campaignCode);
		if (!log) continue;
		const tier = rec.recorded.difficulty ?? 'standard';
		const touched = new Set([
			...Object.keys(rec.scenarioXp ?? {}),
			...Object.keys(rec.scenarioResolutions ?? {}),
			// Tier keys are `<scenario>.<level | version>`.
			...Object.keys(rec.scenarioTiers ?? {}).map((k) => k.slice(0, k.lastIndexOf('.')))
		]);
		if (!touched.size) continue;
		for (const family of contributingFamilies(log, mergeReturnTo)) {
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
	}
	return out;
}

export function buildScenarioStats(
	records: CampaignRecord[],
	mergeReturnTo = true
): CampaignScenarios[] {
	const xp = buildScenarioXp(records, mergeReturnTo);
	const coverage = buildResolutionCoverage(records, mergeReturnTo);
	const plays = playsByFamilyScenario(records, mergeReturnTo);
	const groups = recordsByFamily(records, mergeReturnTo);
	const xpByFamily = new Map(xp.map((c) => [c.family, c]));
	const covByFamily = new Map(coverage.map((c) => [c.family, c]));

	const out: CampaignScenarios[] = [];
	for (const family of new Set([...xpByFamily.keys(), ...covByFamily.keys()])) {
		const cx = xpByFamily.get(family) ?? null;
		const cov = covByFamily.get(family) ?? null;
		const log = getCampaignLog(family);
		const verdictsById = new Map(
			familyScenarioMeta(family, mergeReturnTo).map((m) => [m.id, scenarioVerdicts(m)])
		);
		const covByScenario = new Map((cov?.scenarios ?? []).map((s) => [s.scenario, s]));
		const famPlays = plays.get(family) ?? new Map<string, Tally>();
		const famRecords = groups.get(family)?.recs ?? [];

		const merge = (s: ScenarioXpStat): ScenarioStat => {
			const sc = covByScenario.get(s.scenario);
			const p = famPlays.get(s.scenario);
			const axis = VERSION_AXES[s.scenario];
			const versions =
				axis && log ? buildVersionStats(famRecords, s.scenario, axis, log) : undefined;
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
			// The XP aggregation lists every playable scenario in book order.
			scenarios = cx.scenarios.map(merge);
			name = cx.name;
			totalBest = cx.totalBest;
		} else {
			// Only resolutions were recorded, so the XP aggregation skipped this family.
			const order = log
				? familyScenarioMeta(family, mergeReturnTo)
						.filter((m) => m.type === 'story')
						.map((m) => m.id)
				: (cov?.scenarios ?? []).map((s) => s.scenario);
			const orderIndex = new Map(order.map((id, i) => [id, i]));
			const names = log ? familyScenarioNames(family, mergeReturnTo) : {};
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
