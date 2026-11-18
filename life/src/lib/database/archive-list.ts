/** The Campaign Archive list: filter → sort → paginate. */
import { getCampaignLog, outcomeSignals, type RecordedCampaignState } from '@5argon/arkham-campaign-data';
import type { Campaign } from '@5argon/arkham-kohaku';
import { u } from '@5argon/arkham-string';

import { resolveCardOrNull } from '$lib/card-data';
import { playClearState, type ClearState } from '$lib/campaign/outcomes/clear-status';
import { scenarioChoicesFromLogs } from '$lib/campaign/records/recorded-state';
import { DIFFICULTY_ORDER } from '$lib/campaign/utils/difficulty';

import {
	distinctHands,
	resolvePlayerCount,
	resolveSoloType,
	rosterByUid,
	rosterUids,
	type CampaignRecord,
	type DatabaseDocument,
	type Difficulty,
	type SoloType
} from './document';
import { filterIn, paginate, resolvedParticipants, type ResolvedPlayer } from './repository';

export interface ListCampaign {
	id: string;
	title: string;
	campaignCode: string;
	difficulty: Difficulty;
	/** Resolved head count, or null when unspecified. */
	playerCount: number | null;
	draft: boolean;
	startDate: number | null;
	finishDate: number | null;
	/** null = no outcome recorded (in progress, abandoned, or no campaign log). */
	outcome: ClearState | null;
	/** Cleared with a `bestWin` ending. */
	reachedBestWin: boolean;
	soloType: SoloType | null;
	/** Distinct deck hands, for "Solo X-Handed". */
	soloHands: number;
	players: ResolvedPlayer[];
	decks: { id: string; investigatorCode: string; alternateFrontCode: string | null }[];
}

/** 'cleared' = any win, 'attempted' = lose, 'unknown' = no outcome recorded. */
export type OutcomeFilter = 'cleared' | 'special' | 'attempted' | 'unknown';

export type ListSort = 'date' | 'campaign' | 'difficulty';

export interface ListParams {
	page: number;
	pageSize: number;
	name: string;
	sort: ListSort;
	campaigns?: string[];
	/** Roster uids; matches when any participant is selected. */
	players?: string[];
	/** Investigator codes; matches when any deck used one (either front). */
	investigators?: string[];
	outcomes?: OutcomeFilter[];
	playerCounts?: number[];
	solo?: SoloType[];
}

/** Filter choices, from the whole archive so they don't change with the page. */
export interface FilterOptions {
	campaigns: { code: string; name: string }[];
	players: { uid: string; name: string; iconCardCode: string }[];
	investigators: { code: string; name: string }[];
	playerCounts: number[];
	soloTypes: SoloType[];
}

export interface ListResult {
	campaigns: ListCampaign[];
	totalCount: number;
	filterOptions: FilterOptions;
	/** Every matching id across pages, for Export All. */
	filteredIds: string[];
}

export const EMPTY_LIST: ListResult = {
	campaigns: [],
	totalCount: 0,
	filteredIds: [],
	filterOptions: { campaigns: [], players: [], investigators: [], playerCounts: [], soloTypes: [] }
};

export function campaignDisplayName(code: string): string {
	return code ? u.campaignName(code as Campaign) : '';
}

/** The campaign's ending from its logs (and the Extra choices some endings hinge on). */
function campaignOutcome(c: CampaignRecord): { outcome: ClearState | null; reachedBestWin: boolean } {
	const log = getCampaignLog(c.campaignCode);
	if (!log) return { outcome: null, reachedBestWin: false };
	const recordedLogs = new Set(c.logs.filter((l) => !l.section.startsWith('__')).map((l) => l.key));
	const state: RecordedCampaignState = {
		recordedLogs,
		logCounts: {},
		recordedSectionItems: {},
		finalChaosBag: {}
	};
	const outcome = playClearState(log, state, scenarioChoicesFromLogs(c.logs));
	const reachedBestWin =
		outcome === 'cleared' && outcomeSignals(log).bestWin.some((k) => recordedLogs.has(k));
	return { outcome, reachedBestWin };
}

