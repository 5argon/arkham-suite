/**
 * Shared shape + mapper feeding the <ProfileWidgets> widget renderer. The
 * profile `/p/private/[uid]` layout computes the full payload; every nested
 * page maps it through `toWidgetData` (flattening the scope globals out of
 * `settings`) so the renderer takes one flat prop.
 */

import type { CardCode, Product } from '@5argon/arkham-kohaku';
import type { DifficultyTier, ProfileSettings } from '$lib/campaign/profile/profile-settings';
import {
	emptyProfileSummary,
	type ProfileCampaign,
	type CalendarEntry,
	type CustomizableUsage,
	type DeckTopEntry,
	type EligibilityInsight,
	type InsightDeck,
	type InvestigatorStat,
	type ProfileAchievementsData,
	type ProfileSummary,
	type UsedOnceMap,
} from '$lib/profile/profile-types';
import type { ClearGridRow, WinLossRecord, CampaignEndings } from '$lib/campaign/outcomes/clear-status';
import type { CampaignCollections } from '$lib/campaign/stats/collections';
import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
import type { CampaignStandaloneUsage } from '$lib/campaign/outcomes/standalone-usage';
import type { TraumaTally } from '$lib/campaign/outcomes/trauma';
import type { CampaignEoe } from '$lib/campaign/campaigns/eoe';
import type { CampaignTsk } from '$lib/campaign/campaigns/tsk-profile';
import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
import type { CampaignTic } from '$lib/campaign/campaigns/tic';
import type { CampaignFhv } from '$lib/campaign/campaigns/fhv';
import type { CampaignTdc } from '$lib/campaign/campaigns/tdc';
import type { CampaignNotz } from '$lib/campaign/campaigns/notz';
import type { CampaignSpecialInteractions } from '$lib/campaign/outcomes/special-interactions';

export interface ProfileWidgetData {
	/** Cross-family lifetime headline totals (precomputed; see ProfileSummary). */
	summary: ProfileSummary;
	campaigns: ProfileCampaign[];
	clearGrid: ClearGridRow[];
	soloClearGrid: ClearGridRow[];
	trueSoloClearGrid: ClearGridRow[];
	winLossRecord: WinLossRecord[];
	calendar: CalendarEntry[];
	endings: CampaignEndings[];
	collections: CampaignCollections[];
	scenarios: CampaignScenarios[];
	standaloneUsage: CampaignStandaloneUsage[];
	traumaTally: TraumaTally;
	eoe: CampaignEoe[];
	tsk: CampaignTsk[];
	dwl: CampaignDwl[];
	ptc: CampaignPtc[];
	tfa: CampaignTfa[];
	tcu: CampaignTcu[];
	tdea: CampaignTdea[];
	tdeb: CampaignTdeb[];
	tic: CampaignTic[];
	fhv: CampaignFhv[];
	tdc: CampaignTdc[];
	notz: CampaignNotz[];
	specialInteractions: CampaignSpecialInteractions[];
	achievements: ProfileAchievementsData;
	investigators: InvestigatorStat[];
	cardUsage: Record<CardCode, number>;
	/** Canon card code → single-deck context (the "used once" widgets). */
	usedOnce: UsedOnceMap;
	/** Specialist card code → investigator codes that used it (the Specialist widget). */
	specialistUsage: Record<CardCode, CardCode[]>;
	/** Per-deck spotlight-card footprints (the neutral-card insight widgets). */
	insightDecks: InsightDeck[];
	/** "Eligible but unused" tallies keyed by target id (Vicious Blow & Deduction widget). */
	eligibilityInsights: Record<string, EligibilityInsight>;
	/** Count of all the subject's decks (the "% of decks" denominator). */
	totalDecks: number;
	/** Top decks by ally / accessory count (Charisma & Relic Hunter widget). */
	charismaTopDecks: DeckTopEntry[];
	relicTopDecks: DeckTopEntry[];
	/** Per customizable card: level + option usage tallies. */
	customizableUsage: CustomizableUsage;
	playedCardCodes: CardCode[];
	ownedProducts: Product[] | null;
	trackedTiers: DifficultyTier[];
	/** Live "Log-only mode" master switch — hide widgets/sections needing data beyond the log. */
	logOnly: boolean;
	/** Per-campaign Log-only overrides (campaign slug → true). */
	campaignLogOnly: Record<string, boolean>;
	/** Hide the Cards & Investigators categories (entirely deck-derived). */
	campaignCategoriesOnly: boolean;
}

