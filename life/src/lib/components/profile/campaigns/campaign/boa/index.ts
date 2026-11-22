import { campaignRenderers } from '$lib/components/profile/_framework/widget-renderer';
import BoaQueenOfAsh from './BoaQueenOfAsh.svelte';
import BoaServant from './BoaServant.svelte';
import BoaSmokeAndMirrors from './BoaSmokeAndMirrors.svelte';
import BoaSpreadingFlames from './BoaSpreadingFlames.svelte';

export default campaignRenderers('boa', {
	boaServant: BoaServant,
	boaSpreadingFlames: BoaSpreadingFlames,
	boaSmokeAndMirrors: BoaSmokeAndMirrors,
	boaQueenOfAsh: BoaQueenOfAsh
});
