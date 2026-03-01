/**
 * custom-achievements.ts — life-local **unofficial** achievements + coverage.
 * These live in the life app (not campaign-data) but reuse campaign-data shapes,
 * evaluated against the lifetime union state (see achievement-aggregate.ts).
 *
 *  - `scope: 'family'` aggregates across a base campaign + its Return-to box.
 *  - `scope: 'global'` aggregates across every recorded campaign.
 * Examples: lifetime "Memories Banished" in EoE Fatal Mirage (nothing official
 * tracks it), and branch coverage ("what haven't I explored?") derived from the
 * mutually-exclusive validators.
 */
import { getCampaignLog, type CampaignLog } from '@5argon/arkham-campaign-data';
import {
	buildUnionState,
	countLogsWithPrefix,
	recordsForFamily,
	type AggregateState,
	type CampaignRecord,
} from './achievement-aggregate';
import { routeQuality, type RouteQuality } from './route-quality';

export interface CustomAchievement {
	id: string;
	title: string;
	description: string;
	scope: 'family' | 'global';
	/** For family scope: the base campaign code. */
	family?: string;
	/** Current lifetime value. */
	value: number;
	/** Optional target (a "goal" achievement); absent for a pure tally. */
	goal?: number;
	earned: boolean;
}

interface CustomDef {
	id: string;
	title: string;
	description: string;
	scope: 'family' | 'global';
	family?: string;
	goal?: number;
	measure: (state: AggregateState) => number;
}

/** The life-local custom achievement catalogue. Extend freely. */
const CUSTOM_DEFS: CustomDef[] = [
	{
		id: 'eoe_memories_banished_lifetime',
		title: 'Memories Banished',
		description: 'Total memories banished across every Fatal Mirage you have braved.',
		scope: 'family',
		family: 'eoe',
		measure: (s) => countLogsWithPrefix(s, 'memories_banished'),
	},
	{
		id: 'eoe_memories_discovered_lifetime',
		title: 'Memories Discovered',
		description: 'Total memories discovered across every Edge of the Earth play.',
		scope: 'family',
		family: 'eoe',
		measure: (s) => countLogsWithPrefix(s, 'memories_discovered'),
	},
	{
		id: 'tfa_yigs_fury_lifetime',
		title: "Yig's Lasting Fury",
		description: "Total Yig's Fury accumulated across every Forgotten Age expedition.",
		scope: 'family',
		family: 'tfa',
		measure: (s) => s.logCounts['yigs_fury'] ?? 0,
	},
];

export function evaluateCustomAchievements(records: CampaignRecord[]): CustomAchievement[] {
	const out: CustomAchievement[] = [];
	for (const def of CUSTOM_DEFS) {
		const scoped =
			def.scope === 'family' && def.family ? recordsForFamily(records, def.family) : records;
		if (scoped.length === 0) continue;
		const value = def.measure(buildUnionState(scoped));
		out.push({
			id: def.id,
			title: def.title,
			description: def.description,
			scope: def.scope,
			family: def.family,
			value,
			goal: def.goal,
			earned: def.goal != null ? value >= def.goal : value > 0,
		});
	}
	return out;
}

// ─── Branch coverage ("what haven't I explored?") ────────────────────────────

export interface CoverageBranch {
	key: string;
	text: string;
	recorded: boolean;
	/** Optional route-quality badge ('better' = harder/heroic, 'easier'). */
	quality?: RouteQuality;
}
export interface CoverageGroup {
	scenario?: string;
	branches: CoverageBranch[];
}
export interface CampaignCoverage {
	campaignCode: string;
	/** Folded family code (base campaign), so detail pages filter uniformly. */
	family: string;
	campaignName: string;
	exploredBranches: number;
	totalBranches: number;
	/** exploredBranches / totalBranches as a 0–100 percent (0 when no branches).
	 *  Precomputed so consumers read it directly (see compiled-profile.ts). */
	exploredPct: number;
	groups: CoverageGroup[];
}

function cleanText(t: string): string {
	return t
		.replace(/<\/?[ib]>/g, '')
		.replace(/\[\[([^\]]+)\]\]/g, '$1')
		.replace(/\[[a-z_]+\]/g, '')
		.replace(/#name#/g, 'them')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * For each recorded campaign, report every mutually-exclusive decision and which
 * branch(es) the player has ever recorded — the unrecorded branches are the
 * "unexplored paths". Aggregated across all the player's plays of that campaign.
 */
export function buildCoverage(records: CampaignRecord[]): CampaignCoverage[] {
	// Union of recorded keys per campaign code.
	const byCode = new Map<string, Set<string>>();
	for (const rec of records) {
		const set = byCode.get(rec.campaignCode) ?? new Set<string>();
		for (const k of rec.recorded.recordedLogs ?? []) set.add(k);
		byCode.set(rec.campaignCode, set);
	}

	const out: CampaignCoverage[] = [];
	for (const [code, recorded] of byCode) {
		const log: CampaignLog | undefined = getCampaignLog(code);
		if (!log || !log.db.validators?.length) continue;
		const enText = (key: string) => cleanText(log.en.entries[key]?.text ?? key);

		const groups: CoverageGroup[] = [];
		let explored = 0;
		let total = 0;
		for (const v of log.db.validators) {
			const branches: CoverageBranch[] = v.entries.map((key) => ({
				key,
				text: enText(key),
				recorded: recorded.has(key),
				quality: routeQuality(log.db.code, key),
			}));
			total += branches.length;
			explored += branches.filter((b) => b.recorded).length;
			groups.push({ scenario: v.scenario, branches });
		}
		out.push({
			campaignCode: code,
			family: log.db.originalId ?? log.db.code,
			campaignName: log.db.name,
			exploredBranches: explored,
			totalBranches: total,
			exploredPct: total > 0 ? Math.round((explored / total) * 100) : 0,
			groups,
		});
	}
	return out;
}
