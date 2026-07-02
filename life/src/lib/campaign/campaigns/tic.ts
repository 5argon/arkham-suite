/**
 * tic.ts — The Innsmouth Conspiracy bespoke per-campaign tallies. ONE builder, ONE
 * payload blob (`tic`), mirroring `tcu.ts` / `dwl.ts`. Fully log-derived. Every count is
 * a per-difficulty `ResolutionTally` so the widgets can show the shared difficulty hover.
 *
 *   • memories — the 15 flashbacks (`memories_recovered`), the campaign's collectible
 *     spine + the "You Wake Up In A Room…" achievement (all 15). No card art.
 *   • sevenKeys — the finale gate: the 4 OBTAINABLE keys (blue/red/green/yellow) earned
 *     in earlier scenarios; ALL 4 ⇒ the secret-ending branch is reachable in Into the
 *     Maelstrom. (Keys are a per-scenario mechanic, not carried; this measures setup.)
 *   • equipment — the 3 story assets (Waveworn Idol / Awakened Mantle / Headdress)
 *     brought to the lighthouse (Devil Reef) — the `full_build` achievement.
 *   • harper — The Vanishing of Elina Harper: the suspect + hideout accused
 *     (`hidden.accuse_*`) and the rescue (mission succeeded / failed). Suspects (enemies)
 *     and hideouts (locations) carry their card codes so the widget shows real art.
 *   • per-scenario — In Too Deep / Devil Reef / Horror in High Gear / A Light in the
 *     Fog / The Lair of Dagon decisions; finale = flood axis + Harper-mission branches.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import type { ResolutionTally } from '../outcomes/resolution-coverage';
import { filterFamilyRecords } from '../records/campaign-family';
import { bumpTally, emptyTally, ensureTally } from '../utils/tally';

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

/** The 3 equipment items (Devil Reef → the lighthouse) — the `full_build` achievement.
 *  Codes are the real story-asset cards (Devil Reef pack) for the artifact art wall. */
export const TIC_EQUIPMENT: { id: string; note: string; code: string }[] = [
	{ id: 'idol', note: 'idol_brought_to_the_lighthouse', code: '07179' },
	{ id: 'mantle', note: 'mantle_brought_to_the_lighthouse', code: '07180' },
	{ id: 'headdress', note: 'headdress_brought_to_the_lighthouse', code: '07181' }
];

/** The 6 suspects (enemy cards) — id + its `hidden.accuse_<id>` id + card code for the art wall. */
export const TIC_SUSPECTS: { id: string; code: string }[] = [
	{ id: 'burnham', code: '07078' },
	{ id: 'gilman', code: '07081' },
	{ id: 'little', code: '07080' },
	{ id: 'marsh', code: '07079' },
	{ id: 'allen', code: '07077' },
	{ id: 'friendly', code: '07076' }
];
/** Hideout display id → its `hidden.accuse_*` id (two differ: prison / slums) + card code. */
export const TIC_HIDEOUTS: { id: string; accuse: string; code: string }[] = [
	{ id: 'innsmouth_jail', accuse: 'prison', code: '07074' },
	{ id: 'shoreward_slums', accuse: 'slums', code: '07072' },
	{ id: 'sawbone_alley', accuse: 'sawbone_alley', code: '07071' },
	{ id: 'house_on_water_street', accuse: 'house_on_water_street', code: '07073' },
	{ id: 'order_of_dagon', accuse: 'order_of_dagon', code: '07070' },
	{ id: 'new_church_green', accuse: 'new_church_green', code: '07075' }
];

/** The Amalgam (the Pit of Despair boss) + Agent Harper — passport header art codes. */
export const TIC_AMALGAM_CODE = '07053';
export const TIC_HARPER_CODE = '07083';

