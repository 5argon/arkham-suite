/**
 * notz.ts — The Night of the Zealot bespoke per-campaign tallies. ONE builder, ONE
 * payload blob (`notz`). The core set's three-scenario intro campaign, fully log- and
 * deck-derived (the core-only feat reads `rec.coreOnly`, computed at assembly from the
 * imported decks). Every count is a per-difficulty `ResolutionTally` so the widgets can
 * offer the shared difficulty-breakdown hover:
 *
 *   • gathering — The Gathering: your house (standing vs burned), Lita recruited vs forced
 *     to find others, and the Ghoul Priest slain here (recorded ∧ crossed off) vs left
 *     alive to follow you into the finale (recorded ∧ not crossed).
 *   • midnightMasks — The Midnight Masks: past midnight (the Masked Hunter time-pressure),
 *     the per-cultist manhunt (each of the 6 unique Cultists interrogated vs got away), the
 *     best single-play haul, and how many plays let cultists escape (they swell the finale's doom).
 *   • devourerBelow — The Devourer Below finale: Umôrdhoth repelled (the better ending),
 *     the ritual broken (a win), Lita sacrificed (a distinct, hard-won win), Arkham succumbed (loss).
 *   • purist — the Core-Set-only clears (the tutorial bundled with the box): wins achieved with a
 *     Core / Revised Core-only deck and a non-parallel investigator, and who achieved them.
 *
 * `buildNotz` is family-parameterized so a future Return-to-NotZ suite reuses it.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import { familyOf } from '../records/campaign-family';
import type { ResolutionTally } from '../outcomes/resolution-coverage';
import { emptyTally, bumpTally, ensureTally } from '../utils/tally';

const NOTZ_FAMILY = 'notz';
const N = 'campaign_notes';
const k = (id: string) => `${N}.${id}`;
const INTERROGATED = 'cultists_interrogated';
const ESCAPED = 'cultists_escaped';

/** The six unique Cultist enemies of The Midnight Masks, in encounter order — the roster the
 *  `cultists_interrogated` / `cultists_escaped` sections draw from (incl. the Masked Hunter). */
export const NOTZ_CULTISTS = ['01137', '01138', '01139', '01140', '01141', '01121b'] as const;
/** The Ghoul Priest — the boss left alive in The Gathering, carried into the finale. */
export const NOTZ_GHOUL_PRIEST_CODE = '01104';

/** Resolve a NotZ campaign-data entry's English text by composite key (e.g.
 *  `campaign_notes.ritual_broken`). Falls back to the key when no entry exists. */
export function notzText(compositeKey: string): string {
	return getCampaignLog(NOTZ_FAMILY)?.en.entries[compositeKey]?.text ?? compositeKey;
}

/** One unique cultist across plays: times interrogated vs times it got away. */
export interface NotzCultist {
	caught: ResolutionTally;
	escaped: ResolutionTally;
}

export interface CampaignNotz {
	/** The campaign family (its own code) — 'notz' (or 'rtnotz' for the Return-to suite). */
	family: string;
	plays: number;
	/** Finale won — ritual broken / Umôrdhoth repelled / Lita sacrificed all count as clears. */
	wins: number;
	gathering: {
		houseStanding: ResolutionTally;
		houseBurned: ResolutionTally;
		litaRecruited: ResolutionTally;
		litaFindsOthers: ResolutionTally;
		/** Recorded ∧ crossed off — the Ghoul Priest was slain during The Gathering. */
		ghoulPriestSlain: ResolutionTally;
		/** Recorded ∧ not crossed — the Ghoul Priest survives to stalk you into the finale. */
		ghoulPriestSurvived: ResolutionTally;
	};
	midnightMasks: {
		pastMidnight: ResolutionTally;
		/** Per unique cultist (NOTZ_CULTISTS): plays interrogated vs plays it got away. */
		perCultist: Record<string, NotzCultist>;
		totalInterrogated: number;
		totalEscaped: number;
		/** Plays where at least one cultist got away (they add doom to the finale's Agenda 1a). */
		playsWithEscapes: ResolutionTally;
		/** Best single-play cultist haul (max interrogated); `byTier` is the best per difficulty. */
		bestHaul: ResolutionTally;
	};
	devourerBelow: {
		umordhothRepelled: ResolutionTally;
		ritualBroken: ResolutionTally;
		litaSacrificed: ResolutionTally;
		arkhamSuccumbed: ResolutionTally;
	};
	purist: {
		/** Clears (wins) achieved with a Core / Revised Core-only deck + non-parallel investigator. */
		coreOnlyClears: ResolutionTally;
		/** Investigator code → the core-only clears they took part in. */
		investigators: Record<string, ResolutionTally>;
	};
}

