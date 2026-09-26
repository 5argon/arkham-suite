import { campaignRenderers } from '$lib/components/profile/_framework/widget-renderer';
import NotzCoreOnly from './NotzCoreOnly.svelte';
import NotzDevourerBelow from './NotzDevourerBelow.svelte';
import NotzGathering from './NotzGathering.svelte';
import NotzMidnightMasks from './NotzMidnightMasks.svelte';
import NotzThreatsBelow from './NotzThreatsBelow.svelte';

export default campaignRenderers('notz', {
	notzThreatsBelow: NotzThreatsBelow,
	notzGathering: NotzGathering,
	notzMidnightMasks: NotzMidnightMasks,
	notzDevourerBelow: NotzDevourerBelow,
	notzCoreOnly: NotzCoreOnly
});
