/** The shapes of a profile payload, shared by its builder and the profile components. */

import type { CardCode } from '@5argon/arkham-kohaku';
import type { ProfileFamily } from '$lib/campaign/achievements/achievement-aggregate';
import type { CampaignCoverage, CustomAchievement } from '$lib/campaign/achievements/custom-achievements';
import type {
	CampaignEndings,
	WinLossRecord,
	ClearGridRow,
	ClearState,
} from '$lib/campaign/outcomes/clear-status';
import type { CampaignCollections } from '$lib/campaign/stats/collections';
import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
import type { CampaignStandaloneUsage } from '$lib/campaign/outcomes/standalone-usage';
import type { StandaloneArchiveStat } from '$lib/campaign/outcomes/standalone-archives';
import type { TraumaTally } from '$lib/campaign/outcomes/trauma';
import type { BespokeBlobs } from '$lib/campaign/campaigns/registry';
import type { ProfileSettings } from '$lib/campaign/profile/profile-settings';
import type {
	CampaignSpecialInteractions,
	SpecialInteractionsPartial,
} from '$lib/campaign/outcomes/special-interactions';

/** Who a profile is about, baked in so a compiled profile renders its own header. */
export interface ProfileSubject {
	kind: 'account' | 'player' | 'group' | 'unknown';
	/** `'__account__'`, a roster member uid or a play-group uid. */
	uid: string;
	name: string;
	/** The avatar's investigator code; null for groups. */
	iconCardCode: string | null;
	/** A group's members; empty otherwise. */
	members: { name: string; iconCardCode: string | null }[];
}

/** A campaign listed on a profile. Dates are ms since epoch. */
export interface ProfileCampaign {
	id: string;
	title: string;
	campaignCode: string;
	difficulty: 'easy' | 'standard' | 'hard' | 'expert';
	/** Resolved from participants when set to auto; null when unknown. */
	playerCount: number | null;
	finishDate: number | null;
	startDate: number | null;
	draft: boolean;
}

/** Where a card used in exactly one deck was used (old Core Set printings fold into Revised). */
export interface UsedOnceEntry {
	investigator: CardCode;
	campaignId: string;
	campaignCode: string;
	campaignTitle: string;
	difficulty: 'easy' | 'standard' | 'hard' | 'expert';
	finishDate: number | null;
}
export type UsedOnceMap = Record<CardCode, UsedOnceEntry>;

/** A deck's copies of the cards the neutral-card insight widgets track (decks with none are omitted). */
export interface InsightDeck {
	inv: CardCode;
	/** Card code → most copies in any version: answers "ever used", not "had N at once". */
	slots: Record<CardCode, number>;
	/** Most distinct core neutral cantrips (Guts, Perception, Overpower, Manual Dexterity) in one version. */
	cantripMax: number;
}

/** How the decks that could include a card (e.g. Vicious Blow) used it, over every deck. */
export interface EligibilityInsight {
	/** Decks whose investigator can include the card. */
	canUse: number;
	/** Eligible decks that ran it in any version. */
	used: number;
	/** Each `*Investigators` list holds up to three examples. */
	usedInvestigators: CardCode[];
	notUsed: number;
	notUsedInvestigators: CardCode[];
	/** Used decks that dropped every printing by their final version, without upgrading it. */
	removed: number;
	removedInvestigators: CardCode[];
	/** Used decks that kept a printing in their final version. */
	neverRemovedInvestigators: CardCode[];
}

/** A deck's best version for the Charisma (allies) or Relic Hunter (accessories) tables. */
export interface DeckTopEntry {
	inv: CardCode;
	/** Charisma / Relic Hunter copies in that version. */
	count: number;
	/** Allies / accessories in that version, the ranking metric. */
	total: number;
	cards: { code: CardCode; qty: number }[];
}

/** A customizable card across decks, from each deck's furthest upgrade. */
export interface CustomizableCardUsage {
	/** Level → decks that reached it. */
	levels: Record<string, number>;
	/** Option index → decks that unlocked it, with up to three recent investigators. */
	options: Record<string, { count: number; recent: CardCode[] }>;
}
export type CustomizableUsage = Record<CardCode, CustomizableCardUsage>;

