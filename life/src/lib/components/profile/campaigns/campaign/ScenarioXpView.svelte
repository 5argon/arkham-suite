<!--
@component
Lifetime per-scenario XP highscore (Extra Imports) — the best XP you've recorded
for each scenario across all plays, so you can see which scenarios to push on
next. Hover an XP to see the highscore broken down per difficulty. Every playable
scenario is listed in the campaign's typical play order (campaign-data); scenarios
with no recorded XP show a muted dash.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { HoverTooltip } from '@5argon/arkham-life-ui';
	import { difficultyLabel, orderedDifficulties } from '$lib/campaign/difficulty';
	import type { CampaignScenarioXp, ScenarioXpStat } from '$lib/campaign/extra-imports';

	let {
		scenarioXp,
		showFamilyName = true
	}: { scenarioXp: CampaignScenarioXp[]; showFamilyName?: boolean } = $props();

	const withData = $derived(scenarioXp.filter((c) => c.scenarios.length > 0));

	function tierBreakdown(byTier: Record<string, number> | undefined): string {
		const b = byTier ?? {};
		return orderedDifficulties(b)
			.filter((t) => b[t] != null)
			.map((t) => m.campaign_xp_breakdown_entry({ tier: difficultyLabel(t), xp: b[t] }))
			.join(' · ');
	}

	// ── single shared tooltip: per-difficulty XP highscore ────────────────────
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipTitle = $state('');
	let tipDetail = $state('');
	function showTip(s: ScenarioXpStat, e: MouseEvent) {
		tipTitle = s.name;
		tipDetail = tierBreakdown(s.bestByTier);
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideTip = () => (tipVisible = false);
</script>

{#if withData.length}
	<div class="space-y-3">
		{#each withData as camp (camp.family)}
			<div class="border-primary-200 dark:border-primary-700 rounded border p-3">
				{#if showFamilyName}
					<h3 class="mb-2 font-bold text-black dark:text-white">{camp.name}</h3>
				{/if}
				<ul class="space-y-1">
					{#each camp.scenarios as s (s.scenario)}
						<li class="text-sm">
							<div class="flex items-center justify-between gap-3">
								<span class="truncate text-black dark:text-white" class:opacity-50={s.plays === 0}
									>{s.name}</span
								>
								{#if s.plays > 0}
									<span
										role="img"
										aria-label="{s.name} — {tierBreakdown(s.bestByTier) ||
											m.campaign_xp_unit({ xp: s.best })}"
										class="text-secondary-600 dark:text-secondary-400 shrink-0 cursor-default font-semibold tabular-nums"
										onmouseenter={(e) => showTip(s, e)}
										onmouseleave={hideTip}>{m.campaign_xp_unit({ xp: s.best })}</span
									>
								{:else}
									<span class="text-primary-400 shrink-0 font-normal">—</span>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
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
