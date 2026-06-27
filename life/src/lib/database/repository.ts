/**
 * repository.ts — projects the local `DatabaseDocument` into the exact data shapes
 * the archive route loads return, so the route components render unchanged.
 *
 * Player identity resolves through `resolveParticipant`: a participant whose uid
 * is in the roster shows live (managed); otherwise it's a frozen guest. Projected
 * field names (`userId`, `ownerUserId`) carry uids.
 */
import type { AhdbDeck, Card } from '@5argon/arkham-kohaku';
import {
	getCampaignLog,
	outcomeSignals,
	type RecordedCampaignState
} from '@5argon/arkham-campaign-data';

import { createCardResolver } from '$lib/card-data';
import { playClearState, type ClearState } from '$lib/campaign/outcomes/clear-status';
import { standaloneVerdict, type StandaloneVerdict } from '$lib/campaign/outcomes/standalone-clear';
import { RESERVED } from '$lib/campaign/records/recorded-state';
import { DIFFICULTY_ORDER } from '$lib/campaign/utils/difficulty';

import {
	distinctHands,
	findCampaign,
	findStandalone,
	resolveParticipant,
	resolvePlayerCount,
	resolveSoloType,
	rosterByUid,
	rosterUids,
	sortDecksByParticipants,
	sortParticipants,
	type CampaignRecord,
	type DatabaseDocument,
	type DeckInvestigator,
	type Difficulty,
	type SoloType
} from './document';

// ─── Archive list ──────────────────────────────────────────────────────────────

interface PlayerStub {
	userId: string;
	username: string;
	iconCardCode: string;
	isGuest: boolean;
}

interface DeckStub {
	/** Unique deck record id — used as the card's keyed-each key so decks on the same investigator
	 *  (a mid-campaign swap-back, or two players on one investigator) don't collapse into one. */
	id: string;
	investigatorCode: string;
	alternateFrontCode: string | null;
	ownerUserId: string | null;
	ownerUsername: string | null;
	ownerIconCardCode: string | null;
}

/** One row as consumed by `ArchivedCampaignListItem`. */
export interface ListCampaign {
	id: string;
	title: string;
	campaignCode: string;
	difficulty: string;
	/** Resolved head count (auto→participants capped at 4), or null when unspecified. */
	playerCount: number | null;
	draft: boolean;
	/** Recorded start of play, or null when unset. */
	startDate: Date | null;
	/** Recorded finish of play, or null when unset (e.g. in-progress / abandoned). */
	finishDate: Date | null;
	/** Campaign outcome derived from the terminal resolution logs. null = no outcome
	 *  log recorded yet (in-progress, abandoned, or a campaignCode with no log def). */
	outcome: ClearState | null;
	/** True when the play recorded a `bestWin`-tagged ending (the superior win tier).
	 *  Only meaningful when `outcome === 'cleared'`. */
	reachedBestWin: boolean;
	/** Solo classification, or null when not a 1-player play. See {@link resolveSoloType}. */
	soloType: SoloType | null;
	/** Distinct deck "hands" — the X in "Solo X-Handed". Only meaningful for `'multi-handed'`. */
	soloHands: number;
	userId: string;
	ownerUsername: string;
	ownerIconCardCode: string;
	ownerUid: string;
	players: PlayerStub[];
	decks: DeckStub[];
}

/** Outcome filter buckets: 'cleared' (any win), 'special', 'attempted' (lose),
 *  'unknown' (no outcome recorded). */
export type OutcomeFilter = 'cleared' | 'special' | 'attempted' | 'unknown';

/** Solo filter buckets — the two solo flavors. */
export type SoloFilter = SoloType;

export interface ListParams {
	page: number;
	pageSize: number;
	name: string;
	sort: 'date' | 'campaign' | 'difficulty';
	/** Multi-select filters (empty/absent = no constraint). Applied before pagination. */
	campaigns?: string[];
	/** Participant uids (roster members only). A campaign matches if any participant is selected. */
	players?: string[];
	/** Investigator codes. A campaign matches if any of its decks used a selected investigator. */
	investigators?: string[];
	outcomes?: OutcomeFilter[];
	playerCounts?: number[];
	/** Solo types. A campaign matches if its resolved solo type is selected. */
	solo?: SoloFilter[];
}