export interface CampaignTic {
	/** Always 'tic'. */
	family: string;
	plays: number;
	/** memory id → plays that recovered it (per-difficulty); everRecovered = distinct memories seen;
	 *  allFifteen = plays with the full set (the "You Wake Up In A Room…" achievement). */
	memories: {
		recovered: Record<string, ResolutionTally>;
		everRecovered: number;
		allFifteen: ResolutionTally;
	};
	/** key id → plays that secured it; allFour = plays with all 4 (secret-ending branch reachable). */
	sevenKeys: { obtainable: Record<string, ResolutionTally>; allFour: ResolutionTally };
	/** equipment id → plays secured; allThree = plays with all three (full_build). */
	equipment: { secured: Record<string, ResolutionTally>; allThree: ResolutionTally };
	harper: {
		missionSucceeded: ResolutionTally;
		missionFailed: ResolutionTally;
		/** suspect id → plays accused. */
		suspect: Record<string, ResolutionTally>;
		/** hideout id → plays accused. */
		hideout: Record<string, ResolutionTally>;
	};
	inTooDeep: { safe: ResolutionTally; consumed: ResolutionTally };
	devilReef: {
		terrorAlive: ResolutionTally;
		terrorDead: ResolutionTally;
		tideGrown: ResolutionTally;
	};
	horror: { beforeSunrise: ResolutionTally; afterSunrise: ResolutionTally };
	lightInTheFog: { map: ResolutionTally; key: ResolutionTally; divingSuit: ResolutionTally };
	lairOfDagon: {
		awoke: ResolutionTally;
		slumbers: ResolutionTally;
		gatekeeperDefeated: ResolutionTally;
		ritualDisrupted: ResolutionTally;
	};
	/** Into the Maelstrom — flood axis + Harper-mission branches (single-sided finale outcomes). */
	finale: {
		escaped: ResolutionTally;
		plotThwarted: ResolutionTally;
		floodBegun: ResolutionTally;
		floodedEarth: ResolutionTally;
		harperComplete: ResolutionTally;
		harperCompleteCost: ResolutionTally;
		richesLost: ResolutionTally;
		richesDestroyed: ResolutionTally;
	};
}

