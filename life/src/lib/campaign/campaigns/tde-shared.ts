/**
 * tde-shared.ts — The Dream-Eaters cross-campaign helpers, shared by `tdea.ts`
 * (The Dream-Quest) and `tdeb.ts` (The Web of Dreams). The two campaigns are stored
 * as SEPARATE, unlinked records; for interconnected play the sibling's needed final
 * notes are transcribed into a record's `linkedLog` (projected to `rec.linked`). These
 * helpers read a play from EITHER perspective by routing own/linked to the right axis,
 * so a shared widget renders the same on both campaign pages. See `tde-shared-plan.md`.
 *
 *   • play mode      — interconnected (8-part) vs half (4-part).
 *   • the Black Cat  — the companion whose `at_your_side` state MOVES between the two
 *                      logs; resolved to a terminal disposition (with which party /
 *                      abandoned / distrustful / on your own).
 *   • the Silver Key — possessed (and, interconnected, passed to the Dream-Quest).
 *   • Randolph Carter— his fate across both campaigns.
 *   • the epilogue matrix — the 4×4 combined verdict (Dream-Quest row × Web of Dreams
 *                      col → Epilogue 1–16), the interconnected win/loss truth.
 */
import type { CampaignRecord } from '../achievements/achievement-aggregate';

export const TDEA_FAMILY = 'tdea';
export const TDEB_FAMILY = 'tdeb';
/** Perspective family → its sibling. */
export const TDE_SIBLING: Record<string, string> = { tdea: TDEB_FAMILY, tdeb: TDEA_FAMILY };

const N = 'campaign_notes';
const H = 'hidden';

// ── play mode (hidden setup flags) ──────────────────────────────────────────────
const INTERCONNECTED = `${H}.interconnected_campaign`;
const HALF = `${H}.half_campaign`;

// ── the epilogue matrix axes (each finale records exactly one) ───────────────────
/** Dream-Quest (tdea) final outcome → matrix ROW (0–3). */
export const TDE_MATRIX_ROWS = [
	'nyarlathoteps_invasion_has_begun',
	'dreamers_awoke',
	'dreamers_stayed_in_dreamlands_forever',
	'dreamers_traveled_beneath_the_monastery',
] as const;
/** Web of Dreams (tdeb) final outcome → matrix COLUMN (0–3). */
export const TDE_MATRIX_COLS = [
	'bridge_was_completed',
	'returned_to_reality',
	'never_escaped',
	'still_in_the_dreamlands',
] as const;

export type EpilogueVerdict = 'win' | 'partial' | 'loss';
/** Epilogue 1–16 → verdict (from `a_epilogue.json`): only #1 is a total loss; the six
 *  "averted one form of destruction, but not the other" cells are partials (≈ loss); the
 *  rest are full wins. */
const EPILOGUE_VERDICT: Record<number, EpilogueVerdict> = {
	1: 'loss',
	2: 'partial', 3: 'partial', 4: 'partial',
	5: 'partial', 6: 'win', 7: 'win', 8: 'win',
	9: 'partial', 10: 'win', 11: 'win', 12: 'win',
	13: 'partial', 14: 'win', 15: 'win', 16: 'win',
};
/** Epilogue number (1–16) for a (row, col) cell, both 0-based. */
export function epilogueNumber(row: number, col: number): number {
	return row * 4 + col + 1;
}
export function epilogueVerdict(n: number): EpilogueVerdict {
	return EPILOGUE_VERDICT[n] ?? 'partial';
}
/** (row, col) coordinates (0-based) for an epilogue number. */
export function epilogueCoords(n: number): { row: number; col: number } {
	const i = n - 1;
	return { row: Math.floor(i / 4), col: i % 4 };
}

