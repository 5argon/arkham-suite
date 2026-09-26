/**
 * Campaign clear-state from the win / loss / special `outcome` tags campaign-data stamps on
 * resolution entries, pivoted per family and difficulty for the clear grid, the win/loss record
 * and the endings list.
 */
import {
	getCampaignLog,
	isCleared,
	outcomeSignals,
	type CampaignLog,
	type RecordedCampaignState
} from '@5argon/arkham-campaign-data';
import { campaignToProductMap, type Product } from '@5argon/arkham-kohaku';
import type { CampaignRecord } from '../records/campaign-record';
import type { CampaignGroup } from '../profile/profile-settings';
import {
	baseFamilyOf,
	familyOf,
	isReturnToCode,
	recordsByFamily
} from '../records/campaign-family';
import { campaignGroupOf, GROUPED_CAMPAIGNS } from '../utils/campaign-group';
import { cleanEntryText } from '../utils/entry-text';
import { bumpTally, ensureTally, type Tally } from '../utils/tally';

/** `special` is a rival-faction ending (TCU Lodge / Coven victory): neither a clear nor a loss. */
export type ClearState = 'cleared' | 'special' | 'attempted';

const RANK: Record<ClearState, number> = { cleared: 3, special: 2, attempted: 1 };

const DWL_FINALE_NOTES = [
	'campaign_notes.closed_tear',
	'campaign_notes.yog_sothoth_fled',
	'campaign_notes.yog_sothoth_became_one_with_reality',
	'campaign_notes.yog_sothoth_escaped'
];

/** Dunwich's Lost in Time and Space R2 (the investigators win but are never seen again) writes no
 *  campaign note: the Extra `final_act` = Act 4 with no finale note recorded is its only trace. */
export function dwlWonLostForever(
	log: CampaignLog,
	recorded: RecordedCampaignState,
	scenarioChoices: Record<string, string> | undefined
): boolean {
	return (
		baseFamilyOf(log) === 'dwl' &&
		scenarioChoices?.['lost_in_time_and_space.final_act'] === 'act_4' &&
		!DWL_FINALE_NOTES.some((k) => recorded.recordedLogs?.has(k))
	);
}

/** The strongest outcome a play recorded (a win outranks a co-recorded loss); null while no ending
 *  is recorded. */
export function playClearState(
	log: CampaignLog,
	recorded: RecordedCampaignState,
	scenarioChoices?: Record<string, string>
): ClearState | null {
	const logs = recorded.recordedLogs;
	if (!logs) return null;
	if (isCleared(log, recorded) === true) return 'cleared';
	const sig = outcomeSignals(log);
	if (sig.special.some((k) => logs.has(k))) return 'special';
	if (sig.loss.some((k) => logs.has(k))) return 'attempted';
	if (dwlWonLostForever(log, recorded, scenarioChoices)) return 'cleared';
	return null;
}

function recordClearState(rec: CampaignRecord): ClearState | null {
	const log = getCampaignLog(rec.campaignCode);
	return log ? playClearState(log, rec.recorded, rec.scenarioChoices) : null;
}

export interface CampaignClear {
	family: string;
	name: string;
	/** Strongest state per difficulty tier; a tier without a finished play is absent. */
	byTier: Partial<Record<string, ClearState>>;
	plays: number;
}

export function buildClearGrid(records: CampaignRecord[], mergeReturnTo = true): CampaignClear[] {
	return [...recordsByFamily(records, mergeReturnTo)].map(([family, { log, recs }]) => {
		const byTier: CampaignClear['byTier'] = {};
		for (const rec of recs) {
			const state = recordClearState(rec);
			if (!state) continue;
			const tier = rec.recorded.difficulty ?? 'standard';
			const prev = byTier[tier];
			if (!prev || RANK[state] > RANK[prev]) byTier[tier] = state;
		}
		return { family, name: log.db.name, byTier, plays: recs.length };
	});
}

export interface ClearGridRow extends CampaignClear {
	product: Product;
	owned: boolean;
}

/**
 * Every official campaign box of the tracked chapter groups as a row, played or not.
 * `ownedProducts === null` owns everything. `hideReturnTo` drops the Return-to rows (their plays
 * already fold into the base row when merging).
 */
export function buildFullClearGrid(
	records: CampaignRecord[],
	ownedProducts: Product[] | null,
	trackedGroups: CampaignGroup[],
	mergeReturnTo = true,
	hideReturnTo = false
): ClearGridRow[] {
	const tracked = new Set(trackedGroups);
	const played = new Map(buildClearGrid(records, mergeReturnTo).map((c) => [c.family, c]));
	const seen = new Set<string>();
	const rows: ClearGridRow[] = [];
	for (const campaign of GROUPED_CAMPAIGNS) {
		const group = campaignGroupOf(campaign);
		if (!group || !tracked.has(group)) continue;
		const log = getCampaignLog(campaign);
		if (!log) continue;
		const family = familyOf(log);
		if (hideReturnTo && isReturnToCode(family)) continue;
		if (seen.has(family)) continue;
		seen.add(family);
		const product = campaignToProductMap[campaign];
		const owned = ownedProducts === null || ownedProducts.includes(product);
		const base = played.get(family) ?? { family, name: log.db.name, byTier: {}, plays: 0 };
		rows.push({ ...base, product, owned });
	}
	return rows;
}

