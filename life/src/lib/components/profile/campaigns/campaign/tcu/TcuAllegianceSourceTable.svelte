<!--
@component
TCU Lodge/Coven per-decision breakdown — one row per the five allegiance decision points (book
order, each with its scenario icon), columns = how many plays leaned to the Lodge / the Coven /
stayed Neutral there. Each count hovers to a per-difficulty breakdown. Neutral = the play reached
that decision but took no side (only In the Clutches of Chaos, whose Anette + Sanford picks can
cancel). Built on WidgetTable + HoverTooltip.
-->
<script lang="ts">
	import { EncounterSetIcon, HoverTooltip } from '@5argon/arkham-life-ui';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import type { AllegianceSourceTally } from '$lib/campaign/campaigns/tcu';
	import { difficultyBreakdown } from '$lib/campaign/utils/difficulty';
	import { allegianceIconSet, allegianceScenName } from './tcu-allegiance-labels';
	import * as m from '$lib/paraglide/messages.js';

	let { sources }: { sources: AllegianceSourceTally[] } = $props();

	const total = (r: Record<string, number>) => Object.values(r).reduce((s, n) => s + n, 0);
	const breakdown = (r: Record<string, number>) => difficultyBreakdown(r, (n) => `×${n}`, ' · ');

	const rows = $derived(
		sources.filter((s) => total(s.lodge) + total(s.coven) + total(s.neutral) > 0)
	);
	const columns = [
		{ label: m.campaign_tcu_alleg_src_col_decision() },
		{ label: m.campaign_tcu_alleg_lodge_full(), align: 'right' as const },
		{ label: m.campaign_tcu_alleg_coven_full(), align: 'right' as const },
		{ label: m.campaign_tcu_alleg_neutral_short(), align: 'right' as const }
	];

	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipText = $state('');
	function showTip(text: string, e: MouseEvent) {
		if (!text) return;
		tipText = text;
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideTip = () => (tipVisible = false);

	const cellClass = (n: number, color: string) =>
		`${widgetTableCell} text-right tabular-nums cursor-default ${n > 0 ? color : 'text-primary-300 dark:text-primary-700'}`;
</script>

{#if rows.length}
	<WidgetTable {columns} {rows} key={(s) => s.scenario}>
		{#snippet row(s)}
			{@const set = allegianceIconSet(s.scenario)}
			<td class="{widgetTableCell} whitespace-nowrap">
				<span class="flex items-center gap-1.5">
					{#if set}
						<span class="text-primary-600 dark:text-primary-300" style="font-size:1.1rem">
							<EncounterSetIcon encounterSet={set} />
						</span>
					{/if}
					<span class="text-black dark:text-white">{allegianceScenName(s.scenario)}</span>
				</span>
			</td>
			<td
				class={cellClass(total(s.lodge), 'text-sky-600 dark:text-sky-400 font-semibold')}
				onmouseenter={(e) => showTip(breakdown(s.lodge), e)}
				onmouseleave={hideTip}>{total(s.lodge)}</td
			>
			<td
				class={cellClass(total(s.coven), 'text-emerald-600 dark:text-emerald-400 font-semibold')}
				onmouseenter={(e) => showTip(breakdown(s.coven), e)}
				onmouseleave={hideTip}>{total(s.coven)}</td
			>
			{#if s.canNeutral}
				<td
					class={cellClass(total(s.neutral), 'text-primary-500')}
					onmouseenter={(e) => showTip(breakdown(s.neutral), e)}
					onmouseleave={hideTip}>{total(s.neutral)}</td
				>
			{:else}
				<td
					class="{widgetTableCell} text-primary-300 dark:text-primary-700 cursor-default text-right"
					title={m.campaign_tcu_alleg_neutral_na()}
					aria-label={m.campaign_tcu_alleg_neutral_na()}>—</td
				>
			{/if}
		{/snippet}
	</WidgetTable>
	<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
		<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">{tipText}</span>
	</HoverTooltip>
{/if}