// ── the Black Cat ───────────────────────────────────────────────────────────────
// at_your_side is recorded in interlude I and re-recorded (moved) at the Great Ones —
// two ids for one state. The data models knows_the_truth on tdea only and
// is_searching_for_the_truth on tdeb only (even though the guide records both "in both
// logs"), so each is read on its own side.
const A_AT_SIDE = [`${N}.black_cat_at_your_side`, `${N}.black_cat_at_your_side_2`];
const CAT_ABANDONED = `${N}.you_asked_for_it`;
const CAT_KNOWS_TRUTH = `${N}.black_cat_knows_the_truth`; // tdea side
const CAT_SEARCHING = `${N}.black_cat_is_searching_for_the_truth`; // tdeb side
const CAT_HAS_HUNCH = `${N}.black_cat_has_a_hunch`;
const CAT_ON_YOUR_OWN = `${N}.on_your_own`; // tdeb half play (no cat)

/** Black-cat message choices across the three interludes (a "journey" trail). */
const TDEA_CAT_CHOICES = [
	'black_cat_delivered_news',
	'black_cat_shared_knowledge_of_the_dreamlands',
	'black_cat_warned_the_others',
	'threaten_black_cat',
	'black_cat_spoke_of_nyarlathotep',
	'black_cat_spoke_of_atlach_nacha',
];
const TDEB_CAT_CHOICES = [
	'black_cat_requested_aid',
	'black_cat_shared_knowledge_of_the_underworld',
	'black_cat_warned_the_others',
];

// ── the Silver Key / Randolph ────────────────────────────────────────────────────
const SILVER_KEY = `${N}.possess_silver_key`;
const TDEA_RANDOLPH = {
	savedByCarter: `${N}.saved_by_randolph_carter`,
	eludedCapture: `${N}.randolph_eluded_capture`,
	captured: `${N}.randolph_was_captured`,
	survivedVoyage: `${N}.randolph_survived_the_voyage`,
	diedVoyage: `${N}.randolph_did_not_survive_the_voyage`,
};
const TDEB_RANDOLPH = {
	escapedAlone: `${N}.randolph_escaped_hospital_alone`,
	escapedWithInvestigators: `${N}.randolph_escaped_hospital_with_investigators`,
	survivedDescent: `${N}.randolph_survived_descent`,
	diedDescent: `${N}.randolph_did_not_survive_descent`,
};
/** killed-by-cats override (broken the law of Ulthar) — overrides any epilogue to a loss. */
const BROKEN_LAW = `${N}.broken_the_law_of_ulthar`;

export interface CampaignTdeShared {
	/** Perspective family (tdea or tdeb) — the page this view renders on. */
	family: string;
	plays: number;
	playMode: { interconnected: number; half: number; unspecified: number };
	/** Epilogue matrix (interconnected only): epilogue number (1–16) → plays reached. */
	matrix: {
		cells: Record<number, number>;
		/** Interconnected plays missing the sibling's final outcome (linked log incomplete). */
		awaitingLinked: number;
		/** Interconnected plays that resolved to a full cell. */
		resolved: number;
		/** Plays flagged "broke the law of Ulthar" (killed by cats — overrides to a loss). */
		killedByCats: number;
	};
	blackCat: {
		// Mutually-exclusive terminal disposition (priority order).
		withDreamQuest: number;
		withWebOfDreams: number;
		abandoned: number;
		distrustful: number;
		onYourOwn: number;
		unresolved: number;
		// Non-exclusive arc flags.
		hadHunch: number;
		searched: number;
		/** message-choice id → plays that made it (across both logs). */
		choices: Record<string, number>;
	};
	silverKey: { obtained: number; withDreamQuest: number };
	randolph: {
		savedByCarter: number;
		eludedCapture: number;
		captured: number;
		survivedVoyage: number;
		diedVoyage: number;
		escapedAlone: number;
		escapedWithInvestigators: number;
		survivedDescent: number;
		diedDescent: number;
	};
}

/** First present member of `keys` in `set`, else -1 (matrix axis resolver). */
function firstIndex(set: ReadonlySet<string>, keys: readonly string[], prefix: string): number {
	for (let i = 0; i < keys.length; i++) if (set.has(`${prefix}.${keys[i]}`)) return i;
	return -1;
}

