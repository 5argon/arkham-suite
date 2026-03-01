<!--
@component
EotE bespoke widget — the City of the Elder Things matrix. Which version (I/II/III)
you faced is recorded manually in the Extra tab (the `city_version` choice), since
it depends on who is alive and isn't derivable from the log. Rows are the three
versions; columns are Times played, Resolutions obtained (the scenario's full
resolution set, lit per version like the resolution-coverage widget), and XP high
score. Hovering any cell breaks it down per difficulty via a single shared tooltip.
-->
<script lang="ts">
	import { HoverTooltip } from '@5argon/arkham-life-ui';
	import { difficultyBreakdown, times } from '$lib/campaign/difficulty';
	import { resolutionLabel, resolutionShort } from '$lib/campaign/resolutions';
	import type { CampaignEoeCity, CityResolutionTally } from '$lib/campaign/eoe-city';
	import WidgetTable, { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { city }: { city: CampaignEoeCity | null } = $props();

	// Per-difficulty breakdown comes from the shared `difficulty` helper (same order
	// and labels as every other widget); `times` / "N XP" is this widget's own unit.
	const vpFmt = (n: number): string => m.campaign_eote_city_xp_unit({ n });

	// ── Single shared tooltip for every cell in this widget ──────────────────
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipTitle = $state('');
	let tipDetail = $state('');

	function showTip(title: string, detail: string, e: MouseEvent) {
		tipTitle = title;
		tipDetail = detail;
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideTip = () => (tipVisible = false);

	function playsDetail(plays: number, byTier: Record<string, number>): string {
		const bd = difficultyBreakdown(byTier, times);
		return bd
			? m.campaign_eote_city_plays_detail_bd({ total: times(plays), bd })
			: m.campaign_eote_city_plays_detail({ total: times(plays) });
	}
	function vpDetail(best: number, byTier: Record<string, number>): string {
		const bd = difficultyBreakdown(byTier, vpFmt);
		return bd
			? m.campaign_eote_city_vp_detail_bd({ best, bd })
			: m.campaign_eote_city_vp_detail({ best });
	}
	function resolutionDetail(tally: CityResolutionTally): string {
		const bd = difficultyBreakdown(tally.byTier, times);
		return bd
			? m.campaign_eote_city_resolution_detail_bd({ total: times(tally.total), bd })
			: m.campaign_eote_city_resolution_detail({ total: times(tally.total) });
	}
</script>

{#if city}
	<div class="overflow-x-auto">
		{#if city.totalPlays === 0}
			<p class="text-primary-500 mb-3 text-sm">
				{m.campaign_eote_city_empty()}
			</p>
		{/if}
		<WidgetTable
			columns={[
				{ label: m.campaign_eote_city_col_version() },
				{ label: m.campaign_eote_city_col_times_played() },
				{ label: m.campaign_eote_city_col_resolutions() },
				{ label: m.campaign_eote_city_col_xp_high() }
			]}
			rows={city.versions}
			key={(v) => v.version}
		>
			{#snippet row(v)}
				<td class="{widgetTableCell} font-bold whitespace-nowrap text-black dark:text-white">
					{m.campaign_eote_city_version_label({ version: v.version })}
				</td>

				<!-- Times played -->
				<td class="{widgetTableCell} tabular-nums">
					{#if v.plays > 0}
						<span
							role="img"
							aria-label={m.campaign_eote_city_aria_times_played({
								detail: playsDetail(v.plays, v.playsByTier)
							})}
							class="text-secondary-700 dark:text-secondary-300 cursor-default font-semibold"
							onmouseenter={(e) =>
								showTip(
									m.campaign_eote_city_col_times_played(),
									playsDetail(v.plays, v.playsByTier),
									e
								)}
							onmouseleave={hideTip}
						>
							{v.plays}
						</span>
					{:else}
						<span class="text-primary-400">—</span>
					{/if}
				</td>

				<!-- Resolutions obtained (full set, lit when reached) -->
				<td class={widgetTableCell}>
					<div class="flex flex-wrap gap-1">
						{#each city.allResolutions as r (r)}
							{@const tally = v.resolutions[r] ?? null}
							<span
								role="img"
								aria-label={tally
									? m.campaign_eote_city_aria_resolution_reached({
											label: resolutionLabel(r),
											detail: resolutionDetail(tally)
										})
									: m.campaign_eote_city_aria_resolution_not_reached({
											label: resolutionLabel(r)
										})}
								class={[
									'cursor-default rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums',
									tally
										? 'bg-secondary-500 text-white'
										: 'bg-primary-100 dark:bg-primary-800 text-primary-400 dark:text-primary-600'
								]}
								onmouseenter={(e) =>
									showTip(
										resolutionLabel(r),
										tally ? resolutionDetail(tally) : m.campaign_eote_city_not_reached(),
										e
									)}
								onmouseleave={hideTip}
							>
								{resolutionShort(r)}
							</span>
						{/each}
					</div>
				</td>

				<!-- XP high score -->
				<td class="{widgetTableCell} tabular-nums">
					{#if v.vpBest !== null}
						<span
							role="img"
							aria-label={m.campaign_eote_city_aria_xp_high({
								detail: vpDetail(v.vpBest, v.vpBestByTier)
							})}
							class="text-secondary-700 dark:text-secondary-300 cursor-default font-semibold"
							onmouseenter={(e) =>
								showTip(
									m.campaign_eote_city_col_xp_high(),
									vpDetail(v.vpBest ?? 0, v.vpBestByTier),
									e
								)}
							onmouseleave={hideTip}
						>
							{v.vpBest}
						</span>
					{:else}
						<span class="text-primary-400">—</span>
					{/if}
				</td>
			{/snippet}
		</WidgetTable>
	</div>

	<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
		<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">
			<span class="font-semibold">{tipTitle}</span>
			{#if tipDetail}
				<br />
				<span class="text-neutral-600 dark:text-neutral-300">{tipDetail}</span>
			{/if}
		</span>
	</HoverTooltip>
{/if}
