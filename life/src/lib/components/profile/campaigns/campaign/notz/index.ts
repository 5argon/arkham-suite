import { campaignRenderers } from '$lib/components/profile/_framework/widget-renderer';
import NotzCoreOnly from './NotzCoreOnly.svelte';
import NotzDevourerBelow from './NotzDevourerBelow.svelte';
import NotzGathering from './NotzGathering.svelte';
import NotzMidnightMasks from './NotzMidnightMasks.svelte';
import NotzGhoulPriest from './NotzGhoulPriest.svelte';

export default campaignRenderers('notz', {
	notzGhoulPriest: NotzGhoulPriest,
	notzGathering: NotzGathering,
	notzMidnightMasks: NotzMidnightMasks,
	notzDevourerBelow: NotzDevourerBelow,
	notzCoreOnly: NotzCoreOnly
});
