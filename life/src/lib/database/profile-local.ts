/**
 * Builds a profile subject's payload from the local database: the account (no filter), one roster
 * member, or a play group. Built in three cacheable segments (see profile-cache.ts) that
 * `assemblePayload` recombines.
 */
import { achievementInferScope, getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CardCode, DecodedMeta, Product } from '@5argon/arkham-kohaku';
import { card as cardUtils, decodeMeta } from '@5argon/arkham-kohaku';
import {
	toRecordedState,
	scenarioXpFromLogs,
	scenarioChoicesFromLogs,
	scenarioResolutionsFromLogs,
	scenarioSkippedFromLogs,
	nameChoicesFromLogs,
	standalonesFromLogs,
	scenarioSequence,
	scenarioTiersFromLogs,
	scarletKeyBearersFromLogs,
	erasedFromExistenceFromLogs,
	possessedInvestigatorsFromLogs,
	type LocalLog,
	manualTickKey
} from '$lib/campaign/records/recorded-state';
import {
	aggregateOfficialTiered,
	type ProfileFamily
} from '$lib/campaign/achievements/achievement-aggregate';
import type { CampaignRecord } from '$lib/campaign/records/campaign-record';
import {
	buildFullClearGrid,
	buildWinLossRecord,
	buildEndings,
	playClearState
} from '$lib/campaign/outcomes/clear-status';
import { filterTrackedRecords, groupTracked, tierTracked } from '$lib/campaign/records/tracking';
import { buildCollections } from '$lib/campaign/stats/collections';
import { buildScenarioStats } from '$lib/campaign/stats/scenario-stats';
import { buildStandaloneUsage } from '$lib/campaign/outcomes/standalone-usage';
import { buildStandaloneArchives } from '$lib/campaign/outcomes/standalone-archives';
import { buildTraumaTally, attributeTraumaInvestigators } from '$lib/campaign/outcomes/trauma';
import { buildBespoke } from '$lib/campaign/campaigns/registry';
import { isCoreOnlyCampaign } from '$lib/campaign/utils/deck-purity';
import { familyOf } from '$lib/campaign/records/campaign-family';
import { applyTskTierResolutionInference } from '$lib/campaign/campaigns/tsk/rules';
import {
	buildSpecialInteractions,
	resolveSpecialInteractions,
	type CardLookup
} from '$lib/campaign/outcomes/special-interactions';
import { cardsByCode, createCardResolver, getAllCards } from '$lib/card-data';
import {
	buildCoverage,
	evaluateCustomAchievements
} from '$lib/campaign/achievements/custom-achievements';
import {
	resolveProfileSettings,
	type CampaignGroup,
	type DifficultyTier,
	type ProfileSettings
} from '$lib/campaign/profile/profile-settings';
import {
	accessorySlotCodeSet,
	allySlotCodeSet,
	canonInvestigatorCode,
	charismaRelicCards,
	coreCantripCards,
	customizableOptionXp,
	foldCanonUsage,
	insightTrackedCodeSet,
	specialistCodeSet,
	viciousBlowDeductionEligibility
} from '$lib/campaign/utils/card-filters';
import type {
	CalendarEntry,
	InvestigatorStat,
	ProfileAchievementsData,
	CustomizableUsage,
	DeckTopEntry,
	EligibilityInsight,
	InsightDeck,
	ProfileCampaign,
	ProfilePayload,
	MetaSegment,
	LogsSegment,
	CardsSegment,
	ProfileSubject,
	ProfileSummary,
	UsedOnceEntry,
	UsedOnceMap
} from '$lib/profile/profile-types';
import {
	allRecords,
	findPlayer,
	findPlayGroup,
	resolvePlayerCount,
	type CampaignRecord as DocCampaign,
	type DatabaseDocument,
	type DeckRecord
} from './document';
import { ACCOUNT_SUBJECT } from './profile-cache';

/** The ArkhamDB deck JSON fields read here. */
interface AhdbSlots {
	slots?: Record<string, number>;
	ignoreDeckLimitSlots?: Record<string, number>;
	meta?: string;
}

/** The one deck behind a card used exactly once. */
type UsedOnceContext = Pick<UsedOnceEntry, 'investigator' | 'campaignId'>;

/** Strips HTML emphasis and card links but keeps `[token]` icon markers (rendered as glyphs).
 *  The compiled-profile hydrator re-cleans achievement text with it. */
