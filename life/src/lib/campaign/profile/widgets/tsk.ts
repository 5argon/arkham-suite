import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split, type WidgetConfigOption } from '../widget-def';

const hideWellspring: WidgetConfigOption[] = [
	{ kind: 'toggle', key: 'hideWellspring', label: m.framework_hide_wellspring }
];
const passport: WidgetConfigOption[] = [
	{ kind: 'toggle', key: 'hideVariants', label: m.framework_hide_variant_breakdown },
	{ kind: 'toggle', key: 'hideAchievements', label: m.framework_hide_achievements }
];

export default campaignWidgets(
	'tsk',
	[
		{ id: 'tskKeysObtained', label: m.framework_label_tsk_keys_obtained, nonLog: 'full', config: hideWellspring },
		{ id: 'tskKeysBearer', label: m.framework_label_tsk_keys_bearer, nonLog: 'full', config: hideWellspring },
		{ id: 'tskRoutes', label: m.framework_label_tsk_routes, nonLog: 'full', config: [{ kind: 'toggle', key: 'hideAchievements', label: m.framework_hide_achievement_routes }] },
		{ id: 'tskScenario_riddles_and_rain', scenario: 'riddles_and_rain', fullWidth: true, nonLog: 'partial', image: '/image/widget/campaign/tsk/riddles-and-rain.webp', config: passport },
		{ id: 'tskScenario_dead_heat', scenario: 'dead_heat', fullWidth: true, nonLog: 'partial', image: '/image/widget/campaign/tsk/dead-heat.webp', noteDoc: 'widget/tsk/dead-heat', config: passport },
		{ id: 'tskScenario_sanguine_shadows', scenario: 'sanguine_shadows', fullWidth: true, nonLog: 'partial', image: '/image/widget/campaign/tsk/sanguine-shadows.webp', noteDoc: 'widget/tsk/sanguine-shadows', config: passport },
		{ id: 'tskScenario_dealings_in_the_dark', scenario: 'dealings_in_the_dark', fullWidth: true, nonLog: 'partial', image: '/image/widget/campaign/tsk/dealings-in-the-dark.webp', config: passport },
		{ id: 'tskScenario_dancing_mad', scenario: 'dancing_mad', fullWidth: true, nonLog: 'partial', image: '/image/widget/campaign/tsk/dancing-mad.webp', config: passport },
		{ id: 'tskScenario_on_thin_ice', scenario: 'on_thin_ice', fullWidth: true, nonLog: 'partial', image: '/image/widget/campaign/tsk/on-thin-ice.webp', noteDoc: 'widget/tsk/on-thin-ice', config: passport },
		{ id: 'tskScenario_dogs_of_war', scenario: 'dogs_of_war', fullWidth: true, nonLog: 'partial', image: '/image/widget/campaign/tsk/dogs-of-war.webp', config: passport },
		{ id: 'tskScenario_shades_of_suffering', scenario: 'shades_of_suffering', fullWidth: true, nonLog: 'partial', image: '/image/widget/campaign/tsk/shades-of-suffering.webp', config: passport },
		{ id: 'tskScenario_without_a_trace', scenario: 'without_a_trace', fullWidth: true, nonLog: 'partial', image: '/image/widget/campaign/tsk/without-a-trace.webp', noteDoc: 'widget/tsk/without-a-trace', config: passport },
		{ id: 'tskScenario_congress_of_the_keys', scenario: 'congress_of_the_keys', fullWidth: true, nonLog: 'partial', image: '/image/widget/campaign/tsk/congress-of-the-keys.webp', noteDoc: 'widget/tsk/congress', config: passport },
		{ id: 'tskTrustDeception', label: m.framework_label_tsk_trust_deception, noteDoc: 'widget/tsk/foundation-cell' },
		{ id: 'tskTokenBalance', label: m.framework_label_tsk_token_balance, fullWidth: true, noteDoc: 'widget/tsk/token-balance' },
		{ id: 'tskTrial', label: m.framework_label_tsk_trial, fullWidth: true, nonLog: 'partial', noteDoc: 'widget/tsk/the-trial' },
		{ id: 'tskErased', label: m.framework_label_tsk_erased, nonLog: 'full' },
		{ id: 'tskBaleEngine', label: m.framework_label_tsk_bale_engine, noteDoc: 'widget/tsk/bale-engine' },
		{ id: 'tskRuinousChime', label: m.framework_label_tsk_ruinous_chime, noteDoc: 'widget/tsk/ruinous-chime' },
		{ id: 'tskSideQuests', label: m.framework_label_tsk_side_quests, noteDoc: 'widget/tsk/side-quests' }
	],
	() => [
		split('overview', 'specialInteractions'),
		split('scenarioXp', 'resolutionCoverage'),
		split('tskErased', 'tskSideQuests'),
		split('tskKeysObtained', 'tskKeysBearer'),
		split('tskTrustDeception', 'tskRoutes'),
		full('tskTokenBalance'),
		full('tskScenario_riddles_and_rain'),
		full('tskScenario_dead_heat'),
		full('tskScenario_sanguine_shadows'),
		full('tskScenario_dealings_in_the_dark'),
		full('tskScenario_dancing_mad'),
		full('tskScenario_on_thin_ice'),
		full('tskScenario_dogs_of_war'),
		full('tskScenario_shades_of_suffering'),
		full('tskScenario_without_a_trace'),
		full('tskScenario_congress_of_the_keys'),
		split('tskBaleEngine', 'tskRuinousChime'),
		full('tskTrial')
	]
);
