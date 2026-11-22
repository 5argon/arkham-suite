/** The `/standalones` profile section: every standalone scenario the subject played, folded per
 *  scenario: its Standalone Archives (`doc.standalones`) and the side stories played inside their
 *  campaigns, with scenario metadata from the catalogue in campaign-data. */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { StandaloneRecord } from '$lib/database/document';
import { RESERVED } from '$lib/campaign/records/recorded-state';
import { deckExperience, xpRangeTier } from '$lib/campaign/utils/deck-experience';
import { standaloneVerdict, type StandaloneVerdict } from './standalone-clear';
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
	/** Standalone Archives and side-story plays together. */
	plays: number;
	playsByTier: Record<string, number>;
	/** Plays recorded as their own Standalone Archive. */
	archivePlays: number;
	/** Side-story plays inside a campaign, per campaign family, most first. */
	insertions: { family: string; plays: number }[];
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
	/** Deck XP tier (1–5) → Standalone Archives whose highest-tier deck was in it. */
	xpTierPlays: Record<number, number>;
	/** The lowest deck XP tier that won. */
	bestWinTier: number | null;
	/** Every play, newest first; undated plays last. */
	history: StandalonePlay[];
}

/** One standalone play. */
export interface StandalonePlay {
	/** ms since epoch. */
	date: number | null;
	tier: string;
	resolution: string | null;
	/** Null when no resolution was recorded, or the scenario cannot be won. */
	verdict: StandaloneVerdict | null;
	/** One per deck. */
	investigators: string[];
	/** The campaign family it was played inside as a side story; null for a Standalone Archive. */
	hostFamily: string | null;
}

/** A side story played inside a campaign, from that campaign's Extra tab. */
export interface InsertedStandalonePlay {
	scenario: string;
	tier: string;
	date: number | null;
	resolution: string | null;
	victoryDisplay: number | null;
	investigators: string[];
	hostFamily: string;
}

interface Acc {
	plays: number;
	playsByTier: Record<string, number>;
	archivePlays: number;
	insertions: Map<string, number>;
	won: number;
	lost: number;
	tallies: Map<string, Tally>;
	bestVictoryDisplay: number | null;
	bestEarnedXp: number | null;
	xpTierPlays: Record<number, number>;
	bestWinTier: number | null;
	source: 'pack' | 'campaign';
	catalogueCode: string;
	/** The scenario's curated resolution outcomes, when a numbered resolution is not always a win. */
	outcomes?: Record<string, 'win' | 'loss' | 'neutral'>;
	history: StandalonePlay[];
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

/** Folds one play into its scenario's accumulator; returns its verdict. */
function addPlay(
	acc: Acc,
	play: Omit<StandalonePlay, 'verdict'> & { victoryDisplay: number | null }
): StandaloneVerdict | null {
	const { tier, resolution } = play;
	acc.plays += 1;
	acc.playsByTier[tier] = (acc.playsByTier[tier] ?? 0) + 1;
	const verdict = standaloneVerdict(resolution, acc.outcomes);
	if (resolution) {
		let t = acc.tallies.get(resolution);
		if (!t) acc.tallies.set(resolution, (t = { total: 0, byTier: {} }));
		t.total += 1;
		t.byTier[tier] = (t.byTier[tier] ?? 0) + 1;
	}
	if (play.victoryDisplay != null)
		acc.bestVictoryDisplay = Math.max(acc.bestVictoryDisplay ?? 0, play.victoryDisplay);
	if (verdict === 'won') acc.won += 1;
	else if (verdict === 'lost') acc.lost += 1;
	acc.history.push({
		date: play.date,
		tier,
		resolution,
		verdict,
		investigators: play.investigators,
		hostFamily: play.hostFamily
	});
	return verdict;
}

/**
 * One aggregate per scenario played, most played first. `xpByCode` is each card's printed level.
 * `inserted` are side stories played inside campaigns; they have no deck XP tier of their own.
 */
export function buildStandaloneArchives(
	records: StandaloneRecord[],
	xpByCode: Map<string, number>,
	inserted: readonly InsertedStandalonePlay[] = []
): StandaloneArchiveStat[] {
	const byScenario = new Map<string, Acc>();
	const accFor = (scenario: string, source: Acc['source'], catalogueCode: string): Acc => {
		let acc = byScenario.get(scenario);
		if (!acc) {
			acc = {
				plays: 0,
				playsByTier: {},
				archivePlays: 0,
				insertions: new Map(),
				won: 0,
				lost: 0,
				tallies: new Map(),
				bestVictoryDisplay: null,
				bestEarnedXp: null,
				xpTierPlays: {},
				bestWinTier: null,
				source,
				catalogueCode,
				outcomes: getCampaignLog(catalogueCode)?.db.scenarioMeta?.find((m) => m.id === scenario)
					?.resolutionOutcomes,
				history: []
			};
			byScenario.set(scenario, acc);
		}
		return acc;
	};

	for (const rec of records) {
		const scenario = rec.scenario;
		if (!scenario) continue;
		const acc = accFor(scenario, rec.source, rec.campaignCode);
		acc.archivePlays += 1;
		const verdict = addPlay(acc, {
			date: rec.finishDate ?? null,
			tier: rec.difficulty ?? 'standard',
			resolution: strArg(rec, RESERVED.scenarioResolution, scenario) ?? null,
			victoryDisplay: numArg(rec, RESERVED.scenarioXp, scenario),
			investigators: rec.decks.map((d) => d.investigator.investigatorCode),
			hostFamily: null
		});
		const earned = numArg(rec, RESERVED.standaloneEarnedXp, scenario);
		if (earned != null) acc.bestEarnedXp = Math.max(acc.bestEarnedXp ?? 0, earned);

		const deckTier = recordDeckTier(rec, xpByCode);
		if (deckTier != null) {
			acc.xpTierPlays[deckTier] = (acc.xpTierPlays[deckTier] ?? 0) + 1;
			if (verdict === 'won') acc.bestWinTier = acc.bestWinTier == null ? deckTier : Math.min(acc.bestWinTier, deckTier);
		}
	}

	for (const play of inserted) {
		const acc = accFor(play.scenario, 'pack', 'side');
		acc.insertions.set(play.hostFamily, (acc.insertions.get(play.hostFamily) ?? 0) + 1);
		addPlay(acc, play);
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
			archivePlays: acc.archivePlays,
			insertions: [...acc.insertions]
				.map(([family, plays]) => ({ family, plays }))
				.sort((a, b) => b.plays - a.plays || a.family.localeCompare(b.family)),
			won: unwinnable ? 0 : acc.won,
			lost: unwinnable ? 0 : acc.lost,
			resolutions: all,
			visited,
			tallies,
			bestVictoryDisplay: acc.bestVictoryDisplay,
			bestEarnedXp: acc.bestEarnedXp,
			xpTierPlays: acc.xpTierPlays,
			bestWinTier: unwinnable ? null : acc.bestWinTier,
			history: acc.history
				.map((h) => (unwinnable ? { ...h, verdict: null } : h))
				.sort((a, b) => (b.date ?? -Infinity) - (a.date ?? -Infinity))
		});
	}
	return out.sort((a, b) => b.plays - a.plays || a.name.localeCompare(b.name));
}
