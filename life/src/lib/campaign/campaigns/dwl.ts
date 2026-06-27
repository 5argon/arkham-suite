/**
 * dwl.ts — The Dunwich Legacy bespoke per-campaign tallies. ONE builder, ONE
 * payload blob (`dwl`), mirroring `eoe.ts`: a new DWL widget reads another field
 * off this aggregate rather than adding profile-pipeline plumbing.
 *
 * Everything is derived from each play's `RecordedCampaignState` (+ the derived
 * `route`), no raw-log access:
 *   • opening   — which of the two opener scenarios was played FIRST, from `route`
 *                 (the entry-ordered scenario sequence). Either order is legal in DWL.
 *   • persons   — the three kidnapped scholars (Rice / Morgan / Armitage): rescued,
 *                 kidnapped, and "snatched again" (rescued AND kidnapped both recorded —
 *                 a rescued ally re-taken when you LOSE Essex County Express / Miskatonic
 *                 Museum; these notes legitimately co-occur).
 *   • sacrifices— Blood on the Altar: the five Dunwich allies, times they SURVIVED to
 *                 the end (`*_survived`) vs were SACRIFICED (their ally card in the
 *                 `sacrificed` section).
 *   • necronomicon — Miskatonic Museum custody (took / destroyed / failed) + times the
 *                 Necronomicon was stolen back on the Essex County Express.
 *   • silas     — Blood on the Altar: Silas Bishop killed / restored / banished.
 *   • broods    — Undimensioned and Unseen: distribution of how many broods escaped
 *                 (0 = `no_brood_escaped`, else the recorded `brood_escaped` count) +
 *                 townsfolk calmed / warned.
 *   • ascendingHill — Where Doom Awaits: which version of Act 2 (Ascending the Hill) you
 *                 faced, DERIVED from your Silas / Necronomicon state (v.I restored Silas;
 *                 v.II otherwise without the Necronomicon; v.III otherwise) — counted only
 *                 for plays that reached the scenario — plus entered-the-gate vs Yog escaped.
 *   • finale    — Lost in Time and Space endings: closed the tear / Yog-Sothoth fled /
 *                 became one with reality.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import { filterFamilyRecords } from '../records/campaign-family';

const DWL_FAMILY = 'dwl';
const NOTES = 'campaign_notes';
const k = (id: string) => `${NOTES}.${id}`;

const EA = 'extracurricular_activity';
const THAW = 'the_house_always_wins';

/** The three kidnapped scholars whose rescue/kidnap drama runs across the campaign.
 *  `code` is their Ally story-asset card (portrait art); `id` keys the log entries. */
export const DWL_PERSONS: { id: string; code: string }[] = [
	{ id: 'warren_rice', code: '02061' },
	{ id: 'francis_morgan', code: '02080' },
	{ id: 'henry_armitage', code: '02040' }
];

/** The five Dunwich allies who can be sacrificed at Blood on the Altar (or survive
 *  to the campaign's end). `code` is the Ally card recorded in the `sacrificed`
 *  section; `*_survived` is the survival note. */
export const DWL_SACRIFICE_ALLIES: { id: string; code: string }[] = [
	{ id: 'warren_rice', code: '02061' },
	{ id: 'francis_morgan', code: '02080' },
	{ id: 'henry_armitage', code: '02040' },
	{ id: 'zebulon_whateley', code: '02217' },
	{ id: 'earl_sawyer', code: '02218' }
];

const SACRIFICED_SECTION = 'sacrificed';

// ── single notes ──────────────────────────────────────────────────────────────
const NEC_TOOK = k('took_necronomicon');
const NEC_DESTROYED = k('destroyed_necronomicon');
const NEC_FAILED = k('failed_to_recover_necronomicon');
const NEC_STOLEN = k('necronomicon_stolen');
const SILAS_KILLED = k('killed_silas_bishop');
const SILAS_RESTORED = k('restored_silas_bishop');
const SILAS_BANISHED = k('banished_silas_bishop');
const BROOD_COUNT = k('brood_escaped');
const NO_BROOD = k('no_brood_escaped');
const CALMED = k('calmed_townsfolk');
const WARNED = k('warned_townsfolk');
const ENTERED_GATE = k('entered_the_gate');
const YOG_ESCAPED = k('yog_sothoth_escaped');
const CLOSED_TEAR = k('closed_tear');
const YOG_FLED = k('yog_sothoth_fled');
const YOG_BECAME_ONE = k('yog_sothoth_became_one_with_reality');

export interface DwlPersonTally {
	/** Times rescued at their fate scenario. */
	rescued: number;
	/** Times the kidnapped note is recorded (their non-rescue fate, OR a re-kidnap). */
	kidnapped: number;
	/** Times rescued AND later kidnapped again (a rescued ally re-taken on a lost
	 *  Essex County Express / Miskatonic Museum). */
	snatchedAgain: number;
}
export interface DwlSacrificeTally {
	survived: number;
	sacrificed: number;
}

