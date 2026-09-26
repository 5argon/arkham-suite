import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split } from '../widget-def';

export default campaignWidgets(
	'tfa',
	[
		{ id: 'tfaVengeance', label: m.framework_label_tfa_vengeance, fullWidth: true },
		{ id: 'tfaSupplies', label: m.framework_label_tfa_supplies, fullWidth: true },
		{ id: 'tfaCompanions', label: m.framework_label_tfa_companions },
		{ id: 'tfaHarbinger', label: m.framework_label_tfa_harbinger, nonLog: 'partial' },
		{ id: 'tfaPoison', label: m.framework_label_tfa_poison, nonLog: 'full' },
		{ id: 'tfaWilds', scenario: 'the_untamed_wilds', nonLog: 'partial' },
		{ id: 'tfaEztli', scenario: 'the_doom_of_eztli', nonLog: 'partial' },
		{ id: 'tfaThreads', scenario: 'threads_of_fate', fullWidth: true, nonLog: 'partial' },
		{ id: 'tfaBoundary', scenario: 'the_boundary_beyond' },
		{ id: 'tfaHote', label: m.framework_label_tfa_hote, scenario: 'heart_of_the_elders_part_1', nonLog: 'partial' },
		{ id: 'tfaArchives', scenario: 'the_city_of_archives', fullWidth: true, nonLog: 'partial' },
		{ id: 'tfaYoth', scenario: 'the_depths_of_yoth', nonLog: 'partial' },
		{ id: 'tfaAeons', scenario: 'shattered_aeons' },
		{ id: 'tfaTurnBackTime', scenario: 'turn_back_time', fullWidth: true }
	],
	() => [
		split('overview', 'tfaCompanions'),
		full('tfaVengeance'),
		split('scenarioXp', 'resolutionCoverage'),
		split('tfaHarbinger', 'tfaPoison'),
		full('tfaSupplies'),
		split('tfaWilds', 'tfaEztli'),
		full('tfaThreads'),
		split('tfaBoundary', 'tfaHote'),
		full('tfaArchives'),
		split('tfaYoth', 'tfaAeons'),
		full('tfaTurnBackTime'),
		full('achievements')
	]
);
