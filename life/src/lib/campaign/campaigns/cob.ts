/** Children of Blood: Julia Stern's fate, the hunt for Zburamoarte, the Blood Money party, the epilogue and the blood tokens left in the bag. */
import type { Tally } from '../utils/tally';
import { extentOf, type Extent } from '../utils/tally';
import { tallyNotes, tallyPlays, type Play } from '../records/play';
import { defineCampaignBuilder } from './define';

/** Julia Stern's River of Blood copy at Standard; each difficulty sets aside its own. */
export const COB_JULIA_CODE = '13025';
export const COB_ZBURAMOARTE_CODE = '13059';
export const COB_WILKES_CODE = '13084';
export const COB_PRISCILLA_CODE = '13083';

const BLOOD_TOKEN = 'blood';
/** Read when Priscilla Thomas has 4 or more horror and walks away from the deal. */
const PRISCILLA_WALKED_AWAY = 'hidden.priscilla_done';

export interface CampaignCob {
	family: string;
	plays: number;
	riverOfBlood: {
		spared: Tally;
		killed: Tally;
		/** No resolution, or Julia slipped away for good (Resolution 3). */
		failedToStop: Tally;
	};
	newHorizons: {
		completedSearch: Tally;
		didNotComplete: Tally;
		defeatedZburamoarte: Tally;
		leftZburamoarteAlive: Tally;
		/** Resolution 4: overwhelmed and dragged into the caves. */
		leftToTheCultsMercy: Tally;
	};
	bloodMoney: {
		stopped: Tally;
		failedToStop: Tally;
		/** Priscilla Thomas walked away from her deal with Wilkes. */
		priscillaWalkedAway: Tally;
	};
	/** The epilogue read after Blood Money. */
	epilogue: {
		/** Stopped the Children of Blood and defeated Zburamoarte. */
		arkhamRecovers: Tally;
		/** Stopped the Children of Blood with Zburamoarte left alive. */
		rumorsReturn: Tally;
		/** Failed to stop the Children of Blood. */
		bloodbath: Tally;
		/** Arkham recovered with Julia Stern spared: she is seen again on Water Street. */
		juliaSeenAgain: Tally;
	};
	/** [blood] tokens in the chaos bag after Blood Money, over plays that recorded their final bag. */
	blood: Extent;
}

const finished = (p: Play) =>
	p.has('stopped_the_children_of_blood') || p.has('failed_to_stop_the_children_of_blood');

function finalBlood(p: Play): number | null {
	const bag = p.rec.recorded.finalChaosBag;
	if (!finished(p) || !bag || !Object.keys(bag).length) return null;
	return bag[BLOOD_TOKEN] ?? 0;
}

export const buildCob = defineCampaignBuilder<CampaignCob>('cob', (plays) => {
	const recovers = (p: Play) =>
		p.has('stopped_the_children_of_blood') && p.has('defeated_zburamoarte');
	return {
		riverOfBlood: tallyNotes(plays, {
			spared: 'spared_julia_stern',
			killed: 'killed_julia_stern',
			failedToStop: 'failed_to_stop_julia_stern'
		}),
		newHorizons: tallyNotes(plays, {
			completedSearch: 'completed_their_search',
			didNotComplete: 'did_not_complete_their_search',
			defeatedZburamoarte: 'defeated_zburamoarte',
			leftZburamoarteAlive: 'left_zburamoarte_alive',
			leftToTheCultsMercy: 'left_to_the_cults_mercy'
		}),
		bloodMoney: {
			...tallyNotes(plays, {
				stopped: 'stopped_the_children_of_blood',
				failedToStop: 'failed_to_stop_the_children_of_blood'
			}),
			priscillaWalkedAway: tallyPlays(plays, (p) => p.has(PRISCILLA_WALKED_AWAY))
		},
		epilogue: {
			arkhamRecovers: tallyPlays(plays, recovers),
			rumorsReturn: tallyPlays(
				plays,
				(p) => p.has('stopped_the_children_of_blood') && !p.has('defeated_zburamoarte')
			),
			bloodbath: tallyPlays(plays, (p) => p.has('failed_to_stop_the_children_of_blood')),
			juliaSeenAgain: tallyPlays(plays, (p) => recovers(p) && p.has('spared_julia_stern'))
		},
		blood: extentOf(plays.map(finalBlood))
	};
});
