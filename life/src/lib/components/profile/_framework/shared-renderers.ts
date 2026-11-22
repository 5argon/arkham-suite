import { Product, type Campaign } from '@5argon/arkham-kohaku';
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { mergeStandaloneUsage } from '$lib/campaign/outcomes/standalone-usage';
import type { RewardUnlock } from '$lib/campaign/rewards/rewards';
import { challengeFor } from '$lib/campaign/profile/widgets/standalone/layout';
import { standaloneKey, type StandalonePageBlob } from '$lib/campaign/standalones/define';
import type { StandaloneRules } from '$lib/campaign/standalones/rules';
import { STANDALONE_RULES } from '$lib/campaign/standalones/rules-registry';
import type { Challenge, ChallengeBlob } from '$lib/campaign/standalones/side/challenges';
import { cardByCode } from '$lib/card-data';
import { trackedTierList } from '$lib/campaign/records/tracking';
import {
	insightRows,
	isExceptional,
	isLevel5,
	isPermanent,
	isResearched,
	isSkillCard
} from '$lib/campaign/utils/card-filters';
import type { ClearGridRow } from '$lib/campaign/outcomes/clear-status';
import { playedCampaignList, playedFamiliesFrom } from '$lib/campaign/profile/profile-slugs';
import { GROUPED_CAMPAIGNS, campaignGroupOf } from '$lib/campaign/utils/campaign-group';
import { campaignCodeForFamily } from '$lib/components/campaign/campaign-identity';
import type { DifficultyTier } from '$lib/campaign/profile/profile-settings';
import type { ProfilePayload } from '$lib/profile/profile-types';
import * as m from '$lib/paraglide/messages.js';
import { widget, type RenderContext, type WidgetRenderer } from './widget-renderer';
import AllAchievements from '../campaigns/AllAchievements.svelte';
import CampaignTiles from '../campaigns/CampaignTiles.svelte';
import TraumaTallyView from '../campaigns/TraumaTallyView.svelte';
import WinLossRecordView from '../campaigns/WinLossRecordView.svelte';
import ProfileAchievements from '../campaigns/campaign/ProfileAchievements.svelte';
import ResolutionCoverage from '../campaigns/campaign/ResolutionCoverage.svelte';
import ScenarioXpView from '../campaigns/campaign/ScenarioXpView.svelte';
import SingleCampaignSummary from '../campaigns/campaign/SingleCampaignSummary.svelte';
import SpecialInteractions from '../campaigns/campaign/SpecialInteractions.svelte';
import CardInsightsView from '../cards/CardInsightsView.svelte';
import CardSpotlightView from '../cards/CardSpotlightView.svelte';
import CardUtilizationView from '../cards/CardUtilizationView.svelte';
import MostUsedNonCoreView from '../cards/MostUsedNonCoreView.svelte';
import SpecialistCardsView from '../cards/class/SpecialistCardsView.svelte';
import CharismaRelicView from '../cards/core/CharismaRelicView.svelte';
import CoreSetHistoryView from '../cards/core/CoreSetHistoryView.svelte';
import CoreSetUsedOnceView from '../cards/core/CoreSetUsedOnceView.svelte';
import CustomizableCardsView from '../cards/keywords/CustomizableCardsView.svelte';
import ViciousBlowDeductionView from '../cards/skill/ViciousBlowDeductionView.svelte';
import { SPOTLIGHT_WIDGETS } from '../cards/spotlight-widgets';
import CalendarTimeline from '../home/CalendarTimeline.svelte';
import CampaignClearGrid from '../home/CampaignClearGrid.svelte';
import CampaignsPlayedView from '../home/CampaignsPlayedView.svelte';
import StandaloneUsageView from '../home/StandaloneUsageView.svelte';
import RewardCards from '../rewards/RewardCards.svelte';
import StandaloneDeckXp from '../standalones/StandaloneDeckXp.svelte';
import StandaloneOverview from '../standalones/StandaloneOverview.svelte';
import StandalonePlays from '../standalones/StandalonePlays.svelte';
import StandaloneReward from '../standalones/StandaloneReward.svelte';
import StandaloneSources from '../standalones/StandaloneSources.svelte';
import StandaloneCards from '../standalones/StandaloneCards.svelte';
import StandaloneEndings from '../standalones/StandaloneEndings.svelte';
import ChallengeAdvanced from '../standalones/side/ChallengeAdvanced.svelte';
import ChallengeScore from '../standalones/side/ChallengeScore.svelte';
import { standaloneText } from '../standalones/side/text';
import InvestigatorInsightsView from '../investigators/InvestigatorInsightsView.svelte';
import MostUsedInvestigatorsView from '../investigators/MostUsedInvestigatorsView.svelte';

