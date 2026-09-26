<!-- @component Sanguine Shadows: the Sanguine Watcher confronted, and how many targets were kept (1 XP each). -->
<script lang="ts">
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk/profile';
	import type { Tally } from '$lib/campaign/utils/tally';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import RouteHighlightTable, { type RouteHighlightRow } from './RouteHighlightTable.svelte';
	import TskCount from './TskCount.svelte';
	import TskScenarioInfo from './TskScenarioInfo.svelte';

	let { blob: tsk, ctx }: CampaignWidgetProps<CampaignTsk> = $props();

	interface TargetRow extends RouteHighlightRow {
		runs: Tally | null;
	}
	// Each count of 3–5 kept (or one "3~5" row inviting a first), then always all six.
	const targetRows = $derived.by((): TargetRow[] => {
		const targets = tsk?.sanguineTargets ?? {};
		const row = (count: number): TargetRow => ({
			id: `t${count}`,
			label: m.campaign_tsk_sanguine_targets_n({ count }),
			runs: targets[count]?.runs ?? null,
			route: targets[count]?.route ?? null,
			lit: (targets[count]?.runs.total ?? 0) > 0
		});
		const kept = [3, 4, 5].filter((c) => (targets[c]?.runs.total ?? 0) > 0).map(row);
		const invite = { id: 't345', label: m.campaign_tsk_sanguine_targets_345(), runs: null, route: null, lit: false };
		return [...(kept.length ? kept : [invite]), row(6)];
	});
	const watcher = $derived(tsk?.sanguineWatcher ?? null);
</script>

<TskScenarioInfo blob={tsk} {ctx}>
	{#snippet stats()}
		{#if watcher}
			<StatNumbers
				rows={[
					[
						{ tally: watcher.confronted, label: m.campaign_tsk_sanguine_boss_total() },
						{ tally: watcher.tookDown, label: m.campaign_tsk_sanguine_boss_tookdown() },
						{ tally: watcher.tormentContinues, label: m.campaign_tsk_sanguine_boss_torment() }
					]
				]}
			/>
		{/if}
	{/snippet}
	{#if !ctx.logOnly}
		<RouteHighlightTable
			rows={targetRows}
			highlight={ctx.scenario ?? undefined}
			columns={[
				{ label: m.campaign_tsk_sanguine_targets_col() },
				{ label: m.campaign_tsk_info_col_runs() },
				{ label: m.campaign_tsk_info_col_recent_route() }
			]}
		>
			{#snippet cells(r)}
				<td class="{widgetTableCell} tabular-nums"><TskCount tally={r.runs} /></td>
			{/snippet}
		</RouteHighlightTable>
	{/if}
</TskScenarioInfo>
