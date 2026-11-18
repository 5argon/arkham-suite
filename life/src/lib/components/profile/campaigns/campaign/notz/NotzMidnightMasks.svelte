<!-- @component The Midnight Masks: which of the six cultists were interrogated and which got away, the most interrogated in one play per difficulty, and the lifetime totals. -->
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
	/** One tile per cultist, lit by how often it was interrogated or got away. */
	const tilesFor = (pick: 'caught' | 'escaped', detail: (times: string) => string) =>
		NOTZ_CULTISTS.map((code) => {
			const t = mm?.perCultist[code]?.[pick];
			return { id: code, code, count: t?.total ?? 0, detail: detail(times(t?.total ?? 0)) };
		});
	const interrogated = $derived(
		tilesFor('caught', (n) => m.campaign_notz_cultist_interrogated_detail({ times: n }))
	);
	const gotAway = $derived(
		tilesFor('escaped', (n) => m.campaign_notz_cultist_got_away_detail({ times: n }))
	);
</script>

<ScenarioInfo {ctx} empty={hunted || mm?.pastMidnight.total ? null : m.campaign_notz_masks_empty()}>
	{#snippet stats()}
		<div class="space-y-4">
			{#if hunted}
				<!-- Two 3-wide grids side by side need ~34rem; narrower, one above the other. -->
				<div class="@container">
					<div class="grid grid-cols-1 gap-4 @xl:grid-cols-2">
						<div>
							<SectionLabel variant="heading" align="center"
								>{m.campaign_notz_interrogated_heading()}</SectionLabel
							>
							<LitTileGrid tiles={interrogated} />
						</div>
						<div>
							<SectionLabel variant="heading" align="center"
								>{m.campaign_notz_got_away_heading()}</SectionLabel
							>
							<LitTileGrid tiles={gotAway} />
						</div>
					</div>
				</div>
			{/if}
			<StatNumbers
				rows={[
					{
						heading: m.campaign_notz_most_interrogated_heading(),
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
