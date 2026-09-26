<!-- @component Union and Disillusion: the side taken, the ritual's aftermath, the missing persons' fate, and the Cosmos version walked. -->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import { scenarioVersions } from '$lib/campaign/stats/version-stats';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import ScenarioVersionTable from '../ScenarioVersionTable.svelte';
	import { ALLEGIANCE_TINT } from './tcu-spine';

	let { blob: tcu, ctx }: CampaignWidgetProps<CampaignTcu> = $props();
	const u = $derived(tcu?.union);
	const COSMOS: Record<string, () => string> = {
		I: m.campaign_tcu_cosmos_v1,
		II: m.campaign_tcu_cosmos_v2,
		III: m.campaign_tcu_cosmos_v3,
		IV: m.campaign_tcu_cosmos_v4
	};
	const groups = $derived([
		{
			heading: m.campaign_tcu_union_pnr_heading(),
			stats: [
				{ value: u?.sidedLodge, label: m.campaign_tcu_union_sided_lodge() },
				{ value: u?.sidedCoven, label: m.campaign_tcu_union_sided_coven() }
			]
		},
		{
			heading: m.campaign_tcu_union_aftermath_heading(),
			stats: [
				{ value: u?.lodgeTrueWork, label: m.campaign_tcu_union_true_work() },
				{ value: u?.sanfordPossesses, label: m.campaign_tcu_union_sanford() },
				{ value: u?.anettePossessed, label: m.campaign_tcu_union_anette() }
			]
		},
		{
			heading: m.campaign_tcu_union_survivors_heading(),
			stats: [
				{ value: u?.survivors.alive, label: m.campaign_tcu_union_alive() },
				{ value: u?.survivors.dead, label: m.campaign_tcu_union_dead() }
			]
		}
	]);
	const cosmos = $derived(scenarioVersions(ctx.scenarios, ctx.scenario ?? '').hasPlays);
	const hasData = $derived(groups.some((g) => g.stats.some((s) => s.value)) || cosmos);
</script>

<ScenarioInfo {ctx} empty={hasData ? null : m.campaign_tcu_union_empty()}>
	{#snippet stats()}
		<div class="space-y-4">
			<StatNumbers rows={groups} />
			{#if cosmos}
				<ScenarioVersionTable
					{ctx}
					title={m.campaign_tcu_cosmos_heading()}
					label={(v) => COSMOS[v]?.() ?? v}
					accent={(v) => ALLEGIANCE_TINT[v === 'I' ? 'lodge' : 'coven']}
					showSucceedFailed
				/>
			{/if}
		</div>
	{/snippet}
</ScenarioInfo>
