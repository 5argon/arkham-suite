<!-- @component Before the Black Throne: the threat that rose at Union, how the finale ended, and the finale by Twist of Fate tally. -->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import { scenarioVersions } from '$lib/campaign/stats/version-stats';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import ScenarioVersionTable from '../ScenarioVersionTable.svelte';

	let { blob: tcu, ctx }: CampaignWidgetProps<CampaignTcu> = $props();
	const u = $derived(tcu?.union);
	const e = $derived(tcu?.endings);
	const groups = $derived([
		{
			heading: m.campaign_tcu_end_ritual_heading(),
			stats: [
				{ value: u?.lodgeTrueWork, label: m.campaign_tcu_union_true_work() },
				{ value: u?.sanfordPossesses, label: m.campaign_tcu_union_sanford() },
				{ value: u?.anettePossessed, label: m.campaign_tcu_union_anette() }
			]
		},
		{
			heading: m.campaign_tcu_end_finale_heading(),
			stats: [
				{ value: e?.slumbersClean, label: m.campaign_tcu_end_clean() },
				{ value: e?.joinedPipers, label: m.campaign_tcu_end_pipers() },
				{ value: e?.signedBlackBook, label: m.campaign_tcu_end_black_book() },
				{ value: e?.azathothDevoured, label: m.campaign_tcu_end_devoured() }
			]
		}
	]);
	const hasData = $derived(
		groups.some((g) => g.stats.some((s) => s.value)) ||
			(!ctx.logOnly && scenarioVersions(ctx.scenarios, ctx.scenario ?? '').hasPlays)
	);
</script>

<ScenarioInfo {ctx} empty={hasData ? null : m.campaign_tcu_end_empty()}>
	{#snippet stats()}
		<div class="space-y-4">
			<StatNumbers rows={groups} />
			<ScenarioVersionTable
				{ctx}
				title={m.campaign_tcu_pathwinds_heading()}
				label={(tally) => m.campaign_tcu_pathwinds_row({ tally })}
				showSucceedFailed
			/>
		</div>
	{/snippet}
</ScenarioInfo>
