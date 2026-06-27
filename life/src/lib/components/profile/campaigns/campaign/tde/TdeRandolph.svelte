<!--
@component
TDE shared widget — "Randolph Carter". His fate across both campaigns: the Dream-Quest
(saved you / eluded or was captured / survived or died on the voyage) and the Web of Dreams
(escaped the hospital alone or with you / survived or died on the descent). Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdeShared } from '$lib/campaign/campaigns/tde-shared';
	import StatNumbers, {
		type StatGroup
	} from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { shared }: { shared: CampaignTdeShared | null } = $props();
	const r = $derived(shared?.randolph);
	const hasData = $derived(
		!!r &&
			r.savedByCarter + r.eludedCapture + r.captured + r.survivedVoyage + r.diedVoyage +
				r.escapedAlone + r.escapedWithInvestigators + r.survivedDescent + r.diedDescent >
				0
	);
	const rows = $derived<StatGroup[]>(
		hasData && r
			? [
					{
						heading: m.campaign_tde_randolph_quest(),
						stats: [
							{ value: r.savedByCarter, label: m.campaign_tde_randolph_saved() },
							{ value: r.eludedCapture, label: m.campaign_tde_randolph_eluded() },
							{ value: r.captured, label: m.campaign_tde_randolph_captured() },
							{ value: r.survivedVoyage, label: m.campaign_tde_randolph_survived_voyage() },
							{ value: r.diedVoyage, label: m.campaign_tde_randolph_died_voyage() }
						]
					},
					{
						heading: m.campaign_tde_randolph_web(),
						stats: [
							{ value: r.escapedAlone, label: m.campaign_tde_randolph_escaped_alone() },
							{ value: r.escapedWithInvestigators, label: m.campaign_tde_randolph_escaped_with() },
							{ value: r.survivedDescent, label: m.campaign_tde_randolph_survived_descent() },
							{ value: r.diedDescent, label: m.campaign_tde_randolph_died_descent() }
						]
					}
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tde_randolph_empty()}</p>
{/if}