/**
 * Build the shared TDE view for ONE perspective family from its (already family-filtered)
 * records. `own` = the record's recorded logs; `linked` = the transcribed sibling set —
 * routed to the Dream-Quest / Web of Dreams axis by `family` so the result is identical
 * whichever side you view it from.
 */
export function buildTdeShared(records: CampaignRecord[], family: string): CampaignTdeShared {
	const playMode = { interconnected: 0, half: 0, unspecified: 0 };
	const matrix = { cells: {} as Record<number, number>, awaitingLinked: 0, resolved: 0, killedByCats: 0 };
	const blackCat = {
		withDreamQuest: 0, withWebOfDreams: 0, abandoned: 0, distrustful: 0, onYourOwn: 0, unresolved: 0,
		hadHunch: 0, searched: 0, choices: {} as Record<string, number>,
	};
	const silverKey = { obtained: 0, withDreamQuest: 0 };
	const randolph = {
		savedByCarter: 0, eludedCapture: 0, captured: 0, survivedVoyage: 0, diedVoyage: 0,
		escapedAlone: 0, escapedWithInvestigators: 0, survivedDescent: 0, diedDescent: 0,
	};
	const empty = new Set<string>();

	for (const rec of records) {
		const own = rec.recorded.recordedLogs ?? empty;
		const linked = rec.linked ?? empty;
		// Route own/linked to the Dream-Quest (A) and Web of Dreams (B) axes.
		const aLogs = family === TDEA_FAMILY ? own : linked;
		const bLogs = family === TDEB_FAMILY ? own : linked;
		const inA = (k: string) => aLogs.has(k);
		const inB = (k: string) => bLogs.has(k);
		const inEither = (k: string) => aLogs.has(k) || bLogs.has(k);

		// Play mode (the flag is set on this record's own side during setup).
		const interconnected = own.has(INTERCONNECTED);
		if (interconnected) playMode.interconnected += 1;
		else if (own.has(HALF)) playMode.half += 1;
		else playMode.unspecified += 1;

		// Epilogue matrix — interconnected only; row from the Dream-Quest axis, col from
		// the Web of Dreams axis (one comes from the linked sibling outcome).
		if (interconnected) {
			const row = firstIndex(aLogs, TDE_MATRIX_ROWS, N);
			const col = firstIndex(bLogs, TDE_MATRIX_COLS, N);
			if (inA(BROKEN_LAW)) matrix.killedByCats += 1;
			if (row >= 0 && col >= 0) {
				const n = epilogueNumber(row, col);
				matrix.cells[n] = (matrix.cells[n] ?? 0) + 1;
				matrix.resolved += 1;
			} else if (row >= 0 || col >= 0) {
				matrix.awaitingLinked += 1;
			}
		}

		// Black Cat — terminal disposition (priority) + arc flags + the choice trail.
		const catA = A_AT_SIDE.some(inA);
		const catB = A_AT_SIDE.some(inB);
		if (inB(CAT_ON_YOUR_OWN)) blackCat.onYourOwn += 1;
		else if (inEither(CAT_ABANDONED)) blackCat.abandoned += 1;
		else if (inA(CAT_KNOWS_TRUTH)) blackCat.distrustful += 1;
		else if (catA) blackCat.withDreamQuest += 1;
		else if (catB) blackCat.withWebOfDreams += 1;
		else if (interconnected) blackCat.unresolved += 1;
		if (inEither(CAT_HAS_HUNCH)) blackCat.hadHunch += 1;
		if (inB(CAT_SEARCHING)) blackCat.searched += 1;
		for (const c of TDEA_CAT_CHOICES) if (inA(`${N}.${c}`)) blackCat.choices[c] = (blackCat.choices[c] ?? 0) + 1;
		for (const c of TDEB_CAT_CHOICES) if (inB(`${N}.${c}`)) blackCat.choices[c] = (blackCat.choices[c] ?? 0) + 1;

		// Silver Key — obtained (either side); in interconnected play it ends in the Dream-Quest.
		if (inEither(SILVER_KEY)) silverKey.obtained += 1;
		if (inA(SILVER_KEY)) silverKey.withDreamQuest += 1;

		// Randolph Carter — his fate across both campaigns.
		if (inA(TDEA_RANDOLPH.savedByCarter)) randolph.savedByCarter += 1;
		if (inA(TDEA_RANDOLPH.eludedCapture)) randolph.eludedCapture += 1;
		if (inA(TDEA_RANDOLPH.captured)) randolph.captured += 1;
		if (inA(TDEA_RANDOLPH.survivedVoyage)) randolph.survivedVoyage += 1;
		if (inA(TDEA_RANDOLPH.diedVoyage)) randolph.diedVoyage += 1;
		if (inB(TDEB_RANDOLPH.escapedAlone)) randolph.escapedAlone += 1;
		if (inB(TDEB_RANDOLPH.escapedWithInvestigators)) randolph.escapedWithInvestigators += 1;
		if (inB(TDEB_RANDOLPH.survivedDescent)) randolph.survivedDescent += 1;
		if (inB(TDEB_RANDOLPH.diedDescent)) randolph.diedDescent += 1;
	}

	return { family, plays: records.length, playMode, matrix, blackCat, silverKey, randolph };
}

