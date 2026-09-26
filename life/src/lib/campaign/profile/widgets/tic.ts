import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split } from '../widget-def';

export default campaignWidgets(
	'tic',
	[
		{ id: 'ticMemories', label: m.framework_label_tic_memories, fullWidth: true },
		{ id: 'ticKeys', label: m.framework_label_tic_keys },
		{ id: 'ticPit', scenario: 'the_pit_of_despair' },
		{ id: 'ticHarper', scenario: 'the_vanishing_of_elina_harper' },
		{ id: 'ticInTooDeep', scenario: 'in_too_deep' },
		{ id: 'ticDevilReef', scenario: 'devil_reef' },
		{ id: 'ticHorror', scenario: 'horror_in_high_gear' },
		{ id: 'ticLightInTheFog', scenario: 'a_light_in_the_fog' },
		{ id: 'ticDagon', scenario: 'the_lair_of_dagon', fullWidth: true },
		{ id: 'ticMaelstrom', scenario: 'into_the_maelstrom', fullWidth: true }
	],
	() => [
		split('overview', 'ticKeys'),
		split('scenarioXp', 'resolutionCoverage'),
		full('ticMemories'),
		split('ticPit', 'ticHarper'),
		split('ticInTooDeep', 'ticDevilReef'),
		split('ticHorror', 'ticLightInTheFog'),
		full('ticDagon'),
		full('ticMaelstrom'),
		full('achievements')
	]
);
