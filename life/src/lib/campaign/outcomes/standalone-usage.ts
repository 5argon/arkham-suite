/** How often each standalone scenario was played inside a campaign, per campaign family, from the
 *  standalones recorded in the editor's Extra tab. Names and resolution order come from
 *  campaign-data's `standaloneScenarios()` (ArkhamCards' Side Scenarios). */
import { getCampaignLog, standaloneScenarios } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../records/campaign-record';
import { contributingFamilies } from '../records/campaign-family';

export interface StandaloneUsageRow {
	scenario: string;
	name: string;
	count: number;
	/** Distinct resolutions reached, in book order. */
	resolutions: string[];
}
export interface CampaignStandaloneUsage {
	family: string;
	name: string;
	standalones: StandaloneUsageRow[];
	totalPlays: number;
}

interface CatalogEntry {
	name: string;
	resolutions: string[];
}

function catalog(): Map<string, CatalogEntry> {
	const m = new Map<string, CatalogEntry>();
	for (const s of standaloneScenarios()) {
		m.set(s.scenario, { name: s.name, resolutions: s.resolutions });
	}
	return m;
}

/** Book order, with resolutions the catalogue doesn't list last. */
function orderResolutions(reached: Set<string>, order: string[]): string[] {
	const out = order.filter((r) => reached.has(r));
	for (const r of reached) if (!order.includes(r)) out.push(r);
	return out;
}

interface Acc {
	count: number;
	resolutions: Set<string>;
}

/** Per-family standalone usage, each family's standalones sorted by use count. */
export function buildStandaloneUsage(
	records: CampaignRecord[],
	mergeReturnTo = true
): CampaignStandaloneUsage[] {
	const cat = catalog();
	const byFamily = new Map<string, Map<string, Acc>>();
	for (const rec of records) {
		const list = rec.standalones ?? [];
		if (!list.length) continue;
		const log = getCampaignLog(rec.campaignCode);
		if (!log) continue;
		for (const family of contributingFamilies(log, mergeReturnTo)) {
			let fam = byFamily.get(family);
			if (!fam) {
				fam = new Map();
				byFamily.set(family, fam);
			}
			for (const s of list) {
				if (!s.standalone) continue;
				let acc = fam.get(s.standalone);
				if (!acc) {
					acc = { count: 0, resolutions: new Set() };
					fam.set(s.standalone, acc);
				}
				acc.count += 1;
				if (s.resolution) acc.resolutions.add(s.resolution);
			}
		}
	}

	const out: CampaignStandaloneUsage[] = [];
	for (const [family, fam] of byFamily) {
		const standalones = [...fam.entries()]
			.map(([scenario, acc]) => {
				const c = cat.get(scenario);
				return {
					scenario,
					name: c?.name ?? scenario,
					count: acc.count,
					resolutions: orderResolutions(acc.resolutions, c?.resolutions ?? []),
				};
			})
			.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
		const totalPlays = standalones.reduce((n, s) => n + s.count, 0);
		out.push({ family, name: getCampaignLog(family)?.db.name ?? family, standalones, totalPlays });
	}
	return out.sort((a, b) => b.totalPlays - a.totalPlays || a.name.localeCompare(b.name));
}

/** Every family's usage in one tally. */
export function mergeStandaloneUsage(list: CampaignStandaloneUsage[]): StandaloneUsageRow[] {
	const cat = catalog();
	const byScenario = new Map<string, Acc & { name: string }>();
	for (const fam of list) {
		for (const row of fam.standalones) {
			let acc = byScenario.get(row.scenario);
			if (!acc) {
				acc = { count: 0, resolutions: new Set(), name: row.name };
				byScenario.set(row.scenario, acc);
			}
			acc.count += row.count;
			for (const r of row.resolutions) acc.resolutions.add(r);
		}
	}
	return [...byScenario.entries()]
		.map(([scenario, acc]) => ({
			scenario,
			name: acc.name,
			count: acc.count,
			resolutions: orderResolutions(acc.resolutions, cat.get(scenario)?.resolutions ?? []),
		}))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
