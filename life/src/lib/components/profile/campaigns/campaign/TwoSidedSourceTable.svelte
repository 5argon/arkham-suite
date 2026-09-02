<!--
@component
Per-decision breakdown of a two-sided campaign spine: one row per decision point (icon + name) and
how many plays took each side or stayed neutral there, each count hovering to a per-difficulty
breakdown. A decision that cannot resolve neutral shows a dash in that column. Shared by the PtC
Doubt/Conviction and TCU Lodge/Coven source tables.
-->
<script lang="ts" module>
	export interface SourceRow {
		scenario: string;
		a: Record<string, number>;
		b: Record<string, number>;
		neutral: Record<string, number>;
		canNeutral: boolean;
	}
	export interface SourceSide {
		label: string;
		tint: string;
	}
</script>

<script lang="ts">
	import type { EncounterSet } from '@5argon/arkham-kohaku';
	import { difficultyBreakdown } from '$lib/campaign/utils/difficulty';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import HoverTip from '$lib/components/profile/_primitives/HoverTip.svelte';
	import { HoverTipState } from '$lib/components/profile/_primitives/hover-tip.svelte';
	import ScenarioNameCell from './ScenarioNameCell.svelte';

	let {
		sources,
		decisionLabel,
		sides,
		neutralLabel,
		neutralUnavailable,
		iconSet,
		scenarioName
	}: {
		sources: SourceRow[];
		decisionLabel: string;
		sides: [SourceSide, SourceSide];
		neutralLabel: string;
		/** Tooltip on the dash of a decision that can't resolve neutral. */
		neutralUnavailable: string;
		iconSet: (scenario: string) => EncounterSet | null;
		scenarioName: (scenario: string) => string;
	} = $props();

	const total = (r: Record<string, number>) => Object.values(r).reduce((s, n) => s + n, 0);
	const breakdown = (r: Record<string, number>) => difficultyBreakdown(r, (n) => `×${n}`, ' · ');
	const rows = $derived(sources.filter((s) => total(s.a) + total(s.b) + total(s.neutral) > 0));
	const columns = $derived([
		{ label: decisionLabel },
		{ label: sides[0].label, align: 'right' as const },
		{ label: sides[1].label, align: 'right' as const },
		{ label: neutralLabel, align: 'right' as const }
	]);

	const tip = new HoverTipState();
	const cellClass = (n: number, color: string) =>
		`${widgetTableCell} text-right tabular-nums cursor-default ${n > 0 ? color : 'text-primary-300 dark:text-primary-700'}`;
</script>

{#if rows.length}
	<WidgetTable {columns} {rows} key={(s) => s.scenario}>
		{#snippet row(s)}
			<ScenarioNameCell
				iconSet={iconSet(s.scenario)}
				fallback={s.scenario.slice(0, 2).toUpperCase()}
				name={scenarioName(s.scenario)}
			/>
			<td
				class={cellClass(total(s.a), `${sides[0].tint} font-semibold`)}
				onmouseenter={(e) => tip.showText(breakdown(s.a), e)}
				onmouseleave={tip.hide}>{total(s.a)}</td
			>
			<td
				class={cellClass(total(s.b), `${sides[1].tint} font-semibold`)}
				onmouseenter={(e) => tip.showText(breakdown(s.b), e)}
				onmouseleave={tip.hide}>{total(s.b)}</td
			>
			{#if s.canNeutral}
				<td
					class={cellClass(total(s.neutral), 'text-primary-500')}
					onmouseenter={(e) => tip.showText(breakdown(s.neutral), e)}
					onmouseleave={tip.hide}>{total(s.neutral)}</td
				>
			{:else}
				<td
					class="{widgetTableCell} text-primary-300 dark:text-primary-700 cursor-default text-right"
					title={neutralUnavailable}
					aria-label={neutralUnavailable}>—</td
				>
			{/if}
		{/snippet}
	</WidgetTable>
	<HoverTip {tip} />
{/if}
