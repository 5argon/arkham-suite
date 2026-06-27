<!--
@component
TDE shared widget — "The Black Cat". The companion's terminal disposition across the
interconnected interludes: at your side with the Dream-Quest party (cultist) vs the Web of
Dreams party (tablet), or it abandoned you / grew distrustful / you went on your own. With
the mid-arc flags (had a hunch, searched for the truth). Reconstructed from BOTH logs (own
+ the linked sibling), which is why it needs the Linked Campaign Log. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdeShared } from '$lib/campaign/campaigns/tde-shared';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { shared }: { shared: CampaignTdeShared | null } = $props();
	const c = $derived(shared?.blackCat);
	const hasData = $derived(
		!!c &&
			c.withDreamQuest + c.withWebOfDreams + c.abandoned + c.distrustful + c.onYourOwn + c.hadHunch + c.searched >
				0
	);
	const rows = $derived<Stat[][]>(
		hasData && c
			? [
					[
						{ value: c.withDreamQuest, label: m.campaign_tde_cat_with_dream_quest() },
						{ value: c.withWebOfDreams, label: m.campaign_tde_cat_with_web_of_dreams() }
					],
					[
						{ value: c.abandoned, label: m.campaign_tde_cat_abandoned() },
						{ value: c.distrustful, label: m.campaign_tde_cat_distrustful() },
						{ value: c.onYourOwn, label: m.campaign_tde_cat_on_your_own() }
					],
					[
						{ value: c.hadHunch, label: m.campaign_tde_cat_hunch() },
						{ value: c.searched, label: m.campaign_tde_cat_searched() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
	<p class="text-primary-500 mt-3 text-center text-xs">{m.campaign_tde_cat_note()}</p>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tde_cat_empty()}</p>
{/if}