export function buildTic(records: CampaignRecord[]): CampaignTic[] {
	const baseLog = getCampaignLog(TIC_FAMILY);
	if (!baseLog) return [];
	const ticRecords = filterFamilyRecords(records, TIC_FAMILY);
	if (ticRecords.length === 0) return [];

	const memRecovered: Record<string, ResolutionTally> = {};
	const allFifteen = emptyTally();
	const keyObtainable: Record<string, ResolutionTally> = {};
	const allFour = emptyTally();
	const equipSecured: Record<string, ResolutionTally> = {};
	const allThree = emptyTally();
	const harper = {
		missionSucceeded: emptyTally(),
		missionFailed: emptyTally(),
		suspect: {} as Record<string, ResolutionTally>,
		hideout: {} as Record<string, ResolutionTally>
	};
	const inTooDeep = { safe: emptyTally(), consumed: emptyTally() };
	const devilReef = {
		terrorAlive: emptyTally(),
		terrorDead: emptyTally(),
		tideGrown: emptyTally()
	};
	const horror = { beforeSunrise: emptyTally(), afterSunrise: emptyTally() };
	const lightInTheFog = { map: emptyTally(), key: emptyTally(), divingSuit: emptyTally() };
	const lairOfDagon = {
		awoke: emptyTally(),
		slumbers: emptyTally(),
		gatekeeperDefeated: emptyTally(),
		ritualDisrupted: emptyTally()
	};
	const finale = {
		escaped: emptyTally(),
		plotThwarted: emptyTally(),
		floodBegun: emptyTally(),
		floodedEarth: emptyTally(),
		harperComplete: emptyTally(),
		harperCompleteCost: emptyTally(),
		richesLost: emptyTally(),
		richesDestroyed: emptyTally()
	};

	for (const rec of ticRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const tier = rec.recorded.difficulty ?? 'standard';
		const on = (key: string, t: ResolutionTally) => {
			if (logs.has(key)) bumpTally(t, tier);
		};

		// Memories (the 15 flashbacks).
		let memCount = 0;
		for (const m of TIC_MEMORIES) {
			if (logs.has(mem(m.id))) {
				bumpTally(ensureTally(memRecovered, m.id), tier);
				memCount += 1;
			}
		}
		if (memCount === TIC_MEMORIES.length) bumpTally(allFifteen, tier);

		// The 4 obtainable finale keys → the secret-ending gate.
		let keyCount = 0;
		for (const key of TIC_KEYS) {
			if (logs.has(k(key.note))) {
				bumpTally(ensureTally(keyObtainable, key.id), tier);
				keyCount += 1;
			}
		}
		if (keyCount === TIC_KEYS.length) bumpTally(allFour, tier);

		// The 3 equipment items.
		let equipCount = 0;
		for (const eq of TIC_EQUIPMENT) {
			if (logs.has(k(eq.note))) {
				bumpTally(ensureTally(equipSecured, eq.id), tier);
				equipCount += 1;
			}
		}
		if (equipCount === TIC_EQUIPMENT.length) bumpTally(allThree, tier);

		// The Vanishing of Elina Harper — rescue + the accusation (hidden section).
		on(k('mission_succeeded'), harper.missionSucceeded);
		on(k('mission_failed'), harper.missionFailed);
		for (const s of TIC_SUSPECTS) on(`hidden.accuse_${s.id}`, ensureTally(harper.suspect, s.id));
		for (const h of TIC_HIDEOUTS)
			on(`hidden.accuse_${h.accuse}`, ensureTally(harper.hideout, h.id));

		// In Too Deep — the flooding fork.
		on(k('made_it_safely_to_their_vehicles'), inTooDeep.safe);
		on(k('innsmouth_was_consumed_by_the_rising_tide'), inTooDeep.consumed);

		// Devil Reef.
		on(k('terror_of_devil_reef_is_still_alive'), devilReef.terrorAlive);
		on(k('terror_of_devil_reef_is_dead'), devilReef.terrorDead);
		on(k('tide_has_grown_stronger'), devilReef.tideGrown);

		// Horror in High Gear.
		on(k('reached_falcon_point_before_sunrise'), horror.beforeSunrise);
		on(k('reached_falcon_point_after_sunrise'), horror.afterSunrise);

		// A Light in the Fog.
		on(k('possess_a_map_of_yhanthlei'), lightInTheFog.map);
		on(k('possess_the_key_to_yhanthlei'), lightInTheFog.key);
		on(k('possesses_a_diving_suit'), lightInTheFog.divingSuit);

		// The Lair of Dagon (defeating Dagon is NOT logged — only awoke vs slumbers).
		on(k('dagon_has_awakened'), lairOfDagon.awoke);
		on(k('dagon_still_slumbers'), lairOfDagon.slumbers);
		on(k('gatekeeper_has_been_defeated'), lairOfDagon.gatekeeperDefeated);
		on(k('orders_ritual_was_disrupted'), lairOfDagon.ritualDisrupted);

		// Into the Maelstrom — flood axis + Harper-mission branches.
		on(k('escaped_yhanthlei'), finale.escaped);
		on(k('plot_of_the_deep_ones_was_thwarted'), finale.plotThwarted);
		on(k('flood_has_begun'), finale.floodBegun);
		on(k('deep_ones_have_flooded_the_earth'), finale.floodedEarth);
		on(k('agent_harpers_mission_is_complete'), finale.harperComplete);
		on(k('agent_harpers_mission_is_complete_at_what_cost'), finale.harperCompleteCost);
		on(k('riches_of_the_deep_are_lost_forever'), finale.richesLost);
		on(k('riches_of_the_deep_are_destroyed_at_what_cost'), finale.richesDestroyed);
	}

	const everRecovered = TIC_MEMORIES.filter((m) => (memRecovered[m.id]?.total ?? 0) > 0).length;

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
