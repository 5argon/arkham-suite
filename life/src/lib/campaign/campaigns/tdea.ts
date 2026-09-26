/** The Dream-Quest (The Dream-Eaters A): the Evidence of Kadath track and each scenario's logged
 *  decisions. The threads shared with The Web of Dreams ride on `shared`. */
import { countNotes } from '../records/play';
import { defineCampaignBuilder } from './define';
import {
	buildTdeShared,
	countTrack,
	TDEA_FAMILY,
	type CampaignTdeShared,
	type CountTrack
} from './tde-shared';

const EVIDENCE = 'evidence_of_kadath';
/** Evidence of Kadath that uncovers every Sign of the Gods ("Losing My Religion"). */
export const TDEA_ALL_SIGNS = 10;

/** The Search for Kadath's Dreamlands region; a play records one. */
const ROUTE = {
	oriab: 'hidden.oriab',
	minar: 'hidden.minar',
	forbidden_lands: 'hidden.forbidden_lands',
	timeless_realm: 'hidden.timeless_realm'
};

export interface CampaignTdea {
	family: string;
	plays: number;
	shared: CampaignTdeShared;
	/** Each Evidence of Kadath at Where the Gods Dwell removes one clue from the Onyx Gates. */
	evidenceOfKadath: CountTrack & {
		/** Signs of the Gods lit by the best run. */
		bestSigns: number;
		allSigns: number;
	};
	beyondGates: {
		savedByRandolph: number;
		catsCollectedTribute: number;
		parleyedZoogs: number;
		strayedFromPath: number;
	};
	searchForKadath: {
		/** Region id → plays. */
		route: Record<string, number>;
		forcedIntoTemple: number;
		brokeLawOfUlthar: number;
		captures: {
			virgil: number;
			randolph: number;
			someoneEscaped: number;
			everyoneCaptured: number;
		};
	};
	darkSideOfMoon: {
		carried: number;
		travelled: number;
		randolphSurvivedVoyage: number;
		randolphDiedVoyage: number;
	};
	whereTheGodsDwell: {
		invasion: number;
		awoke: number;
		stayedForever: number;
		traveledMonastery: number;
		banished: number;
		escapedGrasp: number;
		grandDesign: number;
		knowAnotherPath: number;
	};
	/** Read at The Great Ones for a difficulty-scaled chaos token. */
	dreamersGrowWeaker: number;
}

export const buildTdea = defineCampaignBuilder<CampaignTdea>(TDEA_FAMILY, (plays) => {
	const evidence = countTrack(plays, EVIDENCE);
	return {
		shared: buildTdeShared(plays, TDEA_FAMILY),
		evidenceOfKadath: {
			...evidence,
			bestSigns: Math.min(evidence.max ?? 0, TDEA_ALL_SIGNS),
			allSigns: plays.filter((p) => (p.count(EVIDENCE) ?? 0) >= TDEA_ALL_SIGNS).length
		},
		beyondGates: countNotes(plays, {
			savedByRandolph: 'saved_by_randolph_carter',
			catsCollectedTribute: 'cats_collected_their_tribute',
			parleyedZoogs: 'parleyed_with_zoogs',
			strayedFromPath: 'strayed_from_the_path'
		}),
		searchForKadath: {
			route: countNotes(plays, ROUTE),
			...countNotes(plays, {
				forcedIntoTemple: 'forced_way_into_temple',
				brokeLawOfUlthar: 'broken_the_law_of_ulthar'
			}),
			captures: countNotes(plays, {
				virgil: 'virgil_was_captured',
				randolph: 'randolph_was_captured',
				someoneEscaped: 'hidden.someone_escaped',
				everyoneCaptured: 'hidden.everyone_captured'
			})
		},
		darkSideOfMoon: countNotes(plays, {
			carried: 'carried_to_the_cold_wastes',
			travelled: 'travelled_to_the_cold_wastes',
			randolphSurvivedVoyage: 'randolph_survived_the_voyage',
			randolphDiedVoyage: 'randolph_did_not_survive_the_voyage'
		}),
		whereTheGodsDwell: countNotes(plays, {
			invasion: 'nyarlathoteps_invasion_has_begun',
			awoke: 'dreamers_awoke',
			stayedForever: 'dreamers_stayed_in_dreamlands_forever',
			traveledMonastery: 'dreamers_traveled_beneath_the_monastery',
			banished: 'dreamers_banished_nyarlathotep',
			escapedGrasp: 'dreamers_escaped_nyarlathoteps_grasp',
			grandDesign: 'hidden.grand_design',
			knowAnotherPath: 'dreamers_know_of_another_path'
		}),
		dreamersGrowWeaker: plays.filter((p) => p.has('dreamers_grow_weaker')).length
	};
});
