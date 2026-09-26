<!-- @component A two-sided spine per decision point: how many plays leaned each way or passed it neutral. -->
<script lang="ts">
	import { sourcePlays, type SourceTally } from '$lib/campaign/campaigns/two-sided';
	import {
		CountWithBreakdown,
		HoverTip,
		HoverTipState,
		WidgetTable
	} from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import type { Tally } from '$lib/campaign/utils/tally';
	import ScenarioNameCell from './ScenarioNameCell.svelte';
	import type { TwoSidedSpec } from './two-sided';

	let { spec, sources }: { spec: TwoSidedSpec; sources: SourceTally[] } = $props();

	const rows = $derived(sources.filter((s) => sourcePlays(s)));
	const columns = $derived([
		{ label: spec.decisionColumn },
		...spec.sides.map((side) => ({ label: side.label, align: 'right' as const })),
		{ label: spec.neutralColumn, align: 'right' as const }
	]);
	const muted = 'text-primary-300 dark:text-primary-700';
	const tip = new HoverTipState();
</script>

{#snippet count(t: Tally, tint: string)}
	<td class="{widgetTableCell} text-right tabular-nums {t.total ? tint : muted}">
		<CountWithBreakdown tally={t} format={(n) => `×${n}`} />
	</td>
{/snippet}

{#if rows.length}
	<WidgetTable {columns} {rows} key={(s) => s.scenario}>
		{#snippet row(s)}
			<ScenarioNameCell
				scenarioId={spec.iconScenario(s.scenario)}
				name={spec.sourceName(s.scenario)}
			/>
			{#each spec.sides as side (side.key)}
				{@render count(s.sides[side.key], `${side.tint} font-semibold`)}
			{/each}
			{#if s.neutral}
				{@render count(s.neutral, 'text-primary-500')}
			{:else}
				<td class="{widgetTableCell} text-right {muted}">
					<span
						role="img"
						aria-label={spec.neutralNa}
						class="cursor-default"
						onmouseenter={(e) => tip.showText(spec.neutralNa, e)}
						onmouseleave={tip.hide}>—</span
					>
				</td>
			{/if}
		{/snippet}
	</WidgetTable>
	<HoverTip {tip} />
{/if}
