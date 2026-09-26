/** Widgets that are not tied to one campaign, in picker order. */
import * as m from '$lib/paraglide/messages.js';
import type { PaneId } from '../profile-settings';
import type { WidgetConfigOption, WidgetDef } from '../widget-def';

const PLAYER_CLASSES = ['guardian', 'seeker', 'rogue', 'mystic', 'survivor', 'neutral'];
const className = (cls: string) => m.shared_class({ class: cls });

const def = (
	id: string,
	label: () => string,
	panes: PaneId[],
	primaryPane: PaneId,
	rest: Partial<WidgetDef> = {}
): WidgetDef => ({ id, label, panes, primaryPane, ...rest });

const CARD_PAGES: PaneId[] = ['cardsHome', 'cardClassDetail'];
const topCount = (fallback: number): WidgetConfigOption[] => [
	{ kind: 'count', fallback, choices: [5, 10, 15] }
];
const wide = { fullWidth: true };

export const SHARED_WIDGETS: WidgetDef[] = [
	def('overview', m.framework_label_overview, ['campaignDetail'], 'campaignDetail'),
	def('resolutionCoverage', m.framework_label_resolution_coverage, ['campaignDetail'], 'campaignDetail', {
		nonLog: 'full'
	}),
	def('campaignsPlayed', m.profile_campaigns_played_title, ['campaignsHome', 'home'], 'campaignsHome'),
	def('clearGrid', m.framework_label_clear_grid, ['home', 'campaignsHome'], 'home', wide),
	def('soloClearGrid', m.framework_label_solo_clear_grid, ['home', 'campaignsHome'], 'home', {
		...wide,
		defaultHidden: true
	}),
	def('trueSoloClearGrid', m.framework_label_true_solo_clear_grid, ['home', 'campaignsHome'], 'home', {
		...wide,
		defaultHidden: true
	}),
	def('calendar', m.framework_label_calendar, ['home', 'campaignsHome'], 'home'),
	def('traumaTally', m.framework_label_trauma_tally, ['home', 'campaignsHome'], 'campaignsHome', wide),
	def('winLossRecord', m.framework_label_win_loss, ['campaignsHome'], 'campaignsHome'),
	def('achievements', m.framework_label_achievements, ['campaignDetail'], 'campaignDetail', wide),
	def('allAchievements', m.framework_label_all_achievements, ['campaignsHome'], 'campaignsHome', wide),
	def('scenarioXp', m.framework_label_scenario_xp, ['campaignDetail'], 'campaignDetail', { nonLog: 'full' }),
	def('specialInteractions', m.framework_label_special_interactions, ['campaignDetail'], 'campaignDetail'),
	def('standaloneUsage', m.framework_label_standalone_usage, ['home'], 'home'),

	def('cardInsights', m.framework_label_card_insights, CARD_PAGES, 'cardsHome', wide),
	def('favoriteCard', m.framework_label_favorite_card, ['home', ...CARD_PAGES], 'cardsHome', {
		...wide,
		classLabel: m.framework_label_favorite_card_class,
		config: topCount(10)
	}),
	...PLAYER_CLASSES.map((cls) =>
		def(
			`favoriteCard_${cls}`,
			() => m.framework_label_favorite_card_class({ cls: className(cls) }),
			['home', 'cardsHome'],
			'cardsHome',
			{ ...wide, defaultHidden: true, variantClass: cls, config: topCount(10) }
		)
	),
	def('cardHistory', m.framework_label_card_history, ['cardsHome', 'cardsCore'], 'cardsCore', wide),
	def('cardHistory2026', m.framework_label_card_history_2026, ['cardsHome', 'cardsCore'], 'cardsCore', wide),
	def('cardHistoryOnce', m.framework_label_card_history_once, ['cardsHome', 'cardsCore'], 'cardsCore', wide),
	def('cardHistoryOnce2026', m.framework_label_card_history_once_2026, ['cardsHome', 'cardsCore'], 'cardsCore', wide),
	def('permanentCards', m.framework_label_permanent_cards, [...CARD_PAGES, 'cardsKeywords'], 'cardsKeywords', {
		...wide,
		classLabel: m.framework_label_permanent_cards_class
	}),
	def('exceptionalCards', m.framework_label_exceptional_cards, [...CARD_PAGES, 'cardsKeywords'], 'cardsKeywords', {
		...wide,
		classLabel: m.framework_label_exceptional_cards_class
	}),
	def('level5Cards', m.framework_label_level5_cards, [...CARD_PAGES, 'cardsLevels'], 'cardsLevels', {
		...wide,
		classLabel: m.framework_label_level5_cards_class
	}),
	def('skillCards', m.framework_label_skill_cards, [...CARD_PAGES, 'cardsSkill'], 'cardsSkill', {
		...wide,
		classLabel: m.framework_label_skill_cards_class
	}),
	def('researchedCards', m.framework_label_researched_cards, [...CARD_PAGES, 'cardsKeywords'], 'cardsKeywords', {
		...wide,
		classLabel: m.framework_label_researched_cards_class
	}),
	def('customizableCards', m.framework_label_customizable_cards, [...CARD_PAGES, 'cardsKeywords'], 'cardsKeywords', {
		...wide,
		classLabel: m.framework_label_customizable_cards_class
	}),
	// Specialist cards are all Neutral, so they default to the class page.
	def('specialistCards', m.framework_label_specialist_cards, CARD_PAGES, 'cardClassDetail', wide),
	def('coreNeutralL0', m.framework_label_core_neutral_l0, ['cardsHome', 'cardsCore'], 'cardsCore', wide),
	def('charismaRelic', m.framework_label_charisma_relic, ['cardsHome', 'cardsCore'], 'cardsCore', wide),
	def('desperateCards', m.framework_label_desperate_cards, ['cardsHome', 'cardsSkill'], 'cardsSkill'),
	def('innateCards', m.framework_label_innate_cards, ['cardsHome', 'cardsSkill'], 'cardsSkill'),
	def('coreNeutralSkillUpgrades', m.framework_label_core_neutral_skill_upgrades, ['cardsHome', 'cardsSkill'], 'cardsSkill'),
	def('viciousBlowDeduction', m.framework_label_vicious_blow_deduction, ['cardsHome', 'cardsSkill'], 'cardsSkill'),
	def('coreSetNeutralSkills', m.framework_label_core_set_neutral_skills, ['cardsHome', 'cardsSkill'], 'cardsSkill'),

	def('deckStats', m.framework_label_deck_stats, ['investigatorsHome', 'investigatorClassDetail'], 'investigatorsHome', {
		...wide,
		classLabel: m.framework_label_deck_stats_class,
		config: topCount(5)
	}),
	// No Neutral variant: too few neutral investigators.
	...PLAYER_CLASSES.filter((cls) => cls !== 'neutral').map((cls) =>
		def(
			`deckStats_${cls}`,
			() => m.framework_label_deck_stats_class({ cls: className(cls) }),
			['investigatorsHome'],
			'investigatorsHome',
			{ ...wide, defaultHidden: true, variantClass: cls, config: topCount(5) }
		)
	),
	def('investigatorInsights', m.framework_label_investigator_insights, ['investigatorsHome', 'investigatorClassDetail'], 'investigatorsHome', {
		...wide,
		config: [
			{ kind: 'toggle', key: 'ignoreParallel', label: m.framework_ignore_parallel_investigators },
			{ kind: 'toggle', key: 'ignore5u21', label: m.framework_ignore_subject_5u21 }
		]
	})
];
