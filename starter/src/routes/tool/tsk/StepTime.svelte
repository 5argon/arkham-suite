<script lang="ts">
	import type { SimStep } from '@5argon/arkham-tsk-solver';

	// Travel + clock readout for a step: how the cell got here, the clock on arrival, and — when the
	// stop costs time of its own — the clock after resolving it, before embarking to the next leg.
	let { step }: { step: SimStep } = $props();
	const departs = $derived(step.timeAfter !== step.entryTime);
</script>

<span class="inline-flex shrink-0 items-center gap-2 text-xs text-primary-400">
	{#if step.usedTicket}
		<span title="Expedited Ticket warp — saves {step.usedTicket.saved} time"><i class="fa-solid fa-ticket"></i> {step.usedTicket.saved}</span>
	{:else if step.travelCost > 0}
		<span title="Travel — {step.travelCost} time"><i class="fa-solid fa-route"></i> +{step.travelCost}</span>
	{/if}
	<span title="Clock on arrival (after travel, before this stop)"><i class="fa-solid fa-clock"></i> {step.entryTime}</span>
	{#if departs}
		<span title="Clock after this stop's time, before embarking"><i class="fa-solid fa-arrow-right-long"></i> {step.timeAfter}</span>
	{/if}
</span>
