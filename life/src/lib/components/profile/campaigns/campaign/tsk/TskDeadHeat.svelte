<!-- @component Dead Heat: civilians rescued vs slain, and the best run at each player count. -->
<script lang="ts">
	import type { CampaignTsk, DeadHeatBestRun } from '$lib/campaign/campaigns/tsk/profile';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { SectionLabel, StatNumbers, WidgetTable } from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import TskScenarioInfo from './TskScenarioInfo.svelte';

	let { blob: tsk, ctx }: CampaignWidgetProps<CampaignTsk> = $props();

	const dh = $derived(tsk?.deadHeat ?? null);
	const tables = $derived(
		dh && !ctx.logOnly
			? [
					{ id: 'net', title: m.campaign_tsk_deadheat_best_net_title(), score: m.campaign_tsk_deadheat_col_net(), rows: dh.bestByNet },
					{ id: 'double', title: m.campaign_tsk_deadheat_best_double_title(), score: m.campaign_tsk_deadheat_col_double(), rows: dh.bestByDouble }
				].filter((t) => t.rows.length)
			: []
	);
	const signed = (n: number) => (n > 0 ? `+${n}` : String(n));
</script>

{#snippet row(r: DeadHeatBestRun)}
	<td class="{widgetTableCell} font-semibold text-black tabular-nums dark:text-white">
		{m.campaign_tsk_deadheat_players_n({ count: r.players })}
	</td>
	<td class="{widgetTableCell} text-primary-500 tabular-nums">{r.civilians}</td>
	<td class="{widgetTableCell} text-secondary-700 dark:text-secondary-300 tabular-nums">{r.rescued}</td>
	<td class="{widgetTableCell} text-primary-700 dark:text-primary-300 tabular-nums">{r.slain}</td>
	<td
		class="{widgetTableCell} tabular-nums {r.score > 0
			? 'text-secondary-700 dark:text-secondary-300 font-semibold'
			: 'text-primary-400'}"
	>
		{signed(r.score)}
	</td>
{/snippet}

<TskScenarioInfo blob={tsk} {ctx}>
	{#snippet stats()}
		{#if dh}
			<StatNumbers
				logOnly={ctx.logOnly}
				rows={[
					{
						nonLog: true,
						stats: [
							{ value: dh.rescuedOverSlain, label: m.campaign_tsk_deadheat_rescued_over_slain() },
							{ value: dh.rescuedOverDoubleSlain, label: m.campaign_tsk_deadheat_rescued_over_double() },
							{ value: dh.slainOverRescued, label: m.campaign_tsk_deadheat_slain_over_rescued() },
							{ value: dh.slainOverDoubleRescued, label: m.campaign_tsk_deadheat_slain_over_double() }
						]
					},
					{
						nonLog: true,
						keepEmpty: dh.mostRescued !== null || dh.leastSlain !== null,
						stats: [
							{ value: dh.mostRescued, label: m.campaign_tsk_deadheat_most_rescued() },
							{ value: dh.leastSlain, label: m.campaign_tsk_deadheat_least_slain() },
							{ value: dh.loversReunited, label: m.campaign_tsk_deadheat_lovers_reunited() }
						]
					}
				]}
			/>
		{/if}
	{/snippet}
	{#each tables as t (t.id)}
		<div>
			<SectionLabel>{t.title}</SectionLabel>
			<WidgetTable
				columns={[
					{ label: m.campaign_tsk_deadheat_col_players() },
					{ label: m.campaign_tsk_deadheat_col_total() },
					{ label: m.campaign_tsk_deadheat_col_rescued() },
					{ label: m.campaign_tsk_deadheat_col_slain() },
					{ label: t.score }
				]}
				rows={t.rows}
				key={(r) => r.players}
				{row}
			/>
		</div>
	{/each}
</TskScenarioInfo>
