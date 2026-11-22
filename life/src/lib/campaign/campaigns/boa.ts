/** The Brethren of Ash: the Servant of Flame and its harbinger, the Smoke and Mirrors manhunt, and the four endings of Queen of Ash. */
import { orderedDifficulties } from '../utils/difficulty';
import type { Tally } from '../utils/tally';
import { bumpTally, emptyTally } from '../utils/tally';
import { tallyNotes, tallyPlays, type Play } from '../records/play';
import { defineCampaignBuilder } from './define';

/**
 * The six People of Arkham. One is set aside as the Servant of Flame's true identity; the other
 * five are suspects beneath the locations of Smoke and Mirrors, interrogated by reading their
 * codex entry.
 */
export const BOA_SUSPECTS = [
	{ id: 'david', code: '12139', codex: 1 },
	{ id: 'cornelia', code: '12140', codex: 2 },
	{ id: 'naomi', code: '12141', codex: 3 },
	{ id: 'earl', code: '12142', codex: 4 },
	{ id: 'abigail', code: '12143', codex: 5 },
	{ id: 'margaret', code: '12144', codex: 6 }
] as const;

export type BoaSuspectId = (typeof BOA_SUSPECTS)[number]['id'];

export const BOA_SERVANT_CODE = '12114';
export const BOA_ARMITAGE_CODE = '12115';
export const BOA_MARK_OF_ELOKOSS_CODE = '12137';
export const BOA_ELOKOSS_CODE = '12179';

/** Read when the Servant of Flame is defeated in Smoke and Mirrors, before deciding its fate. */
const SERVANT_UNMASKED = 'hidden.smoke_and_mirrors_phi';
/** Read when the Servant of Flame is defeated in Queen of Ash. */
const SERVANT_UNMASKED_IN_FINALE = 'hidden.queen_of_ash_phi';

export interface BoaSuspect {
	/** Plays this suspect was the harbinger behind the Servant of Flame's mask. */
	harbinger: Tally;
	/** Plays this suspect's codex was read through to the end in Smoke and Mirrors. */
	interrogated: Tally;
	/** Plays this suspect, as the harbinger, was unmasked in Queen of Ash. */
	unmaskedInFinale: Tally;
}

export interface CampaignBoa {
	family: string;
	plays: number;
	suspects: Record<BoaSuspectId, BoaSuspect>;
	/** The Servant of Flame through the campaign. */
	servant: {
		/** Spreading Flames, Resolution 1. */
		defeatedInSpreadingFlames: Tally;
		/** Smoke and Mirrors: defeated and killed, into the victory display. */
		killed: Tally;
		/** Smoke and Mirrors: held for questioning beneath the act, which it always escapes. */
		escaped: Tally;
		/** Queen of Ash: defeated again and unmasked. */
		unmaskedInFinale: Tally;
	};
	spreadingFlames: {
		saved: Tally;
		burned: Tally;
		/** The masked pursuer was never defeated: no resolution. */
		pursuerGotAway: Tally;
	};
	smokeAndMirrors: {
		/** Plays that reached the scenario's end. */
		played: Tally;
		foundTheCult: Tally;
		searchFailed: Tally;
		/** All six Elite enemies beneath the act. */
		scouredArkham: Tally;
		/** All six Elite enemies in the victory display. */
		stirredUpTrouble: Tally;
		/** Suspects interrogated across every play. */
		totalInterrogated: number;
		/** The most suspects interrogated in one play, per difficulty in difficulty order. */
		bestInterrogated: { tier: string; interrogated: number }[];
	};
	queenOfAsh: {
		defeatedElokoss: Tally;
		stoppedRebirth: Tally;
		floodedRitual: Tally;
		elokossReborn: Tally;
		/** Each investigator began with 1 clue: scoured Arkham for answers. */
		headStart: Tally;
		/** Cultists waited in the sewers: stirred up trouble. */
		ambushed: Tally;
		/** 1 extra doom on the agenda: the search failed. */
		extraDoom: Tally;
	};
}

