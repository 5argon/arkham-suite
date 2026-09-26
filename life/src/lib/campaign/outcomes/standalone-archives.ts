/** The `/standalones` profile section: every Standalone Archive (`doc.standalones`) folded per
 *  scenario, with scenario metadata from the record's catalogue in campaign-data. */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { StandaloneRecord } from '$lib/database/document';
import { RESERVED } from '$lib/campaign/records/recorded-state';
import { deckExperience, xpRangeTier } from '$lib/campaign/utils/deck-experience';
import { standaloneVerdict } from './standalone-clear';
import type { Tally } from '../utils/tally';

export interface StandaloneArchiveStat {
	scenario: string;
	/** A Scenario Pack, or a campaign scenario played standalone. */
	source: 'pack' | 'campaign';
	/** The campaign-data catalogue the scenario loads from: `side` or the host campaign's code. */
	catalogueCode: string;
	name: string;
	/** False for a scenario that rewards flat Experience instead of a victory display. */
	victoryDisplay: boolean;
	/** Has no win in Standalone Mode; won and lost stay 0. */
	unwinnable: boolean;
	plays: number;
	playsByTier: Record<string, number>;
	won: number;
	lost: number;
	/** Every first-choice resolution, in book order. */
	resolutions: string[];
	/** The resolutions reached, including any outside `resolutions`. */
	visited: string[];
	tallies: Record<string, Tally>;
	/** Also holds the reward of an Experience scenario. Null when none was recorded. */
	bestVictoryDisplay: number | null;
	bestEarnedXp: number | null;
	/** Deck XP tier (1–5) → plays whose highest-tier deck was in it. */
	xpTierPlays: Record<number, number>;
	/** The lowest deck XP tier that won. */
	bestWinTier: number | null;
}

interface Acc {
	plays: number;
	playsByTier: Record<string, number>;
	won: number;
	lost: number;
	tallies: Map<string, Tally>;
	bestVictoryDisplay: number | null;
	bestEarnedXp: number | null;
	xpTierPlays: Record<number, number>;
	bestWinTier: number | null;
	source: 'pack' | 'campaign';
	catalogueCode: string;
}

function numArg(record: StandaloneRecord, section: string, key: string): number | null {
	const v = record.logs.find((l) => l.section === section && l.key === key)?.args.find((a) => a.type === 'number')?.value;
	return v == null || v === '' ? null : Number(v);
}
function strArg(record: StandaloneRecord, section: string, key: string): string | undefined {
	return record.logs.find((l) => l.section === section && l.key === key)?.args.find((a) => a.type === 'string')?.value;
}

/** The highest XP tier among a record's decks (latest version each); decks over the cap are skipped. */
function recordDeckTier(record: StandaloneRecord, xpByCode: Map<string, number>): number | null {
	let best: number | null = null;
	for (const deck of record.decks) {
		const latest = [...deck.versions].sort((a, b) => a.sequenceIndex - b.sequenceIndex).at(-1);
		if (!latest) continue;
		const tier = xpRangeTier(deckExperience(latest.ahdbJson, xpByCode))?.tier ?? null;
		if (tier != null) best = best == null ? tier : Math.max(best, tier);
	}
	return best;
}

/** One aggregate per scenario played, most played first. `xpByCode` is each card's printed level. */
export function buildStandaloneArchives(
	records: StandaloneRecord[],
	xpByCode: Map<string, number>,
): StandaloneArchiveStat[] {
	const byScenario = new Map<string, Acc>();
	for (const rec of records) {
		const scenario = rec.scenario;
		if (!scenario) continue;
		let acc = byScenario.get(scenario);
		if (!acc) {
			acc = {
				plays: 0,
				playsByTier: {},
				won: 0,
				lost: 0,
				tallies: new Map(),
				bestVictoryDisplay: null,
				bestEarnedXp: null,
				xpTierPlays: {},
				bestWinTier: null,
				source: rec.source,
				catalogueCode: rec.campaignCode,
			};
			byScenario.set(scenario, acc);
		}
		const tier = rec.difficulty ?? 'standard';
		acc.plays += 1;
		acc.playsByTier[tier] = (acc.playsByTier[tier] ?? 0) + 1;

		const resolution = strArg(rec, RESERVED.scenarioResolution, scenario);
		const verdict = standaloneVerdict(resolution);
		if (resolution) {
			let t = acc.tallies.get(resolution);
			if (!t) acc.tallies.set(resolution, (t = { total: 0, byTier: {} }));
			t.total += 1;
			t.byTier[tier] = (t.byTier[tier] ?? 0) + 1;
		}

		const vp = numArg(rec, RESERVED.scenarioXp, scenario);
		if (vp != null) acc.bestVictoryDisplay = Math.max(acc.bestVictoryDisplay ?? 0, vp);
		const earned = numArg(rec, RESERVED.standaloneEarnedXp, scenario);
		if (earned != null) acc.bestEarnedXp = Math.max(acc.bestEarnedXp ?? 0, earned);

		const deckTier = recordDeckTier(rec, xpByCode);
		if (deckTier != null) {
			acc.xpTierPlays[deckTier] = (acc.xpTierPlays[deckTier] ?? 0) + 1;
			if (verdict === 'won') acc.bestWinTier = acc.bestWinTier == null ? deckTier : Math.min(acc.bestWinTier, deckTier);
		}

		if (verdict === 'won') acc.won += 1;
		else if (verdict === 'lost') acc.lost += 1;
	}

	const out: StandaloneArchiveStat[] = [];
	for (const [scenario, acc] of byScenario) {
		const log = getCampaignLog(acc.catalogueCode);
		const meta = log?.db.scenarioMeta?.find((m) => m.id === scenario);
		const all = meta?.resolutions ?? [];
		const unwinnable = meta?.standaloneUnwinnable ?? false;
		const visited = all.filter((r) => acc.tallies.has(r));
		for (const r of acc.tallies.keys()) if (!all.includes(r) && !visited.includes(r)) visited.push(r);
		const tallies: Record<string, Tally> = {};
		for (const [r, t] of acc.tallies) tallies[r] = t;
		out.push({
			scenario,
			source: acc.source,
			catalogueCode: acc.catalogueCode,
			name: log?.en.scenarioNames?.[scenario] ?? scenario,
			victoryDisplay: meta?.victoryDisplay ?? true,
			unwinnable,
			plays: acc.plays,
			playsByTier: acc.playsByTier,
			won: unwinnable ? 0 : acc.won,
			lost: unwinnable ? 0 : acc.lost,
			resolutions: all,
			visited,
			tallies,
			bestVictoryDisplay: acc.bestVictoryDisplay,
			bestEarnedXp: acc.bestEarnedXp,
			xpTierPlays: acc.xpTierPlays,
			bestWinTier: unwinnable ? null : acc.bestWinTier,
		});
	}
	return out.sort((a, b) => b.plays - a.plays || a.name.localeCompare(b.name));
}
