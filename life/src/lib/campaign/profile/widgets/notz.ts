import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split } from '../widget-def';

export default campaignWidgets(
	'notz',
	[
		{ id: 'notzGhoulPriest', label: m.framework_label_notz_ghoul_priest },
		{ id: 'notzGathering', scenario: 'the_gathering' },
		{ id: 'notzMidnightMasks', scenario: 'the_midnight_masks' },
		{ id: 'notzDevourerBelow', scenario: 'the_devourer_below' },
		{ id: 'notzCoreOnly', label: m.framework_label_notz_core_only, nonLog: 'full' }
	],
	() => [
		split('overview', 'notzGhoulPriest'),
		split('scenarioXp', 'resolutionCoverage'),
		split('notzGathering', 'notzMidnightMasks'),
		split('notzDevourerBelow', 'notzCoreOnly'),
		full('achievements')
	]
);
