import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split } from '../widget-def';

export default campaignWidgets(
	'dwl',
	[
		{ id: 'dwlExtracurricular', scenario: 'extracurricular_activity' },
		{ id: 'dwlHouseAlwaysWins', scenario: 'the_house_always_wins' },
		{ id: 'dwlMissingPersons', label: m.framework_label_dwl_missing_persons },
		{ id: 'dwlMiskatonic', scenario: 'the_miskatonic_museum', nonLog: 'partial' },
		{ id: 'dwlEssex', scenario: 'the_essex_county_express' },
		{ id: 'dwlSacrifices', scenario: 'blood_on_the_altar', fullWidth: true },
		{ id: 'dwlUndimensioned', scenario: 'undimensioned_and_unseen' },
		{ id: 'dwlAscendingHill', scenario: 'where_doom_awaits' },
		{ id: 'dwlFinale', scenario: 'lost_in_time_and_space', nonLog: 'partial' }
	],
	() => [
		split('overview', 'dwlMissingPersons'),
		split('scenarioXp', 'resolutionCoverage'),
		split('dwlExtracurricular', 'dwlHouseAlwaysWins'),
		split('dwlMiskatonic', 'dwlEssex'),
		full('dwlSacrifices'),
		split('dwlUndimensioned', 'dwlAscendingHill'),
		split('dwlFinale', null),
		full('achievements')
	]
);
