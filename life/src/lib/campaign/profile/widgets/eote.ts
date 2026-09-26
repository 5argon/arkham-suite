import * as m from '$lib/paraglide/messages.js';
import { campaignWidgets, full, split } from '../widget-def';

export default campaignWidgets(
	'eote',
	[
		{ id: 'eoeCity', scenario: 'city_of_the_elder_things', fullWidth: true, nonLog: 'full', image: '/image/widget/campaign/eote/city-of-the-elder-things.webp' },
		{ id: 'eoeCrash', label: m.framework_label_eoe_crash, image: '/image/widget/campaign/eote/killed-in-plane-crash.webp' },
		{ id: 'eoeDemons', label: m.framework_label_eoe_demons, image: '/image/widget/campaign/eote/confronted-their-demons.webp' },
		{ id: 'eoeSurvivors', label: m.framework_label_eoe_survivors, image: '/image/widget/campaign/eote/survivors.webp' },
		{ id: 'eoeRescued', label: m.framework_label_eoe_rescued, image: '/image/widget/campaign/eote/rescued.webp' },
		{ id: 'eoeMementos', label: m.framework_label_eoe_mementos, fullWidth: true, nonLog: 'full', image: '/image/widget/campaign/eote/memories-of-the-lost.webp' },
		{ id: 'eoeSupplies', label: m.framework_label_eoe_supplies, image: '/image/widget/campaign/eote/supplies-recovered.webp' },
		{ id: 'eoeCamped', label: m.framework_label_eoe_camped, image: '/image/widget/campaign/eote/camped.webp' },
		{ id: 'eoeFrost', label: m.framework_label_eoe_frost, image: '/image/widget/campaign/eote/frost-tokens.webp' },
		{ id: 'eoeMiasma', label: m.framework_label_eoe_miasma, image: '/image/widget/campaign/eote/miasma.webp' },
		{ id: 'eoeFatalMirage', scenario: 'fatal_mirage', nonLog: 'full', image: '/image/widget/campaign/eote/fatal-mirage.webp' },
		{ id: 'eoeIceDeath', label: m.framework_label_eoe_ice_death, nonLog: 'partial', image: '/image/widget/campaign/eote/ice-and-death.webp' },
		{ id: 'eoeMemories', label: m.framework_label_eoe_memories, fullWidth: true, image: '/image/widget/campaign/eote/memories-banished.webp' }
	],
	() => [
		split('overview', 'eoeFrost'),
		split('scenarioXp', 'resolutionCoverage'),
		full('eoeCrash'),
		split('eoeIceDeath', 'eoeCamped'),
		split('eoeRescued', 'eoeDemons'),
		full('eoeSupplies'),
		full('eoeMementos'),
		full('eoeMemories'),
		full('eoeCity'),
		split('eoeFatalMirage', 'eoeMiasma'),
		full('eoeSurvivors'),
		full('achievements')
	]
);
