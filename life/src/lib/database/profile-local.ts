/**
 * profile-local.ts — builds the profile from local data, for a SUBJECT.
 *
 * A "subject" is the whole account (all campaigns/decks), a single roster member,
 * or a play group (the union of its members). It resolves to a set of uids; a
 * campaign belongs to the subject iff one of its participants is in the set, and
 * a deck counts iff its owner is in the set (the account = no filter).
 *
 * The payload is split into three independently-built/cached SEGMENTS so the
 * precompute cache can rebuild only what changed (see profile-cache.ts):
 *   - meta  : campaigns list + calendar
 *   - logs  : achievements / clear grid / win/loss record / endings / collections / xp
 *   - cards : card usage / investigators / played codes (the expensive deck scan)
 * Each segment also exposes a cheap signature of its inputs so a recompute can
 * skip unchanged segments. `assemblePayload` recombines three segments into the
 * `LocalProfilePayload` the profile pages consume (reviving ms-dates to `Date`).
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
	type LocalLog,
} from '$lib/campaign/recorded-state';
import {
	aggregateOfficialTiered,
	type CampaignRecord,
	type ProfileFamily,
} from '$lib/campaign/achievement-aggregate';
import {
	buildFullClearGrid,
	buildWinLossRecord,
	buildEndings,
	playClearState,
} from '$lib/campaign/clear-status';
import { filterTrackedRecords, groupTracked, tierTracked } from '$lib/campaign/tracking';
import { buildCollections } from '$lib/campaign/collections';
import { buildScenarioXp } from '$lib/campaign/extra-imports';
import { buildResolutionCoverage } from '$lib/campaign/resolution-coverage';
import { buildStandaloneUsage } from '$lib/campaign/standalone-usage';
import { buildTraumaTally, attributeTraumaInvestigators } from '$lib/campaign/trauma';
import { buildEoeCity } from '$lib/campaign/eoe-city';
import { buildEoe, countEoeMementosEarned } from '$lib/campaign/eoe';
import { buildTsk } from '$lib/campaign/tsk-profile';
import { applyTskTierResolutionInference } from '$lib/campaign/tsk-solver';
import {
	buildSpecialInteractions,
	resolveSpecialInteractions,
	type CardLookup,
} from '$lib/campaign/special-interactions';
import { createCardResolver, getAllCards } from '$lib/card-data';
import { buildCoverage, evaluateCustomAchievements } from '$lib/campaign/custom-achievements';
import { resolveProfileSettings, type CampaignGroup, type DifficultyTier, type ProfileSettings } from '$lib/campaign/profile-settings';
import {
	accessorySlotCodeSet,
	allySlotCodeSet,
	canonInvestigatorCode,
	charismaRelicCards,
	coreCantripCards,
	customizableOptionXp,
	insightTrackedCodeSet,
	specialistCodeSet,
	viciousBlowDeductionEligibility,
} from '$lib/campaign/card-filters';
import type {
	CalendarEntry,
	InvestigatorStat,
	ProfileAchievementsData,
	CustomizableUsage,
	DeckTopEntry,
	EligibilityInsight,
	InsightDeck,
	ProfileCampaign,
	ProfileData,
	ProfileSubject,
	ProfileSummary,
	UsedOnceMap,
} from '$lib/profile/profile-types';
import { findPlayer, findPlayGroup, resolvePlayerCount, type DatabaseDocument } from './document';
import {
	ACCOUNT_SUBJECT,
	type CardsSegmentData,
	type LogsSegmentData,
	type MetaSegmentData,
} from './profile-cache';

/** The local profile payload: ProfileData + the bits the pages also need. */
export interface LocalProfilePayload extends ProfileData {
	playedCardCodes: CardCode[];
	settings: ProfileSettings;
}

/** Context key: the profile layout computes the payload once and shares it with
 *  every nested page. `base` is the URL prefix for in-subtree links
 *  (`/p/private/<uid>` for the in-browser view of a player/group subject). */
export const LOCAL_PROFILE_KEY = Symbol('local-profile');
export interface LocalProfileContext {
	readonly payload: LocalProfilePayload | null;
	readonly base: string;
}

/** One stored campaign (the element type of `doc.campaigns`). */
type DocCampaign = DatabaseDocument['campaigns'][number];

// A minimal view of an ArkhamDB deck JSON (just the slots we read).
interface AhdbSlots {
	slots?: Record<string, number>;
	sideSlots?: Record<string, number>;
	ignoreDeckLimitSlots?: Record<string, number>;
	/** ArkhamDB deck meta — a JSON string of `{ cus_<code>: "optIdx|checked,…", … }`. */
	meta?: string;
}