const count = (c: RenderContext, fallback: number) =>
	typeof c.slot.config?.count === 'number' ? c.slot.config.count : fallback;
const classOf = (c: RenderContext) => c.def.variantClass ?? c.classFilter;

/** Whether a family is in the chapter; every family when no chapter is given. Chapter One includes
 *  its Return-to boxes. */
function inChapter(family: string, chapter?: 1 | 2): boolean {
	if (chapter === undefined) return true;
	const group = campaignGroupOf(campaignCodeForFamily(family));
	return chapter === 2
		? group === 'chapterTwo'
		: group === 'chapterOne' || group === 'chapterOneReturnTo';
}

function clearGrid(
	rows: (p: ProfilePayload) => ClearGridRow[],
	title: (a: { cleared: number; total: number }) => string,
	chapter?: 1 | 2
): WidgetRenderer {
	const inChapterRow = (r: ClearGridRow) => inChapter(r.family, chapter);
	return widget(
		CampaignClearGrid,
		(c) => ({
			grid: c.slice(rows(c.payload)).filter(inChapterRow),
			trackedTiers: c.payload.settings.trackedTiers,
			endings: c.slice(c.payload.endings),
			playedFamilies: playedFamiliesFrom(c.payload.winLossRecord)
		}),
		(c) => {
			const tiers: DifficultyTier[] = trackedTierList(c.payload.settings.trackedTiers);
			const owned = c
				.slice(rows(c.payload))
				.filter(inChapterRow)
				.filter((r) => r.owned);
			const cleared = owned.filter((r) => tiers.some((t) => r.byTier[t] === 'cleared')).length;
			return title({ cleared, total: owned.length });
		}
	);
}

/** Campaign order: Chapter One, its Return-to boxes, then Chapter Two; anything else last. */
function campaignOrder(family: string): number {
	const i = GROUPED_CAMPAIGNS.indexOf(campaignCodeForFamily(family) as Campaign);
	return i < 0 ? Number.MAX_SAFE_INTEGER : i;
}

function campaignTiles(title: (a: { count: number }) => string, chapter?: 1 | 2): WidgetRenderer {
	const campaigns = (c: RenderContext) =>
		playedCampaignList(c.payload.winLossRecord)
			.filter((p) => inChapter(p.family, chapter))
			.sort((a, b) => campaignOrder(a.family) - campaignOrder(b.family));
	return widget(
		CampaignTiles,
		(c) => ({ campaigns: campaigns(c) }),
		(c) => title({ count: campaigns(c).length })
	);
}

const cardUtilization = (predicate: typeof isPermanent) =>
	widget(CardUtilizationView, (c) => ({
		predicate,
		cardUsage: c.payload.cardUsage,
		ownedProducts: c.payload.settings.ownedProducts,
		classFilter: c.classFilter
	}));

const spotlightWidgets = Object.fromEntries(
	Object.entries(SPOTLIGHT_WIDGETS).map(([id, w]) => [
		id,
		widget(CardSpotlightView, (c) => {
			const spotlights = w.spotlights();
			return {
				spotlights,
				cols: w.cols,
				cardUsage: c.payload.cardUsage,
				rows: insightRows(w.rows(spotlights), c.payload.insightDecks, c.payload.totalDecks)
			};
		})
	])
);

const favoriteCard = widget(MostUsedNonCoreView, (c) => ({
	cardUsage: c.payload.cardUsage,
	ownedProducts: c.payload.settings.ownedProducts,
	classFilter: classOf(c),
	count: count(c, 10)
}));

const deckStats = widget(MostUsedInvestigatorsView, (c) => ({
	investigators: c.payload.investigators,
	classFilter: classOf(c),
	count: count(c, 5)
}));

const PLAYER_CLASSES = ['guardian', 'seeker', 'rogue', 'mystic', 'survivor', 'neutral'];

