/**
 * standalone-usage.ts — lifetime "which standalone scenarios have I played, and how
 * often?" aggregation over the opt-in standalone list recorded in the editor's Extra
 * tab (reserved `__standalone` section). Standalones are recorded per play of a host
 * campaign (we track WHAT was played, not where), so this counts each standalone's
 * uses — globally (profile home) and per campaign family (a campaign's page).
 *
 * The catalogue of standalones (names + resolution order) comes from campaign-data's
 * `standaloneScenarios()` (the ArkhamCards "Side Scenarios" collection).
 */
import { getCampaignLog, standaloneScenarios } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from './achievement-aggregate';

export interface StandaloneUsageRow {
	/** Standalone scenario id (campaign-data `standaloneScenarios()`). */
	scenario: string;
	/** Display name. */
	name: string;
	/** Times this standalone was recorded across the counted plays. */
	count: number;
	/** Distinct resolutions reached, in book order. */
	resolutions: string[];
}
export interface CampaignStandaloneUsage {
	/** Campaign family the standalones were played inside (base campaign code). */
	family: string;
	/** Campaign family display name. */
	name: string;
	standalones: StandaloneUsageRow[];
	/** Sum of all standalone uses inside this family. */
	totalPlays: number;
}

interface CatalogEntry {
	name: string;
	resolutions: string[];
}

/** scenario id → { display name, book-ordered resolutions }. */
function catalog(): Map<string, CatalogEntry> {
	const m = new Map<string, CatalogEntry>();
	for (const s of standaloneScenarios()) {
		m.set(s.scenario, { name: s.name, resolutions: s.resolutions });
	}
	return m;
}

/** Order a set of reached resolutions by the catalogue's book order (extras last). */
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
export function buildStandaloneUsage(records: CampaignRecord[]): CampaignStandaloneUsage[] {
	const cat = catalog();
	// family -> scenario -> acc
	const byFamily = new Map<string, Map<string, Acc>>();
	for (const rec of records) {
		const list = rec.standalones ?? [];
		if (!list.length) continue;
		const log = getCampaignLog(rec.campaignCode);
		if (!log) continue;
		const family = log.db.originalId ?? log.db.code;
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

/** Collapse the per-family usage into one global standalone tally (profile home). */
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
