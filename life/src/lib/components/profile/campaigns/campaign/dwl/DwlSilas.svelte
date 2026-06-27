<!--
@component
DWL bespoke widget — "Silas Bishop". At Blood on the Altar his fate is decided
once: put out of his misery (killed) / restored / banished. Lifetime counts.
Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { dwl }: { dwl: CampaignDwl | null } = $props();
	const s = $derived(dwl?.silas);
	const hasData = $derived(!!s && (s.killed > 0 || s.restored > 0 || s.banished > 0));
	const rows = $derived<Stat[][]>(
		hasData && s
			? [
					[
						{ value: s.killed, label: m.campaign_dwl_silas_killed() },
						{ value: s.restored, label: m.campaign_dwl_silas_restored() },
						{ value: s.banished, label: m.campaign_dwl_silas_banished() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_dwl_silas_empty()}</p>
{/if}
