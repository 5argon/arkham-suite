<!--
@component
TSK — Sanguine Shadows. The shared scenario passport — with the Sanguine Watcher (the
scenario's secret boss) folded into the passport's stat numbers via `extraStats`: a lead
"true threat" total (took-down + torment-continues) then the took-it-down vs torment split,
each hoverable for its per-difficulty breakdown. Then one bespoke section:
  • Targets kept — six targets sit on the scenario reference card; each one still there
    at the end grants 1 bonus XP. A row per count you've kept among 3/4/5 (or a single
    "3~5 targets" invitation row when you've kept none of those), plus an always-shown
    perfect-play row for all 6 — each with its run count (per-difficulty hover) and the
    most recent route that reached it.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { TskRoute } from '$lib/campaign/tsk-profile';
	import TskScenarioInfo from '$lib/components/profile/campaigns/campaign/tsk/TskScenarioInfo.svelte';
	import RoutingTrack from '$lib/components/profile/campaigns/campaign/tsk/RoutingTrack.svelte';
	import CountWithBreakdown from '$lib/components/profile/_primitives/CountWithBreakdown.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import type { TskScenarioWidgetProps } from '$lib/components/profile/campaigns/campaign/tsk/tsk-scenario';

	let props: TskScenarioWidgetProps = $props();
	const SCENARIO = 'sanguine_shadows';

	// ── Targets kept ───────────────────────────────────────────────────────────
	interface TargetRow {
		key: string;
		label: string;
		runs: number;
		byTier: Record<string, number>;
		route: TskRoute | null;
	}
	const targets = $derived(props.tsk?.sanguineTargets ?? {});
	const targetRows = $derived.by((): TargetRow[] => {
		const rows: TargetRow[] = [];
		// Rows for 3/4/5 you've actually kept; if none, a single "3~5" invitation row.
		const achieved = [3, 4, 5].filter((c) => (targets[c]?.runs.total ?? 0) > 0);
		if (achieved.length) {
			for (const c of achieved) {
				const e = targets[c];
				if (!e) continue;
				rows.push({
					key: `t${c}`,
					label: m.campaign_tsk_sanguine_targets_n({ count: c }),
					runs: e.runs.total,
					byTier: e.runs.byTier,
					route: e.route
				});
			}
		} else {
			rows.push({
				key: 't345',
				label: m.campaign_tsk_sanguine_targets_345(),
				runs: 0,
				byTier: {},
				route: null
			});
		}
		// All 6 (perfect play) is always its own row, never collapsed into 3~5.
		const e6 = targets[6];
		rows.push({
			key: 't6',
			label: m.campaign_tsk_sanguine_targets_n({ count: 6 }),
			runs: e6?.runs.total ?? 0,
			byTier: e6?.runs.byTier ?? {},
			route: e6?.route ?? null
		});
		return rows;
	});

	// ── Secret boss — the Sanguine Watcher ───────────────────────────────────────
	// Folded into the passport's stat numbers (via `extraStats`): a lead "true threat"
	// total (the precomputed `confronted` tally = took-down + torment-continues) then the
	// two-way split. Each number hovers to its per-difficulty breakdown.
	const boss = $derived(props.tsk?.sanguineWatcher ?? null);
	const bossRow = $derived<Stat[]>(
		boss && boss.confronted.total > 0
			? [
					{
						value: boss.confronted.total,
						label: m.campaign_tsk_sanguine_boss_total(),
						byTier: boss.confronted.byTier
					},
					{
						value: boss.tookDown.total,
						label: m.campaign_tsk_sanguine_boss_tookdown(),
						byTier: boss.tookDown.byTier
					},
					{
						value: boss.tormentContinues.total,
						label: m.campaign_tsk_sanguine_boss_torment(),
						byTier: boss.tormentContinues.byTier
					}
				]
			: []
	);
</script>

<div class="flex flex-col gap-4">
	<TskScenarioInfo scenarioId={SCENARIO} {...props}>
		{#snippet extraStats()}
			<!-- The Sanguine Watcher (the scenario's secret boss), grouped with the passport's
			     Succeed/Failed numbers: combined "true threat" total, then took-down vs torment. -->
			{#if bossRow.length}
				<StatNumbers rows={[bossRow]} />
			{/if}
		{/snippet}
	</TskScenarioInfo>

	{#if !props.logOnly}
	<div>
		<WidgetTable
			columns={[
				{ label: m.campaign_tsk_sanguine_targets_col() },
				{ label: m.campaign_tsk_info_col_runs() },
				{ label: m.campaign_tsk_info_col_recent_route() }
			]}
			rows={targetRows}
			key={(r) => r.key}
		>
			{#snippet row(r)}
				<td
					class="{widgetTableCell} whitespace-nowrap {r.runs > 0
						? 'font-semibold text-black dark:text-white'
						: 'text-primary-400'}"
				>
					{r.label}
				</td>
				<td class="{widgetTableCell} tabular-nums">
					{#if r.runs > 0}
						<CountWithBreakdown
							value="×{r.runs}"
							byTier={r.byTier}
							class="text-secondary-700 dark:text-secondary-300 font-semibold"
						/>
					{:else}
						<span class="text-primary-400">—</span>
					{/if}
				</td>
				<td class={widgetTableCell}>
					{#if r.route}
						<RoutingTrack
							steps={r.route.steps}
							family={props.family}
							highlight={SCENARIO}
							size="1.4rem"
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
