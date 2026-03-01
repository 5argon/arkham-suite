/**
 * profile-types.ts — the shared, framework-free TYPE shapes for the profile. The
 * local builder (`profile-local.ts`) and the profile components consume these
 * types directly. Pure types only — no runtime.
 */

import type { CardCode } from '@5argon/arkham-kohaku';
import type { ProfileFamily } from '$lib/campaign/achievement-aggregate';
import type { CampaignCoverage, CustomAchievement } from '$lib/campaign/custom-achievements';
import type {
	CampaignEndings,
	WinLossRecord,
	ClearGridRow,
	ClearState,
} from '$lib/campaign/clear-status';
import type { CampaignCollections } from '$lib/campaign/collections';
import type { CampaignScenarioXp } from '$lib/campaign/extra-imports';
import type { CampaignResolutionCoverage } from '$lib/campaign/resolution-coverage';
import type { CampaignStandaloneUsage } from '$lib/campaign/standalone-usage';
import type { TraumaTally } from '$lib/campaign/trauma';
import type { CampaignEoeCity } from '$lib/campaign/eoe-city';
import type { CampaignEoe } from '$lib/campaign/eoe';
import type { CampaignTsk } from '$lib/campaign/tsk-profile';
import type { CampaignSpecialInteractions } from '$lib/campaign/special-interactions';

/** Who/what a profile is about. Baked into the payload so a "compiled profile"
 *  renders its own header (avatar, name, group members) with no access to the live
 *  database document — only the ambient card database, for the avatar art. */
export interface ProfileSubject {
	kind: 'account' | 'player' | 'group' | 'unknown';
	/** `'__account__'` for the whole-account view, else a roster member / play-group uid. */
	uid: string;
	name: string;
	/** Investigator card code for the avatar; null for groups / unknown. */
	iconCardCode: string | null;
	/** Members (groups only; empty otherwise) — each with a display name and an
	 *  investigator card code for the avatar (null when unknown). */
	members: { name: string; iconCardCode: string | null }[];
}

/** A campaign as listed on a profile ("Campaigns Played"). Dates are ms-since-epoch
 *  (not `Date`) so the whole payload is JSON-pure — a compiled profile round-trips
 *  through `JSON.stringify`/`parse` with no revival step. */
export interface ProfileCampaign {
	id: string;
	title: string;
	campaignCode: string;
	difficulty: 'easy' | 'standard' | 'hard' | 'expert';
	/** Resolved head count (auto→participants capped at 4), or null when unspecified. */
	playerCount: number | null;
	/** ms-since-epoch, or null. */
	finishDate: number | null;
	/** ms-since-epoch, or null. */
	startDate: number | null;
	draft: boolean;
}

/** A player card that appeared in EXACTLY ONE deck across the subject — the single
 *  deck's context, so a "used once" widget can show where/when that lone use was.
 *  Canon-folded (old Core Set twins count as their Revised Core Set card). */
export interface UsedOnceEntry {
	/** Investigator code of the one deck that used the card. */
	investigator: CardCode;
	/** The campaign that deck belonged to (joins `ProfileCampaign.id`). */
	campaignId: string;
	/** Campaign code (for the campaign's icon) + title, denormalized at assembly. */
	campaignCode: string;
	campaignTitle: string;
	difficulty: 'easy' | 'standard' | 'hard' | 'expert';
	/** Campaign finish date (ms-since-epoch), or null when unfinished. */
	finishDate: number | null;
}
/** Canon card code → its single-deck context. */
export type UsedOnceMap = Record<CardCode, UsedOnceEntry>;

/** One deck's tracked-card footprint, for the bespoke neutral-card "insight" widgets
 *  (Level 0 Core Set Neutral, Charisma & Relic Hunter). Only decks that used at least
 *  one tracked card are recorded. */
export interface InsightDeck {
	/** The deck's investigator code (as recorded). */
	inv: CardCode;
	/** Tracked card code → max copies the deck ran (across its versions). The UNION over the
	 *  upgrade chain — right for "ever used X" questions, but it CANNOT answer "had N of these
	 *  cards at once" (see {@link cantripMax}). */
	slots: Record<CardCode, number>;
	/** Most distinct Level-0 core neutral cantrip skills (Guts / Perception / Overpower /
	 *  Manual Dexterity) the deck ran in any SINGLE version — the per-version answer the cantrip
	 *  diversity rows need (the union `slots` would over-count across upgrades). */
	cantripMax: number;
}