/** The layout payload fields `toWidgetData` reads (a structural subset). */
export interface ProfilePayload {
	summary: ProfileSummary;
	campaigns: ProfileCampaign[];
	clearGrid: ClearGridRow[];
	soloClearGrid: ClearGridRow[];
	trueSoloClearGrid: ClearGridRow[];
	winLossRecord: WinLossRecord[];
	calendar: CalendarEntry[];
	endings: CampaignEndings[];
	collections: CampaignCollections[];
	scenarios: CampaignScenarios[];
	standaloneUsage: CampaignStandaloneUsage[];
	traumaTally: TraumaTally;
	eoe: CampaignEoe[];
	tsk: CampaignTsk[];
	dwl: CampaignDwl[];
	ptc: CampaignPtc[];
	tfa: CampaignTfa[];
	tcu: CampaignTcu[];
	tdea: CampaignTdea[];
	tdeb: CampaignTdeb[];
	tic: CampaignTic[];
	fhv: CampaignFhv[];
	tdc: CampaignTdc[];
	notz: CampaignNotz[];
	specialInteractions: CampaignSpecialInteractions[];
	achievements: ProfileAchievementsData;
	investigators: InvestigatorStat[];
	cardUsage: Record<CardCode, number>;
	usedOnce: UsedOnceMap;
	specialistUsage: Record<CardCode, CardCode[]>;
	insightDecks: InsightDeck[];
	eligibilityInsights: Record<string, EligibilityInsight>;
	totalDecks: number;
	charismaTopDecks: DeckTopEntry[];
	relicTopDecks: DeckTopEntry[];
	customizableUsage: CustomizableUsage;
	playedCardCodes: CardCode[];
	settings: ProfileSettings;
}

export function toWidgetData(d: ProfilePayload): ProfileWidgetData {
	return {
		// Default for payloads compiled/shared before the summary block existed.
		summary: d.summary ?? emptyProfileSummary(),
		campaigns: d.campaigns,
		clearGrid: d.clearGrid,
		// Defaults for payloads compiled/shared before the solo grids existed.
		soloClearGrid: d.soloClearGrid ?? [],
		trueSoloClearGrid: d.trueSoloClearGrid ?? [],
		winLossRecord: d.winLossRecord,
		calendar: d.calendar,
		endings: d.endings,
		collections: d.collections,
		scenarios: d.scenarios,
		standaloneUsage: d.standaloneUsage,
		traumaTally: d.traumaTally,
		eoe: d.eoe,
		tsk: d.tsk,
		// Default for payloads compiled/shared before the dwl blob existed.
		dwl: d.dwl ?? [],
		// Default for payloads compiled/shared before the ptc blob existed.
		ptc: d.ptc ?? [],
		// Default for payloads compiled/shared before the tfa blob existed.
		tfa: d.tfa ?? [],
		// Default for payloads compiled/shared before the tcu blob existed.
		tcu: d.tcu ?? [],
		// Defaults for payloads compiled/shared before the tdea/tdeb blobs existed.
		tdea: d.tdea ?? [],
		tdeb: d.tdeb ?? [],
		// Default for payloads compiled/shared before the tic blob existed.
		tic: d.tic ?? [],
		// Default for payloads compiled/shared before the fhv blob existed.
		fhv: d.fhv ?? [],
		// Default for payloads compiled/shared before the tdc blob existed.
		tdc: d.tdc ?? [],
		// Default for payloads compiled/shared before the notz blob existed.
		notz: d.notz ?? [],
		// Default for payloads compiled/shared before this field existed.
		specialInteractions: d.specialInteractions ?? [],
		achievements: d.achievements,
		investigators: d.investigators,
		cardUsage: d.cardUsage,
		// Defaults for payloads compiled/shared before these fields existed.
		usedOnce: d.usedOnce ?? {},
		specialistUsage: d.specialistUsage ?? {},
		insightDecks: d.insightDecks ?? [],
		eligibilityInsights: d.eligibilityInsights ?? {},
		totalDecks: d.totalDecks ?? 0,
		charismaTopDecks: d.charismaTopDecks ?? [],
		relicTopDecks: d.relicTopDecks ?? [],
		customizableUsage: d.customizableUsage ?? {},
		playedCardCodes: d.playedCardCodes,
		ownedProducts: d.settings.ownedProducts,
		trackedTiers: d.settings.trackedTiers,
		logOnly: d.settings.logOnly ?? false,
		campaignLogOnly: d.settings.campaignLogOnly ?? {},
		campaignCategoriesOnly: d.settings.campaignCategoriesOnly ?? false,
	};
}