export function buildNotz(records: CampaignRecord[], family: string = NOTZ_FAMILY): CampaignNotz[] {
	const baseLog = getCampaignLog(family);
	if (!baseLog) return [];
	const notzRecords = records.filter((r) => {
		const log = getCampaignLog(r.campaignCode);
		return log ? familyOf(log) === family : false;
	});
	if (notzRecords.length === 0) return [];

	const gathering = {
		houseStanding: emptyTally(),
		houseBurned: emptyTally(),
		litaRecruited: emptyTally(),
		litaFindsOthers: emptyTally(),
		ghoulPriestSlain: emptyTally(),
		ghoulPriestSurvived: emptyTally()
	};
	const perCultist: Record<string, NotzCultist> = {};
	for (const code of NOTZ_CULTISTS) perCultist[code] = { caught: emptyTally(), escaped: emptyTally() };
	const midnightMasks = {
		pastMidnight: emptyTally(),
		perCultist,
		totalInterrogated: 0,
		totalEscaped: 0,
		playsWithEscapes: emptyTally(),
		bestHaul: emptyTally()
	};
	const devourerBelow = {
		umordhothRepelled: emptyTally(),
		ritualBroken: emptyTally(),
		litaSacrificed: emptyTally(),
		arkhamSuccumbed: emptyTally()
	};
	const purist = {
		coreOnlyClears: emptyTally(),
		investigators: {} as Record<string, ResolutionTally>
	};
	let wins = 0;

	for (const rec of notzRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const crossed = rec.recorded.crossedLogs ?? new Set<string>();
		const items = rec.recorded.recordedSectionItems ?? {};
		const tier = rec.recorded.difficulty ?? 'standard';
		const has = (id: string) => logs.has(k(id));
		const isCrossed = (id: string) => crossed.has(k(id));

		// ── The Gathering ──
		const gatheringReached = has('house_standing') || has('house_burned');
		if (has('house_standing')) bumpTally(gathering.houseStanding, tier);
		if (has('house_burned')) bumpTally(gathering.houseBurned, tier);
		if (has('lita_finds_others')) bumpTally(gathering.litaFindsOthers, tier);
		else if (gatheringReached) bumpTally(gathering.litaRecruited, tier);
		if (has('ghoul_priest_alive')) {
			if (isCrossed('ghoul_priest_alive')) bumpTally(gathering.ghoulPriestSlain, tier);
			else bumpTally(gathering.ghoulPriestSurvived, tier);
		}

		// ── The Midnight Masks ──
		if (has('past_midnight')) bumpTally(midnightMasks.pastMidnight, tier);
		const caught = items[INTERROGATED] ?? new Set<string>();
		const gotAway = items[ESCAPED] ?? new Set<string>();
		for (const code of caught) bumpTally(ensureCultist(perCultist, code).caught, tier);
		for (const code of gotAway) bumpTally(ensureCultist(perCultist, code).escaped, tier);
		midnightMasks.totalInterrogated += caught.size;
		midnightMasks.totalEscaped += gotAway.size;
		if (gotAway.size > 0) bumpTally(midnightMasks.playsWithEscapes, tier);
		// Best haul = max interrogated in a single play, overall (`total`) + per difficulty (`byTier`).
		if (caught.size > midnightMasks.bestHaul.total) midnightMasks.bestHaul.total = caught.size;
		midnightMasks.bestHaul.byTier[tier] = Math.max(midnightMasks.bestHaul.byTier[tier] ?? 0, caught.size);

		// ── The Devourer Below ──
		if (has('umordhoth_repelled')) bumpTally(devourerBelow.umordhothRepelled, tier);
		if (has('ritual_broken')) bumpTally(devourerBelow.ritualBroken, tier);
		if (has('lita_sacrificed')) bumpTally(devourerBelow.litaSacrificed, tier);
		if (has('arkham_succumbed')) bumpTally(devourerBelow.arkhamSuccumbed, tier);

		// ── Clear (win) + the Core-Set purist feat ──
		const won = has('umordhoth_repelled') || has('ritual_broken') || has('lita_sacrificed');
		if (won) {
			wins += 1;
			if (rec.coreOnly) {
				bumpTally(purist.coreOnlyClears, tier);
				for (const code of rec.subjectInvestigators ?? [])
					bumpTally(ensureTally(purist.investigators, code), tier);
			}
		}
	}

	return [{ family, plays: notzRecords.length, wins, gathering, midnightMasks, devourerBelow, purist }];
}

function ensureCultist(map: Record<string, NotzCultist>, code: string): NotzCultist {
	return (map[code] ??= { caught: emptyTally(), escaped: emptyTally() });
}