export interface CampaignDwl {
	/** Always 'dwl' (the base family; Return-to plays fold in). */
	family: string;
	/** Total DWL plays counted. */
	plays: number;
	// ── the two openers (either may be played first) ──
	/** Plays where Extracurricular Activity was the first opener played. */
	eaFirst: number;
	/** Plays where The House Always Wins was the first opener played. */
	thawFirst: number;
	/** Plays where both openers appear in the route (the unambiguous denominator). */
	bothOpeners: number;
	// ── the kidnapped scholars ──
	/** person id → rescue/kidnap tally. */
	persons: Record<string, DwlPersonTally>;
	// ── Blood on the Altar ──
	/** ally id → survived/sacrificed tally. */
	sacrifices: Record<string, DwlSacrificeTally>;
	/** Silas Bishop's fate. */
	silas: { killed: number; restored: number; banished: number };
	// ── The Miskatonic Museum + The Essex County Express ──
	necronomicon: { took: number; destroyed: number; failed: number; stolen: number };
	/** The Miskatonic Museum opening approach (unlogged — recorded as an Extra-tab choice). */
	miskatonicApproach: { brokeIn: number; spokeToAdam: number };
	// ── Undimensioned and Unseen ──
	/** brood-escaped count (0..n) → plays that ended with exactly that many escaped. */
	broodCounts: Record<number, number>;
	/** Plays that reached U&U and recorded a brood outcome (no_brood OR a count). */
	broodPlays: number;
	townsfolk: { calmed: number; warned: number };
	// ── Where Doom Awaits ──
	wda: { enteredGate: number; yogEscaped: number };
	// ── Lost in Time and Space (finale endings) ──
	/** wonLostForever = R2 ("win… lost forever"), a silent ending recovered from the Extra
	 *  `final_act` = Act 4 (it writes no log note). */
	finale: { closedTear: number; yogFled: number; yogBecameOne: number; wonLostForever: number };
	// ── Epilogue (read only after a win; which one depends on calmed vs warned townsfolk) ──
	/** Among won plays: the Dunwich epilogue reached — peaceful (calmed townsfolk) vs
	 *  ominous (the sign in the dirt). Inferred from a win (closed tear / Yog fled, or the
	 *  Act-4 silent R2 win) + the townsfolk note. */
	epilogue: { peaceful: number; ominous: number };
}

/**
 * Build the Dunwich Legacy bespoke aggregate. Returns a single-element array
 * (sliced by `family` like the other per-campaign data), or empty when the
 * subject has no DWL plays.
 */
/** The Act 2 (Ascending the Hill) version a play faced — derived from reaching Where Doom Awaits +
 *  the Silas / Necronomicon notes; null if the play never reached WDA. The version axis the shared
 *  per-version breakdown table buckets by. */
export function ascendingHillVersionFromRecord(rec: CampaignRecord): 'v1' | 'v2' | 'v3' | null {
	const logs = rec.recorded.recordedLogs ?? new Set<string>();
	const has = (key: string) => logs.has(key);
	if (!has(ENTERED_GATE) && !has(YOG_ESCAPED)) return null;
	if (has(SILAS_RESTORED)) return 'v1';
	if (has(NEC_FAILED) || has(NEC_STOLEN)) return 'v2';
	return 'v3';
}