// Keep `[token]` icon markers (rendered as glyphs by parseArkhamMarkup at display —
// e.g. Trust Nobody's [elder_thing]); only strip HTML emphasis + unwrap card links.
function cleanText(t: string): string {
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

/**
 * Resolve a subject key to the set of uids whose data it covers, or `null` for
 * the whole account (no filter). Unknown keys resolve to an empty set (no data).
 */
export function subjectUids(doc: DatabaseDocument, key: string): Set<string> | null {
	if (key === ACCOUNT_SUBJECT) return null;
	if (doc.owner.uid === key || doc.players.some((p) => p.uid === key)) return new Set([key]);
	const group = findPlayGroup(doc, key);
	if (group) return new Set(group.memberUids);
	return new Set();
}

/** Whether a campaign belongs to the subject (account = always). */
function campaignInSubject(c: DocCampaign, uids: Set<string> | null): boolean {
	return uids === null || c.participants.some((p) => uids.has(p.uid));
}

/** Whether a deck counts for the subject (account = always; else owner ∈ subject). */
function deckInSubject(ownerUid: string | null, uids: Set<string> | null): boolean {
	return uids === null || (ownerUid !== null && uids.has(ownerUid));
}

// ─── Record hydration ────────────────────────────────────────────────────────

function toLocalLogs(c: DocCampaign): LocalLog[] {
	// CampaignLogEntry.args is already the LocalLog arg shape; just add a clientId.
	return c.logs.map((e, i) => ({
		clientId: `${c.id}:${i}`,
		key: e.key,
		section: e.section,
		args: e.args.map((a) => ({ type: a.type, value: a.value })),
	}));
}

/** Distinct investigator codes the subject ran in a campaign (its in-subject decks). */
function subjectInvestigators(c: DocCampaign, uids: Set<string> | null): CardCode[] {
	const codes = new Set<CardCode>();
	for (const deck of c.decks) {
		if (deckInSubject(deck.ownerUid, uids)) codes.add(deck.investigator.investigatorCode as CardCode);
	}
	return [...codes];
}

function recordFor(
	c: DocCampaign,
	log: NonNullable<ReturnType<typeof getCampaignLog>>,
	uids: Set<string> | null,
): CampaignRecord {
	const localLogs = toLocalLogs(c);
	// Cross-fill recorded tier ⇄ resolution implications (e.g. Dead Heat's 25+ time
	// tier ⇔ R5) before both feed the downstream aggregates, so they stay consistent.
	const { resolutions: scenarioResolutions, tiers: scenarioTiers } = applyTskTierResolutionInference(
		scenarioResolutionsFromLogs(localLogs),
		scenarioTiersFromLogs(localLogs),
	);
	return {
		campaignCode: c.campaignCode,
		campaignId: c.id,
		recorded: toRecordedState(log, localLogs, { difficulty: c.difficulty }),
		manual: new Set(
			c.manualAchievements.map((a) => (a.itemId ? `${a.achievementId}::${a.itemId}` : a.achievementId)),
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
		subjectInvestigators: subjectInvestigators(c, uids),
		finishDate: c.finishDate ?? null,
		playerCount: resolvePlayerCount(c.playerCount, c.participants.length),
		multiHanded: c.multiHanded,
	};
}

/** `CampaignRecord[]` for the subject's real (known-code) campaigns. */
function subjectRecords(doc: DatabaseDocument, uids: Set<string> | null): CampaignRecord[] {
	const records: CampaignRecord[] = [];
	for (const c of doc.campaigns) {
		if (!campaignInSubject(c, uids)) continue;
		const log = getCampaignLog(c.campaignCode);
		if (!log) continue; // draft / unknown code → skip
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
				// List achievements (e.g. "There and Back Again"): each item with its
				// lifetime earned state, in the def's declared order.
				...(e.items && e.def.items
					? {
							items: e.def.items.map((id) => ({
								id,
								label: e.en.items?.[id] ?? id,
								earned: e.items![id] === true,
							})),
						}
					: {}),
			})),
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
	return { families, custom: evaluateCustomAchievements(records), coverage: buildCoverage(records) };
}

// ─── Segment builders ────────────────────────────────────────────────────────

/** Whether a campaign's EXISTENCE shows on the profile (calendar + campaigns-played),
 *  resolving `'default'` against the account-wide default. Stats always aggregate
 *  regardless — this gates only the named-campaign widgets, keeping the compiled
 *  profile lean and letting players hide specific archives. */
function archiveVisible(c: DocCampaign, defaultViz: 'visible' | 'hidden'): boolean {
	const v = c.displayInProfile ?? 'default';
	return v === 'default' ? defaultViz === 'visible' : v === 'visible';
}

