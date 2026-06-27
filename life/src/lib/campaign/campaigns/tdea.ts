/**
 * tdea.ts — The Dream-Quest (The Dream-Eaters, campaign A) bespoke tallies. ONE
 * builder, ONE payload blob (`tdea`), mirroring `dwl.ts` / `tcu.ts`. The
 * interconnected machinery (play mode, Black Cat, Silver Key, Randolph, the epilogue
 * matrix) lives in `tde-shared.ts` and rides on `shared`; this file owns the
 * Dream-Quest spine + per-scenario decisions.
 *
 *   • evidenceOfKadath — the running count (`evidence_of_kadath`), with its finale
 *     impact: it's LINEAR not tiered — the Where the Gods Dwell scenario card removes
 *     1 clue from the Onyx Gates per tally (easier final gate); 10 = the "Losing My
 *     Religion" achievement (all Signs of the Gods). Per-source attribution = non-goal.
 *   • beyondGates / searchForKadath / darkSideOfMoon / whereTheGodsDwell — per-scenario
 *     logged decisions, the Dreamlands route, captures, and the four finale outcomes.
 *   • dreamersGrowWeaker — the campaign-weakening flag (read in the Great Ones).
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import { filterFamilyRecords } from '../records/campaign-family';
import { buildTdeShared, TDEA_FAMILY, type CampaignTdeShared } from './tde-shared';

const N = 'campaign_notes';
const k = (id: string) => `${N}.${id}`;
const EVIDENCE_OF_KADATH = 'evidence_of_kadath'; // a `count` section (logCounts[sectionId])
/** All Signs of the Gods uncovered → the "Losing My Religion" achievement. */
const ALL_SIGNS = 10;

/** The Search for Kadath Dreamlands route (hidden notes — exactly one is taken). */
const ROUTE: { id: string; key: string }[] = [
	{ id: 'oriab', key: 'hidden.oriab' },
	{ id: 'minar', key: 'hidden.minar' },
	{ id: 'forbidden_lands', key: 'hidden.forbidden_lands' },
	{ id: 'timeless_realm', key: 'hidden.timeless_realm' },
];

export interface CampaignTdea {
	/** Always 'tdea'. */
	family: string;
	plays: number;
	/** Cross-campaign interconnected view (Black Cat, Silver Key, Randolph, epilogue matrix). */
	shared: CampaignTdeShared;
	/** Evidence of Kadath — the running count toward the Onyx Castle. */
	evidenceOfKadath: {
		/** Plays that recorded any Evidence (reached the relevant scenarios). */
		plays: number;
		max: number | null;
		min: number | null;
		total: number;
		/** count value → plays that ended with exactly that many. */
		distribution: Record<number, number>;
		/** Plays that uncovered all 10 Signs (the achievement breakpoint). */
		allSigns: number;
	};
	beyondGates: { savedByRandolph: number; catsCollectedTribute: number; parleyedZoogs: number; strayedFromPath: number };
	searchForKadath: {
		/** route id → plays. */
		route: Record<string, number>;
		forcedIntoTemple: number;
		brokeLawOfUlthar: number;
		captures: { virgil: number; randolph: number; someoneEscaped: number; everyoneCaptured: number };
	};
	darkSideOfMoon: { carried: number; travelled: number; randolphSurvivedVoyage: number; randolphDiedVoyage: number };
	whereTheGodsDwell: {
		/** Plays that reached the finale (recorded any of the four outcomes). */
		reached: number;
		// The four matrix-row outcomes (single-sided finale result).
		invasion: number;
		awoke: number;
		stayedForever: number;
		traveledMonastery: number;
		// Sub-flavor notes recorded alongside a win.
		banished: number;
		escapedGrasp: number;
		grandDesign: number;
		/** `dreamers_know_of_another_path` — the cat's underworld interlock, read by the finale. */
		knowAnotherPath: number;
	};
	/** `dreamers_grow_weaker` — read in the Great Ones for a difficulty-scaled chaos token. */
	dreamersGrowWeaker: number;
}

