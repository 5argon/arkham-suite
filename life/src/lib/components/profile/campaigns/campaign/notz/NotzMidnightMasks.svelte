<!-- @component The Midnight Masks: the six cultists hunted, the best haul per difficulty, and the lifetime totals. -->
<script lang="ts">
	import { NOTZ_CULTISTS, type CampaignNotz } from '$lib/campaign/campaigns/notz';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, SectionLabel, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { times } from '$lib/profile/plural';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: notz, ctx }: CampaignWidgetProps<CampaignNotz> = $props();

	const mm = $derived(notz?.midnightMasks);
	const hunted = $derived(!!mm && mm.totalInterrogated + mm.totalEscaped > 0);
	const cultists = $derived(
		NOTZ_CULTISTS.map((code) => {
			const caught = mm?.perCultist[code]?.caught.total ?? 0;
			const escaped = mm?.perCultist[code]?.escaped.total ?? 0;
			return {
				id: code,
				code,
				count: caught,
				detail: m.campaign_notz_cultist_detail({ caught: times(caught), escaped: times(escaped) })
			};
		})
	);
</script>

<ScenarioInfo {ctx} empty={hunted || mm?.pastMidnight.total ? null : m.campaign_notz_masks_empty()}>
	{#snippet stats()}
		<div class="space-y-4">
			{#if hunted}
				<div>
					<SectionLabel variant="heading" align="center"
						>{m.campaign_notz_cultists_heading()}</SectionLabel
					>
					<LitTileGrid rows={[cultists]} />
				</div>
			{/if}
			<StatNumbers
				rows={[
					{
						heading: m.campaign_notz_best_haul_heading(),
						stats: (mm?.bestHaul ?? []).map((b) => ({
							value: b.caught,
							label: difficultyLabel(b.tier)
						}))
					},
					[
						{ value: mm?.totalInterrogated, label: m.campaign_notz_total_interrogated() },
						{ tally: mm?.pastMidnight, label: m.campaign_notz_past_midnight() },
						{ value: mm?.totalEscaped, label: m.campaign_notz_total_escaped() }
					]
				]}
			/>
		</div>
	{/snippet}
</ScenarioInfo>