/** meta: campaigns list (known code, incl. draft) + chronological calendar. */
function buildMetaSegment(
	doc: DatabaseDocument,
	uids: Set<string> | null,
	defaultViz: 'visible' | 'hidden',
	trackedTiers: DifficultyTier[],
	trackedGroups: CampaignGroup[],
): MetaSegmentData {
	const campaigns: ProfileCampaign[] = doc.campaigns
		.filter(
			(c) =>
				c.campaignCode &&
				getCampaignLog(c.campaignCode) &&
				campaignInSubject(c, uids) &&
				archiveVisible(c, defaultViz) &&
				tierTracked(c.difficulty ?? 'standard', trackedTiers) &&
				groupTracked(c.campaignCode, trackedGroups),
		)
		.map((c) => ({
			id: c.id,
			title: c.title,
			campaignCode: c.campaignCode,
			difficulty: c.difficulty,
			// Resolve 'auto' here: the cache can't see the campaign's participants later.
			playerCount: resolvePlayerCount(c.playerCount, c.participants.length),
			finishDate: c.finishDate,
			startDate: c.startDate,
			draft: c.draft,
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
		const recorded = toRecordedState(log, toLocalLogs(c), { difficulty: c.difficulty });
		const finish = c.finishDate ?? null;
		const start = c.startDate ?? null;
		calendar.push({
			campaignId: c.id,
			title: c.title,
			campaignCode: c.campaignCode,
			family: log.db.originalId ?? log.db.code,
			difficulty: c.difficulty,
			date: finish ?? start,
			dateKind: finish !== null ? 'finish' : start !== null ? 'start' : null,
			state: playClearState(log, recorded),
		});
	}
	calendar.sort((a, b) => (a.date ?? Infinity) - (b.date ?? Infinity));

	return { campaigns, calendar };
}

/** logs: lifetime aggregates derived from recorded logs + manual ticks. */
function buildLogsSegment(
	doc: DatabaseDocument,
	uids: Set<string> | null,
	ownedProducts: Product[] | null,
	trackedCampaignGroups: CampaignGroup[],
	trackedTiers: DifficultyTier[],
): LogsSegmentData {
	// The single "which plays count" gate: every aggregate below inherits it (totals AND
	// per-difficulty breakdowns), so no widget needs to know about tier/group tracking.
	const records = filterTrackedRecords(subjectRecords(doc, uids), trackedTiers, trackedCampaignGroups);
	// Solo clear grids: same per-family×tier grid as the main one, but folding in only
	// 1-player plays — every solo play for "Solo Campaign Clears", and only the true-solo
	// (not multi-handed) subset for "True Solo Campaign Clears".
	const soloRecords = records.filter((r) => r.playerCount === 1);
	const trueSoloRecords = soloRecords.filter((r) => !r.multiHanded);
	return {
		achievements: records.length
			? buildAchievementsData(records)
			: { families: [], custom: [], coverage: [] },
		clearGrid: buildFullClearGrid(records, ownedProducts, trackedCampaignGroups),
		soloClearGrid: buildFullClearGrid(soloRecords, ownedProducts, trackedCampaignGroups),
		trueSoloClearGrid: buildFullClearGrid(trueSoloRecords, ownedProducts, trackedCampaignGroups),
		winLossRecord: buildWinLossRecord(records),
		endings: buildEndings(records),
		collections: buildCollections(records),
		scenarioXp: buildScenarioXp(records),
		resolutionCoverage: buildResolutionCoverage(records),
		standaloneUsage: buildStandaloneUsage(records),
		traumaTally: buildTraumaTally(records),
		eoeCity: buildEoeCity(records),
		eoe: buildEoe(records),
		tsk: buildTsk(records),
		specialInteractions: buildSpecialInteractions(records),
	};
}

/** Memoized investigator-code → class/traits lookup for special-interaction roster
 *  matching (built once from the bundled card data). */
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

/** cards: player-card usage + investigator stats from the subject's decks
 *  (contributing, non-draft campaigns; in-play = main + ignore-limit, never side). */
function buildCardsSegment(doc: DatabaseDocument, uids: Set<string> | null): CardsSegmentData {
	const cardUsage: Record<CardCode, number> = {};
	const playedInPlay = new Set<CardCode>();
	const invMap = new Map<CardCode, { count: number; options: Set<string> }>();
	// Per-campaign investigator codes — the join target for per-investigator trauma
	// attribution at assembly time (deck-derived, so it belongs in this segment).
	const investigatorsByCampaign: Record<string, CardCode[]> = {};
	// The deck context (investigator + campaign) the LAST time we counted each code.
	// Kept only for codes whose final count is 1 (used in exactly one deck) → usedOnceRaw.
	const lastCtx = new Map<CardCode, { investigator: CardCode; campaignId: string }>();
	// Specialist (trait-restricted) card code → the distinct investigators whose decks used it.
	const specialistCodes = specialistCodeSet();
	const specialistInv = new Map<CardCode, Set<CardCode>>();
	// Per-deck spotlight-card quantities for the neutral-card insight widgets.
	const insightCodes = insightTrackedCodeSet();
	const insightDecks: InsightDeck[] = [];
	// The four core neutral cantrips, each as its set of printing codes — for the per-version
	// "most distinct cantrips at once" count (the diversity rows need single-version, not union).
	const cantripGroups = coreCantripCards().map((s) => s.codes);
	// Every deck in the subject — the denominator for "% of decks" insights whose card any
	// investigator can include (e.g. Charisma & Relic Hunter, usable by all).
	let totalDecks = 0;
	// Deckbuilding questions every deck is run through (Vicious Blow & Deduction): can this
	// investigator+meta include the card; did it run any printing at some point; and did it
	// drop every printing by the final version (removed, not upgraded)? Cards resolved once so
	// the per-deck loop only does the canUse / membership checks.
	const cardByCode = new Map(getAllCards().map((cd) => [cd.code, cd] as const));
	const resolver = createCardResolver();
	const eligibilityAcc = viciousBlowDeductionEligibility().map((t) => ({
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
		neverRemovedInvestigators: new Set<CardCode>(),
	}));
	// Charisma → allies, Relic Hunter → accessories: per-deck best slotted version; plus
	// per-customizable-card level/option tallies (parsed from deck meta).
	const charismaRelic = charismaRelicCards();
	const charismaCodes = charismaRelic.find((s) => s.name === 'Charisma')?.codes ?? [];
	const relicCodes = charismaRelic.find((s) => s.name === 'Relic Hunter')?.codes ?? [];
	const allyCodes = allySlotCodeSet();
	const accessoryCodes = accessorySlotCodeSet();
	const custOptXp = customizableOptionXp();
	const charismaTopDecks: DeckTopEntry[] = [];
	const relicTopDecks: DeckTopEntry[] = [];
	const customizableUsage: CustomizableUsage = {};
	// Per (customizable card # option index) → each activation's investigator + campaign date;
	// folded after the loop into each option's count + 3 most-recent distinct investigators.
	const custOptEvents = new Map<string, { inv: CardCode; date: number }[]>();

	for (const c of doc.campaigns) {
		if (c.draft || !campaignInSubject(c, uids)) continue;
		const campaignInvs = subjectInvestigators(c, uids);
		if (campaignInvs.length) investigatorsByCampaign[c.id] = campaignInvs;
		for (const deck of c.decks) {
			if (!deckInSubject(deck.ownerUid, uids)) continue;
			totalDecks++;
			const chainInPlay = new Set<CardCode>();
				// Max copies of each tracked spotlight card across this deck's versions.
				const insightSlots: Record<CardCode, number> = {};
			// The deck's build meta (faction selections etc.) — last version that carries it;
			// stable across the upgrade chain, and the input the eligibility check needs.
			let lastMetaStr: string | undefined;
			// The card codes in the FINAL version of the chain (highest sequenceIndex) — lets the
			// eligibility pass tell "removed (and not upgraded)" from "still in the deck".
			let finalVersionCodes = new Set<CardCode>();
			let finalSeq = -1;
			// Most distinct core cantrips present in any SINGLE version (per-version, not union).
			let cantripMax = 0;
			for (const v of deck.versions) {
				let ahdb: AhdbSlots;
				try {
					ahdb = JSON.parse(v.ahdbJson) as AhdbSlots;
				} catch {
					continue;
				}
				if (ahdb.meta) lastMetaStr = ahdb.meta;
				const versionCodes = new Set<CardCode>();
				for (const slots of [ahdb.slots, ahdb.ignoreDeckLimitSlots]) {
					for (const [code, qty] of Object.entries(slots ?? {})) {
						chainInPlay.add(code);
						versionCodes.add(code);
						playedInPlay.add(code); if (insightCodes.has(code)) insightSlots[code] = Math.max(insightSlots[code] ?? 0, qty);
					}
				}
				if (v.sequenceIndex >= finalSeq) {
					finalSeq = v.sequenceIndex;
					finalVersionCodes = versionCodes;
				}
				const cantripsHere = cantripGroups.filter((codes) =>
					codes.some((c) => versionCodes.has(c)),
				).length;
				if (cantripsHere > cantripMax) cantripMax = cantripsHere;
			}
			if (Object.keys(insightSlots).length) insightDecks.push({ inv: deck.investigator.investigatorCode, slots: insightSlots, cantripMax }); for (const code of chainInPlay) {
				cardUsage[code] = (cardUsage[code] ?? 0) + 1;
				// Remember this deck's context for the code; only survives if count ends at 1.
				lastCtx.set(code, { investigator: deck.investigator.investigatorCode, campaignId: c.id });
				// Specialist cards: attribute this code to the deck's investigator.
				if (specialistCodes.has(code)) {
					let s = specialistInv.get(code);
					if (!s) specialistInv.set(code, (s = new Set<CardCode>()));
					s.add(deck.investigator.investigatorCode);
				}
			}

			// Deckbuilding questions: run this deck through each target — could its
			// investigator+meta include the card; did it run any printing across the chain; and
			// (of those) was every printing gone from the final version (removed, not upgraded)?
			if (eligibilityAcc.length) {
				const investigatorCard = cardByCode.get(deck.investigator.investigatorCode);
				if (investigatorCard) {
					let meta: DecodedMeta = {};
					if (lastMetaStr) {
						try {
							meta = decodeMeta(lastMetaStr, resolver);
						} catch {
							meta = {};
						}
					}
					const invCanon = canonInvestigatorCode(deck.investigator.investigatorCode);
					for (const e of eligibilityAcc) {
						if (!e.cards.some((cd) => cardUtils.canUse(investigatorCard, meta, cd))) continue;
						e.canUse++;
						if (!e.usedCodes.some((code) => chainInPlay.has(code))) {
							// Eligible but never ran any printing.
							e.notUsed++;
							if (e.notUsedInvestigators.size < 3) e.notUsedInvestigators.add(invCanon);
							continue;
						}
						e.used++;
						if (e.usedInvestigators.size < 3) e.usedInvestigators.add(invCanon);
						// Ran it at some point: did the final version keep a printing (still in the
						// deck) or drop every printing (removed, neither L0 nor L2 → not upgraded)?
						if (e.usedCodes.some((code) => finalVersionCodes.has(code))) {
							if (e.neverRemovedInvestigators.size < 3)
								e.neverRemovedInvestigators.add(invCanon);
						} else {
							e.removed++;
							if (e.removedInvestigators.size < 3) e.removedInvestigators.add(invCanon);
						}
					}
				}
			}

			// Spotlight (Charisma → allies / Relic Hunter → accessories) + customizable
			// analysis: scan each version, keep the best-slotted version per category and
			// each customizable card's max-ticked state, then fold into the tallies.
			{
				let bestCharisma: { total: number; count: number; cards: Record<CardCode, number> } | null =
					null;
				let bestRelic: { total: number; count: number; cards: Record<CardCode, number> } | null =
					null;
				const custMax = new Map<CardCode, { total: number; opts: Record<number, number> }>();
				for (const v of deck.versions) {
					let ahdb: AhdbSlots;
					try {
						ahdb = JSON.parse(v.ahdbJson) as AhdbSlots;
					} catch {
						continue;
					}
					const vslots: Record<CardCode, number> = {};
					for (const slots of [ahdb.slots, ahdb.ignoreDeckLimitSlots])
						for (const [code, qty] of Object.entries(slots ?? {}))
							vslots[code] = (vslots[code] ?? 0) + qty;
					const charismaQty = Math.max(0, ...charismaCodes.map((c) => vslots[c] ?? 0));
					const relicQty = Math.max(0, ...relicCodes.map((c) => vslots[c] ?? 0));
					let allyTotal = 0;
					let accTotal = 0;
					const allyCards: Record<CardCode, number> = {};
					const accCards: Record<CardCode, number> = {};
					for (const [code, qty] of Object.entries(vslots)) {
						if (allyCodes.has(code)) {
							allyCards[code] = qty;
							allyTotal += qty;
						}
						if (accessoryCodes.has(code)) {
							accCards[code] = qty;
							accTotal += qty;
						}
					}
					if (charismaQty >= 1 && (!bestCharisma || allyTotal > bestCharisma.total))
						bestCharisma = { total: allyTotal, count: charismaQty, cards: allyCards };
					if (relicQty >= 1 && (!bestRelic || accTotal > bestRelic.total))
						bestRelic = { total: accTotal, count: relicQty, cards: accCards };
					// Customizable: keep each card's max-ticked version (its final state).
					let metaObj: Record<string, unknown> | null = null;
					try {
						metaObj = ahdb.meta ? (JSON.parse(ahdb.meta) as Record<string, unknown>) : null;
					} catch {
						metaObj = null;
					}
					if (metaObj)
						for (const [k, val] of Object.entries(metaObj)) {
							if (!k.startsWith('cus_') || typeof val !== 'string') continue;
							const code = k.slice(4);
							if (!custOptXp[code]) continue;
							const opts: Record<number, number> = {};
							let total = 0;
							for (const seg of val.split(',')) {
								const parts = seg.split('|');
								const idx = parseInt(parts[0], 10);
								const checked = parseInt(parts[1], 10);
								if (Number.isFinite(idx) && Number.isFinite(checked) && checked > 0) {
									opts[idx] = checked;
									total += checked;
								}
							}
							const prev = custMax.get(code);
							if (!prev || total > prev.total) custMax.set(code, { total, opts });
						}
				}
				const invCode = deck.investigator.investigatorCode;
				if (bestCharisma)
					charismaTopDecks.push({
						inv: invCode,
						count: bestCharisma.count,
						total: bestCharisma.total,
						cards: Object.entries(bestCharisma.cards).map(([code, qty]) => ({ code, qty })),
					});
				if (bestRelic)
					relicTopDecks.push({
						inv: invCode,
						count: bestRelic.count,
						total: bestRelic.total,
						cards: Object.entries(bestRelic.cards).map(([code, qty]) => ({ code, qty })),
					});
				// Record EVERY customizable card the deck ran (from its card list), at its
				// max-ticked level — level 0 when included but never customized (so L0 lights).
				for (const code of chainInPlay) {
					const xp = custOptXp[code];
					if (!xp) continue; // not a customizable card
					const u = (customizableUsage[code] ??= { levels: {}, options: {} });
					const m = custMax.get(code);
					const level = m ? Math.ceil(m.total / 2) : 0;
					u.levels[level] = (u.levels[level] ?? 0) + 1;
					if (m)
						for (const [idxStr, checked] of Object.entries(m.opts))
							if (checked >= (xp[Number(idxStr)] ?? Infinity))
							{ const key = `${code}#${idxStr}`; let ev = custOptEvents.get(key); if (!ev) custOptEvents.set(key, (ev = [])); ev.push({ inv: deck.investigator.investigatorCode, date: c.finishDate ?? c.startDate ?? 0 }); }
				}
			}

			const inv = deck.investigator;
			let e = invMap.get(inv.investigatorCode);
			if (!e) {
				e = { count: 0, options: new Set<string>() };
				invMap.set(inv.investigatorCode, e);
			}
			e.count += 1;
			const sig = optionSignature(inv);
			if (sig) e.options.add(sig);
		}
	}

	const investigators: InvestigatorStat[] = [...invMap.entries()]
		.map(([code, e]) => ({ code, count: e.count, options: [...e.options].sort() }))
		.sort((a, b) => b.count - a.count);
	// Keep context only for cards present in exactly one deck (raw count 1). The
	// canon fold + campaign join happens at assembly (which has the campaigns list).
	const usedOnceRaw: Record<CardCode, { investigator: CardCode; campaignId: string }> = {};
	for (const [code, ctx] of lastCtx) if (cardUsage[code] === 1) usedOnceRaw[code] = ctx;
	const specialistUsage: Record<CardCode, CardCode[]> = {};
	for (const [code, s] of specialistInv) specialistUsage[code] = [...s].sort();
	const eligibilityInsights: Record<string, EligibilityInsight> = {};
	for (const e of eligibilityAcc)
		eligibilityInsights[e.id] = {
			canUse: e.canUse,
			used: e.used,
			usedInvestigators: [...e.usedInvestigators],
			notUsed: e.notUsed,
			notUsedInvestigators: [...e.notUsedInvestigators],
			removed: e.removed,
			removedInvestigators: [...e.removedInvestigators],
			neverRemovedInvestigators: [...e.neverRemovedInvestigators],
		};
	// Fold per-option activation events into each customizable card's options: total count
	// + up to 3 most-recent (by campaign date) distinct investigators.
	for (const [key, events] of custOptEvents) {
		const hash = key.indexOf('#');
		const u = customizableUsage[key.slice(0, hash)];
		if (!u) continue;
		events.sort((a, b) => b.date - a.date);
		const recent: CardCode[] = [];
		const seen = new Set<string>();
		for (const e of events) {
			if (seen.has(e.inv)) continue;
			seen.add(e.inv);
			recent.push(e.inv);
			if (recent.length >= 3) break;
		}
		u.options[key.slice(hash + 1)] = { count: events.length, recent };
	}
	return {
		cardUsage,
		investigators,
		playedCardCodes: [...playedInPlay],
		investigatorsByCampaign,
		usedOnceRaw,
		specialistUsage,
		insightDecks,
		eligibilityInsights,
		totalDecks,
		charismaTopDecks,
		relicTopDecks,
		customizableUsage,
	};
}

// ─── Signatures (cheap change-detection for the cache) ────────────────────────

/** FNV-1a 32-bit → base36; fast and good enough to detect input changes. */
function hashString(s: string): string {
	let h = 0x811c9dc5;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return (h >>> 0).toString(36);
}

function logsToken(c: DocCampaign): string {
	return c.logs.map((e) => `${e.key}|${e.section}|${e.args.map((a) => `${a.type}:${a.value}`).join('~')}`).join(';');
}

function metaSig(doc: DatabaseDocument, uids: Set<string> | null, defaultViz: 'visible' | 'hidden', trackedTiers: DifficultyTier[], trackedGroups: CampaignGroup[]): string {
	// The account default + tracked tiers/groups gate which campaigns appear, so they are inputs.
	const parts: string[] = [
		defaultViz,
		[...trackedTiers].sort().join(','),
		[...trackedGroups].sort().join(','),
	];
	for (const c of doc.campaigns) {
		if (!c.campaignCode || !getCampaignLog(c.campaignCode) || !campaignInSubject(c, uids)) continue;
		const pids = c.participants.map((p) => p.uid).sort().join(',');
		// logs included: each calendar entry's clear `state` is log-derived.
		// displayInProfile included: it gates the campaign's existence in this segment.
		parts.push(
			[
				c.id, c.title, c.difficulty, c.campaignCode, c.startDate, c.finishDate, c.draft,
				c.displayInProfile ?? 'default', c.playerCount ?? 'auto', pids, logsToken(c),
			].join('§'),
		);
	}
	return hashString(parts.join('¶'));
}

function logsSig(doc: DatabaseDocument, uids: Set<string> | null, ownedProducts: Product[] | null, trackedCampaignGroups: CampaignGroup[], trackedTiers: DifficultyTier[]): string {
	// The whole logs segment is scoped by owned products + tracked campaign groups + tracked tiers
	// (records outside a tracked tier/group are filtered out before every aggregate).
	const parts: string[] = [
		ownedProducts === null ? 'ALL' : [...ownedProducts].sort().join(','),
		[...trackedCampaignGroups].sort().join(','),
		[...trackedTiers].sort().join(','),
	];
	for (const c of doc.campaigns) {
		if (!c.campaignCode || !getCampaignLog(c.campaignCode) || !campaignInSubject(c, uids)) continue;
		const manual = c.manualAchievements
			.map((a) => `${a.achievementId}/${a.itemId ?? ''}`)
			.sort()
			.join(',');
		// playerCount + multiHanded gate the solo clear grids (and the player-count-keyed
		// Dead Heat tables), so a change to either must invalidate this segment.
		parts.push(
			[c.id, c.campaignCode, c.difficulty, c.playerCount ?? 'auto', c.multiHanded ?? false, logsToken(c), manual].join('§'),
		);
	}
	return hashString(parts.join('¶'));
}

function cardsSig(doc: DatabaseDocument, uids: Set<string> | null): string {
	const parts: string[] = [];
	for (const c of doc.campaigns) {
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
					versions,
				].join('§'),
			);
		}
	}
	return hashString(parts.join('¶'));
}

