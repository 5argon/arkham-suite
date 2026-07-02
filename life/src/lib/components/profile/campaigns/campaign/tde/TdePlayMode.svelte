<!--
@component
TDE shared widget — "How You Played It". Interconnected (eight-part) vs half (four-part).
Shown on both Dream-Eaters campaign pages from that side's records. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdeShared } from '$lib/campaign/campaigns/tde-shared';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { shared }: { shared: CampaignTdeShared | null } = $props();
	const p = $derived(shared?.playMode);
	const hasData = $derived(!!p && p.interconnected + p.half + p.unspecified > 0);
	const rows = $derived<Stat[][]>(
		hasData && p
			? [
					[
						{ value: p.interconnected, label: m.campaign_tde_mode_interconnected() },
						{ value: p.half, label: m.campaign_tde_mode_half() },
						...(p.unspecified > 0
							? [{ value: p.unspecified, label: m.campaign_tde_mode_unspecified() }]
							: [])
					]
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tde_mode_empty()}</p>
{/if}
