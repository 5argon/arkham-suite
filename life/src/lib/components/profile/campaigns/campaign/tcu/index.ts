import { campaignRenderers } from '$lib/components/profile/_framework/widget-renderer';
import TcuAllegiance from './TcuAllegiance.svelte';
import TcuAtDeathsDoorstep from './TcuAtDeathsDoorstep.svelte';
import TcuClutchesOfChaos from './TcuClutchesOfChaos.svelte';
import TcuEndings from './TcuEndings.svelte';
import TcuForTheGreaterGood from './TcuForTheGreaterGood.svelte';
import TcuMementos from './TcuMementos.svelte';
import TcuMissingPersons from './TcuMissingPersons.svelte';
import TcuSecretName from './TcuSecretName.svelte';
import TcuUnionAndDisillusion from './TcuUnionAndDisillusion.svelte';
import TcuWagesOfSin from './TcuWagesOfSin.svelte';
import TcuWitchingHour from './TcuWitchingHour.svelte';

export default campaignRenderers('tcu', {
	tcuAllegiance: TcuAllegiance,
	tcuMissingPersons: TcuMissingPersons,
	tcuMementos: TcuMementos,
	tcuWitchingHour: TcuWitchingHour,
	tcuDoorstep: TcuAtDeathsDoorstep,
	tcuSecretName: TcuSecretName,
	tcuWagesOfSin: TcuWagesOfSin,
	tcuGreaterGood: TcuForTheGreaterGood,
	tcuUnion: TcuUnionAndDisillusion,
	tcuClutches: TcuClutchesOfChaos,
	tcuEndings: TcuEndings
});
