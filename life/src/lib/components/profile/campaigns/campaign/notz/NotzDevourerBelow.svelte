<!-- @component The Devourer Below: each ending and the resolution it is, from Umôrdhoth repelled down to Arkham succumbing. -->
<script lang="ts">
	import { NOTZ_UMORDHOTH_CODE, type CampaignNotz } from '$lib/campaign/campaigns/notz';
	import type { EndingKind } from '$lib/campaign/outcomes/clear-status';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		CountWithBreakdown,
		OutcomeFace,
		SectionLabel
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ResolutionChips from '../ResolutionChips.svelte';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: notz, ctx }: CampaignWidgetProps<CampaignNotz> = $props();

	const d = $derived(notz?.devourerBelow);
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
		<div>
			<SectionLabel variant="heading" align="center"
				>{m.campaign_notz_devourer_heading()}</SectionLabel
			>
			<div class="grid grid-cols-2 gap-x-6 gap-y-2">
				{#each endings as e (e.label)}
					<div class="flex items-center gap-2 {e.tally.total > 0 ? '' : 'opacity-45'}">
						<OutcomeFace kind={e.kind} label={e.label} reached={e.tally.total > 0} />
						<span class="min-w-0 flex-1 truncate text-sm text-black dark:text-white">{e.label}</span
						>
						<ResolutionChips
							ids={[e.resolution]}
							visited={new Set(e.tally.total > 0 ? [e.resolution] : [])}
							tallies={{ [e.resolution]: e.tally }}
						/>
						<CountWithBreakdown
							value="×{e.tally.total}"
							tally={e.tally}
							class="text-secondary-600 dark:text-secondary-400 shrink-0 font-semibold tabular-nums"
						/>
					</div>
				{/each}
			</div>
		</div>
	{/snippet}
</ScenarioInfo>