// ── Linked Campaign Log manifest (for the Logs-tab editor, M2) ───────────────────
export interface TdeLinkedTopic {
	/** topic id (Black Cat / matrix / Silver Key / Randolph) — labelled via i18n. */
	id: string;
	/** sibling-log composite keys to transcribe under this topic. */
	keys: string[];
}
const TDEB_SIBLING_TOPICS: TdeLinkedTopic[] = [
	{ id: 'matrix', keys: TDE_MATRIX_COLS.map((k) => `${N}.${k}`) },
	{ id: 'blackCat', keys: [
		`${N}.black_cat_at_your_side`, `${N}.black_cat_at_your_side_2`, `${N}.black_cat_has_a_hunch`,
		`${N}.black_cat_is_searching_for_the_truth`, CAT_ABANDONED, `${N}.black_cat_requested_aid`,
		`${N}.black_cat_shared_knowledge_of_the_underworld`, `${N}.black_cat_warned_the_others`,
	] },
	{ id: 'silverKey', keys: [SILVER_KEY] },
	{ id: 'randolph', keys: Object.values(TDEB_RANDOLPH) },
];
const TDEA_SIBLING_TOPICS: TdeLinkedTopic[] = [
	{ id: 'matrix', keys: TDE_MATRIX_ROWS.map((k) => `${N}.${k}`) },
	{ id: 'blackCat', keys: [
		`${N}.black_cat_at_your_side`, `${N}.black_cat_at_your_side_2`, `${N}.black_cat_has_a_hunch`,
		CAT_KNOWS_TRUTH, CAT_ABANDONED, `${N}.black_cat_delivered_news`,
		`${N}.black_cat_shared_knowledge_of_the_dreamlands`, `${N}.black_cat_warned_the_others`,
		`${N}.black_cat_spoke_of_nyarlathotep`, `${N}.black_cat_spoke_of_atlach_nacha`,
	] },
	{ id: 'silverKey', keys: [SILVER_KEY] },
	{ id: 'randolph', keys: Object.values(TDEA_RANDOLPH) },
];

/** The sibling topics+keys a given perspective family must transcribe (the editor reads
 *  display text from the SIBLING campaign-data log). tdea ⇒ tdeb's notes, and vice versa. */
export function linkedTopicsFor(family: string): TdeLinkedTopic[] {
	return family === TDEA_FAMILY ? TDEB_SIBLING_TOPICS : TDEA_SIBLING_TOPICS;
}
