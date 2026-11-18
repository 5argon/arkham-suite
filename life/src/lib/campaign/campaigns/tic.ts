/** The Innsmouth Conspiracy per-scenario tallies, all from the log and all per difficulty. */
import { tallyNotes, tallyPlays, type Play } from '../records/play';
import type { Tally } from '../utils/tally';
import { defineCampaignBuilder } from './define';

/** The 15 flashbacks, by the scenario they are recovered in (a `memories_recovered` entry each). */
export const TIC_MEMORIES: { id: string; scenario: string }[] = [
	{ id: 'meeting_with_thomas_dawson', scenario: 'the_pit_of_despair' },
	{ id: 'battle_with_a_horrifying_devil', scenario: 'the_pit_of_despair' },
	{ id: 'decision_to_stick_together', scenario: 'the_pit_of_despair' },
	{ id: 'encounter_with_a_secret_cult', scenario: 'the_pit_of_despair' },
	{ id: 'a_deal_with_joe_sargent', scenario: 'in_too_deep' },
	{ id: 'a_followed_lead', scenario: 'in_too_deep' },
	{ id: 'an_intervention', scenario: 'in_too_deep' },
	{ id: 'a_jailbreak', scenario: 'in_too_deep' },
	{ id: 'discovery_of_a_strange_idol', scenario: 'devil_reef' },
	{ id: 'discovery_of_an_unholy_mantle', scenario: 'devil_reef' },
	{ id: 'discovery_of_a_mystical_relic', scenario: 'devil_reef' },
	{ id: 'conversation_with_mr_moore', scenario: 'a_light_in_the_fog' },
	{ id: 'lifecycle_of_a_deep_one', scenario: 'a_light_in_the_fog' },
	{ id: 'stinging_betrayal', scenario: 'into_the_maelstrom' },
	{ id: 'horrific_truth', scenario: 'tic_epilogue' }
];

/** The keys Into the Maelstrom places from earlier scenarios; holding all four opens its secret
 *  ending. The other three keys are not up to the players. */
export const TIC_KEYS: { id: string; note: string }[] = [
	{ id: 'blue', note: 'possess_the_key_to_yhanthlei' },
	{ id: 'red', note: 'possess_a_map_of_yhanthlei' },
	{ id: 'green', note: 'guardian_of_yhanthlei_is_dispatched' },
	{ id: 'yellow', note: 'gateway_to_yhanthlei_recognizes_you_as_its_rightful_keeper' }
];

/** The story assets brought to the lighthouse at Devil Reef. */
export const TIC_EQUIPMENT: { id: string; note: string; code: string }[] = [
	{ id: 'idol', note: 'idol_brought_to_the_lighthouse', code: '07179' },
	{ id: 'mantle', note: 'mantle_brought_to_the_lighthouse', code: '07180' },
	{ id: 'headdress', note: 'headdress_brought_to_the_lighthouse', code: '07181' }
];

/** The Vanishing of Elina Harper's suspects, accused through `hidden.accuse_<id>`. */
export const TIC_SUSPECTS: { id: string; code: string }[] = [
	{ id: 'burnham', code: '07078' },
	{ id: 'gilman', code: '07081' },
	{ id: 'little', code: '07080' },
	{ id: 'marsh', code: '07079' },
	{ id: 'allen', code: '07077' },
	{ id: 'friendly', code: '07076' }
];

/** Its hideouts; `id` is the `possible_hideouts` entry, `accuse` the `hidden.accuse_<accuse>` id. */
export const TIC_HIDEOUTS: { id: string; accuse: string; code: string }[] = [
	{ id: 'innsmouth_jail', accuse: 'prison', code: '07074' },
	{ id: 'shoreward_slums', accuse: 'slums', code: '07072' },
	{ id: 'sawbone_alley', accuse: 'sawbone_alley', code: '07071' },
	{ id: 'house_on_water_street', accuse: 'house_on_water_street', code: '07073' },
	{ id: 'order_of_dagon', accuse: 'order_of_dagon', code: '07070' },
	{ id: 'new_church_green', accuse: 'new_church_green', code: '07075' }
];

/** Plays recording each item, and plays recording all of them. */
export interface TicSet {
	each: Record<string, Tally>;
	all: Tally;
}