export const SHARED_RENDERERS: Record<string, WidgetRenderer> = {
	overview: widget(SingleCampaignSummary, (c) => ({
		record: c.pick(c.payload.winLossRecord),
		clear: c.pick(c.payload.clearGrid),
		endings: c.pick(c.payload.endings),
		trackedTiers: c.payload.settings.trackedTiers,
		logOnly: c.ctx.logOnly
	})),
	resolutionCoverage: widget(ResolutionCoverage, (c) => ({ scenarios: c.ctx.scenarios })),
	campaignsPlayed: widget(CampaignsPlayedView, (c) => ({ campaigns: c.payload.campaigns })),
	campaignTiles: campaignTiles(m.framework_title_campaign_tiles),
	campaignTilesChapterOne: campaignTiles(m.framework_title_campaign_tiles_chapter_one, 1),
	campaignTilesChapterTwo: campaignTiles(m.framework_title_campaign_tiles_chapter_two, 2),
	clearGrid: clearGrid((p) => p.clearGrid, m.framework_title_clear_grid),
	clearGridChapterOne: clearGrid((p) => p.clearGrid, m.framework_title_clear_grid_chapter_one, 1),
	clearGridChapterTwo: clearGrid((p) => p.clearGrid, m.framework_title_clear_grid_chapter_two, 2),
	soloClearGrid: clearGrid((p) => p.soloClearGrid, m.framework_title_solo_clear_grid),
	trueSoloClearGrid: clearGrid((p) => p.trueSoloClearGrid, m.framework_title_true_solo_clear_grid),
	calendar: widget(CalendarTimeline, (c) => ({ calendar: c.slice(c.payload.calendar) })),
	traumaTally: widget(TraumaTallyView, (c) => ({ tally: c.payload.traumaTally, family: c.family })),
	winLossRecord: widget(
		WinLossRecordView,
		(c) => ({ records: c.slice(c.payload.winLossRecord), showFamilyName: !c.family }),
		(c) =>
			m.framework_title_win_loss({
				wins: c.payload.summary.totalWins,
				plays: c.payload.summary.totalPlays
			})
	),
	achievements: widget(
		ProfileAchievements,
		(c) => ({ families: c.slice(c.payload.achievements.families), showFamilyName: !c.family }),
		(c) => {
			const families = c.slice(c.payload.achievements.families);
			return m.framework_title_achievements({
				earned: families.reduce((n, f) => n + f.earned, 0),
				total: families.reduce((n, f) => n + f.total, 0)
			});
		}
	),
	allAchievements: widget(
		AllAchievements,
		(c) => ({ families: c.payload.achievements.families }),
		(c) =>
			m.framework_title_all_achievements({
				earned: c.payload.summary.achievementsEarned,
				total: c.payload.summary.achievementsTotal
			})
	),
	scenarioXp: widget(ScenarioXpView, (c) => ({
		scenarios: c.slice(c.payload.scenarios),
		showFamilyName: !c.family
	})),
	specialInteractions: widget(SpecialInteractions, (c) => ({
		special: c.pick(c.payload.specialInteractions)
	})),
	standaloneUsage: widget(StandaloneUsageView, (c) => ({
		rows: c.family
			? (c.pick(c.payload.standaloneUsage)?.standalones ?? [])
			: mergeStandaloneUsage(c.payload.standaloneUsage),
		family: c.family
	})),
	rewardsUnlocked: widget(RewardCards, (c) => ({
		rewards: (c.payload.rewards ?? []).filter(
			(r) => r.earned.total > 0 || owns(c.payload.settings.ownedProducts, r.code)
		)
	})),
	standaloneSources: widget(StandaloneSources, (c) => ({ stat: c.ctx.standalone })),
	standaloneEndings: widget(StandaloneEndings, (c) => ({
		rules: pageRules(c),
		tallies: (c.blob as StandalonePageBlob | null)?.endings ?? null
	})),
	standaloneCards: widget(StandaloneCards, (c) => ({
		rules: pageRules(c),
		tallies: (c.blob as StandalonePageBlob | null)?.cards ?? null
	})),
	challengeAdvanced: widget(ChallengeAdvanced, (c) => ({
		challenge: pageChallenge(c),
		blob: c.blob as ChallengeBlob | null
	})),
	challengeScore: widget(
		ChallengeScore,
		(c) => ({
			challenge: pageChallenge(c),
			scores: (c.blob as ChallengeBlob | null)?.scores ?? null
		}),
		(c) => {
			const prefix = pageChallenge(c)?.prefix;
			return prefix ? standaloneText(`standalone_${prefix}_score_title`) : c.def.label();
		}
	),
	standaloneOverview: widget(StandaloneOverview, (c) => ({ stat: c.ctx.standalone })),
	standaloneReward: widget(StandaloneReward, (c) => ({ reward: pageReward(c) })),
	standalonePlays: widget(StandalonePlays, (c) => ({
		stat: c.ctx.standalone,
		logOnly: c.ctx.logOnly
	})),
	standaloneDeckXp: widget(StandaloneDeckXp, (c) => ({ stat: c.ctx.standalone })),

	cardInsights: widget(CardInsightsView, (c) => ({
		cardUsage: c.payload.cardUsage,
		ownedProducts: c.payload.settings.ownedProducts,
		classFilter: c.classFilter
	})),
	favoriteCard,
	...Object.fromEntries(PLAYER_CLASSES.map((cls) => [`favoriteCard_${cls}`, favoriteCard])),
	cardHistory: widget(CoreSetHistoryView, (c) => ({
		product: Product.RevisedCoreSet,
		cardUsage: c.payload.cardUsage
	})),
	cardHistory2026: widget(CoreSetHistoryView, (c) => ({
		product: Product.CoreSet2026,
		cardUsage: c.payload.cardUsage
	})),
	cardHistoryOnce: widget(CoreSetUsedOnceView, (c) => ({
		product: Product.RevisedCoreSet,
		usedOnce: c.payload.usedOnce
	})),
	cardHistoryOnce2026: widget(CoreSetUsedOnceView, (c) => ({
		product: Product.CoreSet2026,
		usedOnce: c.payload.usedOnce
	})),
	permanentCards: cardUtilization(isPermanent),
	exceptionalCards: cardUtilization(isExceptional),
	level5Cards: cardUtilization(isLevel5),
	researchedCards: cardUtilization(isResearched),
	skillCards: cardUtilization(isSkillCard),
	customizableCards: widget(CustomizableCardsView, (c) => ({
		customizableUsage: c.payload.customizableUsage,
		classFilter: c.classFilter
	})),
	specialistCards: widget(SpecialistCardsView, (c) => ({
		specialistUsage: c.payload.specialistUsage
	})),
	...spotlightWidgets,
	charismaRelic: widget(CharismaRelicView, (c) => ({
		cardUsage: c.payload.cardUsage,
		insightDecks: c.payload.insightDecks,
		totalDecks: c.payload.totalDecks,
		charismaTopDecks: c.payload.charismaTopDecks,
		relicTopDecks: c.payload.relicTopDecks
	})),
	viciousBlowDeduction: widget(ViciousBlowDeductionView, (c) => ({
		cardUsage: c.payload.cardUsage,
		eligibilityInsights: c.payload.eligibilityInsights
	})),

	deckStats,
	...Object.fromEntries(PLAYER_CLASSES.map((cls) => [`deckStats_${cls}`, deckStats])),
	investigatorInsights: widget(InvestigatorInsightsView, (c) => ({
		investigators: c.payload.investigators,
		ownedProducts: c.payload.settings.ownedProducts,
		classFilter: c.classFilter,
		config: c.slot.config
	}))
};

