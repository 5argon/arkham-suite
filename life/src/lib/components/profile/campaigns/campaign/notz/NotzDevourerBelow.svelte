<!-- @component The Devourer Below: each ending and the resolution it is, from Umôrdhoth repelled down to Arkham succumbing, and what waited in its encounter deck. -->
<script lang="ts">
	import { NOTZ_UMORDHOTH_CODE, type CampaignNotz } from '$lib/campaign/campaigns/notz';
	import type { EndingKind } from '$lib/campaign/outcomes/clear-status';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import EndingsGrid from '../EndingsGrid.svelte';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: notz, ctx }: CampaignWidgetProps<CampaignNotz> = $props();

	const d = $derived(notz?.devourerBelow);
	const cultists = $derived(d?.cultists);
	const endings = $derived(
		d
			? [
					{
						kind: 'best' as EndingKind,
						label: m.campaign_notz_ending_repelled(),
						resolution: 'R2',
						tally: d.umordhothRepelled
					},
					{
						kind: 'win' as EndingKind,
						label: m.campaign_notz_ending_ritual(),
						resolution: 'R1',
						tally: d.ritualBroken
					},
					{
						kind: 'special' as EndingKind,
						label: m.campaign_notz_ending_sacrifice(),
						resolution: 'R3',
						tally: d.litaSacrificed
					},
					{
						kind: 'loss' as EndingKind,
						label: m.campaign_notz_ending_succumbed(),
						resolution: 'no_resolution',
						tally: d.arkhamSuccumbed
					}
				]
			: []
	);
	const reached = $derived(endings.some((e) => e.tally.total > 0));
</script>

<ScenarioInfo
	{ctx}
	headerCards={[{ code: NOTZ_UMORDHOTH_CODE, tone: 'danger', objectTop: true }]}
	empty={reached ? null : m.campaign_notz_devourer_empty()}
>
	{#snippet stats()}
		<EndingsGrid {endings} heading={m.campaign_notz_devourer_heading()} />
		<StatNumbers
			rows={[
				{
					heading: m.campaign_notz_devourer_deck_heading(),
					stats: [
						{
							tally: notz?.ghoulPriest.aliveInDevourerBelow,
							label: m.campaign_notz_devourer_ghoul_alive()
						},
						{ value: cultists?.most, label: m.campaign_notz_devourer_most_cultists() },
						{ value: cultists?.fewest, label: m.campaign_notz_devourer_fewest_cultists() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
