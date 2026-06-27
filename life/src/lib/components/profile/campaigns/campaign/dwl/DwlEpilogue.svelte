<!--
@component
DWL bespoke widget — "The Epilogue". Read only after a win, the Dunwich epilogue
forks on whether you calmed the townsfolk at Undimensioned and Unseen: a peaceful
"life returned to normal" vs the ominous sign in the dirt. Inferred from a win
note + the townsfolk note. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { dwl }: { dwl: CampaignDwl | null } = $props();
	const e = $derived(dwl?.epilogue);
	const hasData = $derived(!!e && (e.peaceful > 0 || e.ominous > 0));
	const rows = $derived<Stat[][]>(
		hasData && e
			? [
					[
						{ value: e.peaceful, label: m.campaign_dwl_epilogue_peaceful() },
						{ value: e.ominous, label: m.campaign_dwl_epilogue_ominous() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_dwl_epilogue_empty()}</p>
{/if}
