/** Traces to Nowhere: who was behind the abductions, how the case ended, and Aziza Steer brought home. */
import { tallyPlays, type Play } from '../records/play';
import { rewardFor } from '../rewards/reward-defs';
import { emptyTally, type Tally } from '../utils/tally';
import { defineStandaloneBuilder } from './define';

/**
 * The three possible culprits, each unmasked in the interlude by a codex entry and defeated by its
 * own resolution. `code` is the Culprit enemy.
 */
export const TTN_CULPRITS = [
	{
		id: 'lina',
		code: '73021',
		ending: 'saved_lina_husserl',
		resolution: 'R1',
		unmasked: 'hidden.traces_to_nowhere_lina_opened_the_door'
	},
	{
		id: 'eugene',
		code: '73020',
		ending: 'stopped_eugene_peel',
		resolution: 'R2',
		unmasked: 'hidden.traces_to_nowhere_eurgene_is_not_what_he_seems'
	},
	{
		id: 'albrecht',
		code: '73019',
		ending: 'stopped_albrecht_husserl',
		resolution: 'R3',
		unmasked: 'hidden.traces_to_nowhere_albrecht_is_the_culprit'
	}
] as const;

export type TtnCulpritId = (typeof TTN_CULPRITS)[number]['id'];

/** Aziza Steer (Has a Bone to Pick), the abducted story asset. */
export const TTN_AZIZA_STORY_CODE = '73049';

export interface StandaloneTtn {
	key: string;
	plays: number;
	/** Plays each culprit was unmasked: by their own resolution, or the interlude's codex entry. */
	culprits: Record<TtnCulpritId, Tally>;
	endings: {
		/** Resolution 1. */
		savedLina: Tally;
		/** Resolution 2. */
		stoppedEugene: Tally;
		/** Resolution 3. */
		stoppedAlbrecht: Tally;
		/** Resolution 4: the Dimensional Shambler claimed its next victim. */
		stillAtLarge: Tally;
		/** No resolution: each investigator was defeated. */
		failed: Tally;
	};
	/** Resolution 5: Aziza Steer was under an investigator's control, earning her reward card. */
	azizaRescued: Tally;
}

const AZIZA_REWARD = rewardFor('side', 'ttn');

export const buildTtn = defineStandaloneBuilder<StandaloneTtn>('side', 'ttn', (plays) => {
	// A side story played inside a campaign records only its resolution, so each ending also reads it.
	const ended = (note: string, resolution: string) =>
		tallyPlays(plays, (p: Play) => p.has(note) || p.resolution('ttn') === resolution);
	const culprits = {} as Record<TtnCulpritId, Tally>;
	for (const c of TTN_CULPRITS)
		culprits[c.id] = tallyPlays(
			plays,
			(p) => p.has(c.ending) || p.resolution('ttn') === c.resolution || p.has(c.unmasked)
		);
	return {
		culprits,
		endings: {
			savedLina: ended('saved_lina_husserl', 'R1'),
			stoppedEugene: ended('stopped_eugene_peel', 'R2'),
			stoppedAlbrecht: ended('stopped_albrecht_husserl', 'R3'),
			stillAtLarge: ended('the_culprit_is_still_at_large', 'R4'),
			failed: ended('failed_to_solve_the_case', 'no_resolution')
		},
		azizaRescued: AZIZA_REWARD ? tallyPlays(plays, (p) => AZIZA_REWARD.earned(p)) : emptyTally()
	};
});
