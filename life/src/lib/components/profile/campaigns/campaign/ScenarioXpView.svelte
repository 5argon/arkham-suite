<!--
@component
Lifetime per-scenario Victory Points highscore (Extra Imports) — the best end-of-scenario reward
you've recorded for each scenario across all plays, beside its Max (the most the victory display can
award, curated in campaign-data). Each scenario is worded the way ArkhamCards shows it: Victory
Points / VP for the usual victory-display tally, or flat Experience / XP for the few scenarios that
add uncountable XP (per `scenarioMeta.victoryDisplay`). Hover a highscore for the per-difficulty
breakdown. Every playable scenario is listed in the campaign's typical play order with its
encounter-set icon; no recorded reward shows a dash, and a Max of 0 (or no curated value) shows a
dash too. Rendered through the shared WidgetTable, matching Resolution Coverage.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import HoverTip from '$lib/components/profile/_primitives/HoverTip.svelte';
	import { HoverTipState } from '$lib/components/profile/_primitives/hover-tip.svelte';
		import { difficultyLabel, orderedDifficulties } from '$lib/campaign/utils/difficulty';
	import { isVictoryDisplay, rewardUnit, rewardBreakdownEntry } from '$lib/campaign/utils/scenario-reward';
	import type { CampaignScenarios, ScenarioStat } from '$lib/campaign/stats/scenario-stats';
	import ScenarioSetIcon from '$lib/components/profile/_primitives/ScenarioSetIcon.svelte';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';

	let {
		scenarios,
		showFamilyName = true
	}: { scenarios: CampaignScenarios[]; showFamilyName?: boolean } = $props();

	const withData = $derived(scenarios.filter((c) => c.scenarios.length > 0));

	// Each scenario's reward is VP (victory display) or XP (flat experience) — wording follows the app.
	function tierBreakdown(vd: boolean, byTier: Record<string, number> | undefined): string {
		const b = byTier ?? {};
		return orderedDifficulties(b)
			.filter((t) => b[t] != null)
			.map((t) => rewardBreakdownEntry(vd, difficultyLabel(t), b[t]))
			.join(' · ');
	}

	// Max reward per scenario (campaign-data `scenarioMeta.maxXp`), cached per family. A curated `0`
	// means no highscore is kept (both Highscore and Max render a dash).
	const maxXpCache = new Map<string, Map<string, number>>();
	function maxXpFor(family: string, scenarioId: string): number | undefined {
		let byId = maxXpCache.get(family);
		if (!byId) {
			byId = new Map();
			for (const sm of getCampaignLog(family)?.db.scenarioMeta ?? []) {
				if (typeof sm.maxXp === 'number') byId.set(sm.id, sm.maxXp);
			}
			maxXpCache.set(family, byId);
		}
		// Replay variants (Fatal Mirage's fatal_mirage_2 / _3) dedup onto the base in scenarioMeta, so
		// fall back to the base's curated max by dropping a trailing _<n> — letting a base max of 0 dash
		// the variants too. A genuinely distinct numbered scenario has its own max and matches exactly.
		return byId.get(scenarioId) ?? byId.get(scenarioId.replace(/_\d+$/, ''));
	}

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
						{@const maxXp = maxXpFor(camp.family, s.scenario)}
						{@const vd = isVictoryDisplay(camp.family, s.scenario)}
						<td class="{widgetTableCell} whitespace-nowrap">
							<span class="flex items-center gap-1.5" class:opacity-50={s.plays === 0}>
								<span
									class="text-primary-600 dark:text-primary-300 shrink-0"
									style="font-size:1.1rem"
								>
									<ScenarioSetIcon scenarioId={s.scenario} />
								</span>
								<span class="text-black dark:text-white">{s.name}</span>
							</span>
						</td>
						<td class="{widgetTableCell} tabular-nums">
							{#if maxXp === 0 || s.plays === 0 || !s.best}
								<!-- Dash when the scenario officially awards nothing (max 0), was never played, OR has
								     no recorded highscore (best 0 = the reward box was never filled — not a "0 VP" score). -->
								<span class="text-primary-400">—</span>
							{:else}
								<span
									role="img"
									aria-label="{s.name} — {tierBreakdown(vd, s.bestByTier) ||
										rewardUnit(vd, s.best)}"
									class="text-secondary-600 dark:text-secondary-400 cursor-default font-semibold"
									onmouseenter={(e) => tip.show(s.name, tierBreakdown(vd, s.bestByTier), e)}
									onmouseleave={tip.hide}>{rewardUnit(vd, s.best)}</span
								>
							{/if}
						</td>
						<td class="{widgetTableCell} tabular-nums">
							{#if maxXp != null && maxXp > 0}
								<span class="text-primary-500">{rewardUnit(vd, maxXp)}</span>
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
