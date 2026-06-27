/**
 * tic.ts — The Innsmouth Conspiracy bespoke per-campaign tallies. ONE builder, ONE
 * payload blob (`tic`), mirroring `tcu.ts` / `dwl.ts`. Fully log-derived. See
 * `tic-widgets-plan.md`.
 *
 *   • memories — the 15 flashbacks (`memories_recovered`), the campaign's collectible
 *     spine + the "You Wake Up In A Room…" achievement (all 15). No card art.
 *   • sevenKeys — the finale gate: the 4 OBTAINABLE keys (blue/red/green/yellow) earned
 *     in earlier scenarios; ALL 4 ⇒ the secret-ending branch is reachable in Into the
 *     Maelstrom. (Keys are a per-scenario mechanic, not carried; this measures setup.)
 *   • equipment — the 3 story assets (Waveworn Idol / Awakened Mantle / Headdress)
 *     brought to the lighthouse (Devil Reef) — the `full_build` achievement.
 *   • harper — The Vanishing of Elina Harper: the suspect + hideout accused
 *     (`hidden.accuse_*`) and the rescue (mission succeeded / failed).
 *   • per-scenario — In Too Deep / Devil Reef / Horror in High Gear / A Light in the
 *     Fog / The Lair of Dagon decisions; finale = flood axis + Harper-mission branches.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import { filterFamilyRecords } from '../records/campaign-family';

const TIC_FAMILY = 'tic';
const N = 'campaign_notes';
const k = (id: string) => `${N}.${id}`;
const mem = (id: string) => `memories_recovered.${id}`;

/** The 15 flashbacks, grouped by the scenario they're found in (display order). */
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

/** The 4 OBTAINABLE finale keys (the controllable gate; all 4 ⇒ secret ending). */
export const TIC_KEYS: { id: string; note: string }[] = [
	{ id: 'blue', note: 'possess_the_key_to_yhanthlei' },
	{ id: 'red', note: 'possess_a_map_of_yhanthlei' },
	{ id: 'green', note: 'guardian_of_yhanthlei_is_dispatched' },
	{ id: 'yellow', note: 'gateway_to_yhanthlei_recognizes_you_as_its_rightful_keeper' }
];

/** The 3 equipment items (Devil Reef → the lighthouse) — the `full_build` achievement. */
export const TIC_EQUIPMENT: { id: string; note: string }[] = [
	{ id: 'idol', note: 'idol_brought_to_the_lighthouse' },
	{ id: 'mantle', note: 'mantle_brought_to_the_lighthouse' },
	{ id: 'headdress', note: 'headdress_brought_to_the_lighthouse' }
];

export const TIC_SUSPECTS = ['burnham', 'gilman', 'little', 'marsh', 'allen', 'friendly'];
/** Hideout display id → its `hidden.accuse_*` id (two differ: prison / slums). */
export const TIC_HIDEOUTS: { id: string; accuse: string }[] = [
	{ id: 'innsmouth_jail', accuse: 'prison' },
	{ id: 'shoreward_slums', accuse: 'slums' },
	{ id: 'sawbone_alley', accuse: 'sawbone_alley' },
	{ id: 'house_on_water_street', accuse: 'house_on_water_street' },
	{ id: 'order_of_dagon', accuse: 'order_of_dagon' },
	{ id: 'new_church_green', accuse: 'new_church_green' }
];

export interface CampaignTic {
	/** Always 'tic'. */
	family: string;
	plays: number;
	/** memory id → plays that recovered it; everRecovered = distinct memories seen; allFifteen = full set. */
	memories: { recovered: Record<string, number>; everRecovered: number; allFifteen: number };
	/** key id → plays that secured it; allFour = plays with all 4 (secret-ending branch reachable). */
	sevenKeys: { obtainable: Record<string, number>; allFour: number };
	/** equipment id → plays secured; allThree = plays with all three (full_build). */
	equipment: { secured: Record<string, number>; allThree: number };
	harper: {
		missionSucceeded: number;
		missionFailed: number;
		/** suspect id → plays accused. */
		suspect: Record<string, number>;
		/** hideout id → plays accused. */
		hideout: Record<string, number>;
	};
	inTooDeep: { safe: number; consumed: number };
	devilReef: { terrorAlive: number; terrorDead: number; tideGrown: number };
	horror: { beforeSunrise: number; afterSunrise: number };
	lightInTheFog: { map: number; key: number; divingSuit: number };
	lairOfDagon: { awoke: number; slumbers: number; gatekeeperDefeated: number; ritualDisrupted: number };
	/** Into the Maelstrom — flood axis + Harper-mission branches (single-sided finale outcomes). */
	finale: {
		escaped: number;
		plotThwarted: number;
		floodBegun: number;
		floodedEarth: number;
		harperComplete: number;
		harperCompleteCost: number;
		richesLost: number;
		richesDestroyed: number;
	};
}

