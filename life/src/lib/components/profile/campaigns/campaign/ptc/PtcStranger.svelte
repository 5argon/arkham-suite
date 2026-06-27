<!--
@component
PtC bespoke widget — "The Stranger". How far the Stranger chased you (the final `chasing_the_stranger`
mark, distributed across plays) and the per-scenario highscore — the most times you defeated The Man
in the Pallid Mask in a single play of each scenario (Extra-supplied, since the log keeps only the
running total). He's discarded when defeated, so a deck reshuffle lets you farm multiple defeats —
some scenarios more than others. Two tables, matching Victory Points Highscore: the pursuit
distribution on top, the per-scenario highscore below (EVERY scenario; a dash where he was never
defeated there).
-->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import ScenarioSetIcon from '$lib/components/profile/_primitives/ScenarioSetIcon.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { ptc }: { ptc: CampaignPtc | null } = $props();

	// Top: how far the Stranger chased — final chasing_the_stranger mark → plays, ascending.
	const proximity = $derived(
		ptc
			? Object.keys(ptc.strangerCounts)
					.map(Number)
					.sort((a, b) => a - b)
					.map((n) => ({ marks: n, plays: ptc.strangerCounts[n] }))
			: []
	);
	// Bottom: per-scenario highscore — most defeats in one play of each scenario (0 → a dash).
	const highscores = $derived(ptc?.strangerByScenario ?? []);

	const hasData = $derived(proximity.length > 0 || highscores.length > 0);

	const proximityCols = [
		{ label: m.campaign_ptc_stranger_col_marks() },
		{ label: m.campaign_ptc_stranger_col_plays(), align: 'right' as const }
	];
	const highscoreCols = [
		{ label: m.campaign_ptc_stranger_col_scenario() },
		{ label: m.campaign_ptc_stranger_col_defeats(), align: 'right' as const }
	];
</script>

{#if hasData}
	<div class="space-y-4">
		{#if proximity.length}
			<div>
				<SectionLabel variant="heading">{m.campaign_ptc_stranger_proximity_heading()}</SectionLabel>
				<WidgetTable columns={proximityCols} rows={proximity} key={(p) => p.marks}>
					{#snippet row(p)}
						<td class="{widgetTableCell} tabular-nums text-black dark:text-white">{p.marks}</td>
						<td class="{widgetTableCell} text-primary-600 dark:text-primary-300 text-right tabular-nums"
							>{p.plays}</td
						>
					{/snippet}
				</WidgetTable>
			</div>
		{/if}
		{#if highscores.length}
			<div>
				<SectionLabel variant="heading">{m.campaign_ptc_stranger_highscore_heading()}</SectionLabel>
				<WidgetTable columns={highscoreCols} rows={highscores} key={(s) => s.scenario}>
					{#snippet row(s)}
						<td class="{widgetTableCell} whitespace-nowrap">
							<span class="flex items-center gap-1.5" class:opacity-50={s.max === 0}>
								<span class="text-primary-600 dark:text-primary-300 shrink-0" style="font-size:1.1rem">
									<ScenarioSetIcon scenarioId={s.scenario} />
								</span>
								<span class="text-black dark:text-white">{s.name}</span>
							</span>
						</td>
						<td class="{widgetTableCell} text-right tabular-nums">
							{#if s.max > 0}
								<span class="text-secondary-600 dark:text-secondary-400 font-semibold">{s.max}</span>
							{:else}
								<span class="text-primary-400">—</span>
							{/if}
						</td>
					{/snippet}
				</WidgetTable>
			</div>
		{/if}
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_ptc_stranger_empty()}</p>
{/if}