/** The distinct values present across ALL campaigns, for populating the filter modal.
 *  Built from the whole document (not the current page) so options stay stable. */
export interface FilterOptions {
	campaigns: { code: string; name: string }[];
	players: { uid: string; name: string; iconCardCode: string }[];
	investigators: { code: string; name: string }[];
	playerCounts: number[];
	/** Distinct solo types present across all campaigns (gates the Solo filter section). */
	soloTypes: SoloFilter[];
}

export interface ListResult {
	campaigns: ListCampaign[];
	totalCount: number;
	cardsByCode: Record<string, Card>;
	filterOptions: FilterOptions;
	/** Every campaign id matching the current filters (across all pages, sorted) — the
	 *  target of the "Export All / Export All Filtered" bulk action. */
	filteredIds: string[];
}

/** Resolve a deck owner uid against a campaign's participants (then the roster). */
function resolveOwner(
	doc: DatabaseDocument,
	c: CampaignRecord,
	uid: string | null
): { username: string; iconCardCode: string } | null {
	if (!uid) return null;
	const p = c.participants.find((x) => x.uid === uid);
	if (p) {
		const r = resolveParticipant(doc, p);
		return { username: r.name, iconCardCode: r.iconCardCode };
	}
	return null;
}

/** Derive the terminal outcome of a campaign from its recorded logs alone.
 *  Builds only the `recordedLogs` set (the sole field `playClearState` inspects).
 *  Also checks `outcomeSignals.bestWin` to distinguish a superior-win ending. */
function campaignOutcome(c: CampaignRecord): {
	outcome: ClearState | null;
	reachedBestWin: boolean;
} {
	const log = getCampaignLog(c.campaignCode);
	if (!log) return { outcome: null, reachedBestWin: false };
	const recordedLogs = new Set(c.logs.filter((l) => !l.section.startsWith('__')).map((l) => l.key));
	const state: RecordedCampaignState = {
		recordedLogs,
		logCounts: {},
		recordedSectionItems: {},
		finalChaosBag: {}
	};
	const outcome = playClearState(log, state);
	const reachedBestWin =
		outcome === 'cleared' && outcomeSignals(log).bestWin.some((k) => recordedLogs.has(k));
	return { outcome, reachedBestWin };
}

/** Distinct filter values across the whole document (stable regardless of page). */
function buildFilterOptions(doc: DatabaseDocument): FilterOptions {
	const cardResolver = createCardResolver();
	const roster = rosterUids(doc);
	const byUid = rosterByUid(doc);
	const campaignCodes = new Set<string>();
	const playerUids = new Set<string>();
	const invCodes = new Set<string>();
	const counts = new Set<number>();
	const soloTypes = new Set<SoloFilter>();
	for (const c of doc.campaigns) {
		if (c.campaignCode) campaignCodes.add(c.campaignCode);
		for (const p of c.participants) if (roster.has(p.uid)) playerUids.add(p.uid);
		for (const d of c.decks) invCodes.add(d.investigator.investigatorCode);
		const pc = resolvePlayerCount(c.playerCount, c.participants.length);
		if (pc != null) counts.add(pc);
		const st = resolveSoloType(c.playerCount, c.participants.length, c.multiHanded);
		if (st) soloTypes.add(st);
	}
	const resolveName = (code: string): string => {
		try {
			return cardResolver.resolve(code)?.name ?? code;
		} catch {
			return code;
		}
	};
	return {
		campaigns: [...campaignCodes]
			.map((code) => ({ code, name: getCampaignLog(code)?.db.name ?? code }))
			.sort((a, b) => a.name.localeCompare(b.name)),
		players: [...playerUids]
			.map((uid) => {
				const r = byUid.get(uid);
				return { uid, name: r?.name ?? uid, iconCardCode: r?.iconCardCode ?? '' };
			})
			.sort((a, b) => a.name.localeCompare(b.name)),
		investigators: [...invCodes]
			.map((code) => ({ code, name: resolveName(code) }))
			.sort((a, b) => a.name.localeCompare(b.name)),
		playerCounts: [...counts].sort((a, b) => a - b),
		// Stable, meaningful order (True Solo before Multi-Handed) regardless of insertion.
		soloTypes: (['true-solo', 'multi-handed'] as SoloFilter[]).filter((t) => soloTypes.has(t))
	};
}

