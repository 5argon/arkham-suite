/**
 * standalone-archives.ts — per-scenario aggregation of first-class Standalone
 * Archives (the separate `doc.standalones` array), for the `/standalones` profile
 * section. One {@link StandaloneArchiveStat} per scenario the subject has played,
 * folding ALL of that scenario's standalone plays:
 *   - plays (total + per difficulty),
 *   - Standalone Mode win/loss (numbered resolution = won; see {@link standaloneVerdict}),
 *   - resolution coverage (which endings reached + per-difficulty counts),
 *   - best "score" (victory display + experience earned),
 *   - the XP-RANGE of decks used to challenge it (tier distribution + best winning tier).
 *
 * Reads the raw {@link StandaloneRecord} (logs + decks) directly — no profile-shape
 * conversion — and pulls scenario metadata (name / resolutions / victoryDisplay /
 * unwinnable) from campaign-data via the record's catalogue code.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { StandaloneRecord } from '$lib/database/document';
import { RESERVED } from '$lib/campaign/records/recorded-state';
import { deckExperience, xpRangeTier } from '$lib/campaign/utils/deck-experience';
import { standaloneVerdict } from './standalone-clear';
import type { ResolutionTally } from './resolution-coverage';

export interface StandaloneArchiveStat {
	/** campaign-data scenario id. */
	scenario: string;
	/** A dedicated Scenario Pack vs a campaign scenario played standalone. */
	source: 'pack' | 'campaign';
	/** campaign-data catalogue the scenario loads from (`'side'` or a host campaign code). */
	catalogueCode: string;
	/** Display name. */
	name: string;
	/** Reward kind: true ⇒ Victory display (VP), false ⇒ flat Experience (XP). */
	victoryDisplay: boolean;
	/** The scenario can't be "won" in Standalone Mode (verdict surfaced as neutral). */
	unwinnable: boolean;
	plays: number;
	playsByTier: Record<string, number>;
	/** Plays that reached a numbered resolution (won). 0 for an unwinnable scenario. */
	won: number;
	/** Plays with no numbered resolution recorded (lost). 0 for an unwinnable scenario. */
	lost: number;
	/** Every first-choice resolution id (book order). */
	resolutions: string[];
	/** The subset reached across plays. */
	visited: string[];
	/** Per-resolution reach counts (+ per difficulty). */
	tallies: Record<string, ResolutionTally>;
	/** Best victory-display score across plays (null when none recorded / not a VP scenario). */
	bestVictoryDisplay: number | null;
	/** Best experience earned across plays (null when none recorded). */
	bestEarnedXp: number | null;
	/** XP-range tier (1–5) → plays that used a deck in that tier. */
	xpTierPlays: Record<number, number>;
	/** Lowest deck XP tier (1–5) that achieved a WIN — the "beat it with a Tier-N deck" flex. */
	bestWinTier: number | null;
}

interface Acc {
	plays: number;
	playsByTier: Record<string, number>;
	won: number;
	lost: number;
	tallies: Map<string, ResolutionTally>;
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

/** The highest XP tier (1–5) among a record's decks (latest version each), or null
 *  when there are no decks / a deck is over the 50-XP cap. */
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

/**
 * Build the per-scenario standalone aggregates from a subject's standalone records.
 * `xpByCode` maps a card code to its printed XP (for the deck-XP tier).
 */
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
		const verdict = standaloneVerdict(resolution); // unwinnable handled at finalize
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

		// won/lost recorded against the verdict; unwinnable scenarios stay neutral (finalize).
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
		// keep any reached resolution not in the catalogue's first-choice list, too
		for (const r of acc.tallies.keys()) if (!all.includes(r) && !visited.includes(r)) visited.push(r);
		const tallies: Record<string, ResolutionTally> = {};
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