const playerCountOf = (c: CampaignRecord) => resolvePlayerCount(c.playerCount, c.participants.length);
const soloTypeOf = (c: CampaignRecord) =>
	resolveSoloType(c.playerCount, c.participants.length, c.multiHanded);

function buildFilterOptions(doc: DatabaseDocument): FilterOptions {
	const roster = rosterUids(doc);
	const byUid = rosterByUid(doc);
	const campaignCodes = new Set<string>();
	const playerUids = new Set<string>();
	const invCodes = new Set<string>();
	const counts = new Set<number>();
	const soloTypes = new Set<SoloType>();
	for (const c of doc.campaigns) {
		if (c.campaignCode) campaignCodes.add(c.campaignCode);
		for (const p of c.participants) if (roster.has(p.uid)) playerUids.add(p.uid);
		for (const d of c.decks) invCodes.add(d.investigator.investigatorCode);
		const pc = playerCountOf(c);
		if (pc != null) counts.add(pc);
		const st = soloTypeOf(c);
		if (st) soloTypes.add(st);
	}
	const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
	return {
		campaigns: [...campaignCodes]
			.map((code) => ({ code, name: getCampaignLog(code)?.db.name ?? code }))
			.sort(byName),
		players: [...playerUids]
			.map((uid) => {
				const r = byUid.get(uid);
				return { uid, name: r?.name ?? uid, iconCardCode: r?.iconCardCode ?? '' };
			})
			.sort(byName),
		investigators: [...invCodes]
			.map((code) => ({ code, name: resolveCardOrNull(code)?.name ?? code }))
			.sort(byName),
		playerCounts: [...counts].sort((a, b) => a - b),
		soloTypes: (['true-solo', 'multi-handed'] as SoloType[]).filter((t) => soloTypes.has(t))
	};
}

/** Newest first by finish date, else start date, else creation. */
const effectiveDate = (c: CampaignRecord) => c.finishDate ?? c.startDate ?? c.createdAt;

const SORTS: Record<ListSort, (a: CampaignRecord, b: CampaignRecord) => number> = {
	date: (a, b) => effectiveDate(b) - effectiveDate(a),
	campaign: (a, b) =>
		campaignDisplayName(a.campaignCode).localeCompare(campaignDisplayName(b.campaignCode)) ||
		effectiveDate(b) - effectiveDate(a),
	difficulty: (a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty)
};

export function listData(doc: DatabaseDocument, params: ListParams): ListResult {
	let items = doc.campaigns.slice();
	if (params.name) {
		const needle = params.name.toLowerCase();
		items = items.filter((c) => c.title.toLowerCase().includes(needle));
	}
	items = filterIn(items, params.campaigns, (c) => c.campaignCode);
	items = filterIn(items, params.players, (c) => c.participants.map((p) => p.uid));
	items = filterIn(items, params.investigators, (c) =>
		c.decks.flatMap(({ investigator: { investigatorCode, alternateFrontCode } }) =>
			alternateFrontCode ? [investigatorCode, alternateFrontCode] : [investigatorCode]
		)
	);
	items = filterIn(items, params.outcomes, (c) => campaignOutcome(c).outcome ?? 'unknown');
	items = filterIn(items, params.playerCounts, playerCountOf);
	items = filterIn(items, params.solo, soloTypeOf);
	items.sort(SORTS[params.sort] ?? SORTS.date);

	const campaigns = paginate(items, params.page, params.pageSize).map((c): ListCampaign => {
		const { players, decks } = resolvedParticipants(doc, c);
		return {
			id: c.id,
			title: c.title,
			campaignCode: c.campaignCode,
			difficulty: c.difficulty,
			playerCount: playerCountOf(c),
			draft: c.draft,
			startDate: c.startDate,
			finishDate: c.finishDate,
			...campaignOutcome(c),
			soloType: soloTypeOf(c),
			soloHands: distinctHands(c.decks),
			players,
			decks: decks.map((d) => ({
				id: d.id,
				investigatorCode: d.investigator.investigatorCode,
				alternateFrontCode: d.investigator.alternateFrontCode
			}))
		};
	});

	return {
		campaigns,
		totalCount: items.length,
		filterOptions: buildFilterOptions(doc),
		filteredIds: items.map((c) => c.id)
	};
}
