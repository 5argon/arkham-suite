/**
 * The Dream-Eaters threads that span both campaigns: play mode, the Black Cat, the Silver Key,
 * Randolph Carter and the combined epilogue. A Dream-Quest (tdea) or Web of Dreams (tdeb) record
 * holds its own log plus the sibling's notes transcribed into `rec.linked`, so a play reads the same
 * from either campaign page.
 */
import type { Play } from '../records/play';
import { extentOf } from '../utils/tally';

export const TDEA_FAMILY = 'tdea';
export const TDEB_FAMILY = 'tdeb';
/** Perspective family → its sibling. */
export const TDE_SIBLING: Record<string, string> = { tdea: TDEB_FAMILY, tdeb: TDEA_FAMILY };

const note = (id: string) => `campaign_notes.${id}`;

const INTERCONNECTED = 'hidden.interconnected_campaign';
const HALF = 'hidden.half_campaign';

/** The Dream-Quest's final outcome, one per play: the epilogue matrix row. */
export const TDE_MATRIX_ROWS = [
	'nyarlathoteps_invasion_has_begun',
	'dreamers_awoke',
	'dreamers_stayed_in_dreamlands_forever',
	'dreamers_traveled_beneath_the_monastery'
] as const;
/** The Web of Dreams' final outcome, one per play: the epilogue matrix column. */
export const TDE_MATRIX_COLS = [
	'bridge_was_completed',
	'returned_to_reality',
	'never_escaped',
	'still_in_the_dreamlands'
] as const;

export type EpilogueVerdict = 'win' | 'partial' | 'loss';
// prettier-ignore
/** Only Epilogue 1 is a total loss; the "averted one form of destruction, but not the other"
 *  cells are partial. */
const EPILOGUE_VERDICT: Record<number, EpilogueVerdict> = {
	1: 'loss', 2: 'partial', 3: 'partial', 4: 'partial',
	5: 'partial', 6: 'win', 7: 'win', 8: 'win',
	9: 'partial', 10: 'win', 11: 'win', 12: 'win',
	13: 'partial', 14: 'win', 15: 'win', 16: 'win'
};

/** Epilogue 1–16 for a 0-based (row, col) cell. */
export function epilogueNumber(row: number, col: number): number {
	return row * TDE_MATRIX_COLS.length + col + 1;
}

export function epilogueVerdict(n: number): EpilogueVerdict {
	return EPILOGUE_VERDICT[n] ?? 'partial';
}

// `at_your_side` is recorded at The Black Cat and again at The Great Ones.
const CAT_AT_SIDE = [note('black_cat_at_your_side'), note('black_cat_at_your_side_2')];
const CAT_ABANDONED = note('you_asked_for_it');
const CAT_KNOWS_TRUTH = note('black_cat_knows_the_truth');
const CAT_SEARCHING = note('black_cat_is_searching_for_the_truth');
const CAT_HAS_HUNCH = note('black_cat_has_a_hunch');
/** The Web of Dreams half campaign, played without the cat. */
const CAT_ON_YOUR_OWN = note('on_your_own');

/** The messages given to the cat, in trail order, and which campaign's log records each. */
const CAT_MESSAGES: { id: string; side: 'a' | 'b' | 'both' }[] = [
	{ id: 'black_cat_delivered_news', side: 'a' },
	{ id: 'black_cat_shared_knowledge_of_the_dreamlands', side: 'a' },
	{ id: 'black_cat_spoke_of_nyarlathotep', side: 'a' },
	{ id: 'black_cat_spoke_of_atlach_nacha', side: 'a' },
	{ id: 'threaten_black_cat', side: 'a' },
	{ id: 'black_cat_warned_the_others', side: 'both' },
	{ id: 'black_cat_requested_aid', side: 'b' },
	{ id: 'black_cat_shared_knowledge_of_the_underworld', side: 'b' }
];
const catMessagesOn = (side: 'a' | 'b') =>
	CAT_MESSAGES.filter((c) => c.side === side || c.side === 'both').map((c) => note(c.id));