export function buildTdea(records: CampaignRecord[]): CampaignTdea[] {
	const baseLog = getCampaignLog(TDEA_FAMILY);
	if (!baseLog) return [];
	const tdeaRecords = filterFamilyRecords(records, TDEA_FAMILY);
	if (tdeaRecords.length === 0) return [];

	const evidence = { plays: 0, max: null as number | null, min: null as number | null, total: 0, distribution: {} as Record<number, number>, allSigns: 0 };
	const beyondGates = { savedByRandolph: 0, catsCollectedTribute: 0, parleyedZoogs: 0, strayedFromPath: 0 };
	const searchForKadath = { route: {} as Record<string, number>, forcedIntoTemple: 0, brokeLawOfUlthar: 0, captures: { virgil: 0, randolph: 0, someoneEscaped: 0, everyoneCaptured: 0 } };
	const darkSideOfMoon = { carried: 0, travelled: 0, randolphSurvivedVoyage: 0, randolphDiedVoyage: 0 };
	const whereTheGodsDwell = { reached: 0, invasion: 0, awoke: 0, stayedForever: 0, traveledMonastery: 0, banished: 0, escapedGrasp: 0, grandDesign: 0, knowAnotherPath: 0 };
	let dreamersGrowWeaker = 0;

	for (const rec of tdeaRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const has = (key: string) => logs.has(key);

		// Evidence of Kadath (count section).
		const ev = rec.recorded.logCounts?.[EVIDENCE_OF_KADATH];
		if (ev !== undefined) {
			evidence.plays += 1;
			evidence.total += ev;
			evidence.max = evidence.max === null ? ev : Math.max(evidence.max, ev);
			evidence.min = evidence.min === null ? ev : Math.min(evidence.min, ev);
			evidence.distribution[ev] = (evidence.distribution[ev] ?? 0) + 1;
			if (ev >= ALL_SIGNS) evidence.allSigns += 1;
		}

		// Beyond the Gates of Sleep.
		if (has(k('saved_by_randolph_carter'))) beyondGates.savedByRandolph += 1;
		if (has(k('cats_collected_their_tribute'))) beyondGates.catsCollectedTribute += 1;
		if (has(k('parleyed_with_zoogs'))) beyondGates.parleyedZoogs += 1;
		if (has(k('strayed_from_the_path'))) beyondGates.strayedFromPath += 1;

		// The Search for Kadath — route + temple + captures.
		for (const r of ROUTE) if (has(r.key)) searchForKadath.route[r.id] = (searchForKadath.route[r.id] ?? 0) + 1;
		if (has(k('forced_way_into_temple'))) searchForKadath.forcedIntoTemple += 1;
		if (has(k('broken_the_law_of_ulthar'))) searchForKadath.brokeLawOfUlthar += 1;
		if (has(k('virgil_was_captured'))) searchForKadath.captures.virgil += 1;
		if (has(k('randolph_was_captured'))) searchForKadath.captures.randolph += 1;
		if (has('hidden.someone_escaped')) searchForKadath.captures.someoneEscaped += 1;
		if (has('hidden.everyone_captured')) searchForKadath.captures.everyoneCaptured += 1;

		// Dark Side of the Moon.
		if (has(k('carried_to_the_cold_wastes'))) darkSideOfMoon.carried += 1;
		if (has(k('travelled_to_the_cold_wastes'))) darkSideOfMoon.travelled += 1;
		if (has(k('randolph_survived_the_voyage'))) darkSideOfMoon.randolphSurvivedVoyage += 1;
		if (has(k('randolph_did_not_survive_the_voyage'))) darkSideOfMoon.randolphDiedVoyage += 1;

		// Where the Gods Dwell — finale outcomes (single-sided) + sub-notes + the interlock flag.
		const invasion = has(k('nyarlathoteps_invasion_has_begun'));
		const awoke = has(k('dreamers_awoke'));
		const stayed = has(k('dreamers_stayed_in_dreamlands_forever'));
		const traveled = has(k('dreamers_traveled_beneath_the_monastery'));
		if (invasion) whereTheGodsDwell.invasion += 1;
		if (awoke) whereTheGodsDwell.awoke += 1;
		if (stayed) whereTheGodsDwell.stayedForever += 1;
		if (traveled) whereTheGodsDwell.traveledMonastery += 1;
		if (invasion || awoke || stayed || traveled) whereTheGodsDwell.reached += 1;
		if (has(k('dreamers_banished_nyarlathotep'))) whereTheGodsDwell.banished += 1;
		if (has(k('dreamers_escaped_nyarlathoteps_grasp'))) whereTheGodsDwell.escapedGrasp += 1;
		if (has('hidden.grand_design')) whereTheGodsDwell.grandDesign += 1;
		if (has(k('dreamers_know_of_another_path'))) whereTheGodsDwell.knowAnotherPath += 1;

		if (has(k('dreamers_grow_weaker'))) dreamersGrowWeaker += 1;
	}

	return [
		{
			family: TDEA_FAMILY,
			plays: tdeaRecords.length,
			shared: buildTdeShared(tdeaRecords, TDEA_FAMILY),
			evidenceOfKadath: evidence,
			beyondGates,
			searchForKadath,
			darkSideOfMoon,
			whereTheGodsDwell,
			dreamersGrowWeaker,
		},
	];
}