/** A precomputed deckbuilding insight for one card (e.g. Vicious Blow), tallied over EVERY
 *  deck (not just tracked ones) at the precompute step — the whole upgrade chain is scanned,
 *  so the UI just renders the result. */
export interface EligibilityInsight {
	/** Decks whose investigator + meta can include the card (the eligible population). */
	canUse: number;
	/** Of the eligible decks, those that ran any printing at some point in the chain. */
	used: number;
	/** Up to three distinct (canon-folded) investigators among the used decks. */
	usedInvestigators: CardCode[];
	/** Of the eligible decks, those that never ran any printing (the complement of `used`). */
	notUsed: number;
	/** Up to three distinct (canon-folded) investigators among the not-used decks. */
	notUsedInvestigators: CardCode[];
	/** Of the used decks, those that dropped every printing by the final version — removed and
	 *  not upgraded (no L0 and no L2 remains anywhere later in the chain). */
	removed: number;
	/** Up to three distinct (canon-folded) investigators among the removed decks. */
	removedInvestigators: CardCode[];
	/** Up to three distinct (canon-folded) investigators among the used decks that kept a
	 *  printing in the final version (the complement of `removed`; count is `used - removed`). */
	neverRemovedInvestigators: CardCode[];
}

/** One deck's entry in a "top decks" table (Charisma → allies, Relic Hunter →
 *  accessories): the deck version (among those running the slot card) with the most
 *  ally / accessory cards. */
export interface DeckTopEntry {
	/** The deck's investigator code. */
	inv: CardCode;
	/** Charisma / Relic Hunter copies at the selected version (1 or 2). */
	count: number;
	/** The ranked metric — total ally / accessory cards at that version. */
	total: number;
	/** The ally / accessory cards (code → copies) at that version. */
	cards: { code: CardCode; qty: number }[];
}

/** Per customizable card, across decks (each deck's final/max-ticked state): how often
 *  it reached each level, and how often each option was "used" (enough boxes ticked). */
export interface CustomizableCardUsage {
	/** Level (string key) → number of decks that reached it. */
	levels: Record<string, number>;
	/** Option index (string key) → its activation count + up to 3 most-recent (by campaign
	 *  date) distinct investigators who activated it. */
	options: Record<string, { count: number; recent: CardCode[] }>;
}
export type CustomizableUsage = Record<CardCode, CustomizableCardUsage>;

/** The lifetime achievements view (families / custom tallies / branch coverage). */
export interface ProfileAchievementsData {
	families: ProfileFamily[];
	custom: CustomAchievement[];
	coverage: CampaignCoverage[];
}

/** One chronological entry on the profile calendar. */
export interface CalendarEntry {
	campaignId: string;
	title: string;
	campaignCode: string;
	family: string;
	difficulty: string;
	/** finishDate ?? startDate in ms; null when neither was recorded. */
	date: number | null;
	dateKind: 'finish' | 'start' | null;
	state: ClearState | null;
}

/** Investigator usage across the contributing campaigns: play-count + the
 *  distinct version options chosen (Tony/Mandy/Lola/Wendy faction/size/option). */
export interface InvestigatorStat {
	code: CardCode;
	count: number;
	options: string[];
}

/** Player-card + investigator usage. */
export interface CardInsightsData {
	/** Card code → number of contributing deck chains that ever put it in-play. */
	cardUsage: Record<CardCode, number>;
	investigators: InvestigatorStat[];
}

/**
 * Cross-family lifetime headline numbers — the marquee aggregates the profile's
 * section titles surface (total wins, campaigns cleared, achievements earned, …).
 * Precomputed at payload assembly (rather than re-summed in the UI on every
 * render) so `.ahlifepro` consumers read them directly; see the serialization
 * principle in compiled-profile.ts. It spans both the logs and cards segments, so
 * it is assembled in `assemblePayload` and is NOT itself a cached segment.
 */
