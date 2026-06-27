/**
 * profile-widgets.ts — the single source of truth for the profile widget
 * catalogue. Each widget declares which hierarchy "panes" it may appear in (its
 * level), where it lands by default, and its data scope. This metadata is pure
 * (no Svelte imports) so any module can read it; the id→Svelte-component mapping
 * lives in the page files (a `{#if id === …}` switch).
 *
 * Panes form the page hierarchy:
 *   home → { campaignsHome → campaignDetail,
 *            cardsHome → { cardClassDetail, cardsCore, cardsAsset, cardsEvent,
 *                          cardsSkill, cardsKeywords, cardsLevels },
 *            investigatorsHome → investigatorClassDetail }
 *
 * A widget's `panes` drives the editor's per-pane widget list; `primaryPane` is
 * its default placement and the target when migrating an old flat (v1) layout.
 */

import { getCampaignLog } from '@5argon/arkham-campaign-data';
import * as m from '$lib/paraglide/messages.js';
import type { PaneId } from './profile-settings';

export interface WidgetDef {
	id: string;
	label: string;
	/** Panes this widget is allowed to appear in (the editor offers it there). */
	panes: PaneId[];
	/** Default placement + v1→v2 migration target. */
	primaryPane: PaneId;
	/** Data scope: spans everything / one campaign / one card class. */
	scope: 'aggregate' | 'perCampaign' | 'perClass';
	/** Ships in the catalogue but hidden by default — opt-in (e.g. per-class variants). */
	defaultHidden?: boolean;
	/**
	 * Campaign-specific widget: allowed only on its campaign's detail page, where it
	 * is interleaved into that campaign's own layout (`settings.campaigns[slug]`),
	 * chosen from the same picker as the shared widgets. `campaign` names the slug.
	 */
	perCampaignExtra?: boolean;
	/** Campaign slug a `perCampaignExtra` widget belongs to (e.g. 'tsk'). */
	campaign?: string;
	/**
	 * CONSTANT layout flag. `true` = the widget cannot be halved; it may live
	 * ONLY in a full-width row, never in a split-row slot (card grids, clear
	 * grids, the achievement wall, the campaign-summary hero, bespoke tallies).
	 * Enforced by the picker (excluded from split slots) and the resolver.
	 */
	fullWidth?: boolean;
	/**
	 * Optional artistic header image for the widget's card frame — a static-root
	 * path (e.g. `/image/widget/...webp`). Rendered right-aligned in the card
	 * header with a scrim so the left-aligned title stays legible over any image.
	 */
	image?: string;
	/**
	 * Dependence on data BEYOND the campaign log — either the "Extra" tab inputs
	 * (resolutions, XP, choices, Scarlet-Key bearers, erased cards, route…) OR imported
	 * deck contents. Investigator identity / trauma / experience do NOT count — those are
	 * log-available (so e.g. a bearer portrait is non-log because the bearer ASSIGNMENT is
	 * an Extra input, not because showing a portrait "reads the deck").
	 *  • 'full'    — the whole widget is non-log; under Log-only mode it shows a muted
	 *                placeholder (keeps its frame), and the picker surfaces a hint.
	 *  • 'partial' — has non-log sections but stays useful from the log alone; under
	 *                Log-only mode those sections hide, and the row editor auto-generates
	 *                an "Ignore non-log data" toggle.
	 */
	nonLog?: 'full' | 'partial';
	/**
	 * For a per-scenario widget: the kohaku scenario id it represents. Lets the card
	 * frame put the scenario's encounter-set icon next to the title (the body's
	 * `ScenarioInfo` omits the name/icon, since the frame shows them).
	 */
	scenario?: string;
}

/** The six player-card classes, in display order — used to build the per-class
 *  "Most Used …" variant widgets (opt-in, hidden by default). */
const PLAYER_CLASSES: { key: string; label: string }[] = [
	{ key: 'guardian', label: 'Guardian' },
	{ key: 'seeker', label: 'Seeker' },
	{ key: 'rogue', label: 'Rogue' },
	{ key: 'mystic', label: 'Mystic' },
	{ key: 'survivor', label: 'Survivor' },
	{ key: 'neutral', label: 'Neutral' }
];

const cardClassVariants: WidgetDef[] = PLAYER_CLASSES.map(
	(c): WidgetDef => ({
		id: `favoriteCard_${c.key}`,
		label: `Most Used Non-Core ${c.label} Cards`,
		panes: ['home', 'cardsHome'],
		primaryPane: 'cardsHome',
		scope: 'aggregate',
		defaultHidden: true,
		fullWidth: true
	})
);

// Neutral is skipped on purpose — too few neutral investigators to be worth it.
const investigatorClassVariants: WidgetDef[] = PLAYER_CLASSES.filter(
	(c) => c.key !== 'neutral'
).map(
	(c): WidgetDef => ({
		id: `deckStats_${c.key}`,
		label: `Most Used ${c.label} Investigators`,
		panes: ['investigatorsHome'],
		primaryPane: 'investigatorsHome',
		scope: 'aggregate',
		defaultHidden: true,
		fullWidth: true
	})
);

/** Display name for a TSK story scenario, resolved from the campaign-data package's `scenarioNames`
 *  (the same source the per-scenario passport + route widgets use) — so the catalogue / picker never
 *  hand-types it. Ready to localize: it tracks the package, not a build-time string. */
function tskScenarioName(scenarioId: string): string {
	return getCampaignLog('tskc')?.en.scenarioNames?.[scenarioId] ?? scenarioId;
}

/** The 10 playable TSK (The Scarlet Keys) story scenarios, in campaign-book order — kohaku ids; the
 *  display name comes from {@link tskScenarioName}. Each gets a full-width per-scenario "passport"
 *  widget (Key at stake, location, versions/levels to explore, resolutions reached). */
const TSK_SCENARIOS: string[] = [
	'riddles_and_rain',
	'dead_heat',
	'sanguine_shadows',
	'dealings_in_the_dark',
	'dancing_mad',
	'on_thin_ice',
	'dogs_of_war',
	'shades_of_suffering',
	'without_a_trace',
	'congress_of_the_keys'
];

