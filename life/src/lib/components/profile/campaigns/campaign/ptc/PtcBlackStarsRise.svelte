<!-- @component Black Stars Rise: the path opened and the random basic weaknesses drawn at setup. -->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { SectionLabel, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import PtcCardCountList from './PtcCardCountList.svelte';
	import PtcScenarioInfo from './PtcScenarioInfo.svelte';

	let { blob: ptc, ctx }: CampaignWidgetProps<CampaignPtc> = $props();
	const b = $derived(ptc?.blackStarsRise);
	const weaknesses = $derived(ctx.logOnly ? [] : (b?.randomizedWeaknesses ?? []));
	const path = $derived([
		{ value: b?.pathAbove, label: m.campaign_ptc_bsr_above() },
		{ value: b?.pathBelow, label: m.campaign_ptc_bsr_below() },
		{ value: b?.carcosaMerged, label: m.campaign_ptc_bsr_merged() }
	]);
	const hasData = $derived(path.some((s) => s.value) || weaknesses.length > 0);
</script>

<PtcScenarioInfo {ptc} {ctx} empty={hasData ? null : m.campaign_ptc_bsr_empty()}>
	{#snippet stats()}
		<div class="space-y-4">
			<StatNumbers rows={[path]} />
			{#if weaknesses.length}
				<div>
					<SectionLabel variant="heading" align="center"
						>{m.campaign_ptc_bsr_weakness_heading()}</SectionLabel
					>
					<PtcCardCountList items={weaknesses} weaknessPool="black_stars_rise" />
				</div>
			{/if}
		</div>
	{/snippet}
</PtcScenarioInfo>