export interface WinLossTierRecord {
	plays: number;
	wins: number;
	losses: number;
	special: number;
}
export interface WinLossRecord extends WinLossTierRecord {
	family: string;
	name: string;
	/** Plays with no ending recorded yet. */
	inProgress: number;
	byTier: Record<string, WinLossTierRecord>;
}

const WIN_LOSS_FIELD = { cleared: 'wins', attempted: 'losses', special: 'special' } as const;

export function buildWinLossRecord(
	records: CampaignRecord[],
	mergeReturnTo = true,
	hideReturnTo = false
): WinLossRecord[] {
	const rows: WinLossRecord[] = [];
	for (const [family, { log, recs }] of recordsByFamily(records, mergeReturnTo)) {
		if (hideReturnTo && isReturnToCode(family)) continue;
		const row: WinLossRecord = {
			family,
			name: log.db.name,
			plays: 0,
			wins: 0,
			losses: 0,
			special: 0,
			inProgress: 0,
			byTier: {}
		};
		for (const rec of recs) {
			const tier = rec.recorded.difficulty ?? 'standard';
			const t = (row.byTier[tier] ??= { plays: 0, wins: 0, losses: 0, special: 0 });
			row.plays += 1;
			t.plays += 1;
			const state = recordClearState(rec);
			if (state) {
				row[WIN_LOSS_FIELD[state]] += 1;
				t[WIN_LOSS_FIELD[state]] += 1;
			} else row.inProgress += 1;
		}
		rows.push(row);
	}
	return rows;
}

/** The synthetic ending key for {@link dwlWonLostForever}, and its text (the log has none). */
export const DWL_WIN_LOST_FOREVER_KEY = 'dwl_win_lost_forever';
export const DWL_WIN_LOST_FOREVER_TEXT =
	'the investigators win the campaign, but are never seen again.';

/** `best` is a superior win. */
export type EndingKind = 'best' | 'win' | 'special' | 'loss';
export const ENDING_KIND_ORDER: readonly EndingKind[] = ['best', 'win', 'special', 'loss'];
export interface Ending {
	key: string;
	text: string;
	kind: EndingKind;
	reached: boolean;
	/** Plays that reached this ending. */
	count: number;
	byTier: Record<string, number>;
	/** Known only from an Extra input, so hidden in Log-only mode. */
	nonLog?: boolean;
}
export interface CampaignEndings {
	family: string;
	name: string;
	endings: Ending[];
	reachedCount: number;
	bestReached: boolean;
}

/** The display text of an ending / outcome log key; the key itself when the entry has no text. */
export function endingText(log: CampaignLog, key: string): string {
	return cleanEntryText(log.en.entries[key]?.text ?? key);
}

/** Every ending a family offers (from each of its logs, Return-to included) with how often the
 *  player reached it. */
export function buildEndings(records: CampaignRecord[], mergeReturnTo = true): CampaignEndings[] {
	const out: CampaignEndings[] = [];
	for (const [family, { log: familyLog, recs, codes }] of recordsByFamily(records, mergeReturnTo)) {
		const tallies: Record<string, Tally> = {};
		for (const rec of recs) {
			const tier = rec.recorded.difficulty ?? 'standard';
			for (const k of rec.recorded.recordedLogs ?? []) bumpTally(ensureTally(tallies, k), tier);
			if (dwlWonLostForever(familyLog, rec.recorded, rec.scenarioChoices)) {
				bumpTally(ensureTally(tallies, DWL_WIN_LOST_FOREVER_KEY), tier);
			}
		}
		const ending = (key: string, text: string, kind: EndingKind): Ending => {
			const t = tallies[key];
			const count = t?.total ?? 0;
			return { key, text, kind, reached: count > 0, count, byTier: t?.byTier ?? {} };
		};

		const byKey = new Map<string, Ending>();
		for (const code of codes) {
			const log = getCampaignLog(code);
			if (!log) continue;
			const sig = outcomeSignals(log);
			const add = (key: string, kind: EndingKind) => {
				if (!byKey.has(key)) byKey.set(key, ending(key, endingText(log, key), kind));
			};
			// `win` also lists the best wins, which `bestWin` claims first.
			for (const k of sig.bestWin) add(k, 'best');
			for (const k of sig.win) add(k, 'win');
			for (const k of sig.special) add(k, 'special');
			for (const k of sig.loss) add(k, 'loss');
		}
		if (baseFamilyOf(familyLog) === 'dwl') {
			byKey.set(DWL_WIN_LOST_FOREVER_KEY, {
				...ending(DWL_WIN_LOST_FOREVER_KEY, DWL_WIN_LOST_FOREVER_TEXT, 'win'),
				nonLog: true
			});
		}
		const endings = [...byKey.values()];
		if (!endings.length) continue;
		out.push({
			family,
			name: familyLog.db.name,
			endings,
			reachedCount: endings.filter((e) => e.reached).length,
			bestReached: endings.some((e) => e.kind === 'best' && e.reached)
		});
	}
	return out;
}
