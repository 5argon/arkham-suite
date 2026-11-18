<!-- @component Lodge vs Coven: the signature runs' allegiance chains, the leans per decision point, and The Price of Progress. -->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import { sourcePlays } from '$lib/campaign/campaigns/two-sided';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers, WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import SignatureRunsTable from '../SignatureRunsTable.svelte';
	import TwoSidedSourceTable from '../TwoSidedSourceTable.svelte';
	import { tcuAllegianceSpec } from './tcu-spine';

	let { blob: tcu }: CampaignWidgetProps<CampaignTcu> = $props();
	const spec = $derived(tcuAllegianceSpec());
	const a = $derived(tcu?.allegiance);
</script>

{#if tcu && (tcu.allegianceRuns.mostA || tcu.allegianceSources.some(sourcePlays))}
	<div class="space-y-5">
		<SignatureRunsTable {spec} runs={tcu.allegianceRuns} />
		<TwoSidedSourceTable {spec} sources={tcu.allegianceSources} />
		<StatNumbers
			rows={[
				[
					{ value: a?.deceivingLodge, label: m.campaign_tcu_alleg_deceiving() },
					{ value: a?.rescuedJosef, label: m.campaign_tcu_alleg_josef_rescued() },
					{ value: a?.josefAlive, label: m.campaign_tcu_alleg_josef_alive() },
					{ value: a?.josefLostToMist, label: m.campaign_tcu_alleg_josef_mist() }
				]
			]}
		/>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tcu_alleg_empty()}</WidgetEmpty>
{/if}
