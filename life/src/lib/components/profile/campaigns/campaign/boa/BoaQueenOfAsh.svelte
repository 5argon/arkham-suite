<!-- @component Queen of Ash: each ending and the resolution it is, what Smoke and Mirrors left waiting in the sewers, and the Collector reward card. -->
<script lang="ts">
	import { BOA_ELOKOSS_CODE, type CampaignBoa } from '$lib/campaign/campaigns/boa';
	import type { EndingKind } from '$lib/campaign/outcomes/clear-status';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { COLLECTOR_CODE } from '$lib/campaign/rewards/reward-defs';
	import { RewardLine, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import EndingsGrid from '../EndingsGrid.svelte';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: boa, ctx }: CampaignWidgetProps<CampaignBoa> = $props();

	const q = $derived(boa?.queenOfAsh);
	const endings = $derived(
		q
			? [
					{
						kind: 'best' as EndingKind,
						label: m.campaign_boa_ending_defeated(),
						resolution: 'R1',
						tally: q.defeatedElokoss
					},
					{
						kind: 'best' as EndingKind,
						label: m.campaign_boa_ending_stopped(),
						resolution: 'R2',
						tally: q.stoppedRebirth
					},
					{
						kind: 'win' as EndingKind,
						label: m.campaign_boa_ending_flooded(),
						resolution: 'R3',
						tally: q.floodedRitual
					},
					{
						kind: 'loss' as EndingKind,
						label: m.campaign_boa_ending_reborn(),
						resolution: 'no_resolution',
						tally: q.elokossReborn
					}
				]
			: []
	);
	const reached = $derived(endings.some((e) => e.tally.total > 0));
</script>

<ScenarioInfo
	{ctx}
	headerCards={[{ code: BOA_ELOKOSS_CODE, tone: 'danger', objectTop: true }]}
	empty={reached ? null : m.campaign_boa_queen_empty()}
>
	{#snippet stats()}
		<EndingsGrid {endings} heading={m.campaign_boa_queen_heading()} />
		<StatNumbers
			rows={[
				{
					heading: m.campaign_boa_carried_heading(),
					stats: [
						{ tally: q?.headStart, label: m.campaign_boa_head_start() },
						{ tally: q?.ambushed, label: m.campaign_boa_ambushed() },
						{ tally: q?.extraDoom, label: m.campaign_boa_extra_doom() }
					]
				}
			]}
		/>
		<RewardLine code={COLLECTOR_CODE} tally={q?.collector} />
	{/snippet}
</ScenarioInfo>
