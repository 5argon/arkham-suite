import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split } from '../widget-def';

export default campaignWidgets(
	'tdeb',
	[
		{ id: 'tdebPlayMode', label: m.framework_label_tdeb_play_mode },
		{ id: 'tdebSteps', label: m.framework_label_tdeb_steps, noteDoc: 'widget/tdeb/steps-of-the-bridge' },
		{ id: 'tdebWakingNightmare', scenario: 'waking_nightmare' },
		{ id: 'tdebThousandShapes', scenario: 'a_thousand_shapes_of_horror' },
		{ id: 'tdebPointOfNoReturn', scenario: 'point_of_no_return' },
		{ id: 'tdebWeaver', scenario: 'weaver_of_the_cosmos', fullWidth: true },
		{ id: 'tdebBlackCat', label: m.framework_label_tdeb_black_cat, fullWidth: true, noteDoc: 'widget/tde/black-cat' },
		{ id: 'tdebSilverKey', label: m.framework_label_tdeb_silver_key },
		{ id: 'tdebRandolph', label: m.framework_label_tdeb_randolph },
		{ id: 'tdebMatrix', label: m.framework_label_tdeb_matrix, fullWidth: true, noteDoc: 'widget/tde/epilogue' }
	],
	() => [
		split('overview', 'tdebPlayMode'),
		split('scenarioXp', 'resolutionCoverage'),
		split('tdebSteps', 'tdebWakingNightmare'),
		split('tdebThousandShapes', 'tdebPointOfNoReturn'),
		full('tdebWeaver'),
		full('tdebBlackCat'),
		split('tdebSilverKey', 'tdebRandolph'),
		full('tdebMatrix'),
		full('achievements')
	]
);
