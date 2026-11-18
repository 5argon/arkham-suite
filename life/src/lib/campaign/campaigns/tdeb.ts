/** The Web of Dreams (The Dream-Eaters B): the Steps of the Bridge track and each scenario's logged
 *  decisions. The threads shared with The Dream-Quest ride on `shared`. */
import { countNotes } from '../records/play';
import { defineCampaignBuilder } from './define';
import {
	buildTdeShared,
	countTrack,
	TDEB_FAMILY,
	type CampaignTdeShared,
	type CountTrack
} from './tde-shared';

/** Weaver of the Cosmos places doom by the Steps of the Bridge: each band's lowest count, band
 *  index = doom placed. */
const STEPS_BAND_FLOORS = [0, 3, 6, 9, 12];

export interface StepsBand {
	doom: number;
	from: number;
	/** Null for the open top band. */
	to: number | null;
	plays: number;
}

export interface CampaignTdeb {
	family: string;
	plays: number;
	shared: CampaignTdeShared;
	/** Every doom band in order, with the plays that ended in it. */
	stepsOfTheBridge: CountTrack & { bands: StepsBand[] };
	wakingNightmare: {
		doctorJoined: number;
		doctorStayed: number;
		doctorFateUnknown: number;
		doctorAlive: number;
		doctorMissing: number;
	};
	pointOfNoReturn: { foundWayOut: number };
	weaver: {
		bridgeCompleted: number;
		returnedToReality: number;
		neverEscaped: number;
		stillInDreamlands: number;
		bridgeDestroyed: number;
		trappedInRealm: number;
		spiderQueen: number;
	};
}

function stepsBands(distribution: Record<number, number>): StepsBand[] {
	return STEPS_BAND_FLOORS.map((from, doom) => {
		const next = STEPS_BAND_FLOORS[doom + 1];
		const to = next === undefined ? null : next - 1;
		const plays = Object.entries(distribution)
			.filter(([steps]) => +steps >= from && (to === null || +steps <= to))
			.reduce((sum, [, n]) => sum + n, 0);
		return { doom, from, to, plays };
	});
}

export const buildTdeb = defineCampaignBuilder<CampaignTdeb>(TDEB_FAMILY, (plays) => {
	const steps = countTrack(plays, 'steps_of_the_bridge');
	return {
		shared: buildTdeShared(plays, TDEB_FAMILY),
		stepsOfTheBridge: { ...steps, bands: stepsBands(steps.distribution) },
		wakingNightmare: countNotes(plays, {
			doctorJoined: 'doctor_joined_investigation',
			doctorStayed: 'doctor_stayed_with_patients',
			doctorFateUnknown: 'doctors_fate_unknown',
			doctorAlive: 'doctor_is_alive',
			doctorMissing: 'doctor_is_missing'
		}),
		pointOfNoReturn: countNotes(plays, { foundWayOut: 'found_a_way_out_of_the_underworld' }),
		weaver: countNotes(plays, {
			bridgeCompleted: 'bridge_was_completed',
			returnedToReality: 'returned_to_reality',
			neverEscaped: 'never_escaped',
			stillInDreamlands: 'still_in_the_dreamlands',
			bridgeDestroyed: 'bridge_was_destroyed',
			trappedInRealm: 'trapped_in_atlach_nachas_realm',
			spiderQueen: 'hidden.spider_queen'
		})
	};
});
