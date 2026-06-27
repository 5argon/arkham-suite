<!--
@component
DWL bespoke widget — "The First Case". Dunwich opens with two scenarios played in
EITHER order; this counts how often each was the one you tackled FIRST (derived
from the play's route = entry-ordered scenario sequence). Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { dwl }: { dwl: CampaignDwl | null } = $props();
	const hasData = $derived(!!dwl && (dwl.eaFirst > 0 || dwl.thawFirst > 0));
	const rows = $derived<Stat[][]>(
		hasData && dwl
			? [
					[
						{ value: dwl.eaFirst, label: m.campaign_dwl_opening_ea() },
						{ value: dwl.thawFirst, label: m.campaign_dwl_opening_thaw() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_dwl_opening_empty()}</p>
{/if}