export interface ProfileSummary {
	/** Total recorded plays across all campaign families (won, lost, or in progress). */
	totalPlays: number;
	/** Total winning plays across all families. */
	totalWins: number;
	/** Distinct campaign families with ≥1 recorded play. */
	campaignsPlayed: number;
	/** Owned campaign boxes (the clear-grid denominator). */
	ownedCampaigns: number;
	/** Owned campaigns cleared on ≥1 difficulty (any tier). */
	campaignsClearedAny: number;
	/** Owned campaigns cleared, per difficulty tier (tier id → count); a campaign
	 *  cleared on two tiers counts in both, so these can exceed campaignsClearedAny. */
	campaignsClearedByTier: Record<string, number>;
	/** Official achievements earned / available across all families. */
	achievementsEarned: number;
	achievementsTotal: number;
	/** Distinct investigators ever fielded across the subject's decks. */
	investigatorsPlayed: number;
	/** Distinct player cards ever fielded across the subject's decks. */
	cardsPlayed: number;
	/** Total side/standalone scenario plays across all families. */
	standalonePlays: number;
}

/** A zeroed {@link ProfileSummary} — the fallback for a (legacy) payload that
 *  predates the summary block (e.g. an older shared/compiled profile). */
export function emptyProfileSummary(): ProfileSummary {
	return {
		totalPlays: 0,
		totalWins: 0,
		campaignsPlayed: 0,
		ownedCampaigns: 0,
		campaignsClearedAny: 0,
		campaignsClearedByTier: {},
		achievementsEarned: 0,
		achievementsTotal: 0,
		investigatorsPlayed: 0,
		cardsPlayed: 0,
		standalonePlays: 0,
	};
}

/** Everything the composable profile renders, from a single record load. */
export interface ProfileData {
	/** Whose profile this is — baked in so the payload renders standalone. */
	subject: ProfileSubject;
	/** Cross-family lifetime headline totals (see {@link ProfileSummary}). */
	summary: ProfileSummary;
	campaigns: ProfileCampaign[];
	achievements: ProfileAchievementsData;
	clearGrid: ClearGridRow[];
	/** Clear grid over 1-player plays only (true solo + solo X-handed) — "Solo Campaign Clears". */
	soloClearGrid: ClearGridRow[];
	/** Clear grid over true-solo (1-player, not multi-handed) plays — "True Solo Campaign Clears". */
	trueSoloClearGrid: ClearGridRow[];
	winLossRecord: WinLossRecord[];
	calendar: CalendarEntry[];
	endings: CampaignEndings[];
	collections: CampaignCollections[];
	investigators: InvestigatorStat[];
	scenarioXp: CampaignScenarioXp[];
	resolutionCoverage: CampaignResolutionCoverage[];
	standaloneUsage: CampaignStandaloneUsage[];
	traumaTally: TraumaTally;
	/** Edge of the Earth "City of the Elder Things" per-version matrix (eoe only). */
	eoeCity: CampaignEoeCity[];
	/** Edge of the Earth bespoke tallies — crash / demons / survivors / supplies /
	 *  camps, all keyed by member or item id (eoe only). */
	eoe: CampaignEoe[];
	/** The Scarlet Keys bespoke aggregate — Trust/Deception acts + Coterie outcomes (tskc only). */
	tsk: CampaignTsk[];
	/** Roster-gated flavor moments per campaign family, with lifetime triggered state. */
	specialInteractions: CampaignSpecialInteractions[];
	cardUsage: Record<CardCode, number>;
	/** Cards used in exactly one deck (canon-folded) → that deck's context. Powers
	 *  the "Core Set Cards Used Once" widgets. */
	usedOnce: UsedOnceMap;
	/** Specialist (Scarlet Keys) card code → the distinct investigator codes whose decks
	 *  used it. Powers the Specialist widget's investigator + trait dimensions. */
	specialistUsage: Record<CardCode, CardCode[]>;
	/** Per-deck tracked-card footprints (investigator + spotlight-card copies) for the
	 *  neutral-card insight widgets. */
	insightDecks: InsightDeck[];
	/** "Eligible but unused" insights keyed by target id (e.g. 'viciousBlow', 'deduction') —
	 *  precomputed over every deck for the Vicious Blow & Deduction widget. */
	eligibilityInsights: Record<string, EligibilityInsight>;
	/** Count of all the subject's decks — the denominator for "% of decks" insights whose
	 *  card every investigator can include (Charisma & Relic Hunter). */
	totalDecks: number;
	/** Decks ranked by ally count (each running Charisma) — Charisma & Relic Hunter widget. */
	charismaTopDecks: DeckTopEntry[];
	/** Decks ranked by accessory count (each running Relic Hunter). */
	relicTopDecks: DeckTopEntry[];
	/** Per customizable card: level + option usage tallies (the Customizable Cards widget). */
	customizableUsage: CustomizableUsage;
}