const tskScenarioWidgets: WidgetDef[] = TSK_SCENARIOS.map(
	(id): WidgetDef => ({
		id: `tskScenario_${id}`,
		label: tskScenarioName(id),
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'tsk',
		scenario: id,
		nonLog: 'partial',
		fullWidth: true,
		// A strip of the Scarlet Keys world map centered on this scenario's location
		// (cropped from the campaign map, named after the scenario) — the widget's tab art.
		image: `/image/widget/campaign/tsk/${id.replace(/_/g, '-')}.webp`
	})
);

/**
 * The catalogue, in a sensible global order. Per-pane defaults are derived by
 * filtering this list by pane (preserving order), so the sequence here doubles
 * as the default render order on every page.
 */
export const WIDGET_CATALOGUE: WidgetDef[] = [
	// ── per-campaign summary (top of a campaign page) ──
	{
		id: 'overview',
		label: 'Campaign Overview',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign'
	},
	{
		id: 'resolutionCoverage',
		label: 'Resolution Coverage',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		nonLog: 'full'
	},

	// ── aggregate / overview ──
	{
		id: 'campaignsPlayed',
		label: 'Recently Played',
		panes: ['campaignsHome', 'home'],
		primaryPane: 'campaignsHome',
		scope: 'aggregate'
	},
	{
		id: 'clearGrid',
		label: 'Campaign Clear Grid',
		panes: ['home', 'campaignsHome'],
		primaryPane: 'home',
		scope: 'aggregate',
		fullWidth: true
	},
	// Solo variants of the clear grid (opt-in via the picker — never auto-placed): "Solo"
	// folds in every 1-player play, "True Solo" only the not-multi-handed subset.
	{
		id: 'soloClearGrid',
		label: 'Solo Campaign Clears',
		panes: ['home', 'campaignsHome'],
		primaryPane: 'home',
		scope: 'aggregate',
		fullWidth: true,
		defaultHidden: true
	},
	{
		id: 'trueSoloClearGrid',
		label: 'True Solo Campaign Clears',
		panes: ['home', 'campaignsHome'],
		primaryPane: 'home',
		scope: 'aggregate',
		fullWidth: true,
		defaultHidden: true
	},
	{
		id: 'calendar',
		label: 'Calendar',
		panes: ['home', 'campaignsHome'],
		primaryPane: 'home',
		scope: 'aggregate'
	},
	{
		id: 'traumaTally',
		label: 'Deaths & Insanities',
		panes: ['home', 'campaignsHome'],
		primaryPane: 'campaignsHome',
		scope: 'aggregate',
		fullWidth: true
	},

	// ── per-campaign (shared layout, filtered to the route's campaign) ──
	{
		id: 'winLossRecord',
		label: 'Win/Loss Record',
		panes: ['campaignsHome'],
		primaryPane: 'campaignsHome',
		scope: 'perCampaign'
	},
	{
		id: 'achievements',
		label: 'Achievements',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		fullWidth: true
	},
	{
		id: 'allAchievements',
		label: 'All Achievements',
		panes: ['campaignsHome'],
		primaryPane: 'campaignsHome',
		scope: 'aggregate',
		fullWidth: true
	},
	{
		id: 'scenarioXp',
		label: 'Scenario XP Highscore',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		nonLog: 'full'
	},
	// Roster-gated flavor moments (e.g. Lola starts backstage, the expedition leader)
	// — fully derived from the roster + scenarios reached, no Extra input needed. The
	// grid reflows, so it works in a split (half-width) slot too — not fullWidth.
	{
		id: 'specialInteractions',
		label: 'Special Interactions',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign'
	},
	// Standalone scenarios played inside a campaign: a global tally on the profile
	// home, and a per-campaign tally on a campaign's page (sliced to `family`).
	{
		id: 'standaloneUsage',
		label: 'Standalone Usage',
		panes: ['home'],
		primaryPane: 'home',
		scope: 'aggregate'
	},

	// ── player cards ── (card grids / wide tables — all full-width)
	{
		id: 'cardInsights',
		label: 'Player Cards Usage',
		panes: ['cardsHome', 'cardClassDetail'],
		primaryPane: 'cardsHome',
		scope: 'perClass',
		fullWidth: true
	},
	{
		id: 'favoriteCard',
		label: 'Most Used Non-Core Cards',
		panes: ['home', 'cardsHome', 'cardClassDetail'],
		primaryPane: 'cardsHome',
		scope: 'perClass',
		fullWidth: true
	},
	...cardClassVariants,
	// Core-set history widgets — default onto the Core Set inner page (still addable
	// to the outer cards page).
	{
		id: 'cardHistory',
		label: 'Core Set Card History',
		panes: ['cardsHome', 'cardsCore'],
		primaryPane: 'cardsCore',
		scope: 'aggregate',
		fullWidth: true
	},
	{
		id: 'cardHistory2026',
		label: 'Core Set 2026 Card History',
		panes: ['cardsHome', 'cardsCore'],
		primaryPane: 'cardsCore',
		scope: 'aggregate',
		fullWidth: true
	},
	{
		id: 'cardHistoryOnce',
		label: 'Core Set Cards Used Once',
		panes: ['cardsHome', 'cardsCore'],
		primaryPane: 'cardsCore',
		scope: 'aggregate',
		fullWidth: true
	},
	{
		id: 'cardHistoryOnce2026',
		label: 'Core Set 2026 Cards Used Once',
		panes: ['cardsHome', 'cardsCore'],
		primaryPane: 'cardsCore',
		scope: 'aggregate',
		fullWidth: true
	},
	// Keyword "utilization" widgets — default onto the Keywords inner page; per-class
	// on a class page (auto-filtered).
	{
		id: 'permanentCards',
		label: 'Permanent Cards',
		panes: ['cardsHome', 'cardClassDetail', 'cardsKeywords'],
		primaryPane: 'cardsKeywords',
		scope: 'perClass',
		fullWidth: true
	},
	{
		id: 'exceptionalCards',
		label: 'Exceptional Cards',
		panes: ['cardsHome', 'cardClassDetail', 'cardsKeywords'],
		primaryPane: 'cardsKeywords',
		scope: 'perClass',
		fullWidth: true
	},
	// Level 5 is a level, not a keyword — it gets the Levels inner page.
	{
		id: 'level5Cards',
		label: 'Level 5 Cards',
		panes: ['cardsHome', 'cardClassDetail', 'cardsLevels'],
		primaryPane: 'cardsLevels',
		scope: 'perClass',
		fullWidth: true
	},
	// Skill cards default onto the Skill inner page; per-class on a class page.
	{
		id: 'skillCards',
		label: 'Skill Cards',
		panes: ['cardsHome', 'cardClassDetail', 'cardsSkill'],
		primaryPane: 'cardsSkill',
		scope: 'perClass',
		fullWidth: true
	},
	// Researched cards are all Seeker — perClass, so they surface on the Seeker page too.
	{
		id: 'researchedCards',
		label: 'Researched Cards',
		panes: ['cardsHome', 'cardClassDetail', 'cardsKeywords'],
		primaryPane: 'cardsKeywords',
		scope: 'perClass',
		fullWidth: true
	},
	{
		id: 'customizableCards',
		label: 'Customizable Cards',
		panes: ['cardsHome', 'cardClassDetail', 'cardsKeywords'],
		primaryPane: 'cardsKeywords',
		scope: 'perClass',
		fullWidth: true
	},
	// Specialist cards are always Neutral, so this single (un-classed) view belongs to
	// the Neutral class page (and stays addable to the overall cards page).
	{
		id: 'specialistCards',
		label: 'Specialist Cards',
		panes: ['cardsHome', 'cardClassDetail'],
		primaryPane: 'cardClassDetail',
		scope: 'aggregate',
		fullWidth: true
	},
	// Bespoke core-set neutral-card insight widgets (scans + per-deck insights).
	{
		id: 'coreNeutralL0',
		label: 'Level 0 Core Set Neutral Cards',
		panes: ['cardsHome', 'cardsCore'],
		primaryPane: 'cardsCore',
		scope: 'aggregate',
		fullWidth: true
	},
	{
		id: 'charismaRelic',
		label: 'Charisma & Relic Hunter',
		panes: ['cardsHome', 'cardsCore'],
		primaryPane: 'cardsCore',
		scope: 'aggregate',
		fullWidth: true
	},
	{
		id: 'desperateCards',
		label: 'The Path to Carcosa : Desperate Skills',
		panes: ['cardsHome', 'cardsSkill'],
		primaryPane: 'cardsSkill',
		scope: 'aggregate',
		fullWidth: false
	},
	{
		id: 'innateCards',
		label: 'The Circle Undone : Innate Skills',
		panes: ['cardsHome', 'cardsSkill'],
		primaryPane: 'cardsSkill',
		scope: 'aggregate',
		fullWidth: false
	},
	{
		id: 'coreNeutralSkillUpgrades',
		label: 'Core Neutral Skill Upgrades',
		panes: ['cardsHome', 'cardsSkill'],
		primaryPane: 'cardsSkill',
		scope: 'aggregate',
		fullWidth: false
	},
	{
		id: 'viciousBlowDeduction',
		label: 'Vicious Blow & Deduction',
		panes: ['cardsHome', 'cardsSkill'],
		primaryPane: 'cardsSkill',
		scope: 'aggregate',
		fullWidth: false
	},
	{
		id: 'coreSetNeutralSkills',
		label: 'Core Set Neutral Skills',
		panes: ['cardsHome', 'cardsSkill'],
		primaryPane: 'cardsSkill',
		scope: 'aggregate',
		fullWidth: false
	},

	// ── investigators ── (wide tables — all full-width)
	{
		id: 'deckStats',
		label: 'Most Used Investigators',
		panes: ['investigatorsHome', 'investigatorClassDetail'],
		primaryPane: 'investigatorsHome',
		scope: 'perClass',
		fullWidth: true
	},
	...investigatorClassVariants,
	{
		id: 'investigatorInsights',
		label: 'Investigator Usage',
		panes: ['investigatorsHome', 'investigatorClassDetail'],
		primaryPane: 'investigatorsHome',
		scope: 'perClass',
		fullWidth: true
	},

	// ── campaign-specific widgets (interleaved into a campaign's own layout) ── (all full-width)
	// TSK: the Scarlet Keys vault, then one passport per playable scenario (book
	// order), then the finale summary.
	{
		id: 'tskKeysObtained',
		nonLog: 'full',
		label: 'The Scarlet Keys (Obtained)',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'tsk'
	},
	{
		id: 'tskKeysBearer',
		nonLog: 'full',
		label: 'The Scarlet Keys (Bearer)',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'tsk'
	},
	{
		id: 'tskRoutes',
		nonLog: 'full',
		label: 'Successful Routes',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'tsk'
	},
	...tskScenarioWidgets,
	{
		id: 'tskTrustDeception',
		label: 'Foundation Trust & Cell Deception',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'tsk'
	},
	{
		id: 'tskTokenBalance',
		label: 'Trust vs. Deception',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'tsk',
		fullWidth: true
	},
	{
		id: 'tskTrial',
		nonLog: 'partial',
		label: 'The Trial',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'tsk',
		fullWidth: true
	},
	{
		id: 'tskErased',
		nonLog: 'full',
		label: 'Erased From Existence',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'tsk',
		fullWidth: false
	},
	{
		id: 'tskBaleEngine',
		label: 'The Bale Engine',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'tsk'
	},
	{
		id: 'tskRuinousChime',
		label: 'The Ruinous Chime',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'tsk'
	},
	{
		id: 'tskSideQuests',
		label: 'Side Quests',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'tsk'
	},
	{
		id: 'tdcGlyphWall',
		label: 'Alien Glyph Wall',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'tdc',
		fullWidth: true
	},
	// TDC: the Fold (direction) + glyphs/artifacts/tasks spine, the Sepulchre better-ending gate,
	// the per-scenario forks, then the Doom of Arkham finale.
	{ id: 'tdcFold', label: 'The Fold', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdc', fullWidth: true },
	{ id: 'tdcGlyphsScenario', label: 'Glyphs by Scenario', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdc', fullWidth: true },
	{ id: 'tdcArtifacts', label: 'Eldritch Artifacts', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdc' },
	{ id: 'tdcTasks', label: 'Side Tasks', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdc' },
	{ id: 'tdcSepulchre', scenario: 'sepulchre_of_the_sleeper', label: 'Sepulchre of the Sleeper', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdc' },
	{ id: 'tdcForks', label: 'Expedition Forks', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdc', fullWidth: true },
	{ id: 'tdcDoom', label: 'The Doom of Arkham', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdc', fullWidth: true },
	// NotZ: the three core-set scenarios.
	{ id: 'notzGathering', scenario: 'the_gathering', label: 'The Gathering', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'notz' },
	{ id: 'notzMidnightMasks', scenario: 'the_midnight_masks', label: 'The Midnight Masks', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'notz' },
	{ id: 'notzDevourerBelow', scenario: 'the_devourer_below', label: 'The Devourer Below', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'notz' },
	// PtC: the Doubt/Conviction spine, the VIP roster, the Stranger, then per scenario.
	{ id: 'ptcDoubtConviction', label: 'Doubt & Conviction', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'ptc' },
	{ id: 'ptcVips', label: 'VIPs', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'ptc' },
	{ id: 'ptcStranger', label: 'The Stranger', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'ptc' },
	{ id: 'ptcChaosTokens', label: 'Chaos Tokens', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'ptc', nonLog: 'full' },
	{ id: 'ptcCurtainCall', scenario: 'curtain_call', label: 'Curtain Call', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'ptc' },
	{ id: 'ptcLastKing', scenario: 'the_last_king', label: 'The Last King', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'ptc', nonLog: 'full' },
	{ id: 'ptcEchoes', scenario: 'echoes_of_the_past', label: 'Echoes of the Past', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'ptc' },
	{ id: 'ptcUnspeakableOath', scenario: 'the_unspeakable_oath', label: 'The Unspeakable Oath', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'ptc' },
	{ id: 'ptcLostSoul', label: 'Lost Soul (Interlude II)', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'ptc', nonLog: 'partial' },
	{ id: 'ptcPhantom', scenario: 'a_phantom_of_truth', label: 'A Phantom of Truth', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'ptc' },
	{ id: 'ptcPallidMask', scenario: 'the_pallid_mask', label: 'The Pallid Mask', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'ptc' },
	{ id: 'ptcBlackStarsRise', scenario: 'black_stars_rise', label: 'Black Stars Rise', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'ptc' },
	{ id: 'ptcDimCarcosa', scenario: 'dim_carcosa', label: 'Dim Carcosa', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'ptc', nonLog: 'partial', fullWidth: true },
	// TCU: the Lodge-vs-Coven spine, the missing persons, mementos, then per scenario.
	{ id: 'tcuAllegiance', label: 'Lodge vs Coven', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tcu', fullWidth: true },
	{ id: 'tcuMissingPersons', scenario: 'disappearance_at_the_twilight_estate', label: 'The Missing Persons', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tcu', fullWidth: true },
	{ id: 'tcuMementos', label: 'Mementos', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tcu', fullWidth: true },
	{ id: 'tcuWitchingHour', scenario: 'the_witching_hour', label: 'The Witching Hour', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tcu' },
	{ id: 'tcuDoorstep', scenario: 'at_deaths_doorstep', label: "At Death's Doorstep", panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tcu' },
	{ id: 'tcuSecretName', scenario: 'the_secret_name', label: 'The Secret Name', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tcu' },
	{ id: 'tcuWagesOfSin', scenario: 'the_wages_of_sin', label: 'The Wages of Sin', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tcu' },
	{ id: 'tcuGreaterGood', scenario: 'for_the_greater_good', label: 'For the Greater Good', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tcu' },
	{ id: 'tcuUnion', scenario: 'union_and_disillusion', label: 'Union and Disillusion', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tcu' },
	{ id: 'tcuClutches', scenario: 'in_the_clutches_of_chaos', label: 'In the Clutches of Chaos', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tcu' },
	{ id: 'tcuEndings', scenario: 'before_the_black_throne', label: 'Before the Black Throne', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tcu' },
	// TDE · The Dream-Quest (tdea): the Evidence-of-Kadath spine, per-scenario decisions, and the
	// shared interconnected view (play mode, Black Cat, Silver Key, Randolph, the epilogue matrix).
	// All log-derived (the cross-campaign data lives in the Logs tab's Linked Campaign Log).
	{ id: 'tdeaPlayMode', label: 'How You Played It', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdea' },
	{ id: 'tdeaEvidence', label: 'Evidence of Kadath', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdea', fullWidth: true },
	{ id: 'tdeaBeyondGates', scenario: 'beyond_the_gates_of_sleep', label: 'Beyond the Gates of Sleep', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdea' },
	{ id: 'tdeaSearchForKadath', scenario: 'the_search_for_kadath', label: 'The Search for Kadath', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdea', fullWidth: true },
	{ id: 'tdeaDarkSide', scenario: 'dark_side_of_the_moon', label: 'Dark Side of the Moon', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdea' },
	{ id: 'tdeaGodsDwell', scenario: 'where_gods_dwell', label: 'Where the Gods Dwell', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdea', fullWidth: true },
	{ id: 'tdeaBlackCat', label: 'The Black Cat', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdea', fullWidth: true },
	{ id: 'tdeaSilverKey', label: 'The Silver Key', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdea' },
	{ id: 'tdeaRandolph', label: 'Randolph Carter', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdea' },
	{ id: 'tdeaMatrix', label: 'The Epilogue', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdea', fullWidth: true },
	// TDE · The Web of Dreams (tdeb): the Steps-of-the-Bridge spine, per-scenario decisions, and the
	// same shared interconnected view. All log-derived.
	{ id: 'tdebPlayMode', label: 'How You Played It', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdeb' },
	{ id: 'tdebSteps', label: 'Steps of the Bridge', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdeb', fullWidth: true },
	{ id: 'tdebWakingNightmare', scenario: 'waking_nightmare', label: 'Waking Nightmare', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdeb', fullWidth: true },
	{ id: 'tdebThousandShapes', scenario: 'a_thousand_shapes_of_horror', label: 'A Thousand Shapes of Horror', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdeb' },
	{ id: 'tdebPointOfNoReturn', scenario: 'point_of_no_return', label: 'Point of No Return', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdeb' },
	{ id: 'tdebWeaver', scenario: 'weaver_of_the_cosmos', label: 'Weaver of the Cosmos', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdeb', fullWidth: true },
	{ id: 'tdebBlackCat', label: 'The Black Cat', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdeb', fullWidth: true },
	{ id: 'tdebSilverKey', label: 'The Silver Key', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdeb' },
	{ id: 'tdebRandolph', label: 'Randolph Carter', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdeb' },
	{ id: 'tdebMatrix', label: 'The Epilogue', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tdeb', fullWidth: true },
	// TIC · The Innsmouth Conspiracy: the memories collectible, the seven-key finale gate, the
	// Harper investigation, per-scenario decisions, and the finale. All log-derived.
	{ id: 'ticMemories', label: 'Memories Recovered', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tic', fullWidth: true },
	{ id: 'ticKeys', label: 'The Seven Keys', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tic' },
	{ id: 'ticHarper', scenario: 'the_vanishing_of_elina_harper', label: 'The Vanishing of Elina Harper', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tic', fullWidth: true },
	{ id: 'ticInTooDeep', scenario: 'in_too_deep', label: 'In Too Deep', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tic' },
	{ id: 'ticDevilReef', scenario: 'devil_reef', label: 'Devil Reef', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tic', fullWidth: true },
	{ id: 'ticHorror', scenario: 'horror_in_high_gear', label: 'Horror in High Gear', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tic' },
	{ id: 'ticLightInTheFog', scenario: 'a_light_in_the_fog', label: 'A Light in the Fog', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tic' },
	{ id: 'ticDagon', scenario: 'the_lair_of_dagon', label: 'The Lair of Dagon', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tic' },
	{ id: 'ticMaelstrom', scenario: 'into_the_maelstrom', label: 'Into the Maelstrom', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tic', fullWidth: true },
	// FHV · The Feast of Hemlock Vale: the Day/Night schedule (replay hook), 8 dedicated villager
	// widgets (2×4 half-width), Fate of the Vale, the Hemlock curse, and per-scenario forks.
	{ id: 'fhvSchedule', label: 'Day/Night Schedule', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv', fullWidth: true, nonLog: 'partial' },
	{ id: 'fhvRachel', label: 'Mother Rachel', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvLeah', label: 'Leah Atwood', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvSimeon', label: 'Simeon Atwood', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvWilliam', label: 'William Hemlock', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvRiver', label: 'River Hawthorne', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvGideon', label: 'Gideon Mizrah', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvJudith', label: 'Judith Park', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvTheo', label: 'Theo Peters', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvFate', scenario: 'fate_of_the_vale', label: 'Fate of the Vale', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv', fullWidth: true },
	{ id: 'fhvCurse', label: 'The Hemlock Curse', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvScWrittenInRock', scenario: 'written_in_rock', label: 'Written in Rock', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvScSilentHeath', scenario: 'the_silent_heath', label: 'The Silent Heath', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvScLostSister', scenario: 'the_lost_sister', label: 'The Lost Sister', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvScThingDepths', scenario: 'the_thing_in_the_depths', label: 'The Thing in the Depths', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvScTwistedHollow', scenario: 'the_twisted_hollow', label: 'The Twisted Hollow', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	{ id: 'fhvScLongestNight', scenario: 'the_longest_night', label: 'The Longest Night', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'fhv' },
	// DWL: per-scenario tallies (all log-derived) for The Dunwich Legacy.
	{
		id: 'dwlOpening',
		label: 'The First Case',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'dwl'
	},
	{
		id: 'dwlMissingPersons',
		label: 'The Missing Persons',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'dwl'
	},
	{
		id: 'dwlMiskatonic',
		scenario: 'the_miskatonic_museum',
		label: 'The Miskatonic Museum',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'dwl',
		// The Necronomicon custody is log-derived; the opening approach (broke in / spoke to
		// Adam) is an Extra-tab choice, so that group hides under Log-only mode.
		nonLog: 'partial'
	},
	{
		id: 'dwlEssex',
		scenario: 'the_essex_county_express',
		label: 'The Essex County Express',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'dwl'
	},
	{
		id: 'dwlSilas',
		label: 'Silas Bishop',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'dwl'
	},
	{
		id: 'dwlSacrifices',
		scenario: 'blood_on_the_altar',
		label: 'Blood on the Altar',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'dwl',
		fullWidth: true
	},
	{
		id: 'dwlUndimensioned',
		scenario: 'undimensioned_and_unseen',
		label: 'Undimensioned and Unseen',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'dwl'
	},
	{
		id: 'dwlAscendingHill',
		scenario: 'where_doom_awaits',
		label: 'Where Doom Awaits',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'dwl'
	},
	{
		id: 'dwlFinale',
		scenario: 'lost_in_time_and_space',
		label: 'Lost in Time and Space',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'dwl',
		// closed-tear / Yog-fled / became-one are log-derived; the Act-4 "won, lost forever"
		// is recovered from the Extra `final_act` choice, so it hides under Log-only mode.
		nonLog: 'partial'
	},
	{
		id: 'dwlEpilogue',
		label: 'The Epilogue',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'dwl'
	},
	// EotE: which City of the Elder Things version (manually recorded), plays, resolutions, VP.
	{
		id: 'eoeCity',
		label: 'City of the Elder Things',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'eote',
		scenario: 'city_of_the_elder_things',
		fullWidth: true,
		image: '/image/widget/campaign/eote/city-of-the-elder-things.webp',
		nonLog: 'full'
	},
	{
		id: 'eoeCrash',
		label: 'Killed in the Plane Crash',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'eote',
		image: '/image/widget/campaign/eote/killed-in-plane-crash.webp'
	},
	{
		id: 'eoeDemons',
		label: 'Confronted Their Demons',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'eote',
		image: '/image/widget/campaign/eote/confronted-their-demons.webp'
	},
	{
		id: 'eoeSurvivors',
		label: 'The Survivors of the Expedition',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'eote',
		image: '/image/widget/campaign/eote/survivors.webp'
	},
	{
		id: 'eoeRescued',
		label: 'Rescued',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'eote',
		image: '/image/widget/campaign/eote/rescued.webp'
	},
	{
		id: 'eoeMementos',
		nonLog: 'full',
		label: 'Memories of the Lost',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'eote',
		fullWidth: true,
		image: '/image/widget/campaign/eote/memories-of-the-lost.webp'
	},
	{
		id: 'eoeSupplies',
		label: 'Supplies Recovered',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'eote',
		image: '/image/widget/campaign/eote/supplies-recovered.webp'
	},
	{
		id: 'eoeCamped',
		label: 'Camped',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'eote',
		image: '/image/widget/campaign/eote/camped.webp'
	},
	{
		id: 'eoeFrost',
		label: 'Frost Tokens',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'eote',
		image: '/image/widget/campaign/eote/frost-tokens.webp'
	},
	{
		id: 'eoeMiasma',
		label: 'The Miasma',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'eote',
		image: '/image/widget/campaign/eote/miasma.webp'
	},
	{
		id: 'eoeFatalMirage',
		label: 'Fatal Mirage',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'eote',
		scenario: 'fatal_mirage',
		image: '/image/widget/campaign/eote/fatal-mirage.webp',
		nonLog: 'full'
	},
	{
		id: 'eoeIceDeath',
		label: 'Ice and Death',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'eote',
		image: '/image/widget/campaign/eote/ice-and-death.webp',
		nonLog: 'partial'
	},
	// Lifetime tallies (life-local custom achievements) shown only on their campaign.
	// `campaign` is the URL slug (kohaku Campaign value): EotE = 'eote' (data code 'eoe').
	{
		id: 'eoeMemories',
		label: 'Memories Banished',
		panes: ['campaignDetail'],
		primaryPane: 'campaignDetail',
		scope: 'perCampaign',
		perCampaignExtra: true,
		campaign: 'eote',
		fullWidth: true,
		image: '/image/widget/campaign/eote/memories-banished.webp'
	},
	// TFA: Yig's Fury spine, provisions, companions, the recurring Harbinger, then per scenario.
	{ id: 'tfaVengeance', label: "Yig's Fury", panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tfa', fullWidth: true },
	{ id: 'tfaSupplies', label: 'Provisions', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tfa', fullWidth: true },
	{ id: 'tfaCompanions', label: 'Ichtaca & Alejandro', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tfa' },
	{ id: 'tfaHarbinger', label: 'The Harbinger of Valusia', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tfa' },
	{ id: 'tfaWilds', scenario: 'the_untamed_wilds', label: 'The Untamed Wilds', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tfa' },
	{ id: 'tfaEztli', scenario: 'the_doom_of_eztli', label: 'The Doom of Eztli', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tfa', nonLog: 'partial' },
	{ id: 'tfaThreads', scenario: 'threads_of_fate', label: 'Threads of Fate', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tfa' },
	{ id: 'tfaBoundary', scenario: 'the_boundary_beyond', label: 'The Boundary Beyond', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tfa' },
	{ id: 'tfaHote', scenario: 'heart_of_the_elders_part_1', label: 'Heart of the Elders', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tfa' },
	{ id: 'tfaArchives', scenario: 'the_city_of_archives', label: 'The City of Archives', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tfa', fullWidth: true },
	{ id: 'tfaYoth', scenario: 'the_depths_of_yoth', label: 'The Depths of Yoth', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tfa' },
	{ id: 'tfaAeons', scenario: 'shattered_aeons', label: 'Shattered Aeons', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tfa' },
	{ id: 'tfaTurnBackTime', scenario: 'turn_back_time', label: 'Turn Back Time', panes: ['campaignDetail'], primaryPane: 'campaignDetail', scope: 'perCampaign', perCampaignExtra: true, campaign: 'tfa' }
];

export const WIDGET_BY_ID: Record<string, WidgetDef> = Object.fromEntries(
	WIDGET_CATALOGUE.map((w) => [w.id, w])
);

/** Localized catalogue label per widget id (the picker / row-editor name). */
const WIDGET_LABEL_MSG: Record<string, () => string> = {
	overview: m.framework_label_overview,
	resolutionCoverage: m.framework_label_resolution_coverage,
	campaignsPlayed: m.profile_campaigns_played_title,
	clearGrid: m.framework_label_clear_grid,
	soloClearGrid: m.framework_label_solo_clear_grid,
	trueSoloClearGrid: m.framework_label_true_solo_clear_grid,
	calendar: m.framework_label_calendar,
	traumaTally: m.framework_label_trauma_tally,
	winLossRecord: m.framework_label_win_loss,
	achievements: m.framework_label_achievements,
	allAchievements: m.framework_label_all_achievements,
	scenarioXp: m.framework_label_scenario_xp,
	specialInteractions: m.framework_label_special_interactions,
	standaloneUsage: m.framework_label_standalone_usage,
	cardInsights: m.framework_label_card_insights,
	favoriteCard: m.framework_label_favorite_card,
	cardHistory: m.framework_label_card_history,
	cardHistory2026: m.framework_label_card_history_2026,
	cardHistoryOnce: m.framework_label_card_history_once,
	cardHistoryOnce2026: m.framework_label_card_history_once_2026,
	permanentCards: m.framework_label_permanent_cards,
	exceptionalCards: m.framework_label_exceptional_cards,
	specialistCards: m.framework_label_specialist_cards,
	level5Cards: m.framework_label_level5_cards,
	skillCards: m.framework_label_skill_cards,
	researchedCards: m.framework_label_researched_cards,
	customizableCards: m.framework_label_customizable_cards,
	coreNeutralL0: m.framework_label_core_neutral_l0,
	charismaRelic: m.framework_label_charisma_relic,
	desperateCards: m.framework_label_desperate_cards,
	innateCards: m.framework_label_innate_cards,
	coreNeutralSkillUpgrades: m.framework_label_core_neutral_skill_upgrades,
	viciousBlowDeduction: m.framework_label_vicious_blow_deduction,
	coreSetNeutralSkills: m.framework_label_core_set_neutral_skills,
	deckStats: m.framework_label_deck_stats,
	investigatorInsights: m.framework_label_investigator_insights,
	tskKeysObtained: m.framework_label_tsk_keys_obtained,
	tskKeysBearer: m.framework_label_tsk_keys_bearer,
	tskRoutes: m.framework_label_tsk_routes,
	tskTrustDeception: m.framework_label_tsk_trust_deception,
	tskTokenBalance: m.framework_label_tsk_token_balance,
	tskTrial: m.framework_label_tsk_trial,
	tskErased: m.framework_label_tsk_erased,
	tskBaleEngine: m.framework_label_tsk_bale_engine,
	tskRuinousChime: m.framework_label_tsk_ruinous_chime,
	tskSideQuests: m.framework_label_tsk_side_quests,
	tdcGlyphWall: m.framework_label_tdc_glyph_wall,
	tdcFold: m.framework_label_tdc_fold,
	tdcGlyphsScenario: m.framework_label_tdc_glyphs_scenario,
	tdcArtifacts: m.framework_label_tdc_artifacts,
	tdcTasks: m.framework_label_tdc_tasks,
	tdcSepulchre: m.framework_label_tdc_sepulchre,
	tdcForks: m.framework_label_tdc_forks,
	tdcDoom: m.framework_label_tdc_doom,
	notzGathering: m.framework_label_notz_gathering,
	notzMidnightMasks: m.framework_label_notz_midnight_masks,
	notzDevourerBelow: m.framework_label_notz_devourer,
	ptcDoubtConviction: m.framework_label_ptc_doubt_conviction,
	ptcVips: m.framework_label_ptc_vips,
	ptcStranger: m.framework_label_ptc_stranger,
	ptcChaosTokens: m.framework_label_ptc_chaos_tokens,
	ptcCurtainCall: m.framework_label_ptc_curtain_call,
	ptcLastKing: m.framework_label_ptc_last_king,
	ptcEchoes: m.framework_label_ptc_echoes,
	ptcUnspeakableOath: m.framework_label_ptc_unspeakable_oath,
	ptcLostSoul: m.framework_label_ptc_lost_soul,
	ptcPhantom: m.framework_label_ptc_phantom,
	ptcPallidMask: m.framework_label_ptc_pallid_mask,
	ptcBlackStarsRise: m.framework_label_ptc_black_stars_rise,
	ptcDimCarcosa: m.framework_label_ptc_dim_carcosa,
	tcuAllegiance: m.framework_label_tcu_allegiance,
	tcuMissingPersons: m.framework_label_tcu_missing_persons,
	tcuMementos: m.framework_label_tcu_mementos,
	tcuWitchingHour: m.framework_label_tcu_witching_hour,
	tcuDoorstep: m.framework_label_tcu_doorstep,
	tcuSecretName: m.framework_label_tcu_secret_name,
	tcuWagesOfSin: m.framework_label_tcu_wages_of_sin,
	tcuGreaterGood: m.framework_label_tcu_greater_good,
	tcuUnion: m.framework_label_tcu_union,
	tcuClutches: m.framework_label_tcu_clutches,
	tcuEndings: m.framework_label_tcu_endings,
	tdeaPlayMode: m.framework_label_tdea_play_mode,
	tdeaEvidence: m.framework_label_tdea_evidence,
	tdeaBeyondGates: m.framework_label_tdea_beyond_gates,
	tdeaSearchForKadath: m.framework_label_tdea_search_kadath,
	tdeaDarkSide: m.framework_label_tdea_dark_side,
	tdeaGodsDwell: m.framework_label_tdea_gods_dwell,
	tdeaBlackCat: m.framework_label_tdea_black_cat,
	tdeaSilverKey: m.framework_label_tdea_silver_key,
	tdeaRandolph: m.framework_label_tdea_randolph,
	tdeaMatrix: m.framework_label_tdea_matrix,
	tdebPlayMode: m.framework_label_tdeb_play_mode,
	tdebSteps: m.framework_label_tdeb_steps,
	tdebWakingNightmare: m.framework_label_tdeb_waking_nightmare,
	tdebThousandShapes: m.framework_label_tdeb_thousand_shapes,
	tdebPointOfNoReturn: m.framework_label_tdeb_point_no_return,
	tdebWeaver: m.framework_label_tdeb_weaver,
	tdebBlackCat: m.framework_label_tdeb_black_cat,
	tdebSilverKey: m.framework_label_tdeb_silver_key,
	tdebRandolph: m.framework_label_tdeb_randolph,
	tdebMatrix: m.framework_label_tdeb_matrix,
	ticMemories: m.framework_label_tic_memories,
	ticKeys: m.framework_label_tic_keys,
	ticHarper: m.framework_label_tic_harper,
	ticInTooDeep: m.framework_label_tic_in_too_deep,
	ticDevilReef: m.framework_label_tic_devil_reef,
	ticHorror: m.framework_label_tic_horror,
	ticLightInTheFog: m.framework_label_tic_light_in_the_fog,
	ticDagon: m.framework_label_tic_dagon,
	ticMaelstrom: m.framework_label_tic_maelstrom,
	fhvSchedule: m.framework_label_fhv_schedule,
	fhvRachel: m.framework_label_fhv_rachel,
	fhvLeah: m.framework_label_fhv_leah,
	fhvSimeon: m.framework_label_fhv_simeon,
	fhvWilliam: m.framework_label_fhv_william,
	fhvRiver: m.framework_label_fhv_river,
	fhvGideon: m.framework_label_fhv_gideon,
	fhvJudith: m.framework_label_fhv_judith,
	fhvTheo: m.framework_label_fhv_theo,
	fhvFate: m.framework_label_fhv_fate,
	fhvCurse: m.framework_label_fhv_curse,
	fhvScWrittenInRock: m.framework_label_fhv_sc_written_in_rock,
	fhvScSilentHeath: m.framework_label_fhv_sc_silent_heath,
	fhvScLostSister: m.framework_label_fhv_sc_lost_sister,
	fhvScThingDepths: m.framework_label_fhv_sc_thing_depths,
	fhvScTwistedHollow: m.framework_label_fhv_sc_twisted_hollow,
	fhvScLongestNight: m.framework_label_fhv_sc_longest_night,
	dwlOpening: m.framework_label_dwl_opening,
	dwlMissingPersons: m.framework_label_dwl_missing_persons,
	dwlMiskatonic: m.framework_label_dwl_miskatonic,
	dwlEssex: m.framework_label_dwl_essex,
	dwlSilas: m.framework_label_dwl_silas,
	dwlSacrifices: m.framework_label_dwl_sacrifices,
	dwlUndimensioned: m.framework_label_dwl_undimensioned,
	dwlAscendingHill: m.framework_label_dwl_ascending_hill,
	dwlFinale: m.framework_label_dwl_finale,
	dwlEpilogue: m.framework_label_dwl_epilogue,
	eoeCity: m.framework_label_eoe_city,
	eoeCrash: m.framework_label_eoe_crash,
	eoeDemons: m.framework_label_eoe_demons,
	eoeSurvivors: m.framework_label_eoe_survivors,
	eoeRescued: m.framework_label_eoe_rescued,
	eoeMementos: m.framework_label_eoe_mementos,
	eoeSupplies: m.framework_label_eoe_supplies,
	eoeCamped: m.framework_label_eoe_camped,
	eoeFrost: m.framework_label_eoe_frost,
	eoeMiasma: m.framework_label_eoe_miasma,
	eoeFatalMirage: m.framework_label_eoe_fatal_mirage,
	eoeIceDeath: m.framework_label_eoe_ice_death,
	eoeMemories: m.framework_label_eoe_memories,
	tfaVengeance: m.framework_label_tfa_vengeance,
	tfaSupplies: m.framework_label_tfa_supplies,
	tfaCompanions: m.framework_label_tfa_companions,
	tfaHarbinger: m.framework_label_tfa_harbinger,
	tfaWilds: m.framework_label_tfa_wilds,
	tfaEztli: m.framework_label_tfa_eztli,
	tfaThreads: m.framework_label_tfa_threads,
	tfaBoundary: m.framework_label_tfa_boundary,
	tfaHote: m.framework_label_tfa_hote,
	tfaArchives: m.framework_label_tfa_archives,
	tfaYoth: m.framework_label_tfa_yoth,
	tfaAeons: m.framework_label_tfa_aeons
};

/** Localized catalogue label for a widget id; per-class variants interpolate the
 *  class name, TSK per-scenario widgets keep their (package-sourced) scenario name. */
export function widgetLabel(id: string): string {
	const direct = WIDGET_LABEL_MSG[id];
	if (direct) return direct();
	const fav = /^favoriteCard_(.+)$/.exec(id);
	if (fav) return m.framework_label_favorite_card_class({ cls: m.shared_class({ class: fav[1] }) });
	const deck = /^deckStats_(.+)$/.exec(id);
	if (deck) return m.framework_label_deck_stats_class({ cls: m.shared_class({ class: deck[1] }) });
	// tskScenario_* labels are scenario names from the campaign-data package (not a Paraglide message),
	// resolved live so they track the package rather than a build-time catalogue string.
	const scenario = /^tskScenario_(.+)$/.exec(id);
	if (scenario) return tskScenarioName(scenario[1]);
	return WIDGET_BY_ID[id]?.label ?? id;
}

/** Widget id → a doc path (under src/lib/docs) shown via a clickable info icon in the card header
 *  that opens a modal. Documents data quirks / caveats so the user understands the numbers or knows
 *  which Extra input completes them. Only widgets that need a note appear here. */
const WIDGET_NOTE_DOC: Record<string, string> = {
	tskScenario_dead_heat: 'widget/tsk/dead-heat',
	tskScenario_sanguine_shadows: 'widget/tsk/sanguine-shadows',
	tskScenario_on_thin_ice: 'widget/tsk/on-thin-ice',
	tskScenario_without_a_trace: 'widget/tsk/without-a-trace',
	tskScenario_congress_of_the_keys: 'widget/tsk/congress',
	tskTokenBalance: 'widget/tsk/token-balance',
	tskTrustDeception: 'widget/tsk/foundation-cell',
	tskTrial: 'widget/tsk/the-trial',
	tskBaleEngine: 'widget/tsk/bale-engine',
	tskRuinousChime: 'widget/tsk/ruinous-chime',
	tskSideQuests: 'widget/tsk/side-quests'
};

/** The header note doc path for widget `id`, or null when it has none. */
export function widgetNoteDoc(id: string): string | null {
	return WIDGET_NOTE_DOC[id] ?? null;
}

/** True if `id` is a catalogue widget flagged `fullWidth` (cannot occupy a split
 *  slot). Unknown ids → false. Used by the resolver, the row editor, and the picker. */
export function isFullWidth(id: string): boolean {
	return !!WIDGET_BY_ID[id]?.fullWidth;
}

/** Panes belonging to the Cards / Investigators top-level categories. */
const DECK_CATEGORY_PANES = new Set<PaneId>([
	'cardsHome',
	'cardClassDetail',
	'cardsCore',
	'cardsAsset',
	'cardsEvent',
	'cardsSkill',
	'cardsKeywords',
	'cardsLevels',
	'investigatorsHome',
	'investigatorClassDetail'
]);

/** True if widget `id` belongs to the Cards or Investigators category (by its
 *  `primaryPane`) — i.e. it is deck-derived. Hidden wholesale (wherever placed, e.g.
 *  `favoriteCard` on the home pane) when the profile is in "campaign categories only"
 *  mode. Unknown ids → false. */
export function isDeckCategoryWidget(id: string): boolean {
	const p = WIDGET_BY_ID[id]?.primaryPane;
	return !!p && DECK_CATEGORY_PANES.has(p);
}

/** Shared (non-bespoke) widgets allowed in a pane, in catalogue order. */
export function sharedWidgetsForPane(pane: PaneId): WidgetDef[] {
	return WIDGET_CATALOGUE.filter((w) => !w.perCampaignExtra && w.panes.includes(pane));
}

/** Bespoke (campaign-specific) widgets for a given campaign slug, in catalogue order. */
export function bespokeWidgetsForCampaign(slug: string): WidgetDef[] {
	return WIDGET_CATALOGUE.filter((w) => w.perCampaignExtra && w.campaign === slug);
}

/** Whether a campaign has any derivable (non-`optional`) special interactions — gates
 *  the otherwise-shared `specialInteractions` widget so the picker only offers it where
 *  it would show something. `slug` is the kohaku Campaign value (getCampaignLog aliases it). */
function hasSpecialInteractions(slug: string): boolean {
	return Boolean(getCampaignLog(slug)?.db.specialInteractions?.some((s) => !s.optional));
}

/** Shared campaignDetail widgets that apply to a specific campaign (data-gated ones
 *  filtered to those that would render something for it). */
function sharedCampaignDetailFor(slug: string): WidgetDef[] {
	return sharedWidgetsForPane('campaignDetail').filter(
		(w) => w.id !== 'specialInteractions' || hasSpecialInteractions(slug)
	);
}

/** Every widget id selectable on a campaign's detail page, in catalogue order: the
 *  shared campaign-detail widgets PLUS that campaign's own bespoke widgets. The
 *  campaign-specific ones are interleaved freely into the campaign's single layout
 *  (chosen from the same picker), not kept in a separate section. */
export function campaignDetailWidgetIds(slug: string): string[] {
	return [
		...sharedCampaignDetailFor(slug).map((w) => w.id),
		...bespokeWidgetsForCampaign(slug).map((w) => w.id)
	];
}
