<!-- @component The Last King: how the dinner party ended, the Reality's Shadow fork, and the guests interviewed and slain there. -->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import PtcVipGrid from './PtcVipGrid.svelte';

	let { blob: ptc, ctx }: CampaignWidgetProps<CampaignPtc> = $props();
	const lk = $derived(ptc?.lastKing);
	const groups = $derived([
		{
			heading: m.campaign_ptc_lastking_resolution(),
			nonLog: true,
			stats: [
				{ value: lk?.survived, label: m.campaign_ptc_lastking_survived() },
				{ value: lk?.resigned, label: m.campaign_ptc_lastking_resigned() },
				{ value: lk?.defeated, label: m.campaign_ptc_lastking_defeated() }
			]
		},
		{
			heading: m.campaign_ptc_lastking_interlude(),
			stats: [
				{ value: lk?.fledParty, label: m.campaign_ptc_lastking_fled() },
				{ value: lk?.intrudedMeeting, label: m.campaign_ptc_lastking_intruded() },
				{ value: lk?.slayedMonsters, label: m.campaign_ptc_lastking_slayed() }
			]
		}
	]);
	const slain = $derived(ctx.logOnly ? null : (lk?.slainVips ?? null));
	const hasVips = $derived(
		!!ptc && Object.keys(ptc.vipsInterviewed).length + Object.keys(slain ?? {}).length > 0
	);
	const hasData = $derived(
		hasVips || groups.some((g) => !(g.nonLog && ctx.logOnly) && g.stats.some((s) => s.value))
	);
</script>

<ScenarioInfo {ctx} empty={hasData ? null : m.campaign_ptc_lastking_empty()}>
	{#snippet stats()}
		<div class="space-y-4">
			<StatNumbers rows={groups} logOnly={ctx.logOnly} />
			{#if ptc && hasVips}
				<PtcVipGrid
					interviewed={ptc.vipsInterviewed}
					{slain}
					slainLabel={m.campaign_ptc_lastking_slain_heading()}
					mostSlain={lk?.mostSlainInRun}
				/>
			{/if}
		</div>
	{/snippet}
</ScenarioInfo>