/** The three segment signatures for a subject (used to skip unchanged rebuilds). */
export function segmentSignatures(
	doc: DatabaseDocument,
	key: string,
): { meta: string; logs: string; cards: string } {
	const uids = subjectUids(doc, key);
	const settings = resolveProfileSettings(doc.profileSettings);
	const ownedProducts = settings.ownedProducts as Product[] | null;
	return {
		meta: metaSig(doc, uids, settings.defaultArchiveDisplayInProfile, settings.trackedTiers, settings.trackedCampaignGroups),
		logs: logsSig(doc, uids, ownedProducts, settings.trackedCampaignGroups, settings.trackedTiers),
		cards: cardsSig(doc, uids),
	};
}

// ─── Per-subject segment builders (resolve uids + settings internally) ────────

export function buildMetaSegmentFor(doc: DatabaseDocument, key: string): MetaSegmentData {
	const settings = resolveProfileSettings(doc.profileSettings);
	return buildMetaSegment(
		doc,
		subjectUids(doc, key),
		settings.defaultArchiveDisplayInProfile,
		settings.trackedTiers,
		settings.trackedCampaignGroups,
	);
}

export function buildLogsSegmentFor(doc: DatabaseDocument, key: string): LogsSegmentData {
	const settings = resolveProfileSettings(doc.profileSettings);
	return buildLogsSegment(doc, subjectUids(doc, key), settings.ownedProducts as Product[] | null, settings.trackedCampaignGroups, settings.trackedTiers);
}

