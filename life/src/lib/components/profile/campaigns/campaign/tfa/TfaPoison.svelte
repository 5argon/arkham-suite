<!--
@component
TFA bespoke widget — "Venom of Yig". The campaign's signature survival tax: how many times your
investigators gained the Poisoned weakness across the exploration scenarios (recorded via the Extra
tab, since a weakness gained in play leaves no campaign-log entry), and which of your investigators
Yig's venom struck most. Built on CardLineList beside the Poisoned card art.
-->
<script lang="ts">
	import { TFA_POISONED_CODE, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import CardLineList from '$lib/components/profile/_primitives/CardLineList.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tfa }: { tfa: CampaignTfa | null } = $props();
	const p = $derived(tfa?.poison);
	const hasData = $derived(!!p && p.total > 0);

	const victims = $derived(
		p
			? Object.entries(p.byInvestigator)
					.map(([code, count]) => ({ code, count }))
					.sort((a, b) => b.count - a.count)
			: []
	);
</script>

{#if hasData && p}
	<div class="space-y-3">
		<div class="flex items-center gap-3">
			<CardThumb code={TFA_POISONED_CODE} alt={m.campaign_tfa_poisoned_name()} tone="danger" objectTop />
			<div>
				<p class="text-4xl leading-none font-bold text-black tabular-nums dark:text-white">{p.total}</p>
				<p class="text-primary-500 mt-1.5 text-sm">{m.campaign_tfa_poison_total()}</p>
			</div>
		</div>
		{#if victims.length}
			<div>
				<SectionLabel>{m.campaign_tfa_poison_by_investigator()}</SectionLabel>
				<CardLineList items={victims} align="right">
					{#snippet trailing(v)}
						×{v.count}
					{/snippet}
				</CardLineList>
			</div>
		{/if}
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tfa_poison_empty()}</p>
{/if}
