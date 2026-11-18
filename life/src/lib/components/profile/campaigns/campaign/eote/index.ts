import {
	campaignRenderers,
	widget,
	withProps
} from '$lib/components/profile/_framework/widget-renderer';
import EoeCityMatrix from './EoeCityMatrix.svelte';
import EoeFatalMirage from './EoeFatalMirage.svelte';
import EoeFrostTokens from './EoeFrostTokens.svelte';
import EoeIceAndDeath from './EoeIceAndDeath.svelte';
import EoeItemTally from './EoeItemTally.svelte';
import EoeMemberRoster from './EoeMemberRoster.svelte';
import EoeMementos from './EoeMementos.svelte';
import EoeMemoryWall from './EoeMemoryWall.svelte';
import EoeMiasma from './EoeMiasma.svelte';

export default {
	...campaignRenderers('eoe', {
		eoeCity: EoeCityMatrix,
		eoeCrash: withProps(EoeMemberRoster, { metric: 'killed' as const }),
		eoeDemons: withProps(EoeMemberRoster, { metric: 'demons' as const }),
		eoeSurvivors: withProps(EoeMemberRoster, { metric: 'survived' as const }),
		eoeRescued: withProps(EoeMemberRoster, { metric: 'rescued' as const }),
		eoeSupplies: withProps(EoeItemTally, { kind: 'supplies' as const }),
		eoeCamped: withProps(EoeItemTally, { kind: 'camped' as const }),
		eoeMemories: EoeMemoryWall,
		eoeFrost: EoeFrostTokens,
		eoeMiasma: EoeMiasma,
		eoeFatalMirage: EoeFatalMirage,
		eoeIceDeath: EoeIceAndDeath
	}),
	// The mementos are earned into decks, so they come from the subject's card usage, not the blob.
	eoeMementos: widget(EoeMementos, (c) => ({ cardUsage: c.payload.cardUsage }))
};