export interface ProfileAchievementsData {
	families: ProfileFamily[];
	custom: CustomAchievement[];
	coverage: CampaignCoverage[];
}

export interface CalendarEntry {
	campaignId: string;
	title: string;
	campaignCode: string;
	family: string;
	difficulty: string;
	/** The finish date, else the start date. */
	date: number | null;
	dateKind: 'finish' | 'start' | null;
	state: ClearState | null;
}

/** An investigator's play count and the deckbuilding options chosen for it. */
export interface InvestigatorStat {
	code: CardCode;
	count: number;
	options: string[];
}

/** Lifetime headline numbers across every campaign, assembled from the logs and cards segments. */
export interface ProfileSummary {
	/** Won, lost and unfinished. */
	totalPlays: number;
	totalWins: number;
	campaignsPlayed: number;
	/** The clear grid's denominator. */
	ownedCampaigns: number;
	campaignsClearedAny: number;
	/** A campaign cleared on two tiers counts in both. */
	campaignsClearedByTier: Record<string, number>;
	achievementsEarned: number;
	achievementsTotal: number;
	investigatorsPlayed: number;
	cardsPlayed: number;
	/** Standalone scenarios played inside campaigns. */
	standalonePlays: number;
}

/** Campaign list + calendar: cheap, rebuilt on any metadata edit. */
export interface MetaSegment {
	campaigns: ProfileCampaign[];
	calendar: CalendarEntry[];
}

/** Everything aggregated from the recorded logs and Extra inputs. */
export interface LogsSegment {
	achievements: ProfileAchievementsData;
	clearGrid: ClearGridRow[];
	/** Over 1-player plays only (true solo + multi-handed solo). */
	soloClearGrid: ClearGridRow[];
	/** Over 1-player plays by a single deck. */
	trueSoloClearGrid: ClearGridRow[];
	winLossRecord: WinLossRecord[];
	endings: CampaignEndings[];
	collections: CampaignCollections[];
	scenarios: CampaignScenarios[];
	standaloneUsage: CampaignStandaloneUsage[];
	standalones: StandaloneArchiveStat[];
	traumaTally: TraumaTally;
	bespoke: BespokeBlobs;
	/** Joined with each campaign's roster at assembly. */
	specialInteractions: SpecialInteractionsPartial[];
}

/** Everything read from the subject's decks — the expensive scan. */
export interface CardsSegment {
	/** Card code → number of deck chains that put it in play. */
	cardUsage: Record<CardCode, number>;
	investigators: InvestigatorStat[];
	playedCardCodes: CardCode[];
	/** Campaign id → investigator codes, for per-investigator joins at assembly. */
	investigatorsByCampaign: Record<string, CardCode[]>;
	/** Raw code → the one deck that used it; resolved into `usedOnce` at assembly. */
	usedOnceRaw: Record<CardCode, { investigator: CardCode; campaignId: string }>;
	/** Specialist card code → investigator codes whose decks used it. */
	specialistUsage: Record<CardCode, CardCode[]>;
	insightDecks: InsightDeck[];
	eligibilityInsights: Record<string, EligibilityInsight>;
	/** Every deck of the subject; the "% of decks" denominator. */
	totalDecks: number;
	charismaTopDecks: DeckTopEntry[];
	relicTopDecks: DeckTopEntry[];
	customizableUsage: CustomizableUsage;
}

/** Everything a profile page renders. */
export interface ProfilePayload
	extends MetaSegment,
		Omit<LogsSegment, 'specialInteractions'>,
		Omit<CardsSegment, 'investigatorsByCampaign' | 'usedOnceRaw'> {
	subject: ProfileSubject;
	summary: ProfileSummary;
	specialInteractions: CampaignSpecialInteractions[];
	usedOnce: UsedOnceMap;
	settings: ProfileSettings;
}