/** Build the `/archive` list payload (filter → sort → paginate → enrich). */
export function listData(doc: DatabaseDocument, params: ListParams): ListResult {
	const owner = doc.owner;

	let items = doc.campaigns.slice();
	if (params.name) {
		const needle = params.name.toLowerCase();
		items = items.filter((c) => c.title.toLowerCase().includes(needle));
	}
	if (params.campaigns?.length) {
		const set = new Set(params.campaigns);
		items = items.filter((c) => set.has(c.campaignCode));
	}
	if (params.players?.length) {
		const set = new Set(params.players);
		items = items.filter((c) => c.participants.some((p) => set.has(p.uid)));
	}
	if (params.investigators?.length) {
		const set = new Set(params.investigators);
		items = items.filter((c) =>
			c.decks.some(
				(d) =>
					set.has(d.investigator.investigatorCode) ||
					(d.investigator.alternateFrontCode != null && set.has(d.investigator.alternateFrontCode))
			)
		);
	}
	if (params.outcomes?.length) {
		const set = new Set<OutcomeFilter>(params.outcomes);
		items = items.filter((c) => set.has(campaignOutcome(c).outcome ?? 'unknown'));
	}
	if (params.playerCounts?.length) {
		const set = new Set(params.playerCounts);
		items = items.filter((c) => {
			const pc = resolvePlayerCount(c.playerCount, c.participants.length);
			return pc != null && set.has(pc);
		});
	}
	if (params.solo?.length) {
		const set = new Set<SoloFilter>(params.solo);
		items = items.filter((c) => {
			const st = resolveSoloType(c.playerCount, c.participants.length, c.multiHanded);
			return st != null && set.has(st);
		});
	}
	// "Date" sorts by finish date, falling back to start date, then created-at
	// (never shown — just keeps date-less campaigns from clumping at the epoch).
	const effectiveDate = (c: CampaignRecord) => c.finishDate ?? c.startDate ?? c.createdAt;
	items.sort((a, b) => {
		if (params.sort === 'campaign') return b.campaignCode.localeCompare(a.campaignCode);
		if (params.sort === 'difficulty') return b.difficulty.localeCompare(a.difficulty);
		return effectiveDate(b) - effectiveDate(a);
	});

	const totalCount = items.length;
	// All ids matching the filters (across pages) — for the bulk "Export All [Filtered]" action.
	const filteredIds = items.map((c) => c.id);
	const start = (params.page - 1) * params.pageSize;
	const pageItems = items.slice(start, start + params.pageSize);

	const campaigns: ListCampaign[] = pageItems.map((c) => {
		// Display order: you → roster → guests; decks follow their owner's order.
		const sortedParticipants = sortParticipants(doc, c.participants);
		return {
			id: c.id,
			title: c.title,
			campaignCode: c.campaignCode,
			difficulty: c.difficulty,
			playerCount: resolvePlayerCount(c.playerCount, c.participants.length),
			draft: c.draft,
			startDate: c.startDate != null ? new Date(c.startDate) : null,
			finishDate: c.finishDate != null ? new Date(c.finishDate) : null,
			...campaignOutcome(c),
			soloType: resolveSoloType(c.playerCount, c.participants.length, c.multiHanded),
			soloHands: distinctHands(c.decks),
			userId: owner.uid,
			ownerUsername: owner.name,
			ownerIconCardCode: owner.iconCardCode,
			ownerUid: owner.uid,
			players: sortedParticipants.map((p) => {
				const r = resolveParticipant(doc, p);
				return {
					userId: r.uid,
					username: r.name,
					iconCardCode: r.iconCardCode,
					isGuest: r.isGuest
				};
			}),
			decks: sortDecksByParticipants(sortedParticipants, c.decks).map((d) => {
				const o = resolveOwner(doc, c, d.ownerUid);
				return {
					id: d.id,
					investigatorCode: d.investigator.investigatorCode,
					alternateFrontCode: d.investigator.alternateFrontCode,
					ownerUserId: d.ownerUid,
					ownerUsername: o?.username ?? null,
					ownerIconCardCode: o?.iconCardCode ?? null
				};
			})
		};
	});

	return {
		campaigns,
		totalCount,
		cardsByCode: resolveCards(campaigns),
		filterOptions: buildFilterOptions(doc),
		filteredIds
	};
}