const SILVER_KEY = note('possess_silver_key');
const TDEA_RANDOLPH = {
	savedByCarter: note('saved_by_randolph_carter'),
	eludedCapture: note('randolph_eluded_capture'),
	captured: note('randolph_was_captured'),
	survivedVoyage: note('randolph_survived_the_voyage'),
	diedVoyage: note('randolph_did_not_survive_the_voyage')
};
const TDEB_RANDOLPH = {
	escapedAlone: note('randolph_escaped_hospital_alone'),
	escapedWithInvestigators: note('randolph_escaped_hospital_with_investigators'),
	survivedDescent: note('randolph_survived_descent'),
	diedDescent: note('randolph_did_not_survive_descent')
};
/** Killed by the cats of Ulthar: a loss whatever the epilogue cell. */
const BROKEN_LAW = note('broken_the_law_of_ulthar');

export interface TdeCatMessage {
	/** A `campaign_notes` id. */
	note: string;
	/** The campaign whose log holds the note's text. */
	family: string;
	plays: number;
}

export interface CampaignTdeShared {
	playMode: { interconnected: number; half: number; unspecified: number };
	/** Interconnected plays only. */
	matrix: {
		/** Epilogue number (1–16) → plays. */
		cells: Record<number, number>;
		/** Plays with only one side's final outcome (the linked log is incomplete). */
		awaitingLinked: number;
		resolved: number;
		killedByCats: number;
	};
	blackCat: {
		// One terminal disposition per play, in this priority.
		withDreamQuest: number;
		withWebOfDreams: number;
		abandoned: number;
		distrustful: number;
		onYourOwn: number;
		/** Interconnected plays with no disposition recorded. */
		unresolved: number;
		hadHunch: number;
		searched: number;
		/** The messages given to the cat, in trail order; only those given at least once. */
		trail: TdeCatMessage[];
	};
	/** `withDreamQuest`: the Key ended with the Dream-Quest party. */
	silverKey: { obtained: number; withDreamQuest: number };
	randolph: Record<keyof typeof TDEA_RANDOLPH | keyof typeof TDEB_RANDOLPH, number>;
}

const NONE: ReadonlySet<string> = new Set();

function firstIndex(logs: ReadonlySet<string>, ids: readonly string[]): number {
	return ids.findIndex((id) => logs.has(note(id)));
}

/** The shared view of one perspective family's plays. */
export function buildTdeShared(plays: readonly Play[], family: string): CampaignTdeShared {
	const playMode = { interconnected: 0, half: 0, unspecified: 0 };
	const matrix = {
		cells: {} as Record<number, number>,
		awaitingLinked: 0,
		resolved: 0,
		killedByCats: 0
	};
	const cat = {
		withDreamQuest: 0,
		withWebOfDreams: 0,
		abandoned: 0,
		distrustful: 0,
		onYourOwn: 0,
		unresolved: 0,
		hadHunch: 0,
		searched: 0
	};
	const messages: Record<string, number> = {};
	const silverKey = { obtained: 0, withDreamQuest: 0 };
	const randolphKeys = { ...TDEA_RANDOLPH, ...TDEB_RANDOLPH };
	const randolph = Object.fromEntries(
		Object.keys(randolphKeys).map((k) => [k, 0])
	) as CampaignTdeShared['randolph'];

	for (const p of plays) {
		const own = p.rec.recorded.recordedLogs ?? NONE;
		const linked = p.rec.linked ?? NONE;
		// The Dream-Quest (a) and Web of Dreams (b) logs, whichever side this record is.
		const a = family === TDEA_FAMILY ? own : linked;
		const b = family === TDEA_FAMILY ? linked : own;
		const inEither = (k: string) => a.has(k) || b.has(k);

		const interconnected = own.has(INTERCONNECTED);
		if (interconnected) playMode.interconnected += 1;
		else if (own.has(HALF)) playMode.half += 1;
		else playMode.unspecified += 1;

		if (interconnected) {
			const row = firstIndex(a, TDE_MATRIX_ROWS);
			const col = firstIndex(b, TDE_MATRIX_COLS);
			if (a.has(BROKEN_LAW)) matrix.killedByCats += 1;
			if (row >= 0 && col >= 0) {
				const n = epilogueNumber(row, col);
				matrix.cells[n] = (matrix.cells[n] ?? 0) + 1;
				matrix.resolved += 1;
			} else if (row >= 0 || col >= 0) {
				matrix.awaitingLinked += 1;
			}
		}

		if (b.has(CAT_ON_YOUR_OWN)) cat.onYourOwn += 1;
		else if (inEither(CAT_ABANDONED)) cat.abandoned += 1;
		else if (a.has(CAT_KNOWS_TRUTH)) cat.distrustful += 1;
		else if (CAT_AT_SIDE.some((k) => a.has(k))) cat.withDreamQuest += 1;
		else if (CAT_AT_SIDE.some((k) => b.has(k))) cat.withWebOfDreams += 1;
		else if (interconnected) cat.unresolved += 1;
		if (inEither(CAT_HAS_HUNCH)) cat.hadHunch += 1;
		if (b.has(CAT_SEARCHING)) cat.searched += 1;
		for (const { id, side } of CAT_MESSAGES) {
			const k = note(id);
			const given = side === 'a' ? a.has(k) : side === 'b' ? b.has(k) : inEither(k);
			if (given) messages[id] = (messages[id] ?? 0) + 1;
		}

		if (inEither(SILVER_KEY)) silverKey.obtained += 1;
		if (a.has(SILVER_KEY)) silverKey.withDreamQuest += 1;

		for (const [field, k] of Object.entries(TDEA_RANDOLPH))
			if (a.has(k)) randolph[field as keyof typeof TDEA_RANDOLPH] += 1;
		for (const [field, k] of Object.entries(TDEB_RANDOLPH))
			if (b.has(k)) randolph[field as keyof typeof TDEB_RANDOLPH] += 1;
	}

	const trail = CAT_MESSAGES.filter(({ id }) => messages[id]).map(({ id, side }) => ({
		note: id,
		family: side === 'b' ? TDEB_FAMILY : TDEA_FAMILY,
		plays: messages[id]
	}));
	return { playMode, matrix, blackCat: { ...cat, trail }, silverKey, randolph };
}

