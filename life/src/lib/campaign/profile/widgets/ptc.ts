import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split } from '../widget-def';

export default campaignWidgets(
	'ptc',
	[
		{ id: 'ptcDoubtConviction', label: m.framework_label_ptc_doubt_conviction },
		{ id: 'ptcVips', label: m.framework_label_ptc_vips },
		{ id: 'ptcStranger', label: m.framework_label_ptc_stranger, nonLog: 'partial' },
		{ id: 'ptcChaosTokens', label: m.framework_label_ptc_chaos_tokens, nonLog: 'full' },
		{ id: 'ptcCurtainCall', scenario: 'curtain_call', nonLog: 'partial' },
		{ id: 'ptcLastKing', scenario: 'the_last_king', nonLog: 'partial' },
		{ id: 'ptcEchoes', scenario: 'echoes_of_the_past', nonLog: 'partial' },
		{ id: 'ptcUnspeakableOath', scenario: 'the_unspeakable_oath', nonLog: 'partial' },
		{ id: 'ptcLostSoul', label: m.framework_label_ptc_lost_soul, nonLog: 'partial' },
		{ id: 'ptcPhantom', scenario: 'a_phantom_of_truth', nonLog: 'partial' },
		{ id: 'ptcPallidMask', scenario: 'the_pallid_mask', nonLog: 'partial' },
		{ id: 'ptcBlackStarsRise', scenario: 'black_stars_rise', nonLog: 'partial' },
		{ id: 'ptcDimCarcosa', scenario: 'dim_carcosa', fullWidth: true, nonLog: 'partial' }
	],
	() => [
		split('overview', 'ptcDoubtConviction'),
		split('scenarioXp', 'resolutionCoverage'),
		full('ptcVips'),
		split('ptcStranger', 'ptcChaosTokens'),
		full('ptcCurtainCall'),
		split('ptcLastKing', 'ptcEchoes'),
		split('ptcUnspeakableOath', 'ptcLostSoul'),
		split('ptcPhantom', 'ptcPallidMask'),
		split('ptcBlackStarsRise', null),
		full('ptcDimCarcosa'),
		full('achievements')
	]
);
