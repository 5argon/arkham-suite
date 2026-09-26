/** The Night of the Zealot: The Gathering, the Midnight Masks manhunt, the finale, and Core-Set-only clears. */
import { orderedDifficulties } from '../utils/difficulty';
import type { Tally } from '../utils/tally';
import { bumpTally, emptyTally, ensureTally } from '../utils/tally';
import { tallyNotes, tallyPlays, type Play } from '../records/play';
import { defineCampaignBuilder } from './define';

/** The six unique Cultists of The Midnight Masks, in encounter order. */
export const NOTZ_CULTISTS = ['01137', '01138', '01139', '01140', '01141', '01121b'] as const;
export const NOTZ_LITA_CODE = '01117';
export const NOTZ_GHOUL_PRIEST_CODE = '01116';
export const NOTZ_UMORDHOTH_CODE = '01157';

const GHOUL_PRIEST_ALIVE = 'campaign_notes.ghoul_priest_alive';

export interface NotzCultist {
	caught: Tally;
	escaped: Tally;
}

export interface CampaignNotz {
	family: string;
	plays: number;
	/** Finale won: Umôrdhoth repelled, the ritual broken, or Lita sacrificed. */
	wins: number;
	gathering: {
		houseStanding: Tally;
		houseBurned: Tally;
		/** Reached The Gathering without Lita being forced to find others. */
		litaRecruited: Tally;
		litaFindsOthers: Tally;
		/** "The Ghoul Priest is still alive" recorded and crossed off. */
		ghoulPriestSlain: Tally;
		/** Recorded and not crossed off: he joins the finale's encounter deck. */
		ghoulPriestSurvived: Tally;
	};
	midnightMasks: {
		pastMidnight: Tally;
		/** Keyed by {@link NOTZ_CULTISTS} code. */
		perCultist: Record<string, NotzCultist>;
		totalInterrogated: number;
		totalEscaped: number;
		/** The most cultists interrogated in one play, per difficulty in difficulty order; tiers
		 *  with no catch are left out. */
		bestHaul: { tier: string; caught: number }[];
	};
	devourerBelow: {
		umordhothRepelled: Tally;
		ritualBroken: Tally;
		litaSacrificed: Tally;
		arkhamSuccumbed: Tally;
	};
	purist: {
		/** Wins whose subject decks were all Core / Revised Core-only with a non-parallel investigator. */
		coreOnlyClears: Tally;
		/** The investigators of those clears, most clears first. */
		investigators: { code: string; clears: Tally }[];
	};
}

export const buildNotz = defineCampaignBuilder<CampaignNotz>('notz', (plays) => {
	const reachedGathering = (p: Play) => p.has('house_standing') || p.has('house_burned');
	const ghoulCrossed = (p: Play) => p.rec.recorded.crossedLogs?.has(GHOUL_PRIEST_ALIVE) ?? false;

	const perCultist: Record<string, NotzCultist> = {};
	for (const code of NOTZ_CULTISTS)
		perCultist[code] = { caught: emptyTally(), escaped: emptyTally() };
	const cultist = (code: string) =>
		(perCultist[code] ??= { caught: emptyTally(), escaped: emptyTally() });
	const bestByTier: Record<string, number> = {};
	let totalInterrogated = 0;
	let totalEscaped = 0;

	const coreOnlyClears = emptyTally();
	const investigators: Record<string, Tally> = {};
	let wins = 0;

	for (const p of plays) {
		const caught = p.items('cultists_interrogated');
		const gotAway = p.items('cultists_escaped');
		for (const code of caught) bumpTally(cultist(code).caught, p.tier);
		for (const code of gotAway) bumpTally(cultist(code).escaped, p.tier);
		totalInterrogated += caught.size;
		totalEscaped += gotAway.size;
		bestByTier[p.tier] = Math.max(bestByTier[p.tier] ?? 0, caught.size);

		// campaign-data marks `lita_sacrificed` with no win outcome, so `isCleared` would miss it.
		if (!(p.has('umordhoth_repelled') || p.has('ritual_broken') || p.has('lita_sacrificed')))
			continue;
		wins += 1;
		if (!p.rec.coreOnly) continue;
		bumpTally(coreOnlyClears, p.tier);
		for (const code of p.rec.subjectInvestigators ?? [])
			bumpTally(ensureTally(investigators, code), p.tier);
	}

	return {
		wins,
		gathering: {
			...tallyNotes(plays, {
				houseStanding: 'house_standing',
				houseBurned: 'house_burned',
				litaFindsOthers: 'lita_finds_others'
			}),
			litaRecruited: tallyPlays(plays, (p) => reachedGathering(p) && !p.has('lita_finds_others')),
			ghoulPriestSlain: tallyPlays(plays, (p) => p.has(GHOUL_PRIEST_ALIVE) && ghoulCrossed(p)),
			ghoulPriestSurvived: tallyPlays(plays, (p) => p.has(GHOUL_PRIEST_ALIVE) && !ghoulCrossed(p))
		},
		midnightMasks: {
			pastMidnight: tallyPlays(plays, (p) => p.has('past_midnight')),
			perCultist,
			totalInterrogated,
			totalEscaped,
			bestHaul: orderedDifficulties(bestByTier)
				.filter((tier) => bestByTier[tier] > 0)
				.map((tier) => ({ tier, caught: bestByTier[tier] }))
		},
		devourerBelow: tallyNotes(plays, {
			umordhothRepelled: 'umordhoth_repelled',
			ritualBroken: 'ritual_broken',
			litaSacrificed: 'lita_sacrificed',
			arkhamSuccumbed: 'arkham_succumbed'
		}),
		purist: {
			coreOnlyClears,
			investigators: Object.entries(investigators)
				.map(([code, clears]) => ({ code, clears }))
				.sort((a, b) => b.clears.total - a.clears.total)
		}
	};
});
