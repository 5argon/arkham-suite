<!--
@component
The "three signature runs" table shared by the two-sided campaign spines (PtC Doubt/Conviction,
PtC chaos tokens, TCU Lodge/Coven): one row per title with the run's chain (the caller's `chain`
snippet), its outcome face and the two side totals. Built on WidgetTable.
-->
<script lang="ts" module>
	export interface SignatureSide<T> {
		abbr: string;
		tint: string;
		value: (run: T) => number;
	}
</script>

<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { SignatureRow } from '$lib/campaign/utils/signature-runs';
	import type { EndingKind } from '$lib/campaign/outcomes/clear-status';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import OutcomeFace from '$lib/components/profile/_primitives/OutcomeFace.svelte';

	let {
		rows,
		chainLabel,
		resultLabel,
		chain,
		outcomeKind,
		outcomeLabel,
		sides
	}: {
		rows: SignatureRow<T>[];
		chainLabel: string;
		resultLabel: string;
		chain: Snippet<[T]>;
		outcomeKind: (run: T) => EndingKind | null;
		outcomeLabel: (run: T) => string;
		sides: [SignatureSide<T>, SignatureSide<T>];
	} = $props();

	const columns = $derived([
		{ label: '' },
		{ label: chainLabel },
		{ label: resultLabel, align: 'right' as const }
	]);
</script>

<WidgetTable {columns} {rows} key={(r) => r.topic}>
	{#snippet row(r)}
		<td class="{widgetTableCell} font-semibold whitespace-nowrap text-black dark:text-white"
			>{r.topic}</td
		>
		<td class={widgetTableCell}>{@render chain(r.run)}</td>
		<td class="{widgetTableCell} text-right tabular-nums whitespace-nowrap">
			<span class="inline-flex items-center justify-end gap-2">
				<OutcomeFace kind={outcomeKind(r.run)} label={outcomeLabel(r.run)} />
				<span>
					<span class="font-semibold {sides[0].tint}">{sides[0].abbr}{sides[0].value(r.run)}</span>
					<span class="text-primary-400"> · </span>
					<span class="font-semibold {sides[1].tint}">{sides[1].abbr}{sides[1].value(r.run)}</span>
				</span>
			</span>
		</td>
	{/snippet}
</WidgetTable>
