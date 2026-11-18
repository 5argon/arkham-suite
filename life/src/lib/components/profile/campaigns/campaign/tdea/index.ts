import { campaignRenderers } from '$lib/components/profile/_framework/widget-renderer';
import TdeBlackCat from '../tde/TdeBlackCat.svelte';
import TdeEpilogueMatrix from '../tde/TdeEpilogueMatrix.svelte';
import TdePlayMode from '../tde/TdePlayMode.svelte';
import TdeRandolph from '../tde/TdeRandolph.svelte';
import TdeSilverKey from '../tde/TdeSilverKey.svelte';
import TdeaBeyondTheGates from './TdeaBeyondTheGates.svelte';
import TdeaDarkSideOfTheMoon from './TdeaDarkSideOfTheMoon.svelte';
import TdeaEvidenceOfKadath from './TdeaEvidenceOfKadath.svelte';
import TdeaSearchForKadath from './TdeaSearchForKadath.svelte';
import TdeaWhereTheGodsDwell from './TdeaWhereTheGodsDwell.svelte';

export default campaignRenderers('tdea', {
	tdeaPlayMode: TdePlayMode,
	tdeaEvidence: TdeaEvidenceOfKadath,
	tdeaBeyondGates: TdeaBeyondTheGates,
	tdeaSearchForKadath: TdeaSearchForKadath,
	tdeaDarkSide: TdeaDarkSideOfTheMoon,
	tdeaGodsDwell: TdeaWhereTheGodsDwell,
	tdeaBlackCat: TdeBlackCat,
	tdeaSilverKey: TdeSilverKey,
	tdeaRandolph: TdeRandolph,
	tdeaMatrix: TdeEpilogueMatrix
});
