<!--
@component
The shared per-VERSION breakdown table — one row per version a scenario can be played in, with
toggleable columns (Succeed / Failed / Plays / Resolutions / XP high score) plus an optional free
`extra` column (TSK's route). Every versioned scenario (PtC, EotE City, DWL Ascending the Hill, TSK)
renders through this; the caller maps its `ScenarioStat.versions` (or bespoke data) to `VersionRow[]`
and supplies the version labels.

Log-only mode: if the version axis isn't recoverable from the log alone (`versionFromLog` false),
the table renders nothing; otherwise it keeps only Version + Plays (+ the `extra` column) and drops
the Extra-tab-derived columns (Succeed / Failed / Resolutions / XP).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { VersionRow } from '$lib/campaign/stats/version-stats';
	import WidgetTable, {
		widgetTableCell,
		type WidgetTableColumn
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import ResolutionChips from '$lib/components/profile/campaigns/campaign/ResolutionChips.svelte';
	import CountWithBreakdown from '$lib/components/profile/_primitives/CountWithBreakdown.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import { rewardUnit, rewardVersionColumn } from '$lib/campaign/utils/scenario-reward';

	let {
		rows,
		title,
		showSucceedFailed = false,
		showPlays = false,
		showResolutions = true,
		showXp = false,
		victoryDisplay = true,
		extraLabel,
		extra,
		versionLabel,
		playsLabel,
		logOnly = false,
		versionFromLog = false
	}: {
		rows: VersionRow[];
		title?: string;
		showSucceedFailed?: boolean;
		showPlays?: boolean;
		showResolutions?: boolean;
		showXp?: boolean;
		/** Whether this scenario's reward is the Victory display (VP) vs flat Experience (XP) — words
		 *  the XP column + cells the way the app does. Defaults to VP (the common case). */
		victoryDisplay?: boolean;
		extraLabel?: string;
		extra?: Snippet<[VersionRow]>;
		/** Override the first column's header (default "Version") — TSK passes "Variant". */
		versionLabel?: string;
		/** Override the Plays column header (default "Plays") — TSK passes "Runs". */
		playsLabel?: string;
		logOnly?: boolean;
		versionFromLog?: boolean;
	} = $props();

	// Log-only: Succeed/Failed/Resolutions/XP all ride Extra-tab sections → drop them; keep the
	// log-known Version + Plays (+ the `extra` column, which the caller only fills with log data).
	const sf = $derived(showSucceedFailed && !logOnly);
	const res = $derived(showResolutions && !logOnly);
	const xp = $derived(showXp && !logOnly);
	const plays = $derived(logOnly ? true : showPlays);

	const columns = $derived.by((): WidgetTableColumn[] => {
		const cols: WidgetTableColumn[] = [{ label: versionLabel ?? m.campaign_version_version() }];
		if (sf) cols.push({ label: m.campaign_scenario_succeed() }, { label: m.campaign_scenario_failed() });
		if (plays) cols.push({ label: playsLabel ?? m.campaign_version_plays() });
		if (extra) cols.push({ label: extraLabel ?? '' });
		if (res) cols.push({ label: m.campaign_scenario_resolutions() });
		if (xp) cols.push({ label: rewardVersionColumn(victoryDisplay) });
		return cols;
	});
</script>

{#if !(logOnly && !versionFromLog)}
	<div>
		{#if title}
			<SectionLabel>{title}</SectionLabel>
		{/if}
		<WidgetTable {columns} {rows} key={(r) => r.id}>
			{#snippet row(r)}
				<td class="{widgetTableCell} font-semibold {r.accent ?? 'text-black dark:text-white'}">
					{#if r.badge}<span class="text-primary-400 mr-1 text-[0.6rem] tracking-wide uppercase">{r.badge}</span>{/if}
					{r.label}
				</td>
				{#if sf}
					<td class="{widgetTableCell} tabular-nums">
						{#if r.noOutcome}<!-- skip row: no win/loss applies -->
						{:else if r.succeed && r.succeed.total > 0}
							<CountWithBreakdown
								value="×{r.succeed.total}"
								byTier={r.succeed.byTier}
								class="text-secondary-700 dark:text-secondary-300 font-semibold"
							/>
						{:else}<span class="text-primary-400">—</span>{/if}
					</td>
					<td class="{widgetTableCell} tabular-nums">
						{#if r.noOutcome}<!-- skip row: no win/loss applies -->
						{:else if r.failed && r.failed.total > 0}
							<CountWithBreakdown
								value="×{r.failed.total}"
								byTier={r.failed.byTier}
								class="text-primary-700 dark:text-primary-300 font-semibold"
							/>
						{:else}<span class="text-primary-400">—</span>{/if}
					</td>
				{/if}
				{#if plays}
					<td class="{widgetTableCell} tabular-nums">
						{#if r.plays && r.plays.total > 0}
							<CountWithBreakdown
								value="×{r.plays.total}"
								byTier={r.plays.byTier}
								class="text-secondary-700 dark:text-secondary-300 font-semibold"
							/>
						{:else}<span class="text-primary-400">—</span>{/if}
					</td>
				{/if}
				{#if extra}
					<td class={widgetTableCell}>{@render extra(r)}</td>
				{/if}
				{#if res}
					<td class={widgetTableCell}>
						{#if r.resolutionIds?.length}
							<ResolutionChips
								ids={r.resolutionIds}
								visited={r.reached ?? new Set()}
								tallies={r.tallies ?? null}
								verdicts={r.verdicts ?? null}
								nowrap
							/>
						{:else}<span class="text-primary-400">—</span>{/if}
					</td>
				{/if}
				{#if xp}
					<td class="{widgetTableCell} tabular-nums">
						{#if r.vpBest != null}
							<CountWithBreakdown
								value={rewardUnit(victoryDisplay, r.vpBest)}
								byTier={r.vpByTier ?? null}
								format={(n) => rewardUnit(victoryDisplay, n)}
								class="text-secondary-600 dark:text-secondary-400 font-semibold"
							/>
						{:else}<span class="text-primary-400">—</span>{/if}
					</td>
				{/if}
			{/snippet}
		</WidgetTable>
	</div>
{/if}