export function buildTic(records: CampaignRecord[]): CampaignTic[] {
	const baseLog = getCampaignLog(TIC_FAMILY);
	if (!baseLog) return [];
	const ticRecords = filterFamilyRecords(records, TIC_FAMILY);
	if (ticRecords.length === 0) return [];

	const memRecovered: Record<string, number> = {};
	let allFifteen = 0;
	const keyObtainable: Record<string, number> = {};
	let allFour = 0;
	const equipSecured: Record<string, number> = {};
	let allThree = 0;
	const harper = { missionSucceeded: 0, missionFailed: 0, suspect: {} as Record<string, number>, hideout: {} as Record<string, number> };
	const inTooDeep = { safe: 0, consumed: 0 };
	const devilReef = { terrorAlive: 0, terrorDead: 0, tideGrown: 0 };
	const horror = { beforeSunrise: 0, afterSunrise: 0 };
	const lightInTheFog = { map: 0, key: 0, divingSuit: 0 };
	const lairOfDagon = { awoke: 0, slumbers: 0, gatekeeperDefeated: 0, ritualDisrupted: 0 };
	const finale = { escaped: 0, plotThwarted: 0, floodBegun: 0, floodedEarth: 0, harperComplete: 0, harperCompleteCost: 0, richesLost: 0, richesDestroyed: 0 };

	for (const rec of ticRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const has = (key: string) => logs.has(key);

		// Memories (the 15 flashbacks).
		let memCount = 0;
		for (const m of TIC_MEMORIES) {
			if (has(mem(m.id))) {
				memRecovered[m.id] = (memRecovered[m.id] ?? 0) + 1;
				memCount += 1;
			}
		}
		if (memCount === TIC_MEMORIES.length) allFifteen += 1;

		// The 4 obtainable finale keys → the secret-ending gate.
		let keyCount = 0;
		for (const key of TIC_KEYS) {
			if (has(k(key.note))) {
				keyObtainable[key.id] = (keyObtainable[key.id] ?? 0) + 1;
				keyCount += 1;
			}
		}
		if (keyCount === TIC_KEYS.length) allFour += 1;

		// The 3 equipment items.
		let equipCount = 0;
		for (const eq of TIC_EQUIPMENT) {
			if (has(k(eq.note))) {
				equipSecured[eq.id] = (equipSecured[eq.id] ?? 0) + 1;
				equipCount += 1;
			}
		}
		if (equipCount === TIC_EQUIPMENT.length) allThree += 1;

		// The Vanishing of Elina Harper — rescue + the accusation (hidden section).
		if (has(k('mission_succeeded'))) harper.missionSucceeded += 1;
		if (has(k('mission_failed'))) harper.missionFailed += 1;
		for (const s of TIC_SUSPECTS) if (has(`hidden.accuse_${s}`)) harper.suspect[s] = (harper.suspect[s] ?? 0) + 1;
		for (const h of TIC_HIDEOUTS) if (has(`hidden.accuse_${h.accuse}`)) harper.hideout[h.id] = (harper.hideout[h.id] ?? 0) + 1;

		// In Too Deep — the flooding fork.
		if (has(k('made_it_safely_to_their_vehicles'))) inTooDeep.safe += 1;
		if (has(k('innsmouth_was_consumed_by_the_rising_tide'))) inTooDeep.consumed += 1;

		// Devil Reef.
		if (has(k('terror_of_devil_reef_is_still_alive'))) devilReef.terrorAlive += 1;
		if (has(k('terror_of_devil_reef_is_dead'))) devilReef.terrorDead += 1;
		if (has(k('tide_has_grown_stronger'))) devilReef.tideGrown += 1;

		// Horror in High Gear.
		if (has(k('reached_falcon_point_before_sunrise'))) horror.beforeSunrise += 1;
		if (has(k('reached_falcon_point_after_sunrise'))) horror.afterSunrise += 1;

		// A Light in the Fog.
		if (has(k('possess_a_map_of_yhanthlei'))) lightInTheFog.map += 1;
		if (has(k('possess_the_key_to_yhanthlei'))) lightInTheFog.key += 1;
		if (has(k('possesses_a_diving_suit'))) lightInTheFog.divingSuit += 1;

		// The Lair of Dagon (defeating Dagon is NOT logged — only awoke vs slumbers).
		if (has(k('dagon_has_awakened'))) lairOfDagon.awoke += 1;
		if (has(k('dagon_still_slumbers'))) lairOfDagon.slumbers += 1;
		if (has(k('gatekeeper_has_been_defeated'))) lairOfDagon.gatekeeperDefeated += 1;
		if (has(k('orders_ritual_was_disrupted'))) lairOfDagon.ritualDisrupted += 1;

		// Into the Maelstrom — flood axis + Harper-mission branches.
		if (has(k('escaped_yhanthlei'))) finale.escaped += 1;
		if (has(k('plot_of_the_deep_ones_was_thwarted'))) finale.plotThwarted += 1;
		if (has(k('flood_has_begun'))) finale.floodBegun += 1;
		if (has(k('deep_ones_have_flooded_the_earth'))) finale.floodedEarth += 1;
		if (has(k('agent_harpers_mission_is_complete'))) finale.harperComplete += 1;
		if (has(k('agent_harpers_mission_is_complete_at_what_cost'))) finale.harperCompleteCost += 1;
		if (has(k('riches_of_the_deep_are_lost_forever'))) finale.richesLost += 1;
		if (has(k('riches_of_the_deep_are_destroyed_at_what_cost'))) finale.richesDestroyed += 1;
	}

	const everRecovered = TIC_MEMORIES.filter((m) => (memRecovered[m.id] ?? 0) > 0).length;

	return [
		{
			family: TIC_FAMILY,
			plays: ticRecords.length,
			memories: { recovered: memRecovered, everRecovered, allFifteen },
			sevenKeys: { obtainable: keyObtainable, allFour },
			equipment: { secured: equipSecured, allThree },
			harper,
			inTooDeep,
			devilReef,
			horror,
			lightInTheFog,
			lairOfDagon,
			finale
		}
	];
}
