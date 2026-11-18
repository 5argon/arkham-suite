<!-- @component Each scenario's best recorded reward (Victory Points, or Experience where the app awards flat XP) beside the most it can award. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { difficultyLabel, orderedDifficulties } from '$lib/campaign/utils/difficulty';
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import {
		isVictoryDisplay,
		rewardBreakdownEntry,
		rewardUnit
	} from '$lib/campaign/utils/scenario-reward';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import { HoverTip, HoverTipState, WidgetTable } from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import ScenarioNameCell from './ScenarioNameCell.svelte';

	let {
		scenarios,
		showFamilyName = true
	}: { scenarios: CampaignScenarios[]; showFamilyName?: boolean } = $props();

	const withData = $derived(scenarios.filter((c) => c.scenarios.length > 0));

	function tierBreakdown(vd: boolean, byTier: Record<string, number> | undefined): string {
		const b = byTier ?? {};
		return orderedDifficulties(b)
			.filter((t) => b[t] != null)
			.map((t) => rewardBreakdownEntry(vd, difficultyLabel(t), b[t]))
			.join(' · ');
	}

	// A curated max of 0 means the scenario keeps no highscore. Replay variants (Fatal Mirage's
	// fatal_mirage_2 / _3) take the max of their base scenario.
	const maxReward = (family: string, id: string): number | undefined =>
		scenarioMeta(family, id)?.maxXp ?? scenarioMeta(family, id.replace(/_\d+$/, ''))?.maxXp;

	const columns = [
		{ label: m.campaign_xp_col_scenario() },
		{ label: m.campaign_xp_col_best() },
		{ label: m.campaign_xp_col_max() }
	];

	const tip = new HoverTipState();
</script>

{#if withData.length}
	<div class="space-y-3">
		{#each withData as camp (camp.family)}
			<div>
				{#if showFamilyName}
					<h3 class="mb-2 font-bold text-black dark:text-white">{camp.name}</h3>
				{/if}
				<WidgetTable {columns} rows={camp.scenarios} key={(s) => s.scenario}>
					{#snippet row(s)}
						{@const max = maxReward(camp.family, s.scenario)}
						{@const vd = isVictoryDisplay(camp.family, s.scenario)}
						<ScenarioNameCell scenarioId={s.scenario} name={s.name} faded={s.plays === 0} />
						<td class="{widgetTableCell} tabular-nums">
							<!-- A best of 0 is a reward box never filled, not a score of 0. -->
							{#if max === 0 || s.plays === 0 || !s.best}
								<span class="text-primary-400">—</span>
							{:else}
								<span
									role="img"
									aria-label="{s.name} — {tierBreakdown(vd, s.bestByTier) || rewardUnit(vd, s.best)}"
									class="text-secondary-600 dark:text-secondary-400 cursor-default font-semibold"
									onmouseenter={(e) => tip.show(s.name, tierBreakdown(vd, s.bestByTier), e)}
									onmouseleave={tip.hide}>{rewardUnit(vd, s.best)}</span
								>
							{/if}
						</td>
						<td class="{widgetTableCell} tabular-nums">
							{#if max}
								<span class="text-primary-500">{rewardUnit(vd, max)}</span>
							{:else}
								<span class="text-primary-400">—</span>
							{/if}
						</td>
					{/snippet}
				</WidgetTable>
			</div>
		{/each}
	</div>

	<HoverTip {tip} />
{/if}
