import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split } from '../widget-def';

export default campaignWidgets(
	'boa',
	[
		{ id: 'boaServant', label: m.framework_label_boa_servant },
		{ id: 'boaSpreadingFlames', scenario: 'spreading_flames' },
		{ id: 'boaSmokeAndMirrors', scenario: 'smoke_and_mirrors', fullWidth: true },
		{ id: 'boaQueenOfAsh', scenario: 'queen_of_ash' }
	],
	() => [
		split('overview', 'boaServant'),
		split('scenarioXp', 'resolutionCoverage'),
		full('boaSpreadingFlames'),
		full('boaSmokeAndMirrors'),
		full('boaQueenOfAsh')
	]
);
