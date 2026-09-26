<!-- @component Sepulchre of the Sleeper: plays that met each part of its gate, and whether the awakening was halted. -->
<script lang="ts">
	import type { CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tdc, ctx }: CampaignWidgetProps<CampaignTdc> = $props();

	const s = $derived(tdc?.sepulchre);
</script>

<ScenarioInfo {ctx} showPlays>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tdc_sepulchre_empty()}
			rows={[
				{
					heading: m.campaign_tdc_sepulchre_gate_heading(),
					stats: [
						{ value: tdc?.glyphs.allTwentySix, label: m.campaign_tdc_sepulchre_gate_glyphs() },
						{ value: tdc?.artifacts.allSix, label: m.campaign_tdc_sepulchre_gate_artifacts() },
						{ value: s?.innerSanctum, label: m.campaign_tdc_sepulchre_gate_sanctum() }
					]
				},
				{
					heading: m.campaign_tdc_sepulchre_outcome_heading(),
					stats: [
						{ value: s?.halted, label: m.campaign_tdc_sepulchre_halted() },
						{ value: s?.didNotConfront, label: m.campaign_tdc_sepulchre_skipped() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
