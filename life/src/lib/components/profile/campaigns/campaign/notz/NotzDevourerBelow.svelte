<!-- @component The Devourer Below: each ending reached, from Umôrdhoth repelled down to Arkham succumbing. -->
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
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: notz, ctx }: CampaignWidgetProps<CampaignNotz> = $props();

	const d = $derived(notz?.devourerBelow);
	const endings = $derived(
		d
			? [
					{
						kind: 'best' as EndingKind,
						label: m.campaign_notz_ending_repelled(),
						tally: d.umordhothRepelled
					},
					{
						kind: 'win' as EndingKind,
						label: m.campaign_notz_ending_ritual(),
						tally: d.ritualBroken
					},
					{
						kind: 'special' as EndingKind,
						label: m.campaign_notz_ending_sacrifice(),
						tally: d.litaSacrificed
					},
					{
						kind: 'loss' as EndingKind,
						label: m.campaign_notz_ending_succumbed(),
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
