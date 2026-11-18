import { campaignRenderers } from '$lib/components/profile/_framework/widget-renderer';
import TdeBlackCat from '../tde/TdeBlackCat.svelte';
import TdeEpilogueMatrix from '../tde/TdeEpilogueMatrix.svelte';
import TdePlayMode from '../tde/TdePlayMode.svelte';
import TdeRandolph from '../tde/TdeRandolph.svelte';
import TdeSilverKey from '../tde/TdeSilverKey.svelte';
import TdebAThousandShapes from './TdebAThousandShapes.svelte';
import TdebPointOfNoReturn from './TdebPointOfNoReturn.svelte';
import TdebStepsOfTheBridge from './TdebStepsOfTheBridge.svelte';
import TdebWakingNightmare from './TdebWakingNightmare.svelte';
import TdebWeaverOfTheCosmos from './TdebWeaverOfTheCosmos.svelte';

export default campaignRenderers('tdeb', {
	tdebPlayMode: TdePlayMode,
	tdebSteps: TdebStepsOfTheBridge,
	tdebWakingNightmare: TdebWakingNightmare,
	tdebThousandShapes: TdebAThousandShapes,
	tdebPointOfNoReturn: TdebPointOfNoReturn,
	tdebWeaver: TdebWeaverOfTheCosmos,
	tdebBlackCat: TdeBlackCat,
	tdebSilverKey: TdeSilverKey,
	tdebRandolph: TdeRandolph,
	tdebMatrix: TdeEpilogueMatrix
});
