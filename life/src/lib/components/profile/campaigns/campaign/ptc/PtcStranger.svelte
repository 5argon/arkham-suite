<!-- @component The Stranger: how far he chased each play, and the most times he was defeated in one play of each scenario. -->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		CountWithBreakdown,
		SectionLabel,
		WidgetEmpty,
		WidgetTable
	} from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioNameCell from '../ScenarioNameCell.svelte';
	import { ptcScenarioName } from './ptc-spine';

	let { blob: ptc, ctx }: CampaignWidgetProps<CampaignPtc> = $props();
	const chased = $derived(ptc?.stranger ?? []);
	const highscores = $derived(ctx.logOnly ? [] : (ptc?.strangerHighscores ?? []));

	const chasedColumns = [
		{ label: m.campaign_ptc_stranger_col_marks() },
		{ label: m.campaign_ptc_stranger_col_plays(), align: 'right' as const }
	];
	const highscoreColumns = [
		{ label: m.campaign_ptc_stranger_col_scenario() },
		{ label: m.campaign_ptc_stranger_col_defeats(), align: 'right' as const }
	];
</script>

{#if chased.length || highscores.length}
	<div class="space-y-4">
		{#if chased.length}
			<div>
				<SectionLabel variant="heading">{m.campaign_ptc_stranger_proximity_heading()}</SectionLabel>
				<WidgetTable columns={chasedColumns} rows={chased} key={(c) => c.marks}>
					{#snippet row(c)}
						<td class="{widgetTableCell} text-black tabular-nums dark:text-white">{c.marks}</td>
						<td
							class="{widgetTableCell} text-primary-600 dark:text-primary-300 text-right tabular-nums"
						>
							<CountWithBreakdown tally={c.plays} />
						</td>
					{/snippet}
				</WidgetTable>
			</div>
		{/if}
		{#if highscores.length}
			<div>
				<SectionLabel variant="heading">{m.campaign_ptc_stranger_highscore_heading()}</SectionLabel>
				<WidgetTable columns={highscoreColumns} rows={highscores} key={(s) => s.scenario}>
					{#snippet row(s)}
						<ScenarioNameCell
							scenarioId={s.scenario}
							name={ptcScenarioName(s.scenario)}
							faded={!s.max}
						/>
						<td class="{widgetTableCell} text-right tabular-nums">
							{#if s.max}
								<CountWithBreakdown
									value={s.max}
									byTier={s.byTier}
									format={String}
									class="text-secondary-600 dark:text-secondary-400 font-semibold"
								/>
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
	<WidgetEmpty>{m.campaign_ptc_stranger_empty()}</WidgetEmpty>
{/if}
