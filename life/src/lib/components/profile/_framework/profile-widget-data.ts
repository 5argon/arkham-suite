/**
 * Shared shape + mapper feeding the <ProfileWidgets> widget renderer. The
 * profile `/p/private/[uid]` layout computes the full payload; every nested
 * page maps it through `toWidgetData` (flattening the scope globals out of
 * `settings`) so the renderer takes one flat prop.
 */

import type { CardCode, Product } from '@5argon/arkham-kohaku';
import type { DifficultyTier, ProfileSettings } from '$lib/campaign/profile-settings';
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
import type { ClearGridRow, WinLossRecord, CampaignEndings } from '$lib/campaign/clear-status';
import type { CampaignCollections } from '$lib/campaign/collections';
import type { CampaignScenarioXp } from '$lib/campaign/extra-imports';
import type { CampaignResolutionCoverage } from '$lib/campaign/resolution-coverage';
import type { CampaignStandaloneUsage } from '$lib/campaign/standalone-usage';
import type { TraumaTally } from '$lib/campaign/trauma';
import type { CampaignEoeCity } from '$lib/campaign/eoe-city';
import type { CampaignEoe } from '$lib/campaign/eoe';
import type { CampaignTsk } from '$lib/campaign/tsk-profile';
import type { CampaignSpecialInteractions } from '$lib/campaign/special-interactions';

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
	scenarioXp: CampaignScenarioXp[];
	resolutionCoverage: CampaignResolutionCoverage[];
	standaloneUsage: CampaignStandaloneUsage[];
	traumaTally: TraumaTally;
	eoeCity: CampaignEoeCity[];
	eoe: CampaignEoe[];
	tsk: CampaignTsk[];
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
	scenarioXp: CampaignScenarioXp[];
	resolutionCoverage: CampaignResolutionCoverage[];
	standaloneUsage: CampaignStandaloneUsage[];
	traumaTally: TraumaTally;
	eoeCity: CampaignEoeCity[];
	eoe: CampaignEoe[];
	tsk: CampaignTsk[];
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
		scenarioXp: d.scenarioXp,
		resolutionCoverage: d.resolutionCoverage,
		standaloneUsage: d.standaloneUsage,
		traumaTally: d.traumaTally,
		eoeCity: d.eoeCity,
		eoe: d.eoe,
		tsk: d.tsk,
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
