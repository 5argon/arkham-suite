import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split } from '../widget-def';

export default campaignWidgets(
	'tdea',
	[
		{ id: 'tdeaPlayMode', label: m.framework_label_tdea_play_mode },
		{ id: 'tdeaEvidence', label: m.framework_label_tdea_evidence, noteDoc: 'widget/tdea/evidence-of-kadath' },
		{ id: 'tdeaBeyondGates', scenario: 'beyond_the_gates_of_sleep' },
		{ id: 'tdeaSearchForKadath', scenario: 'the_search_for_kadath' },
		{ id: 'tdeaDarkSide', scenario: 'dark_side_of_the_moon' },
		{ id: 'tdeaGodsDwell', scenario: 'where_gods_dwell', fullWidth: true },
		{ id: 'tdeaBlackCat', label: m.framework_label_tdea_black_cat, fullWidth: true, noteDoc: 'widget/tde/black-cat' },
		{ id: 'tdeaSilverKey', label: m.framework_label_tdea_silver_key },
		{ id: 'tdeaRandolph', label: m.framework_label_tdea_randolph },
		{ id: 'tdeaMatrix', label: m.framework_label_tdea_matrix, fullWidth: true, noteDoc: 'widget/tde/epilogue' }
	],
	() => [
		split('overview', 'tdeaPlayMode'),
		split('scenarioXp', 'resolutionCoverage'),
		split('tdeaEvidence', 'tdeaBeyondGates'),
		split('tdeaSearchForKadath', 'tdeaDarkSide'),
		full('tdeaGodsDwell'),
		full('tdeaBlackCat'),
		split('tdeaSilverKey', 'tdeaRandolph'),
		full('tdeaMatrix'),
		full('achievements')
	]
);