/** Resolve every card code referenced by the list rows to a full Card. */
function resolveCards(campaigns: ListCampaign[]): Record<string, Card> {
	const codes = new Set<string>();
	for (const c of campaigns) {
		codes.add(c.ownerIconCardCode);
		for (const p of c.players) codes.add(p.iconCardCode);
		for (const d of c.decks) {
			codes.add(d.investigatorCode);
			if (d.alternateFrontCode) codes.add(d.alternateFrontCode);
			if (d.ownerIconCardCode) codes.add(d.ownerIconCardCode);
		}
	}
	const resolver = createCardResolver();
	const cardsByCode: Record<string, Card> = {};
	for (const code of codes) {
		try {
			cardsByCode[code] = resolver.resolve(code);
		} catch {
			// Unknown code (e.g. a card not in the bundled set) — skip; the UI
			// guards on a missing entry.
		}
	}
	return cardsByCode;
}

// ─── Campaign editor detail ──────────────────────────────────────────────────

/** The shape the `archive/edit` route + its components consume. */
export interface CampaignDetail {
	campaign: {
		id: string;
		userId: string;
		title: string;
		campaignCode: string;
		difficulty: Difficulty;
		draft: boolean;
		displayInProfile: 'default' | 'visible' | 'hidden';
		startDate: Date | null;
		finishDate: Date | null;
		createdAt: Date;
		updatedAt: Date;
		/** Whether this record is a campaign archive or a standalone-mode play. */
		kind: 'campaign' | 'standalone';
		/** Standalone only: a dedicated Scenario Pack vs a campaign scenario played standalone. */
		source?: 'pack' | 'campaign';
		/** Standalone only: the single scenario id being recorded (campaignCode is the catalogue to load). */
		scenario?: string;
	};
	players: {
		id: string;
		userId: string;
		username: string;
		iconCardCode: string;
		uid: string | null;
		isGuest: boolean;
		canEdit: boolean;
		canDelete: boolean;
	}[];
	decks: {
		id: string;
		ownerUserId: string | null;
		/** Pre-resolved from `DeckRecord.investigator.investigatorCode` — present
		 *  even for deck-less investigator entries (empty versions). */
		investigatorCode: string;
		versions: { sequenceIndex: number; ahdbJson: string }[];
		owner: { username: string; iconCardCode: string } | null;
	}[];
	logs: {
		key: string;
		section: string;
		params: { valueString: string | null; valueNumber: number | null }[];
	}[];
	/** Transcribed sibling-campaign entries (The Dream-Eaters Linked Campaign Log). Same shape as logs. */
	linkedLog: {
		key: string;
		section: string;
		params: { valueString: string | null; valueNumber: number | null }[];
	}[];
	achievements: { family: string; achievementId: string; itemId: string | null }[];
	isOwner: boolean;
	canEdit: boolean;
	canDelete: boolean;
	currentUser: { id: string; username: string; iconCardCode: string };
}