export function cleanText(t: string): string {
	return t
		.replace(/<\/?[ib]>/g, '')
		.replace(/\[\[([^\]]+)\]\]/g, '$1')
		.replace(/#name#/g, 'them')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Investigator version label (faction/size/option selections). */
function optionSignature(inv: {
	factionSelected: string | null;
	faction1: string | null;
	faction2: string | null;
	optionSelected: string | null;
	deckSizeSelected: number | null;
}): string {
	const parts: string[] = [];
	if (inv.factionSelected) parts.push(inv.factionSelected);
	if (inv.faction1 && inv.faction2) parts.push(`${inv.faction1}/${inv.faction2}`);
	if (inv.optionSelected) parts.push(inv.optionSelected);
	if (inv.deckSizeSelected) parts.push(`${inv.deckSizeSelected} cards`);
	return parts.join(' · ');
}

// ─── Subject resolution + filtering ──────────────────────────────────────────

/** The uids a subject key covers: `null` for the whole account, empty for an unknown key. */
export function subjectUids(doc: DatabaseDocument, key: string): Set<string> | null {
	if (key === ACCOUNT_SUBJECT) return null;
	if (doc.owner.uid === key || doc.players.some((p) => p.uid === key)) return new Set([key]);
	const group = findPlayGroup(doc, key);
	if (group) return new Set(group.memberUids);
	return new Set();
}

/** Who a payload is about plus the settings that decide which plays count. */
interface ProfileScope {
	uids: Set<string> | null;
	ownedProducts: Product[] | null;
	trackedTiers: DifficultyTier[];
	trackedGroups: CampaignGroup[];
	defaultViz: 'visible' | 'hidden';
	mergeReturnTo: boolean;
	/** Only while merging, so hiding a Return-to box never orphans its plays. */
	hideReturnTo: boolean;
}

function profileScope(doc: DatabaseDocument, key: string): ProfileScope {
	const settings = resolveProfileSettings(doc.profileSettings);
	const mergeReturnTo = settings.mergeReturnToStats !== false;
	return {
		uids: subjectUids(doc, key),
		ownedProducts: settings.ownedProducts,
		trackedTiers: settings.trackedTiers,
		trackedGroups: settings.trackedCampaignGroups,
		defaultViz: settings.defaultArchiveDisplayInProfile,
		mergeReturnTo,
		hideReturnTo: mergeReturnTo && settings.hideReturnToCampaigns === true
	};
}

function campaignInSubject(c: DocCampaign, uids: Set<string> | null): boolean {
	return uids === null || c.participants.some((p) => uids.has(p.uid));
}

function deckInSubject(ownerUid: string | null, uids: Set<string> | null): boolean {
	return uids === null || (ownerUid !== null && uids.has(ownerUid));
}

// ─── Record hydration ────────────────────────────────────────────────────────

function toLocalLogs(c: DocCampaign): LocalLog[] {
	return c.logs.map((e, i) => ({
		clientId: `${c.id}:${i}`,
		key: e.key,
		section: e.section,
		args: e.args.map((a) => ({ type: a.type, value: a.value }))
	}));
}

/** Distinct investigator codes the subject ran in a campaign (its in-subject decks). */
function subjectInvestigators(c: DocCampaign, uids: Set<string> | null): CardCode[] {
	const codes = new Set<CardCode>();
	for (const deck of c.decks) {
		if (deckInSubject(deck.ownerUid, uids))
			codes.add(deck.investigator.investigatorCode as CardCode);
	}
	return [...codes];
}

function recordFor(
	c: DocCampaign,
	log: NonNullable<ReturnType<typeof getCampaignLog>>,
	uids: Set<string> | null
): CampaignRecord {
	const localLogs = toLocalLogs(c);
	// Cross-fill TSK tier ⇄ resolution implications (Dead Heat's 25+ time tier ⇔ R5).
	const { resolutions: scenarioResolutions, tiers: scenarioTiers } =
		applyTskTierResolutionInference(
			scenarioResolutionsFromLogs(localLogs),
			scenarioTiersFromLogs(localLogs)
		);
	return {
		campaignCode: c.campaignCode,
		campaignId: c.id,
		recorded: toRecordedState(log, localLogs, { difficulty: c.difficulty }),
		manual: new Set(
			c.manualAchievements.map((a) =>
				manualTickKey(a.achievementId, a.itemId)
			)
		),
		scenarioXp: scenarioXpFromLogs(localLogs),
		scenarioChoices: scenarioChoicesFromLogs(localLogs),
		scenarioResolutions,
		scenarioSkipped: scenarioSkippedFromLogs(localLogs),
		nameChoices: nameChoicesFromLogs(log, localLogs),
		standalones: standalonesFromLogs(localLogs),
		route: scenarioSequence(log, localLogs),
		scenarioTiers,
		scarletKeyBearers: scarletKeyBearersFromLogs(log, localLogs),
		erasedCards: erasedFromExistenceFromLogs(localLogs),
		possessedInvestigators: possessedInvestigatorsFromLogs(localLogs),
		subjectInvestigators: subjectInvestigators(c, uids),
		coreOnly: isCoreOnlyCampaign(c.decks.filter((d) => deckInSubject(d.ownerUid, uids))),
		finishDate: c.finishDate ?? null,
		playerCount: resolvePlayerCount(c.playerCount, c.participants.length),
		multiHanded: c.multiHanded,
		linked: new Set((c.linkedLog ?? []).map((e) => e.key))
	};
}

/** The subject's campaigns with a known campaign-data log. */
function subjectRecords(doc: DatabaseDocument, uids: Set<string> | null): CampaignRecord[] {
	const records: CampaignRecord[] = [];
	for (const c of doc.campaigns) {
		if (!campaignInSubject(c, uids)) continue;
		const log = getCampaignLog(c.campaignCode);
		if (!log) continue;
		records.push(recordFor(c, log, uids));
	}
	return records;
}

/** Build achievements data (families / custom / coverage). */
function buildAchievementsData(records: CampaignRecord[]): ProfileAchievementsData {
	const byFamily = aggregateOfficialTiered(records);
	const families: ProfileFamily[] = [...byFamily.entries()]
		.map(([family, list]) => ({
			family,
			name: getCampaignLog(family)?.db.name ?? family,
			earned: list.filter((e) => e.earned).length,
			total: list.length,
			achievements: list.map((e) => ({
				id: e.def.id,
				title: e.en.title,
				text: cleanText(e.en.text),
				earned: e.earned,
				inferred: achievementInferScope(e.def) !== 'manual',
				earnCount: e.earnCount,
				earnedTiers: e.earnedTiers,
				// List achievements ("There and Back Again"): each item's lifetime state.
				...(e.items && e.def.items
					? {
							items: e.def.items.map((id) => ({
								id,
								label: e.en.items?.[id] ?? id,
								earned: e.items![id] === true
							}))
						}
					: {})
			}))
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
	return {
		families,
		custom: evaluateCustomAchievements(records),
		coverage: buildCoverage(records)
	};
}

// ─── Segment builders ────────────────────────────────────────────────────────

/** Whether the campaign itself is listed (calendar, campaigns played); its stats count either way. */
function archiveVisible(c: DocCampaign, defaultViz: 'visible' | 'hidden'): boolean {
	const v = c.displayInProfile ?? 'default';
	return v === 'default' ? defaultViz === 'visible' : v === 'visible';
}

/** The listed campaigns (drafts included) and the chronological calendar. */
function buildMetaSegment(doc: DatabaseDocument, scope: ProfileScope): MetaSegment {
	const { uids, defaultViz, trackedTiers, trackedGroups } = scope;
	const campaigns: ProfileCampaign[] = doc.campaigns
		.filter(
			(c) =>
				c.campaignCode &&
				getCampaignLog(c.campaignCode) &&
				campaignInSubject(c, uids) &&
				archiveVisible(c, defaultViz) &&
				tierTracked(c.difficulty ?? 'standard', trackedTiers) &&
				groupTracked(c.campaignCode, trackedGroups)
		)
		.map((c) => ({
			id: c.id,
			title: c.title,
			campaignCode: c.campaignCode,
			difficulty: c.difficulty,
			playerCount: resolvePlayerCount(c.playerCount, c.participants.length),
			finishDate: c.finishDate,
			startDate: c.startDate,
			draft: c.draft
		}));

	const calendar: CalendarEntry[] = [];
	for (const c of doc.campaigns) {
		const log = getCampaignLog(c.campaignCode);
		if (
			!log ||
			c.draft ||
			!campaignInSubject(c, uids) ||
			!archiveVisible(c, defaultViz) ||
			!tierTracked(c.difficulty ?? 'standard', trackedTiers) ||
			!groupTracked(c.campaignCode, trackedGroups)
		)
			continue;
		const localLogs = toLocalLogs(c);
		const recorded = toRecordedState(log, localLogs, { difficulty: c.difficulty });
		const finish = c.finishDate ?? null;
		const start = c.startDate ?? null;
		calendar.push({
			campaignId: c.id,
			title: c.title,
			campaignCode: c.campaignCode,
			family: familyOf(log),
			difficulty: c.difficulty,
			date: finish ?? start,
			dateKind: finish !== null ? 'finish' : start !== null ? 'start' : null,
			state: playClearState(log, recorded, scenarioChoicesFromLogs(localLogs))
		});
	}
	calendar.sort((a, b) => (a.date ?? Infinity) - (b.date ?? Infinity));

	return { campaigns, calendar };
}

function buildLogsSegment(doc: DatabaseDocument, scope: ProfileScope): LogsSegment {
	const { ownedProducts, trackedGroups, mergeReturnTo, hideReturnTo } = scope;
	const records = filterTrackedRecords(
		subjectRecords(doc, scope.uids),
		scope.trackedTiers,
		trackedGroups
	);
	const soloRecords = records.filter((r) => r.playerCount === 1);
	const trueSoloRecords = soloRecords.filter((r) => !r.multiHanded);
	const clearGrid = (recs: CampaignRecord[]) =>
		buildFullClearGrid(recs, ownedProducts, trackedGroups, mergeReturnTo, hideReturnTo);
	return {
		achievements: records.length
			? buildAchievementsData(records)
			: { families: [], custom: [], coverage: [] },
		clearGrid: clearGrid(records),
		soloClearGrid: clearGrid(soloRecords),
		trueSoloClearGrid: clearGrid(trueSoloRecords),
		winLossRecord: buildWinLossRecord(records, mergeReturnTo, hideReturnTo),
		endings: buildEndings(records, mergeReturnTo),
		collections: buildCollections(records, mergeReturnTo),
		scenarios: buildScenarioStats(records, mergeReturnTo),
		standaloneUsage: buildStandaloneUsage(records, mergeReturnTo),
		// Standalone archives are not tier/group filtered.
		standalones: buildStandaloneArchives(
			doc.standalones.filter((s) => campaignInSubject(s, scope.uids)),
			new Map(getAllCards().map((c) => [c.code, c.xp ?? 0]))
		),
		traumaTally: buildTraumaTally(records, mergeReturnTo),
		bespoke: buildBespoke(records, { mergeReturnTo }),
		specialInteractions: buildSpecialInteractions(records, mergeReturnTo)
	};
}

/** Investigator code → classes/traits, for special-interaction roster matching. */
let cardLookupCache: CardLookup | null = null;
function cardClassTraitLookup(): CardLookup {
	if (!cardLookupCache) {
		const byCode = new Map<string, { factions: string[]; traits: string[] }>();
		for (const c of getAllCards()) {
			const factions: string[] = [];
			if (c.cardClass?.class1) factions.push(String(c.cardClass.class1));
			if (c.cardClass?.class2) factions.push(String(c.cardClass.class2));
			byCode.set(c.code, { factions, traits: c.traits ?? [] });
		}
		cardLookupCache = (code) => byCode.get(code);
	}
	return cardLookupCache;
}

/** One deck version's in-play entries: main slots, then ignore-deck-limit slots (never side). */
interface VersionSlots {
	sequenceIndex: number;
	entries: [CardCode, number][];
	/** ArkhamDB deck meta, a JSON string of `{ cus_<code>: "optIdx|checked,…" }`. */
	meta?: string;
}

/** Each version parsed once; unparsable versions are skipped. */
function parseVersions(deck: DeckRecord): VersionSlots[] {
	const out: VersionSlots[] = [];
	for (const v of deck.versions) {
		let ahdb: AhdbSlots;
		try {
			ahdb = JSON.parse(v.ahdbJson) as AhdbSlots;
		} catch {
			continue;
		}
		out.push({
			sequenceIndex: v.sequenceIndex,
			entries: [
				...Object.entries(ahdb.slots ?? {}),
				...Object.entries(ahdb.ignoreDeckLimitSlots ?? {})
			],
			meta: ahdb.meta
		});
	}
	return out;
}

/** What a deck chain put in play across all its versions. */
interface ChainFootprint {
	inPlay: Set<CardCode>;
	/** The highest-`sequenceIndex` version's codes. */
	finalCodes: Set<CardCode>;
	/** Max copies of each spotlight-tracked card in any version. */
	insightSlots: Record<CardCode, number>;
	/** Most distinct core cantrips in a single version. */
	cantripMax: number;
	/** The last version's deck meta (faction selections etc.). */
	meta: string | undefined;
}

function chainFootprint(
	versions: VersionSlots[],
	insightCodes: Set<CardCode>,
	cantripGroups: CardCode[][]
): ChainFootprint {
	const fp: ChainFootprint = {
		inPlay: new Set(),
		finalCodes: new Set(),
		insightSlots: {},
		cantripMax: 0,
		meta: undefined
	};
	let finalSeq = -1;
	for (const v of versions) {
		if (v.meta) fp.meta = v.meta;
		const codes = new Set<CardCode>();
		for (const [code, qty] of v.entries) {
			fp.inPlay.add(code);
			codes.add(code);
			if (insightCodes.has(code)) fp.insightSlots[code] = Math.max(fp.insightSlots[code] ?? 0, qty);
		}
		if (v.sequenceIndex >= finalSeq) {
			finalSeq = v.sequenceIndex;
			fp.finalCodes = codes;
		}
		const cantrips = cantripGroups.filter((group) => group.some((c) => codes.has(c))).length;
		fp.cantripMax = Math.max(fp.cantripMax, cantrips);
	}
	return fp;
}

/** Up to three distinct investigators kept per bucket. */
function addCapped(set: Set<CardCode>, code: CardCode): void {
	if (set.size < 3) set.add(code);
}

/**
 * Vicious Blow & Deduction: could each deck's investigator+meta include the card, did it run any
 * printing, and did its final version drop every printing (removed rather than upgraded)?
 */
function eligibilityAccumulator() {
	const cardByCode = cardsByCode();
	const resolver = createCardResolver();
	const targets = viciousBlowDeductionEligibility().map((t) => ({
		id: t.id,
		cards: t.eligibilityCodes
			.map((code) => cardByCode.get(code))
			.filter((cd): cd is NonNullable<typeof cd> => !!cd),
		usedCodes: t.usedCodes,
		canUse: 0,
		used: 0,
		usedInvestigators: new Set<CardCode>(),
		notUsed: 0,
		notUsedInvestigators: new Set<CardCode>(),
		removed: 0,
		removedInvestigators: new Set<CardCode>(),
		neverRemovedInvestigators: new Set<CardCode>()
	}));
	return {
		add(investigatorCode: CardCode, chain: ChainFootprint): void {
			const investigatorCard = cardByCode.get(investigatorCode);
			if (!targets.length || !investigatorCard) return;
			let meta: DecodedMeta = {};
			try {
				if (chain.meta) meta = decodeMeta(chain.meta, resolver);
			} catch {
				meta = {};
			}
			const inv = canonInvestigatorCode(investigatorCode);
			for (const t of targets) {
				if (!t.cards.some((cd) => cardUtils.canUse(investigatorCard, meta, cd))) continue;
				t.canUse++;
				if (!t.usedCodes.some((code) => chain.inPlay.has(code))) {
					t.notUsed++;
					addCapped(t.notUsedInvestigators, inv);
					continue;
				}
				t.used++;
				addCapped(t.usedInvestigators, inv);
				if (t.usedCodes.some((code) => chain.finalCodes.has(code))) {
					addCapped(t.neverRemovedInvestigators, inv);
				} else {
					t.removed++;
					addCapped(t.removedInvestigators, inv);
				}
			}
		},
		result(): Record<string, EligibilityInsight> {
			const out: Record<string, EligibilityInsight> = {};
			for (const t of targets) {
				out[t.id] = {
					canUse: t.canUse,
					used: t.used,
					usedInvestigators: [...t.usedInvestigators],
					notUsed: t.notUsed,
					notUsedInvestigators: [...t.notUsedInvestigators],
					removed: t.removed,
					removedInvestigators: [...t.removedInvestigators],
					neverRemovedInvestigators: [...t.neverRemovedInvestigators]
				};
			}
			return out;
		}
	};
}

/** Charisma → allies and Relic Hunter → accessories: each deck's best-slotted version. */
function spotlightAccumulator() {
	const sets = charismaRelicCards();
	const categories = [
		{
			trigger: sets.find((s) => s.name === 'Charisma')?.codes ?? [],
			slot: allySlotCodeSet(),
			top: [] as DeckTopEntry[]
		},
		{
			trigger: sets.find((s) => s.name === 'Relic Hunter')?.codes ?? [],
			slot: accessorySlotCodeSet(),
			top: [] as DeckTopEntry[]
		}
	];
	return {
		add(investigatorCode: CardCode, versions: VersionSlots[]): void {
			for (const cat of categories) {
				let best: { total: number; count: number; cards: Record<CardCode, number> } | null = null;
				for (const v of versions) {
					const qty: Record<CardCode, number> = {};
					for (const [code, n] of v.entries) qty[code] = (qty[code] ?? 0) + n;
					const count = Math.max(0, ...cat.trigger.map((c) => qty[c] ?? 0));
					if (count < 1) continue;
					let total = 0;
					const cards: Record<CardCode, number> = {};
					for (const [code, n] of Object.entries(qty)) {
						if (!cat.slot.has(code)) continue;
						cards[code] = n;
						total += n;
					}
					if (!best || total > best.total) best = { total, count, cards };
				}
				if (best) {
					cat.top.push({
						inv: investigatorCode,
						count: best.count,
						total: best.total,
						cards: Object.entries(best.cards).map(([code, qty]) => ({ code, qty }))
					});
				}
			}
		},
		charismaTopDecks: categories[0].top,
		relicTopDecks: categories[1].top
	};
}

/**
 * Customizable cards: each deck's max-ticked state per card (level 0 when included but never
 * customized), and per option its activation count plus the three most recent investigators.
 */
function customizableAccumulator() {
	const optionXp = customizableOptionXp();
	const usage: CustomizableUsage = {};
	/** `${code}#${optionIndex}` → each activation's investigator and campaign date. */
	const events = new Map<string, { inv: CardCode; date: number }[]>();
	return {
		add(
			investigatorCode: CardCode,
			versions: VersionSlots[],
			inPlay: Set<CardCode>,
			date: number
		): void {
			const maxTicked = new Map<CardCode, { total: number; opts: Record<number, number> }>();
			for (const v of versions) {
				let meta: Record<string, unknown> | null = null;
				try {
					meta = v.meta ? (JSON.parse(v.meta) as Record<string, unknown>) : null;
				} catch {
					meta = null;
				}
				for (const [key, value] of Object.entries(meta ?? {})) {
					if (!key.startsWith('cus_') || typeof value !== 'string') continue;
					const code = key.slice(4);
					if (!optionXp[code]) continue;
					const opts: Record<number, number> = {};
					let total = 0;
					for (const seg of value.split(',')) {
						const [idx, checked] = seg.split('|').map((x) => parseInt(x, 10));
						if (Number.isFinite(idx) && Number.isFinite(checked) && checked > 0) {
							opts[idx] = checked;
							total += checked;
						}
					}
					const prev = maxTicked.get(code);
					if (!prev || total > prev.total) maxTicked.set(code, { total, opts });
				}
			}
			for (const code of inPlay) {
				const xp = optionXp[code];
				if (!xp) continue;
				const u = (usage[code] ??= { levels: {}, options: {} });
				const ticked = maxTicked.get(code);
				const level = ticked ? Math.ceil(ticked.total / 2) : 0;
				u.levels[level] = (u.levels[level] ?? 0) + 1;
				for (const [idx, checked] of Object.entries(ticked?.opts ?? {})) {
					if (checked < (xp[Number(idx)] ?? Infinity)) continue;
					const key = `${code}#${idx}`;
					const list = events.get(key) ?? [];
					list.push({ inv: investigatorCode, date });
					events.set(key, list);
				}
			}
		},
		result(): CustomizableUsage {
			for (const [key, list] of events) {
				const hash = key.indexOf('#');
				const u = usage[key.slice(0, hash)];
				if (!u) continue;
				list.sort((a, b) => b.date - a.date);
				const recent = [...new Set(list.map((e) => e.inv))].slice(0, 3);
				u.options[key.slice(hash + 1)] = { count: list.length, recent };
			}
			return usage;
		}
	};
}

/** Player-card usage and investigator stats from the subject's non-draft decks. */
function buildCardsSegment(doc: DatabaseDocument, uids: Set<string> | null): CardsSegment {
	const cardUsage: Record<CardCode, number> = {};
	const playedInPlay = new Set<CardCode>();
	const invMap = new Map<CardCode, { count: number; options: Set<string> }>();
	const investigatorsByCampaign: Record<string, CardCode[]> = {};
	/** The last deck that counted each code; kept only where the final count is 1. */
	const lastCtx = new Map<CardCode, UsedOnceContext>();
	const specialistCodes = specialistCodeSet();
	const specialistInv = new Map<CardCode, Set<CardCode>>();
	const insightCodes = insightTrackedCodeSet();
	const cantripGroups = coreCantripCards().map((s) => s.codes);
	const insightDecks: InsightDeck[] = [];
	const eligibility = eligibilityAccumulator();
	const spotlight = spotlightAccumulator();
	const customizable = customizableAccumulator();
	let totalDecks = 0;

	// A card played is a card played: standalone decks count too. A used-once context that
	// lands on a standalone is dropped at assembly.
	for (const c of allRecords(doc)) {
		if (c.draft || !campaignInSubject(c, uids)) continue;
		const campaignInvs = subjectInvestigators(c, uids);
		if (campaignInvs.length) investigatorsByCampaign[c.id] = campaignInvs;
		for (const deck of c.decks) {
			if (!deckInSubject(deck.ownerUid, uids)) continue;
			totalDecks++;
			const inv = deck.investigator.investigatorCode;
			const versions = parseVersions(deck);
			const chain = chainFootprint(versions, insightCodes, cantripGroups);
			if (Object.keys(chain.insightSlots).length) {
				insightDecks.push({ inv, slots: chain.insightSlots, cantripMax: chain.cantripMax });
			}
			for (const code of chain.inPlay) {
				playedInPlay.add(code);
				cardUsage[code] = (cardUsage[code] ?? 0) + 1;
				lastCtx.set(code, { investigator: inv, campaignId: c.id });
				if (specialistCodes.has(code)) {
					const users = specialistInv.get(code) ?? new Set<CardCode>();
					users.add(inv);
					specialistInv.set(code, users);
				}
			}
			eligibility.add(inv, chain);
			spotlight.add(inv, versions);
			customizable.add(inv, versions, chain.inPlay, c.finishDate ?? c.startDate ?? 0);

			const stat = invMap.get(inv) ?? { count: 0, options: new Set<string>() };
			stat.count++;
			const sig = optionSignature(deck.investigator);
			if (sig) stat.options.add(sig);
			invMap.set(inv, stat);
		}
	}

	const investigators: InvestigatorStat[] = [...invMap.entries()]
		.map(([code, e]) => ({ code, count: e.count, options: [...e.options].sort() }))
		.sort((a, b) => b.count - a.count);
	const usedOnceRaw: Record<CardCode, UsedOnceContext> = {};
	for (const [code, ctx] of lastCtx) if (cardUsage[code] === 1) usedOnceRaw[code] = ctx;
	const specialistUsage: Record<CardCode, CardCode[]> = {};
	for (const [code, users] of specialistInv) specialistUsage[code] = [...users].sort();
	return {
		cardUsage,
		investigators,
		playedCardCodes: [...playedInPlay],
		investigatorsByCampaign,
		usedOnceRaw,
		specialistUsage,
		insightDecks,
		eligibilityInsights: eligibility.result(),
		totalDecks,
		charismaTopDecks: spotlight.charismaTopDecks,
		relicTopDecks: spotlight.relicTopDecks,
		customizableUsage: customizable.result()
	};
}

// ─── Signatures (cheap change-detection for the cache) ────────────────────────

/** FNV-1a 32-bit, base36. */
function hashString(s: string): string {
	let h = 0x811c9dc5;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return (h >>> 0).toString(36);
}

function logsToken(c: DocCampaign): string {
	return c.logs
		.map((e) => `${e.key}|${e.section}|${e.args.map((a) => `${a.type}:${a.value}`).join('~')}`)
		.join(';');
}

function metaSig(doc: DatabaseDocument, scope: ProfileScope): string {
	const { uids, defaultViz, trackedTiers, trackedGroups } = scope;
	const parts: string[] = [
		defaultViz,
		[...trackedTiers].sort().join(','),
		[...trackedGroups].sort().join(',')
	];
	for (const c of doc.campaigns) {
		if (!c.campaignCode || !getCampaignLog(c.campaignCode) || !campaignInSubject(c, uids)) continue;
		const pids = c.participants
			.map((p) => p.uid)
			.sort()
			.join(',');
		parts.push(
			[
				c.id,
				c.title,
				c.difficulty,
				c.campaignCode,
				c.startDate,
				c.finishDate,
				c.draft,
				c.displayInProfile ?? 'default',
				c.playerCount ?? 'auto',
				pids,
				logsToken(c)
			].join('§')
		);
	}
	return hashString(parts.join('¶'));
}

function logsSig(doc: DatabaseDocument, scope: ProfileScope): string {
	const { uids, ownedProducts, trackedGroups, trackedTiers, mergeReturnTo, hideReturnTo } = scope;
	const parts: string[] = [
		ownedProducts === null ? 'ALL' : [...ownedProducts].sort().join(','),
		[...trackedGroups].sort().join(','),
		[...trackedTiers].sort().join(','),
		`merge:${mergeReturnTo ? 1 : 0}:${hideReturnTo ? 1 : 0}`
	];
	for (const c of doc.campaigns) {
		if (!c.campaignCode || !getCampaignLog(c.campaignCode) || !campaignInSubject(c, uids)) continue;
		const manual = c.manualAchievements
			.map((a) => `${a.achievementId}/${a.itemId ?? ''}`)
			.sort()
			.join(',');
		// Everything `recordFor` reads.
		const linked = (c.linkedLog ?? [])
			.map((e) => e.key)
			.sort()
			.join(',');
		const decks = c.decks
			.map((d) => `${d.ownerUid ?? ''}:${d.investigator.investigatorCode}`)
			.join(',');
		parts.push(
			[
				c.id,
				c.campaignCode,
				c.difficulty,
				c.playerCount ?? 'auto',
				c.multiHanded ?? false,
				c.finishDate ?? '',
				linked,
				decks,
				logsToken(c),
				manual
			].join('§')
		);
	}
	// The standalone aggregate reads their logs and decks (XP-range tier).
	for (const s of doc.standalones) {
		if (!campaignInSubject(s, uids)) continue;
		const decks = s.decks.map((d) => d.versions.map((v) => v.ahdbJson).join('~')).join('|');
		parts.push(
			['SA', s.id, s.scenario, s.campaignCode, s.difficulty, logsToken(s), decks].join('§')
		);
	}
	return hashString(parts.join('¶'));
}

function cardsSig(doc: DatabaseDocument, uids: Set<string> | null): string {
	const parts: string[] = [];
	for (const c of allRecords(doc)) {
		if (c.draft || !campaignInSubject(c, uids)) continue;
		for (const d of c.decks) {
			if (!deckInSubject(d.ownerUid, uids)) continue;
			const inv = d.investigator;
			const versions = d.versions.map((v) => `${v.sequenceIndex}:${v.ahdbJson}`).join('~');
			parts.push(
				[
					c.id,
					d.id,
					d.ownerUid ?? '',
					inv.investigatorCode,
					inv.factionSelected ?? '',
					inv.faction1 ?? '',
					inv.faction2 ?? '',
					inv.optionSelected ?? '',
					inv.deckSizeSelected ?? '',
					versions
				].join('§')
			);
		}
	}
	return hashString(parts.join('¶'));
}

/** The three segment signatures for a subject; an unchanged signature skips the rebuild. */
export function segmentSignatures(
	doc: DatabaseDocument,
	key: string
): { meta: string; logs: string; cards: string } {
	const scope = profileScope(doc, key);
	return { meta: metaSig(doc, scope), logs: logsSig(doc, scope), cards: cardsSig(doc, scope.uids) };
}

export function buildMetaSegmentFor(doc: DatabaseDocument, key: string): MetaSegment {
	return buildMetaSegment(doc, profileScope(doc, key));
}

export function buildLogsSegmentFor(doc: DatabaseDocument, key: string): LogsSegment {
	return buildLogsSegment(doc, profileScope(doc, key));
}

export function buildCardsSegmentFor(doc: DatabaseDocument, key: string): CardsSegment {
	return buildCardsSegment(doc, subjectUids(doc, key));
}

// ─── Assembly ────────────────────────────────────────────────────────────────

/** A subject's display identity; cheap, so assembled fresh rather than cached. */
export function buildSubjectIdentity(doc: DatabaseDocument, key: string): ProfileSubject {
	if (key === ACCOUNT_SUBJECT) {
		return {
			kind: 'account',
			uid: ACCOUNT_SUBJECT,
			name: doc.owner.name,
			iconCardCode: doc.owner.iconCardCode,
			members: []
		};
	}
	const player = findPlayer(doc, key);
	if (player) {
		return {
			kind: 'player',
			uid: key,
			name: player.name,
			iconCardCode: player.iconCardCode,
			members: []
		};
	}
	const group = findPlayGroup(doc, key);
	if (group) {
		const members = group.memberUids.map((u) => {
			const m = findPlayer(doc, u);
			return { name: m?.name ?? '?', iconCardCode: m?.iconCardCode ?? null };
		});
		return { kind: 'group', uid: key, name: group.name, iconCardCode: null, members };
	}
	return { kind: 'unknown', uid: key, name: 'Unknown profile', iconCardCode: null, members: [] };
}

/**
 * Canon-fold the used-once candidates (a card used once via the old Core Set and once via its
 * Revised twin was not used once) and join each survivor with its campaign.
 */
function resolveUsedOnce(
	raw: Record<CardCode, UsedOnceContext>,
	cardUsage: Record<CardCode, number>,
	campaigns: ProfileCampaign[]
): UsedOnceMap {
	const canonUsage = foldCanonUsage(cardUsage);
	const byId = new Map(campaigns.map((c) => [c.id, c]));
	const out: UsedOnceMap = {};
	for (const [rawCode, ctx] of Object.entries(raw)) {
		const canon = cardUtils.coreToRcore(rawCode);
		if (canonUsage[canon] !== 1) continue;
		const camp = byId.get(ctx.campaignId);
		if (!camp) continue;
		out[canon] = {
			investigator: ctx.investigator,
			campaignId: ctx.campaignId,
			campaignCode: camp.campaignCode,
			campaignTitle: camp.title,
			difficulty: camp.difficulty,
			finishDate: camp.finishDate
		};
	}
	return out;
}

/** Lifetime headline totals; spans the logs and cards segments, so it is summed at assembly. */
function buildProfileSummary(logs: LogsSegment, cards: CardsSegment): ProfileSummary {
	const wl = logs.winLossRecord;
	const owned = logs.clearGrid.filter((r) => r.owned);
	const clearedByTier: Record<string, number> = {};
	for (const r of owned)
		for (const [tier, state] of Object.entries(r.byTier))
			if (state === 'cleared') clearedByTier[tier] = (clearedByTier[tier] ?? 0) + 1;
	return {
		totalPlays: wl.reduce((n, r) => n + r.plays, 0),
		totalWins: wl.reduce((n, r) => n + r.wins, 0),
		campaignsPlayed: wl.filter((r) => r.plays > 0).length,
		ownedCampaigns: owned.length,
		campaignsClearedAny: owned.filter((r) => Object.values(r.byTier).some((s) => s === 'cleared'))
			.length,
		campaignsClearedByTier: clearedByTier,
		achievementsEarned: logs.achievements.families.reduce((n, f) => n + f.earned, 0),
		achievementsTotal: logs.achievements.families.reduce((n, f) => n + f.total, 0),
		investigatorsPlayed: cards.investigators.length,
		cardsPlayed: cards.playedCardCodes.length,
		standalonePlays: logs.standaloneUsage.reduce((n, r) => n + r.totalPlays, 0)
	};
}

/** Recombine three cached or fresh segments into the page payload. Fields share references with
 *  the segments, so the payload is read-only. */
export function assemblePayload(
	seg: { meta: MetaSegment; logs: LogsSegment; cards: CardsSegment },
	settings: ProfileSettings,
	subject: ProfileSubject
): ProfilePayload {
	const { investigatorsByCampaign, usedOnceRaw, ...cards } = seg.cards;
	return {
		...seg.meta,
		...seg.logs,
		...cards,
		subject,
		summary: buildProfileSummary(seg.logs, seg.cards),
		traumaTally: {
			...seg.logs.traumaTally,
			perInvestigator: attributeTraumaInvestigators(
				seg.logs.traumaTally.events,
				investigatorsByCampaign
			)
		},
		specialInteractions: resolveSpecialInteractions(
			seg.logs.specialInteractions,
			investigatorsByCampaign,
			cardClassTraitLookup()
		),
		usedOnce: resolveUsedOnce(usedOnceRaw, seg.cards.cardUsage, seg.meta.campaigns),
		settings
	};
}

/** Build a subject's payload fresh, bypassing the cache. */
export function buildSubjectPayload(doc: DatabaseDocument, key: string): ProfilePayload {
	return assemblePayload(
		{
			meta: buildMetaSegmentFor(doc, key),
			logs: buildLogsSegmentFor(doc, key),
			cards: buildCardsSegmentFor(doc, key)
		},
		resolveProfileSettings(doc.profileSettings),
		buildSubjectIdentity(doc, key)
	);
}
