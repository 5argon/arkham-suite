/**
 * Unofficial lifetime achievements measured on the union state of a family's plays (or every play),
 * and branch coverage: which side of each mutually-exclusive log decision the player has recorded.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { buildUnionState, countLogsWithPrefix, type AggregateState } from './achievement-aggregate';
import type { CampaignRecord } from '../records/campaign-record';
import { familyOf, recordsByFamily } from '../records/campaign-family';
import { cleanEntryText } from '../utils/entry-text';
import { routeQuality, type RouteQuality } from './route-quality';

export interface CustomAchievement {
	id: string;
	title: string;
	description: string;
	scope: 'family' | 'global';
	/** Family scope only; includes the family's Return-to plays. */
	family?: string;
	value: number;
	/** Absent for a pure tally (earned once above zero). */
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

const CUSTOM_DEFS: CustomDef[] = [
	{
		id: 'eoe_memories_banished_lifetime',
		title: 'Memories Banished',
		description: 'Total memories banished across every Fatal Mirage you have braved.',
		scope: 'family',
		family: 'eoe',
		measure: (s) => countLogsWithPrefix(s, 'memories_banished')
	},
	{
		id: 'eoe_memories_discovered_lifetime',
		title: 'Memories Discovered',
		description: 'Total memories discovered across every Edge of the Earth play.',
		scope: 'family',
		family: 'eoe',
		measure: (s) => countLogsWithPrefix(s, 'memories_discovered')
	},
	{
		id: 'tfa_yigs_fury_lifetime',
		title: "Yig's Lasting Fury",
		description: "Total Yig's Fury accumulated across every Forgotten Age expedition.",
		scope: 'family',
		family: 'tfa',
		measure: (s) => s.logCounts['yigs_fury'] ?? 0
	}
];

export function customAchievementText(
	id: string
): { title: string; description: string } | undefined {
	const def = CUSTOM_DEFS.find((d) => d.id === id);
	return def ? { title: def.title, description: def.description } : undefined;
}

export function evaluateCustomAchievements(records: CampaignRecord[]): CustomAchievement[] {
	const families = recordsByFamily(records, true);
	const out: CustomAchievement[] = [];
	for (const def of CUSTOM_DEFS) {
		const scoped =
			def.scope === 'family' && def.family ? (families.get(def.family)?.recs ?? []) : records;
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
			earned: def.goal != null ? value >= def.goal : value > 0
		});
	}
	return out;
}

export interface CoverageBranch {
	key: string;
	text: string;
	recorded: boolean;
	quality?: RouteQuality;
}
export interface CoverageGroup {
	scenario?: string;
	branches: CoverageBranch[];
}
export interface CampaignCoverage {
	campaignCode: string;
	family: string;
	campaignName: string;
	exploredBranches: number;
	totalBranches: number;
	/** Rounded 0–100; 0 when there are no branches. */
	exploredPct: number;
	groups: CoverageGroup[];
}

/** Per campaign code (Return-to boxes stay separate). */
export function buildCoverage(records: CampaignRecord[]): CampaignCoverage[] {
	const byCode = new Map<string, Set<string>>();
	for (const rec of records) {
		const set = byCode.get(rec.campaignCode) ?? new Set<string>();
		for (const k of rec.recorded.recordedLogs ?? []) set.add(k);
		byCode.set(rec.campaignCode, set);
	}

	const out: CampaignCoverage[] = [];
	for (const [code, recorded] of byCode) {
		const log = getCampaignLog(code);
		if (!log || !log.db.validators?.length) continue;
		const enText = (key: string) => cleanEntryText(log.en.entries[key]?.text ?? key);

		const groups: CoverageGroup[] = [];
		let explored = 0;
		let total = 0;
		for (const v of log.db.validators) {
			// `disjointSections` validators are consistency checks with no branches to explore.
			if (v.type !== 'mutuallyExclusive') continue;
			const branches: CoverageBranch[] = v.entries.map((key) => ({
				key,
				text: enText(key),
				recorded: recorded.has(key),
				quality: routeQuality(log.db.code, key)
			}));
			total += branches.length;
			explored += branches.filter((b) => b.recorded).length;
			groups.push({ scenario: v.scenario, branches });
		}
		out.push({
			campaignCode: code,
			family: familyOf(log),
			campaignName: log.db.name,
			exploredBranches: explored,
			totalBranches: total,
			exploredPct: total > 0 ? Math.round((explored / total) * 100) : 0,
			groups
		});
	}
	return out;
}
