import { campaignRenderers } from '$lib/components/profile/_framework/widget-renderer';
import CobBlood from './CobBlood.svelte';
import CobBloodMoney from './CobBloodMoney.svelte';
import CobNewHorizons from './CobNewHorizons.svelte';
import CobRiverOfBlood from './CobRiverOfBlood.svelte';

export default campaignRenderers('cob', {
	cobBlood: CobBlood,
	cobRiverOfBlood: CobRiverOfBlood,
	cobNewHorizons: CobNewHorizons,
	cobBloodMoney: CobBloodMoney
});