export interface CampaignTic {
	family: string;
	plays: number;
	/** `distinct` counts memories recovered in any play; `all` is the "You Wake Up In A Room…" set. */
	memories: TicSet & { distinct: number };
	keys: TicSet;
	equipment: TicSet;
	harper: {
		missionSucceeded: Tally;
		missionFailed: Tally;
		suspect: Record<string, Tally>;
		hideout: Record<string, Tally>;
	};
	inTooDeep: { safe: Tally; consumed: Tally };
	devilReef: { terrorAlive: Tally; terrorDead: Tally; tideGrown: Tally };
	horror: { beforeSunrise: Tally; afterSunrise: Tally };
	lightInTheFog: { map: Tally; key: Tally; divingSuit: Tally };
	/** The log records whether Dagon awoke, not whether he was defeated. */
	lairOfDagon: { awoke: Tally; slumbers: Tally; gatekeeperDefeated: Tally; ritualDisrupted: Tally };
	finale: {
		escaped: Tally;
		plotThwarted: Tally;
		floodBegun: Tally;
		floodedEarth: Tally;
		harperComplete: Tally;
		harperCompleteCost: Tally;
		richesLost: Tally;
		richesDestroyed: Tally;
	};
}

function tallySet(plays: Play[], keys: Record<string, string>): TicSet {
	return {
		each: tallyNotes(plays, keys),
		all: tallyPlays(plays, (p) => Object.values(keys).every((key) => p.has(key)))
	};
}

const specOf = <T extends { id: string }>(list: T[], key: (item: T) => string) =>
	Object.fromEntries(list.map((item) => [item.id, key(item)]));

export const buildTic = defineCampaignBuilder<CampaignTic>('tic', (plays) => {
	const memories = tallySet(plays, specOf(TIC_MEMORIES, (m) => `memories_recovered.${m.id}`));
	return {
		memories: {
			...memories,
			distinct: Object.values(memories.each).filter((t) => t.total > 0).length
		},
		keys: tallySet(plays, specOf(TIC_KEYS, (k) => k.note)),
		equipment: tallySet(plays, specOf(TIC_EQUIPMENT, (e) => e.note)),
		harper: {
			...tallyNotes(plays, { missionSucceeded: 'mission_succeeded', missionFailed: 'mission_failed' }),
			suspect: tallyNotes(plays, specOf(TIC_SUSPECTS, (s) => `hidden.accuse_${s.id}`)),
			hideout: tallyNotes(plays, specOf(TIC_HIDEOUTS, (h) => `hidden.accuse_${h.accuse}`))
		},
		inTooDeep: tallyNotes(plays, {
			safe: 'made_it_safely_to_their_vehicles',
			consumed: 'innsmouth_was_consumed_by_the_rising_tide'
		}),
		devilReef: tallyNotes(plays, {
			terrorAlive: 'terror_of_devil_reef_is_still_alive',
			terrorDead: 'terror_of_devil_reef_is_dead',
			tideGrown: 'tide_has_grown_stronger'
		}),
		horror: tallyNotes(plays, {
			beforeSunrise: 'reached_falcon_point_before_sunrise',
			afterSunrise: 'reached_falcon_point_after_sunrise'
		}),
		lightInTheFog: tallyNotes(plays, {
			map: 'possess_a_map_of_yhanthlei',
			key: 'possess_the_key_to_yhanthlei',
			divingSuit: 'possesses_a_diving_suit'
		}),
		lairOfDagon: tallyNotes(plays, {
			awoke: 'dagon_has_awakened',
			slumbers: 'dagon_still_slumbers',
			gatekeeperDefeated: 'gatekeeper_has_been_defeated',
			ritualDisrupted: 'orders_ritual_was_disrupted'
		}),
		finale: tallyNotes(plays, {
			escaped: 'escaped_yhanthlei',
			plotThwarted: 'plot_of_the_deep_ones_was_thwarted',
			floodBegun: 'flood_has_begun',
			floodedEarth: 'deep_ones_have_flooded_the_earth',
			harperComplete: 'agent_harpers_mission_is_complete',
			harperCompleteCost: 'agent_harpers_mission_is_complete_at_what_cost',
			richesLost: 'riches_of_the_deep_are_lost_forever',
			richesDestroyed: 'riches_of_the_deep_are_destroyed_at_what_cost'
		})
	};
});
