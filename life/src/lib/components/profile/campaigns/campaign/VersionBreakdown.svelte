<!--
@component
A per-version table: Succeed / Failed / Plays / Resolutions / reward highscore columns plus an
optional `extra` column. In log-only mode it keeps Version + Plays, or hides when the version
itself needs Extra data (`versionFromLog` false).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { VersionRow } from '$lib/campaign/stats/version-stats';
	import type { Tally } from '$lib/campaign/utils/tally';
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
		/** VP (victory display) or XP wording. */
		victoryDisplay?: boolean;
		extraLabel?: string;
		extra?: Snippet<[VersionRow]>;
		versionLabel?: string;
		playsLabel?: string;
		logOnly?: boolean;
		versionFromLog?: boolean;
	} = $props();

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

{#snippet count(t: Tally | null | undefined, tone: string)}
	{#if t?.total}
		<CountWithBreakdown value="×{t.total}" tally={t} class="{tone} font-semibold" />
	{:else}<span class="text-primary-400">—</span>{/if}
{/snippet}

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
						{#if !r.noOutcome}{@render count(r.succeed, 'text-secondary-700 dark:text-secondary-300')}{/if}
					</td>
					<td class="{widgetTableCell} tabular-nums">
						{#if !r.noOutcome}{@render count(r.failed, 'text-primary-700 dark:text-primary-300')}{/if}
					</td>
				{/if}
				{#if plays}
					<td class="{widgetTableCell} tabular-nums">
						{@render count(r.plays, 'text-secondary-700 dark:text-secondary-300')}
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
