import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split } from '../widget-def';

export default campaignWidgets(
	'tcu',
	[
		{ id: 'tcuAllegiance', label: m.framework_label_tcu_allegiance },
		{ id: 'tcuMissingPersons', label: m.framework_label_tcu_missing_persons, scenario: 'disappearance_at_the_twilight_estate', fullWidth: true },
		{ id: 'tcuMementos', label: m.framework_label_tcu_mementos, fullWidth: true },
		{ id: 'tcuWitchingHour', scenario: 'the_witching_hour' },
		{ id: 'tcuDoorstep', scenario: 'at_deaths_doorstep' },
		{ id: 'tcuSecretName', scenario: 'the_secret_name' },
		{ id: 'tcuWagesOfSin', scenario: 'the_wages_of_sin' },
		{ id: 'tcuGreaterGood', scenario: 'for_the_greater_good' },
		{ id: 'tcuUnion', scenario: 'union_and_disillusion', fullWidth: true },
		{ id: 'tcuClutches', scenario: 'in_the_clutches_of_chaos' },
		{ id: 'tcuEndings', scenario: 'before_the_black_throne', fullWidth: true, nonLog: 'partial' }
	],
	() => [
		split('overview', 'tcuAllegiance'),
		split('scenarioXp', 'resolutionCoverage'),
		full('tcuMissingPersons'),
		full('tcuMementos'),
		split('tcuWitchingHour', 'tcuDoorstep'),
		split('tcuSecretName', 'tcuWagesOfSin'),
		split('tcuGreaterGood', 'tcuClutches'),
		full('tcuUnion'),
		full('tcuEndings'),
		full('achievements')
	]
);
