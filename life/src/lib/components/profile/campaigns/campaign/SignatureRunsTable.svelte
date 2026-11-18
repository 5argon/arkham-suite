<!-- @component A two-sided spine's signature runs: each run's chain, its ending and its two side totals. -->
<script lang="ts" generics="R extends SideRun">
	import type { Snippet } from 'svelte';
	import type { SideRun } from '$lib/campaign/campaigns/two-sided';
	import { signatureRows, type SignatureRuns } from '$lib/campaign/utils/signature-runs';
	import { OutcomeFace, WidgetTable } from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import TwoSidedChain from './TwoSidedChain.svelte';
	import { outcomeText, type TwoSidedSpec } from './two-sided';

	let {
		spec,
		runs,
		chainColumn,
		chain
	}: {
		spec: TwoSidedSpec;
		runs: SignatureRuns<R>;
		chainColumn?: string;
		/** Draws a run's chain; the spine's decision chain by default. */
		chain?: Snippet<[R]>;
	} = $props();

	const rows = $derived(
		signatureRows([
			[spec.signatureTitles[0], runs.mostA],
			[spec.signatureTitles[1], runs.mostB],
			[spec.signatureTitles[2], runs.leastCombined]
		])
	);
	const columns = $derived([
		{ label: '' },
		{ label: chainColumn ?? spec.chainColumn },
		{ label: spec.resultColumn, align: 'right' as const }
	]);
</script>

{#if rows.length}
	<WidgetTable {columns} {rows} key={(r) => r.topic}>
		{#snippet row(r)}
			<td class="{widgetTableCell} font-semibold whitespace-nowrap text-black dark:text-white"
				>{r.topic}</td
			>
			<td class={widgetTableCell}>
				{#if chain}{@render chain(r.run)}{:else}<TwoSidedChain {spec} beads={r.run.beads} />{/if}
			</td>
			<td class="{widgetTableCell} text-right whitespace-nowrap tabular-nums">
				<span class="inline-flex items-center justify-end gap-2">
					<OutcomeFace kind={r.run.outcome} label={outcomeText(spec, r.run)} />
					<span>
						{#each spec.sides as side, i (side.key)}
							{#if i}<span class="text-primary-400"> · </span>{/if}<span
								class="font-semibold {side.tint}">{side.abbr}{r.run.totals[side.key]}</span
							>
						{/each}
					</span>
				</span>
			</td>
		{/snippet}
	</WidgetTable>
{/if}
