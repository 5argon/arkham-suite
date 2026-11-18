import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split } from '../widget-def';

export default campaignWidgets(
	'fhv',
	[
		{ id: 'fhvVale', label: m.framework_label_fhv_vale, fullWidth: true },
		{
			id: 'fhvSchedule',
			label: m.framework_label_fhv_schedule,
			fullWidth: true,
			nonLog: 'partial'
		},
		{ id: 'fhvRachel', label: m.framework_label_fhv_rachel },
		{ id: 'fhvLeah', label: m.framework_label_fhv_leah },
		{ id: 'fhvSimeon', label: m.framework_label_fhv_simeon },
		{ id: 'fhvWilliam', label: m.framework_label_fhv_william },
		{ id: 'fhvRiver', label: m.framework_label_fhv_river },
		{ id: 'fhvGideon', label: m.framework_label_fhv_gideon },
		{ id: 'fhvJudith', label: m.framework_label_fhv_judith },
		{ id: 'fhvTheo', label: m.framework_label_fhv_theo },
		{
			id: 'fhvScWrittenInRock',
			label: m.framework_label_fhv_sc_written_in_rock,
			scenario: 'written_in_rock'
		},
		{
			id: 'fhvScHemlockHouse',
			label: m.framework_label_fhv_sc_hemlock_house,
			scenario: 'hemlock_house',
			nonLog: 'partial'
		},
		{
			id: 'fhvScSilentHeath',
			label: m.framework_label_fhv_sc_silent_heath,
			scenario: 'the_silent_heath'
		},
		{
			id: 'fhvScLostSister',
			label: m.framework_label_fhv_sc_lost_sister,
			scenario: 'the_lost_sister'
		},
		{
			id: 'fhvScThingDepths',
			label: m.framework_label_fhv_sc_thing_depths,
			scenario: 'the_thing_in_the_depths'
		},
		{
			id: 'fhvScTwistedHollow',
			label: m.framework_label_fhv_sc_twisted_hollow,
			scenario: 'the_twisted_hollow'
		},
		{ id: 'fhvDance', label: m.framework_label_fhv_dance, fullWidth: true },
		{
			id: 'fhvScLongestNight',
			label: m.framework_label_fhv_sc_longest_night,
			scenario: 'the_longest_night',
			fullWidth: true,
			nonLog: 'partial'
		},
		{ id: 'fhvFinalEvening', label: m.framework_label_fhv_final_evening, fullWidth: true },
		{
			id: 'fhvFate',
			label: m.framework_label_fhv_fate,
			scenario: 'fate_of_the_vale',
			fullWidth: true
		},
		{ id: 'fhvCurse', label: m.framework_label_fhv_curse }
	],
	() => [
		split('overview', 'fhvCurse'),
		split('scenarioXp', 'resolutionCoverage'),
		full('fhvVale'),
		split('fhvRachel', 'fhvLeah'),
		split('fhvSimeon', 'fhvWilliam'),
		split('fhvRiver', 'fhvGideon'),
		split('fhvJudith', 'fhvTheo'),
		full('fhvSchedule'),
		split('fhvScWrittenInRock', 'fhvScHemlockHouse'),
		split('fhvScSilentHeath', 'fhvScLostSister'),
		split('fhvScThingDepths', 'fhvScTwistedHollow'),
		full('fhvDance'),
		full('fhvScLongestNight'),
		full('fhvFinalEvening'),
		full('fhvFate'),
		full('achievements')
	]
);