/** A running count kept in a `count` section, over the plays that recorded it. */
export interface CountTrack {
	plays: number;
	max: number | null;
	min: number | null;
	total: number;
	/** Mean per recording play, to one decimal; null when none recorded it. */
	avg: number | null;
	/** Final count → plays that ended on it. */
	distribution: Record<number, number>;
}

export function countTrack(plays: readonly Play[], section: string): CountTrack {
	const values = plays.map((p) => p.count(section)).filter((v): v is number => v !== undefined);
	const total = values.reduce((sum, v) => sum + v, 0);
	const distribution: Record<number, number> = {};
	for (const v of values) distribution[v] = (distribution[v] ?? 0) + 1;
	return {
		plays: values.length,
		...extentOf(values),
		total,
		avg: values.length ? Math.round((total / values.length) * 10) / 10 : null,
		distribution
	};
}

export interface TdeLinkedTopic {
	/** Black Cat / matrix / Silver Key / Randolph; labelled by the editor. */
	id: string;
	/** The sibling log's keys to transcribe under this topic. */
	keys: string[];
}

const TDEA_TOPICS: TdeLinkedTopic[] = [
	{ id: 'matrix', keys: TDE_MATRIX_ROWS.map(note) },
	{
		id: 'blackCat',
		keys: [...CAT_AT_SIDE, CAT_HAS_HUNCH, CAT_KNOWS_TRUTH, CAT_ABANDONED, ...catMessagesOn('a')]
	},
	{ id: 'silverKey', keys: [SILVER_KEY] },
	{ id: 'randolph', keys: Object.values(TDEA_RANDOLPH) }
];
const TDEB_TOPICS: TdeLinkedTopic[] = [
	{ id: 'matrix', keys: TDE_MATRIX_COLS.map(note) },
	{
		id: 'blackCat',
		keys: [...CAT_AT_SIDE, CAT_HAS_HUNCH, CAT_SEARCHING, CAT_ABANDONED, ...catMessagesOn('b')]
	},
	{ id: 'silverKey', keys: [SILVER_KEY] },
	{ id: 'randolph', keys: Object.values(TDEB_RANDOLPH) }
];

/** What a record of `family` transcribes from its sibling's log, by topic. */
export function linkedTopicsFor(family: string): TdeLinkedTopic[] {
	return family === TDEA_FAMILY ? TDEB_TOPICS : TDEA_TOPICS;
}
