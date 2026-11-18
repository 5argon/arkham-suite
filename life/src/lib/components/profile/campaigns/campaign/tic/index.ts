import { campaignRenderers } from '$lib/components/profile/_framework/widget-renderer';
import TicDevilReef from './TicDevilReef.svelte';
import TicHarper from './TicHarper.svelte';
import TicHorrorInHighGear from './TicHorrorInHighGear.svelte';
import TicInTooDeep from './TicInTooDeep.svelte';
import TicIntoTheMaelstrom from './TicIntoTheMaelstrom.svelte';
import TicLairOfDagon from './TicLairOfDagon.svelte';
import TicLightInTheFog from './TicLightInTheFog.svelte';
import TicMemories from './TicMemories.svelte';
import TicPit from './TicPit.svelte';
import TicSevenKeys from './TicSevenKeys.svelte';

export default campaignRenderers('tic', {
	ticMemories: TicMemories,
	ticKeys: TicSevenKeys,
	ticPit: TicPit,
	ticHarper: TicHarper,
	ticInTooDeep: TicInTooDeep,
	ticDevilReef: TicDevilReef,
	ticHorror: TicHorrorInHighGear,
	ticLightInTheFog: TicLightInTheFog,
	ticDagon: TicLairOfDagon,
	ticMaelstrom: TicIntoTheMaelstrom
});
