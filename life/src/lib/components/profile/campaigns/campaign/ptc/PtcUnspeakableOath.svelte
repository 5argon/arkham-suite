<!-- @component The Unspeakable Oath: how the asylum was left, its Act 2 versions, and who went insane there. -->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { SectionLabel, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioVersionTable from '../ScenarioVersionTable.svelte';
	import PtcCardCountList from './PtcCardCountList.svelte';
	import PtcScenarioInfo from './PtcScenarioInfo.svelte';
	import { DC_TINT, hasVersionTable } from './ptc-spine';

	let { blob: ptc, ctx }: CampaignWidgetProps<CampaignPtc> = $props();
	const o = $derived(ptc?.unspeakableOath);
	const insane = $derived(ctx.logOnly ? [] : (o?.insaneInvestigators ?? []));
	const LABEL: Record<string, () => string> = {
		I: m.campaign_ptc_oath_version_1,
		II: m.campaign_ptc_oath_version_2
	};
	const asylum = $derived([
		{ value: o?.escaped, label: m.campaign_ptc_oath_escaped() },
		{ value: o?.attacked, label: m.campaign_ptc_oath_attacked() },
		{ value: o?.partyClaimed, label: m.campaign_ptc_oath_party_claimed() }
	]);
	const hasData = $derived(
		asylum.some((s) => s.value) || hasVersionTable(ctx) || insane.length > 0
	);
</script>

<PtcScenarioInfo {ptc} {ctx} empty={hasData ? null : m.campaign_ptc_oath_empty()}>
	{#snippet stats()}
		<div class="space-y-4">
			<StatNumbers rows={[asylum]} />
			<ScenarioVersionTable
				{ctx}
				title={m.campaign_ptc_oath_versions_title()}
				label={(v) => LABEL[v]?.() ?? v}
				accent={(v) => DC_TINT[v === 'I' ? 'conviction' : 'doubt']}
				showSucceedFailed
				showXp
			/>
			{#if insane.length}
				<div>
					<SectionLabel variant="heading" align="center"
						>{m.campaign_ptc_oath_insane_heading()}</SectionLabel
					>
					<PtcCardCountList items={insane} />
				</div>
			{/if}
		</div>
	{/snippet}
</PtcScenarioInfo>
