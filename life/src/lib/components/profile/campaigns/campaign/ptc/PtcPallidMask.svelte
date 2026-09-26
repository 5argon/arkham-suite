<!-- @component The Pallid Mask: how the catacombs were entered, how Act 2 advanced, and the weaknesses drawn for reading Act II. -->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import { choicesForScenario } from '$lib/campaign/stats/scenario-extras';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { SectionLabel, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioVersionTable from '../ScenarioVersionTable.svelte';
	import PtcCardCountList from './PtcCardCountList.svelte';
	import PtcScenarioInfo from './PtcScenarioInfo.svelte';
	import { DC_TINT, hasVersionTable, versionResolutions } from './ptc-spine';

	let { blob: ptc, ctx }: CampaignWidgetProps<CampaignPtc> = $props();
	const p = $derived(ptc?.pallidMask);
	const log = getCampaignLog('ptc');
	const advanced = log
		? (choicesForScenario(log, 'the_pallid_mask').find((c) => c.id === 'doubt_conviction')
				?.options ?? [])
		: [];
	const weaknesses = $derived(ctx.logOnly ? [] : (p?.randomizedWeaknesses ?? []));
	const catacombs = $derived([
		{ value: p?.enteredCatacombs, label: m.campaign_ptc_pallid_entered() },
		{ value: p?.awokeInside, label: m.campaign_ptc_pallid_awoke() }
	]);
	const reachable = $derived(versionResolutions(ctx));
	const hasData = $derived(
		catacombs.some((s) => s.value) || hasVersionTable(ctx) || weaknesses.length > 0
	);
</script>

<PtcScenarioInfo {ptc} {ctx} empty={hasData ? null : m.campaign_ptc_pallid_empty()}>
	{#snippet stats()}
		<div class="space-y-4">
			<StatNumbers rows={[catacombs]} />
			<ScenarioVersionTable
				{ctx}
				title={m.campaign_ptc_pallid_versions_title()}
				label={(v) => advanced.find((o) => o.value === v)?.label ?? v}
				accent={(v) => DC_TINT[v as 'conviction' | 'doubt']}
				resolutionIds={(v) => reachable(v).filter((r) => r !== 'no_resolution')}
				showSucceedFailed
				showXp
			/>
			{#if weaknesses.length}
				<div>
					<SectionLabel variant="heading" align="center"
						>{m.campaign_ptc_pallid_weakness_heading()}</SectionLabel
					>
					<PtcCardCountList items={weaknesses} weaknessPool="the_pallid_mask" />
				</div>
			{/if}
		</div>
	{/snippet}
</PtcScenarioInfo>
