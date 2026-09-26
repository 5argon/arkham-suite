import { campaignRenderers } from '$lib/components/profile/_framework/widget-renderer';
import DwlAscendingHill from './DwlAscendingHill.svelte';
import DwlEssex from './DwlEssex.svelte';
import DwlFinale from './DwlFinale.svelte';
import DwlMiskatonicMuseum from './DwlMiskatonicMuseum.svelte';
import DwlMissingPersons from './DwlMissingPersons.svelte';
import DwlOpener from './DwlOpener.svelte';
import DwlSacrifices from './DwlSacrifices.svelte';
import DwlUndimensioned from './DwlUndimensioned.svelte';

export default campaignRenderers('dwl', {
	dwlExtracurricular: DwlOpener,
	dwlHouseAlwaysWins: DwlOpener,
	dwlMissingPersons: DwlMissingPersons,
	dwlMiskatonic: DwlMiskatonicMuseum,
	dwlEssex: DwlEssex,
	dwlSacrifices: DwlSacrifices,
	dwlUndimensioned: DwlUndimensioned,
	dwlAscendingHill: DwlAscendingHill,
	dwlFinale: DwlFinale
});
