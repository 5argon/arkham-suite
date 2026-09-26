/**
 * Which of each scenario's first-choice resolutions the player reached across all plays, from the
 * Extra-tab resolution input.
 */
import type { CampaignRecord } from '../records/campaign-record';
import { familyScenarioMeta, recordsByFamily } from '../records/campaign-family';
import { scenarioVerdicts } from '../utils/scenario-meta';
import { bumpTally, emptyTally, ensureTally, mergeTally, type Tally } from '../utils/tally';

export interface ScenarioResolutionCoverage {
	scenario: string;
	/** Every first-choice resolution id, in book order. */
	all: string[];
	visited: string[];
	/** Reached resolutions only. */
	tallies: Record<string, Tally>;
	/** Plays that reached a resolution campaign-data classifies as a win / loss; absent when none
	 *  did. Neutral and unclassified resolutions count toward neither. */
	succeed?: Tally;
	failed?: Tally;
}
export interface CampaignResolutionCoverage {
	family: string;
	name: string;
	scenarios: ScenarioResolutionCoverage[];
	visitedCount: number;
	totalCount: number;
}

export function buildResolutionCoverage(
	records: CampaignRecord[],
	mergeReturnTo = true
): CampaignResolutionCoverage[] {
	const out: CampaignResolutionCoverage[] = [];
	for (const [family, { log, recs }] of recordsByFamily(records, mergeReturnTo)) {
		const byScenario = new Map<string, Record<string, Tally>>();
		for (const rec of recs) {
			const tier = rec.recorded.difficulty ?? 'standard';
			for (const [scenario, resolution] of Object.entries(rec.scenarioResolutions ?? {})) {
				let reached = byScenario.get(scenario);
				if (!reached) byScenario.set(scenario, (reached = {}));
				bumpTally(ensureTally(reached, resolution), tier);
			}
		}

		const scenarios: ScenarioResolutionCoverage[] = [];
		let visitedCount = 0;
		let totalCount = 0;
		for (const sm of familyScenarioMeta(family, mergeReturnTo)) {
			const all = sm.resolutions ?? [];
			if (!all.length) continue;
			const reached = byScenario.get(sm.id) ?? {};
			const verdicts = scenarioVerdicts(sm);
			const visited = all.filter((r) => reached[r]);
			let succeed: Tally | null = null;
			let failed: Tally | null = null;
			for (const r of visited) {
				if (verdicts[r] === 'win') succeed = mergeTally(succeed ?? emptyTally(), reached[r]);
				else if (verdicts[r] === 'loss') failed = mergeTally(failed ?? emptyTally(), reached[r]);
			}
			scenarios.push({
				scenario: sm.id,
				all,
				visited,
				tallies: Object.fromEntries(visited.map((r) => [r, reached[r]])),
				...(succeed ? { succeed } : {}),
				...(failed ? { failed } : {})
			});
			visitedCount += visited.length;
			totalCount += all.length;
		}
		if (scenarios.length) {
			out.push({ family, name: log.db.name, scenarios, visitedCount, totalCount });
		}
	}
	return out;
}
