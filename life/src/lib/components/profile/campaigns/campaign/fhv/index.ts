import { campaignRenderers, withProps } from '$lib/components/profile/_framework/widget-renderer';
import FhvCurse from './FhvCurse.svelte';
import FhvDance from './FhvDance.svelte';
import FhvFate from './FhvFate.svelte';
import FhvFinalEvening from './FhvFinalEvening.svelte';
import FhvHemlockHouse from './FhvHemlockHouse.svelte';
import FhvLongestNight from './FhvLongestNight.svelte';
import FhvOutcomeScenario from './FhvOutcomeScenario.svelte';
import FhvSchedule from './FhvSchedule.svelte';
import FhvVale from './FhvVale.svelte';
import FhvVillager from './FhvVillager.svelte';

export default campaignRenderers('fhv', {
	fhvVale: FhvVale,
	fhvSchedule: FhvSchedule,
	fhvRachel: withProps(FhvVillager, { villager: 'rachel' }),
	fhvLeah: withProps(FhvVillager, { villager: 'leah' }),
	fhvSimeon: withProps(FhvVillager, { villager: 'simeon' }),
	fhvWilliam: withProps(FhvVillager, { villager: 'william' }),
	fhvRiver: withProps(FhvVillager, { villager: 'river' }),
	fhvGideon: withProps(FhvVillager, { villager: 'gideon' }),
	fhvJudith: withProps(FhvVillager, { villager: 'judith' }),
	fhvTheo: withProps(FhvVillager, { villager: 'theo' }),
	fhvFate: FhvFate,
	fhvCurse: FhvCurse,
	fhvDance: FhvDance,
	fhvFinalEvening: FhvFinalEvening,
	fhvScWrittenInRock: FhvOutcomeScenario,
	fhvScHemlockHouse: FhvHemlockHouse,
	fhvScSilentHeath: FhvOutcomeScenario,
	fhvScLostSister: FhvOutcomeScenario,
	fhvScThingDepths: FhvOutcomeScenario,
	fhvScTwistedHollow: FhvOutcomeScenario,
	fhvScLongestNight: FhvLongestNight
});