/** Project one campaign OR standalone of the database into the editor's data shape. */
export function campaignDetail(doc: DatabaseDocument, id: string): CampaignDetail | null {
	const standalone = findStandalone(doc, id);
	const c = standalone ?? findCampaign(doc, id);
	if (!c) return null;
	const owner = doc.owner;
	// Display order: you → roster → guests; decks follow their owner's order.
	const sortedParticipants = sortParticipants(doc, c.participants);

	return {
		campaign: {
			id: c.id,
			userId: owner.uid,
			title: c.title,
			campaignCode: c.campaignCode,
			difficulty: c.difficulty,
			draft: c.draft,
			displayInProfile: c.displayInProfile ?? 'default',
			startDate: c.startDate != null ? new Date(c.startDate) : null,
			finishDate: c.finishDate != null ? new Date(c.finishDate) : null,
			createdAt: new Date(c.createdAt),
			updatedAt: new Date(c.updatedAt),
			kind: standalone ? 'standalone' : 'campaign',
			source: standalone?.source,
			scenario: standalone?.scenario
		},
		players: sortedParticipants.map((p) => {
			const r = resolveParticipant(doc, p);
			return {
				id: r.uid,
				userId: r.uid,
				username: r.name,
				iconCardCode: r.iconCardCode,
				uid: r.uid,
				isGuest: r.isGuest,
				canEdit: true,
				canDelete: r.uid !== owner.uid
			};
		}),
		decks: sortDecksByParticipants(sortedParticipants, c.decks).map((d) => {
			const o = resolveOwner(doc, c, d.ownerUid);
			return {
				id: d.id,
				ownerUserId: d.ownerUid,
				investigatorCode: d.investigator.investigatorCode,
				versions: d.versions.map((v) => ({ sequenceIndex: v.sequenceIndex, ahdbJson: v.ahdbJson })),
				owner: o ? { username: o.username, iconCardCode: o.iconCardCode } : null
			};
		}),
		logs: c.logs.map((l) => ({
			key: l.key,
			section: l.section,
			params: l.args.map((a) => ({
				valueString: a.type === 'string' ? a.value : null,
				valueNumber: a.type === 'number' ? Number(a.value) || 0 : null
			}))
		})),
		linkedLog: (c.linkedLog ?? []).map((l) => ({
			key: l.key,
			section: l.section,
			params: l.args.map((a) => ({
				valueString: a.type === 'string' ? a.value : null,
				valueNumber: a.type === 'number' ? Number(a.value) || 0 : null
			}))
		})),
		achievements: c.manualAchievements.map((a) => ({
			family: a.family,
			achievementId: a.achievementId,
			itemId: a.itemId
		})),
		isOwner: true,
		canEdit: true,
		canDelete: true,
		currentUser: { id: owner.uid, username: owner.name, iconCardCode: owner.iconCardCode }
	};
}

/**
 * Derive deck investigator + meta selections from the latest AhdbDeck version.
 */
export function investigatorFromAhdbDeck(deck: AhdbDeck): DeckInvestigator {
	let meta: Record<string, unknown> = {};
	try {
		meta = JSON.parse(deck.meta ?? '{}') as Record<string, unknown>;
	} catch {
		meta = {};
	}
	const str = (k: string) => (typeof meta[k] === 'string' ? (meta[k] as string) : null);
	return {
		investigatorCode: deck.investigator_code,
		alternateFrontCode: str('alternate_front'),
		alternateBackCode: str('alternate_back'),
		factionSelected: str('faction_selected'),
		faction1: str('faction_1'),
		faction2: str('faction_2'),
		optionSelected: str('option_selected'),
		deckSizeSelected:
			typeof meta['deck_size_selected'] === 'number' ? (meta['deck_size_selected'] as number) : null
	};
}

// ─── Standalone archive list ───────────────────────────────────────────────────

/** A standalone-mode play projected for the archive list (lightweight; no filters). */
export interface ListStandalone {
	id: string;
	title: string;
	/** The single scenario id recorded. */
	scenario: string;
	/** The scenario's display name (campaign-data), for the card. */
	scenarioName: string;
	/** A dedicated Scenario Pack vs a campaign scenario played standalone. */
	source: 'pack' | 'campaign';
	/** campaign-data catalogue code the scenario loads from (`'side'` or a campaign code). */
	catalogueCode: string;
	difficulty: Difficulty;
	finishDate: number | null;
	/** Standalone Mode verdict (numbered resolution = won), or null when unrecorded. */
	verdict: StandaloneVerdict | null;
	/** Investigator codes across the play's decks (for the card portraits). */
	investigatorCodes: string[];
	/** Baked participant display names. */
	participantNames: string[];
}

export type StandaloneVerdictFilter = 'won' | 'lost' | 'unknown';

export interface StandaloneListParams {
	page: number;
	pageSize: number;
	name: string;
	sort: 'date' | 'name' | 'difficulty';
	/** Facet filters (empty/absent = no constraint). */
	sources?: string[];
	difficulties?: string[];
	verdicts?: string[];
}

