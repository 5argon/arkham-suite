/**
 * tdeb.ts — The Web of Dreams (The Dream-Eaters, campaign B) bespoke tallies. ONE
 * builder, ONE payload blob (`tdeb`), mirroring `tdea.ts`. The interconnected
 * machinery (play mode, Black Cat, Silver Key, Randolph, the epilogue matrix) lives in
 * `tde-shared.ts` and rides on `shared`; this file owns the Web of Dreams spine +
 * per-scenario decisions.
 *
 *   • stepsOfTheBridge — the running count (`steps_of_the_bridge`), with its finale
 *     threshold TIER: Weaver of the Cosmos places doom by band (0–2 → 0 · 3–5 → 1 ·
 *     6–8 → 2 · 9–11 → 3 · 12+ → 4). Per-source attribution = non-goal.
 *   • wakingNightmare — Dr. Maheswaran's fate (Randolph's hospital escape is in `shared`).
 *   • pointOfNoReturn — found a way out of the Underworld.
 *   • weaver — Weaver of the Cosmos finale outcomes (the four matrix columns + sub-notes).
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import { filterFamilyRecords } from '../records/campaign-family';
import { buildTdeShared, TDEB_FAMILY, type CampaignTdeShared } from './tde-shared';

const N = 'campaign_notes';
const k = (id: string) => `${N}.${id}`;
const STEPS_OF_THE_BRIDGE = 'steps_of_the_bridge'; // a `count` section (logCounts[sectionId])

/** Weaver of the Cosmos doom tier (0–4) for a Steps-of-the-Bridge tally count. */
export function stepsDoomTier(count: number): number {
	if (count <= 2) return 0;
	if (count <= 5) return 1;
	if (count <= 8) return 2;
	if (count <= 11) return 3;
	return 4;
}

export interface CampaignTdeb {
	/** Always 'tdeb'. */
	family: string;
	plays: number;
	/** Cross-campaign interconnected view (Black Cat, Silver Key, Randolph, epilogue matrix). */
	shared: CampaignTdeShared;
	/** Steps of the Bridge — the running count toward Atlach-Nacha's web. */
	stepsOfTheBridge: {
		plays: number;
		max: number | null;
		min: number | null;
		total: number;
		/** count value → plays that ended with exactly that many. */
		distribution: Record<number, number>;
		/** doom tier (0–4) → plays that landed in that finale band. */
		tiers: Record<number, number>;
	};
	wakingNightmare: { doctorJoined: number; doctorStayed: number; doctorFateUnknown: number; doctorAlive: number; doctorMissing: number };
	pointOfNoReturn: { foundWayOut: number };
	weaver: {
		/** Plays that reached the finale (recorded any column outcome). */
		reached: number;
		// The four matrix-column outcomes (single-sided finale result).
		bridgeCompleted: number;
		returnedToReality: number;
		neverEscaped: number;
		stillInDreamlands: number;
		// Sub-flavor notes.
		bridgeDestroyed: number;
		trappedInRealm: number;
		spiderQueen: number;
	};
}

export function buildTdeb(records: CampaignRecord[]): CampaignTdeb[] {
	const baseLog = getCampaignLog(TDEB_FAMILY);
	if (!baseLog) return [];
	const tdebRecords = filterFamilyRecords(records, TDEB_FAMILY);
	if (tdebRecords.length === 0) return [];

	const steps = { plays: 0, max: null as number | null, min: null as number | null, total: 0, distribution: {} as Record<number, number>, tiers: {} as Record<number, number> };
	const wakingNightmare = { doctorJoined: 0, doctorStayed: 0, doctorFateUnknown: 0, doctorAlive: 0, doctorMissing: 0 };
	const pointOfNoReturn = { foundWayOut: 0 };
	const weaver = { reached: 0, bridgeCompleted: 0, returnedToReality: 0, neverEscaped: 0, stillInDreamlands: 0, bridgeDestroyed: 0, trappedInRealm: 0, spiderQueen: 0 };

	for (const rec of tdebRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const has = (key: string) => logs.has(key);

		// Steps of the Bridge (count section) + finale doom tier.
		const sb = rec.recorded.logCounts?.[STEPS_OF_THE_BRIDGE];
		if (sb !== undefined) {
			steps.plays += 1;
			steps.total += sb;
			steps.max = steps.max === null ? sb : Math.max(steps.max, sb);
			steps.min = steps.min === null ? sb : Math.min(steps.min, sb);
			steps.distribution[sb] = (steps.distribution[sb] ?? 0) + 1;
			const tier = stepsDoomTier(sb);
			steps.tiers[tier] = (steps.tiers[tier] ?? 0) + 1;
		}

		// Waking Nightmare — the doctor's fate (Randolph's hospital escape is in `shared`).
		if (has(k('doctor_joined_investigation'))) wakingNightmare.doctorJoined += 1;
		if (has(k('doctor_stayed_with_patients'))) wakingNightmare.doctorStayed += 1;
		if (has(k('doctors_fate_unknown'))) wakingNightmare.doctorFateUnknown += 1;
		if (has(k('doctor_is_alive'))) wakingNightmare.doctorAlive += 1;
		if (has(k('doctor_is_missing'))) wakingNightmare.doctorMissing += 1;

		// Point of No Return.
		if (has(k('found_a_way_out_of_the_underworld'))) pointOfNoReturn.foundWayOut += 1;

		// Weaver of the Cosmos — finale outcomes (single-sided) + sub-notes.
		const completed = has(k('bridge_was_completed'));
		const returned = has(k('returned_to_reality'));
		const never = has(k('never_escaped'));
		const still = has(k('still_in_the_dreamlands'));
		if (completed) weaver.bridgeCompleted += 1;
		if (returned) weaver.returnedToReality += 1;
		if (never) weaver.neverEscaped += 1;
		if (still) weaver.stillInDreamlands += 1;
		if (completed || returned || never || still) weaver.reached += 1;
		if (has(k('bridge_was_destroyed'))) weaver.bridgeDestroyed += 1;
		if (has(k('trapped_in_atlach_nachas_realm'))) weaver.trappedInRealm += 1;
		if (has('hidden.spider_queen')) weaver.spiderQueen += 1;
	}

	return [
		{
			family: TDEB_FAMILY,
			plays: tdebRecords.length,
			shared: buildTdeShared(tdebRecords, TDEB_FAMILY),
			stepsOfTheBridge: steps,
			wakingNightmare,
			pointOfNoReturn,
			weaver,
		},
	];
}
