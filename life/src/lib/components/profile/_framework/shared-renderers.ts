import { Product } from '@5argon/arkham-kohaku';
import { mergeStandaloneUsage } from '$lib/campaign/outcomes/standalone-usage';
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
import type { DifficultyTier } from '$lib/campaign/profile/profile-settings';
import type { ProfilePayload } from '$lib/profile/profile-types';
import * as m from '$lib/paraglide/messages.js';
import { widget, type RenderContext, type WidgetRenderer } from './widget-renderer';
import AllAchievements from '../campaigns/AllAchievements.svelte';
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
import InvestigatorInsightsView from '../investigators/InvestigatorInsightsView.svelte';
import MostUsedInvestigatorsView from '../investigators/MostUsedInvestigatorsView.svelte';

const count = (c: RenderContext, fallback: number) =>
	typeof c.slot.config?.count === 'number' ? c.slot.config.count : fallback;
const classOf = (c: RenderContext) => c.def.variantClass ?? c.classFilter;

function clearGrid(
	rows: (p: ProfilePayload) => ClearGridRow[],
	title: (a: { cleared: number; total: number }) => string
): WidgetRenderer {
	return widget(
		CampaignClearGrid,
		(c) => ({
			grid: c.slice(rows(c.payload)),
			trackedTiers: c.payload.settings.trackedTiers,
			endings: c.slice(c.payload.endings)
		}),
		(c) => {
			const tiers: DifficultyTier[] = trackedTierList(c.payload.settings.trackedTiers);
			const owned = c.slice(rows(c.payload)).filter((r) => r.owned);
			const cleared = owned.filter((r) => tiers.some((t) => r.byTier[t] === 'cleared')).length;
			return title({ cleared, total: owned.length });
		}
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
	clearGrid: clearGrid((p) => p.clearGrid, m.framework_title_clear_grid),
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