const SMOKE_ENDINGS = ['discovered_the_cults_whereabouts', 'failed_in_their_search'];
const QUEEN_ENDINGS = [
	'defeated_elokoss_and_the_brethren_of_ash',
	'stopped_elokoss_glorious_rebirth',
	'flooded_the_ritual',
	'elokoss_was_reborn'
];

const harbingerNote = (id: BoaSuspectId) => `${id}_harbinger`;
const codexNote = (codex: number) => `hidden.smoke_and_mirrors_${codex}`;

export const buildBoa = defineCampaignBuilder<CampaignBoa>('boa', (plays) => {
	const suspects = {} as Record<BoaSuspectId, BoaSuspect>;
	for (const s of BOA_SUSPECTS)
		suspects[s.id] = {
			harbinger: emptyTally(),
			interrogated: emptyTally(),
			unmaskedInFinale: emptyTally()
		};

	const reachedSmoke = (p: Play) => SMOKE_ENDINGS.some((note) => p.has(note));
	const reachedQueen = (p: Play) => QUEEN_ENDINGS.some((note) => p.has(note));
	const bestByTier: Record<string, number> = {};
	let totalInterrogated = 0;

	for (const p of plays) {
		let interrogated = 0;
		for (const s of BOA_SUSPECTS) {
			const t = suspects[s.id];
			if (p.has(codexNote(s.codex))) {
				bumpTally(t.interrogated, p.tier);
				interrogated += 1;
			}
			if (p.has(harbingerNote(s.id))) {
				bumpTally(t.harbinger, p.tier);
				if (p.has(SERVANT_UNMASKED_IN_FINALE)) bumpTally(t.unmaskedInFinale, p.tier);
			}
		}
		totalInterrogated += interrogated;
		if (reachedSmoke(p)) bestByTier[p.tier] = Math.max(bestByTier[p.tier] ?? 0, interrogated);
	}

	return {
		suspects,
		servant: {
			defeatedInSpreadingFlames: tallyPlays(plays, (p) => p.has('defeated_their_masked_pursuer')),
			killed: tallyPlays(plays, (p) => p.has('killed_the_servant_of_flame')),
			escaped: tallyPlays(plays, (p) => p.has('the_servant_of_flame_escaped')),
			unmaskedInFinale: tallyPlays(plays, (p) => p.has(SERVANT_UNMASKED_IN_FINALE))
		},
		spreadingFlames: {
			...tallyNotes(plays, {
				saved: 'saved_miskatonic_university',
				burned: 'miskatonic_university_burned'
			}),
			pursuerGotAway: tallyPlays(
				plays,
				(p) => p.has('miskatonic_university_burned') && !p.has('defeated_their_masked_pursuer')
			)
		},
		smokeAndMirrors: {
			played: tallyPlays(plays, reachedSmoke),
			...tallyNotes(plays, {
				foundTheCult: 'discovered_the_cults_whereabouts',
				searchFailed: 'failed_in_their_search',
				scouredArkham: 'scoured_arkham_for_answers',
				stirredUpTrouble: 'stirred_up_trouble'
			}),
			totalInterrogated,
			bestInterrogated: orderedDifficulties(bestByTier).map((tier) => ({
				tier,
				interrogated: bestByTier[tier]
			}))
		},
		queenOfAsh: {
			...tallyNotes(plays, {
				defeatedElokoss: 'defeated_elokoss_and_the_brethren_of_ash',
				stoppedRebirth: 'stopped_elokoss_glorious_rebirth',
				floodedRitual: 'flooded_the_ritual',
				elokossReborn: 'elokoss_was_reborn'
			}),
			headStart: tallyPlays(plays, (p) => reachedQueen(p) && p.has('scoured_arkham_for_answers')),
			ambushed: tallyPlays(plays, (p) => reachedQueen(p) && p.has('stirred_up_trouble')),
			extraDoom: tallyPlays(plays, (p) => reachedQueen(p) && p.has('failed_in_their_search'))
		}
	};
});
