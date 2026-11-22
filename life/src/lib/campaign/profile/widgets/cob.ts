import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split } from '../widget-def';

export default campaignWidgets(
	'cob',
	[
		{ id: 'cobBlood', label: m.framework_label_cob_blood },
		{ id: 'cobRiverOfBlood', scenario: 'river_of_blood' },
		{ id: 'cobNewHorizons', scenario: 'new_horizons' },
		{ id: 'cobBloodMoney', scenario: 'blood_money' }
	],
	() => [
		split('overview', 'cobBlood'),
		split('scenarioXp', 'resolutionCoverage'),
		split('cobRiverOfBlood', 'cobNewHorizons'),
		full('cobBloodMoney'),
		full('achievements')
	]
);
