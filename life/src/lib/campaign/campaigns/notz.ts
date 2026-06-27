/**
 * notz.ts — The Night of the Zealot bespoke per-campaign tallies. ONE builder, ONE
 * payload blob (`notz`), mirroring `tic.ts` / `tdc.ts`. Fully log-derived. The core
 * set's three-scenario intro campaign:
 *
 *   • gathering — The Gathering: your house (standing vs burned to the ground), whether
 *     the Ghoul Priest survives (a threat carried into later scenarios), and whether Lita
 *     was forced to find others.
 *   • midnightMasks — The Midnight Masks: whether it ran past midnight (the Masked Hunter
 *     time-pressure), plus how many cultists were interrogated vs got away (the Cultist
 *     deck; `cultists_interrogated` / `cultists_escaped` are freeform card sections, so
 *     this is a lifetime COUNT, not a fixed roster).
 *   • devourerBelow — The Devourer Below finale: the ritual broken (win), Umôrdhoth
 *     repelled (the better ending), Arkham succumbed (loss), and whether Lita was sacrificed.
 *
 * `buildNotz` is family-parameterized so a future Return-to-NotZ suite reuses it.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import { familyOf } from '../records/campaign-family';

const NOTZ_FAMILY = 'notz';
const N = 'campaign_notes';
const k = (id: string) => `${N}.${id}`;
const INTERROGATED = 'cultists_interrogated';
const ESCAPED = 'cultists_escaped';

/** Resolve a NotZ campaign-data entry's English text by composite key (e.g.
 *  `campaign_notes.ritual_broken`). Falls back to the key when no entry exists. */
export function notzText(compositeKey: string): string {
	return getCampaignLog(NOTZ_FAMILY)?.en.entries[compositeKey]?.text ?? compositeKey;
}

export interface CampaignNotz {
	/** The campaign family (its own code) — 'notz' (or 'rtnotz' for the Return-to suite). */
	family: string;
	plays: number;
	/** The Gathering. */
	gathering: { houseStanding: number; houseBurned: number; ghoulPriestAlive: number; litaFindsOthers: number };
	/** The Midnight Masks — `interrogated` / `escaped` are lifetime cultist counts summed across plays. */
	midnightMasks: { pastMidnight: number; interrogated: number; escaped: number };
	/** The Devourer Below — the finale outcomes. */
	devourerBelow: { ritualBroken: number; umordhothRepelled: number; arkhamSuccumbed: number; litaSacrificed: number };
}

export function buildNotz(records: CampaignRecord[], family: string = NOTZ_FAMILY): CampaignNotz[] {
	const baseLog = getCampaignLog(family);
	if (!baseLog) return [];
	const notzRecords = records.filter((r) => {
		const log = getCampaignLog(r.campaignCode);
		return log ? familyOf(log) === family : false;
	});
	if (notzRecords.length === 0) return [];

	const gathering = { houseStanding: 0, houseBurned: 0, ghoulPriestAlive: 0, litaFindsOthers: 0 };
	const midnightMasks = { pastMidnight: 0, interrogated: 0, escaped: 0 };
	const devourerBelow = { ritualBroken: 0, umordhothRepelled: 0, arkhamSuccumbed: 0, litaSacrificed: 0 };

	for (const rec of notzRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const items = rec.recorded.recordedSectionItems ?? {};
		const has = (key: string) => logs.has(key);

		// The Gathering.
		if (has(k('house_standing'))) gathering.houseStanding += 1;
		if (has(k('house_burned'))) gathering.houseBurned += 1;
		if (has(k('ghoul_priest_alive'))) gathering.ghoulPriestAlive += 1;
		if (has(k('lita_finds_others'))) gathering.litaFindsOthers += 1;

		// The Midnight Masks.
		if (has(k('past_midnight'))) midnightMasks.pastMidnight += 1;
		midnightMasks.interrogated += (items[INTERROGATED]?.size ?? 0);
		midnightMasks.escaped += (items[ESCAPED]?.size ?? 0);

		// The Devourer Below.
		if (has(k('ritual_broken'))) devourerBelow.ritualBroken += 1;
		if (has(k('umordhoth_repelled'))) devourerBelow.umordhothRepelled += 1;
		if (has(k('arkham_succumbed'))) devourerBelow.arkhamSuccumbed += 1;
		if (has(k('lita_sacrificed'))) devourerBelow.litaSacrificed += 1;
	}

	return [
		{
			family,
			plays: notzRecords.length,
			gathering,
			midnightMasks,
			devourerBelow
		}
	];
}