/** Whether the subject owns the product a reward card comes in: a locked reward from a product they
 *  don't own is not a gap to fill. `null` owns everything. */
function owns(ownedProducts: Product[] | null, code: string): boolean {
	const product = cardByCode(code)?.product;
	return ownedProducts == null || (product != null && ownedProducts.includes(product));
}

/** The page's standalone key, from its scenario's plays. */
function pageKey(c: RenderContext): string | null {
	const stat = c.ctx.standalone;
	return stat ? standaloneKey(stat.catalogueCode, stat.scenario) : null;
}

function pageRules(c: RenderContext): StandaloneRules | null {
	const key = pageKey(c);
	return key ? (STANDALONE_RULES[key] ?? null) : null;
}

function pageChallenge(c: RenderContext): Challenge | null {
	const key = pageKey(c);
	return key ? challengeFor(key) : null;
}

/** The reward card a standalone page's scenario grants, with the subject's unlocks of it. */
function pageReward(c: RenderContext): RewardUnlock | null {
	const stat = c.ctx.standalone;
	const catalogue = stat && getCampaignLog(stat.catalogueCode)?.db.code;
	if (!stat || !catalogue) return null;
	return (
		(c.payload.rewards ?? []).find(
			(r) => r.catalogue === catalogue && r.scenario === stat.scenario
		) ?? null
	);
}