export function buildDwl(records: CampaignRecord[]): CampaignDwl[] {
	const baseLog = getCampaignLog(DWL_FAMILY);
	if (!baseLog) return [];
	const dwlRecords = filterFamilyRecords(records, DWL_FAMILY);
	if (dwlRecords.length === 0) return [];

	let eaFirst = 0;
	let thawFirst = 0;
	let bothOpeners = 0;
	const persons: Record<string, DwlPersonTally> = {};
	for (const p of DWL_PERSONS) persons[p.id] = { rescued: 0, kidnapped: 0, snatchedAgain: 0 };
	const sacrifices: Record<string, DwlSacrificeTally> = {};
	for (const a of DWL_SACRIFICE_ALLIES) sacrifices[a.id] = { survived: 0, sacrificed: 0 };
	const silas = { killed: 0, restored: 0, banished: 0 };
	const necronomicon = { took: 0, destroyed: 0, failed: 0, stolen: 0 };
	const broodCounts: Record<number, number> = {};
	let broodPlays = 0;
	const townsfolk = { calmed: 0, warned: 0 };
	const wda = { enteredGate: 0, yogEscaped: 0 };
	const finale = { closedTear: 0, yogFled: 0, yogBecameOne: 0, wonLostForever: 0 };
	const miskatonicApproach = { brokeIn: 0, spokeToAdam: 0 };
	const epilogue = { peaceful: 0, ominous: 0 };

	for (const rec of dwlRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const has = (key: string) => logs.has(key);

		// Opening order — first of the two openers to appear in the play's route.
		const route = rec.route ?? [];
		const eaIdx = route.indexOf(EA);
		const thawIdx = route.indexOf(THAW);
		if (eaIdx >= 0 && thawIdx >= 0) {
			bothOpeners += 1;
			if (eaIdx < thawIdx) eaFirst += 1;
			else thawFirst += 1;
		} else if (eaIdx >= 0) eaFirst += 1;
		else if (thawIdx >= 0) thawFirst += 1;

		// Kidnapped scholars — rescued / kidnapped (and both = snatched again).
		for (const p of DWL_PERSONS) {
			const r = has(k(`${p.id}_rescued`));
			const kid = has(k(`${p.id}_kidnapped`));
			if (r) persons[p.id].rescued += 1;
			if (kid) persons[p.id].kidnapped += 1;
			if (r && kid) persons[p.id].snatchedAgain += 1;
		}

		// Blood on the Altar — survived vs sacrificed.
		const sacrificed = rec.recorded.recordedSectionItems?.[SACRIFICED_SECTION];
		for (const a of DWL_SACRIFICE_ALLIES) {
			if (has(k(`${a.id}_survived`))) sacrifices[a.id].survived += 1;
			if (sacrificed?.has(a.code)) sacrifices[a.id].sacrificed += 1;
		}
		if (has(SILAS_KILLED)) silas.killed += 1;
		if (has(SILAS_RESTORED)) silas.restored += 1;
		if (has(SILAS_BANISHED)) silas.banished += 1;

		// The Necronomicon (Miskatonic Museum custody + stolen back on the train).
		if (has(NEC_TOOK)) necronomicon.took += 1;
		if (has(NEC_DESTROYED)) necronomicon.destroyed += 1;
		if (has(NEC_FAILED)) necronomicon.failed += 1;
		if (has(NEC_STOLEN)) necronomicon.stolen += 1;

		// The Miskatonic Museum opening approach (Extra choice — the log never records it).
		const approach = rec.scenarioChoices?.['the_miskatonic_museum.approach'];
		if (approach === 'broke_in') miskatonicApproach.brokeIn += 1;
		else if (approach === 'spoke_to_adam') miskatonicApproach.spokeToAdam += 1;

		// Undimensioned and Unseen — brood distribution + townsfolk.
		if (has(NO_BROOD)) {
			broodCounts[0] = (broodCounts[0] ?? 0) + 1;
			broodPlays += 1;
		} else if (has(BROOD_COUNT)) {
			const n = rec.recorded.logCounts?.[BROOD_COUNT] ?? 0;
			broodCounts[n] = (broodCounts[n] ?? 0) + 1;
			broodPlays += 1;
		}
		if (has(CALMED)) townsfolk.calmed += 1;
		if (has(WARNED)) townsfolk.warned += 1;

		// Where Doom Awaits — outcome (the per-version breakdown rides the unified scenarios record).
		if (has(ENTERED_GATE)) wda.enteredGate += 1;
		if (has(YOG_ESCAPED)) wda.yogEscaped += 1;

		// Lost in Time and Space — finale endings. R2 ("win… lost forever") writes no note;
		// the Extra `final_act` = Act 4 is its only signal (Acts 1-3 log the R4 loss).
		if (has(CLOSED_TEAR)) finale.closedTear += 1;
		if (has(YOG_FLED)) finale.yogFled += 1;
		if (has(YOG_BECAME_ONE)) finale.yogBecameOne += 1;
		const anyFinaleNote =
			has(CLOSED_TEAR) || has(YOG_FLED) || has(YOG_BECAME_ONE) || has(YOG_ESCAPED);
		const r2Win = rec.scenarioChoices?.['lost_in_time_and_space.final_act'] === 'act_4' && !anyFinaleNote;
		if (r2Win) finale.wonLostForever += 1;

		// Epilogue — read after any win (incl. the silent R2); peaceful if you calmed the townsfolk.
		if (has(CLOSED_TEAR) || has(YOG_FLED) || r2Win) {
			if (has(CALMED)) epilogue.peaceful += 1;
			else epilogue.ominous += 1;
		}
	}

	return [
		{
			family: DWL_FAMILY,
			plays: dwlRecords.length,
			eaFirst,
			thawFirst,
			bothOpeners,
			persons,
			sacrifices,
			silas,
			necronomicon,
			miskatonicApproach,
			broodCounts,
			broodPlays,
			townsfolk,
			wda,
			finale,
			epilogue
		}
	];
}