/** Distinct facet values across all standalone plays, for the filter modal. */
export interface StandaloneFilterOptions {
	sources: ('pack' | 'campaign')[];
	difficulties: Difficulty[];
	verdicts: StandaloneVerdictFilter[];
}

export interface StandaloneListResult {
	items: ListStandalone[];
	totalCount: number;
	filteredIds: string[];
	cardsByCode: Record<string, Card>;
	filterOptions: StandaloneFilterOptions;
}

function buildStandaloneFilterOptions(all: ListStandalone[]): StandaloneFilterOptions {
	const sources = new Set<'pack' | 'campaign'>();
	const difficulties = new Set<Difficulty>();
	const verdicts = new Set<StandaloneVerdictFilter>();
	for (const s of all) {
		sources.add(s.source);
		difficulties.add(s.difficulty);
		verdicts.add(s.verdict ?? 'unknown');
	}
	return {
		sources: [...sources].sort(),
		difficulties: DIFFICULTY_ORDER.filter((d) => difficulties.has(d)),
		verdicts: (['won', 'lost', 'unknown'] as StandaloneVerdictFilter[]).filter((v) => verdicts.has(v)),
	};
}

function resolveStandaloneCards(items: ListStandalone[]): Record<string, Card> {
	const codes = new Set<string>();
	for (const s of items) for (const c of s.investigatorCodes) codes.add(c);
	const resolver = createCardResolver();
	const out: Record<string, Card> = {};
	for (const code of codes) {
		try {
			out[code] = resolver.resolve(code);
		} catch {
			/* unknown code — skip */
		}
	}
	return out;
}

/** Build the `/archive/standalone` list payload (filter → sort → paginate → enrich) —
 *  the uniform shape the shared ArchiveListView consumes. */
export function standaloneListData(
	doc: DatabaseDocument,
	params: StandaloneListParams,
): StandaloneListResult {
	const all = standaloneList(doc); // newest-first, enriched
	let items = all;
	if (params.name) {
		const n = params.name.toLowerCase();
		items = items.filter(
			(s) => s.title.toLowerCase().includes(n) || s.scenarioName.toLowerCase().includes(n),
		);
	}
	if (params.sources?.length) {
		const set = new Set(params.sources);
		items = items.filter((s) => set.has(s.source));
	}
	if (params.difficulties?.length) {
		const set = new Set(params.difficulties);
		items = items.filter((s) => set.has(s.difficulty));
	}
	if (params.verdicts?.length) {
		const set = new Set(params.verdicts);
		items = items.filter((s) => set.has(s.verdict ?? 'unknown'));
	}
	const sorted = items.slice();
	if (params.sort === 'name') sorted.sort((a, b) => a.title.localeCompare(b.title));
	else if (params.sort === 'difficulty')
		sorted.sort((a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty));
	// 'date' keeps standaloneList's newest-first order.

	const totalCount = sorted.length;
	const filteredIds = sorted.map((s) => s.id);
	const start = (params.page - 1) * params.pageSize;
	const pageItems = sorted.slice(start, start + params.pageSize);
	return {
		items: pageItems,
		totalCount,
		filteredIds,
		cardsByCode: resolveStandaloneCards(pageItems),
		filterOptions: buildStandaloneFilterOptions(all),
	};
}

/** All standalone-mode plays, newest first. Separate from the campaign list. */
export function standaloneList(doc: DatabaseDocument): ListStandalone[] {
	return (doc.standalones ?? [])
		.map((s): ListStandalone => {
			const res = s.logs
				.find((l) => l.section === RESERVED.scenarioResolution && l.key === s.scenario)
				?.args.find((a) => a.type === 'string')?.value;
			return {
				id: s.id,
				title: s.title,
				scenario: s.scenario,
				scenarioName: getCampaignLog(s.campaignCode)?.en.scenarioNames?.[s.scenario] ?? s.scenario,
				source: s.source,
				catalogueCode: s.campaignCode,
				difficulty: s.difficulty,
				finishDate: s.finishDate,
				verdict: standaloneVerdict(res),
				investigatorCodes: s.decks.map((d) => d.investigator.investigatorCode),
				participantNames: s.participants.map((p) => p.name)
			};
		})
		.sort((a, b) => (b.finishDate ?? 0) - (a.finishDate ?? 0));
}
