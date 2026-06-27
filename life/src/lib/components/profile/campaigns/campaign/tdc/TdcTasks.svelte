<!--
@component
TDC bespoke widget — "Side Tasks". At "An Offer You Can't Refuse" the crew picks up to 8 side
tasks; `task_progress` (a count entry) records how many were completed. Shows your best single
expedition and the lifetime total across plays. StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tdc }: { tdc: CampaignTdc | null } = $props();
	const t = $derived(tdc?.tasks ?? null);
	const hasData = $derived(!!t && t.total > 0);
	const rows = $derived<Stat[][]>(
		hasData && t
			? [
					[
						{ value: t.best, label: m.campaign_tdc_tasks_best() },
						{ value: t.total, label: m.campaign_tdc_tasks_total() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
	<p class="text-primary-500 mt-3 text-center text-xs">{m.campaign_tdc_tasks_note()}</p>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tdc_tasks_empty()}</p>
{/if}
