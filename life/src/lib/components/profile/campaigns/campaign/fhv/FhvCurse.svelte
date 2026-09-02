<!--
@component
FHV bespoke widget — "The Hemlock Curse". Eating at the feast curses an investigator; this
tallies how many of the cell bore the curse. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import WidgetEmpty from '$lib/components/profile/_primitives/WidgetEmpty.svelte';

	let { fhv }: { fhv: CampaignFhv | null } = $props();
	const c = $derived(fhv?.curse);
	const hasData = $derived(!!c && c.plays > 0);
	const rows = $derived<Stat[][]>(
		hasData && c
			? [
					[
						{ value: c.maxCursed, label: m.campaign_fhv_curse_max() },
						{ value: c.plays, label: m.campaign_fhv_curse_plays() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
{:else}
	<WidgetEmpty>{m.campaign_fhv_curse_empty()}</WidgetEmpty>
{/if}