export function buildCardsSegmentFor(doc: DatabaseDocument, key: string): CardsSegmentData {
	return buildCardsSegment(doc, subjectUids(doc, key));
}

// ─── Assembly ────────────────────────────────────────────────────────────────

/** Resolve a subject key to its display identity (avatar code, name, members).
 *  Cheap and doc-derived, so it is computed at assembly time rather than cached. */
export function buildSubjectIdentity(doc: DatabaseDocument, key: string): ProfileSubject {
	if (key === ACCOUNT_SUBJECT) {
		return { kind: 'account', uid: ACCOUNT_SUBJECT, name: doc.owner.name, iconCardCode: doc.owner.iconCardCode, members: [] };
	}
	const player = findPlayer(doc, key);
	if (player) {
		return { kind: 'player', uid: key, name: player.name, iconCardCode: player.iconCardCode, members: [] };
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

/** Resolve the cards segment's raw used-once context into the display-ready map:
 *  canon-fold so a card used once total (via the old Core Set OR its Revised twin)
 *  counts as one, then join the surviving codes with their campaign for the icon /
 *  title / difficulty / finish date. Codes whose canon count exceeds 1 (used once via
 *  EACH twin) drop out — they were not used exactly once. */
function resolveUsedOnce(
	raw: Record<CardCode, { investigator: CardCode; campaignId: string }>,
	cardUsage: Record<CardCode, number>,
	campaigns: ProfileCampaign[],
): UsedOnceMap {
	const canonUsage: Record<string, number> = {};
	for (const [code, n] of Object.entries(cardUsage)) {
		const key = cardUtils.coreToRcore(code);
		canonUsage[key] = (canonUsage[key] ?? 0) + n;
	}
	const byId = new Map(campaigns.map((c) => [c.id, c]));
	const out: UsedOnceMap = {};
	for (const [rawCode, ctx] of Object.entries(raw)) {
		const canon = cardUtils.coreToRcore(rawCode);
		if (canonUsage[canon] !== 1) continue;
		const camp = byId.get(ctx.campaignId);
		if (!camp) continue; // campaign not in this subject's payload → nothing to show
		out[canon] = {
			investigator: ctx.investigator,
			campaignId: ctx.campaignId,
			campaignCode: camp.campaignCode,
			campaignTitle: camp.title,
			difficulty: camp.difficulty,
			finishDate: camp.finishDate,
		};
	}
	return out;
}

/** Cross-family lifetime headline totals — summed once here from the already-built
 *  logs + cards segments so consumers (and `.ahlifepro`) read them directly instead
 *  of re-summing in the UI. Spans both segments, so it lives at assembly, not in a
 *  single cached segment. */
function buildProfileSummary(logs: LogsSegmentData, cards: CardsSegmentData): ProfileSummary {
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
		standalonePlays: logs.standaloneUsage.reduce((n, r) => n + r.totalPlays, 0),
	};
}

/** Recombine three (cached or freshly-built) segments into the page payload.
 *  NOTE: every field (campaigns, calendar, clearGrid, …, cardUsage) shares
 *  references with the segment data — consumers must treat the payload as
 *  read-only. The payload is JSON-pure (ms dates, no `Date`), so it needs no
 *  revival and round-trips through `JSON.stringify`/`parse` unchanged. */
export function assemblePayload(
	seg: { meta: MetaSegmentData; logs: LogsSegmentData; cards: CardsSegmentData },
	settings: ProfileSettings,
	subject: ProfileSubject,
): LocalProfilePayload {
	return {
		subject,
		summary: buildProfileSummary(seg.logs, seg.cards),
		campaigns: seg.meta.campaigns,
		calendar: seg.meta.calendar,
		achievements: seg.logs.achievements,
		clearGrid: seg.logs.clearGrid,
		soloClearGrid: seg.logs.soloClearGrid,
		trueSoloClearGrid: seg.logs.trueSoloClearGrid,
		winLossRecord: seg.logs.winLossRecord,
		endings: seg.logs.endings,
		collections: seg.logs.collections,
		scenarioXp: seg.logs.scenarioXp,
		resolutionCoverage: seg.logs.resolutionCoverage,
		standaloneUsage: seg.logs.standaloneUsage,
		// Per-investigator trauma joins the logs segment's events (campaignId +
		// all-target flags) with the cards segment's per-campaign investigator map.
		traumaTally: {
			...seg.logs.traumaTally,
			perInvestigator: attributeTraumaInvestigators(
				seg.logs.traumaTally.events,
				seg.cards.investigatorsByCampaign,
			),
		},
		eoeCity: seg.logs.eoeCity,
		// `mementosEarned` is deck-derived (the eoe builder has no card data), so it's
		// filled here from the cards segment's cardUsage — like traumaTally's perInvestigator.
		eoe: seg.logs.eoe.map((e) => ({
			...e,
			mementosEarned: countEoeMementosEarned(seg.cards.cardUsage),
		})),
		tsk: seg.logs.tsk,
		// Special interactions join the logs partial with the per-campaign roster
		// (cards segment) + card class/traits, exactly like per-investigator trauma.
		specialInteractions: resolveSpecialInteractions(
			seg.logs.specialInteractions,
			seg.cards.investigatorsByCampaign,
			cardClassTraitLookup(),
		),
		investigators: seg.cards.investigators,
		cardUsage: seg.cards.cardUsage,
		// Resolve raw used-once context against this subject's campaigns (canon-folded).
		usedOnce: resolveUsedOnce(seg.cards.usedOnceRaw, seg.cards.cardUsage, seg.meta.campaigns),
		specialistUsage: seg.cards.specialistUsage,
		insightDecks: seg.cards.insightDecks,
		eligibilityInsights: seg.cards.eligibilityInsights,
		totalDecks: seg.cards.totalDecks,
		charismaTopDecks: seg.cards.charismaTopDecks,
		relicTopDecks: seg.cards.relicTopDecks,
		customizableUsage: seg.cards.customizableUsage,
		playedCardCodes: seg.cards.playedCardCodes,
		settings,
	};
}

/** Build a subject's payload fresh (no cache) — the lazy/fallback path + tests. */
export function buildSubjectPayload(doc: DatabaseDocument, key: string): LocalProfilePayload {
	const settings = resolveProfileSettings(doc.profileSettings);
	const uids = subjectUids(doc, key);
	const ownedProducts = settings.ownedProducts as Product[] | null;
	return assemblePayload(
		{
			meta: buildMetaSegment(doc, uids, settings.defaultArchiveDisplayInProfile, settings.trackedTiers, settings.trackedCampaignGroups),
			logs: buildLogsSegment(doc, uids, ownedProducts, settings.trackedCampaignGroups, settings.trackedTiers),
			cards: buildCardsSegment(doc, uids),
		},
		settings,
		buildSubjectIdentity(doc, key),
	);
}
