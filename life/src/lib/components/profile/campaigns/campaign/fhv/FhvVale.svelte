<!--
@component
FHV bespoke widget — "The Vale", the campaign spine. A cast sheet of the eight residents: each
row is the villager's portrait + name, the best Relationship Level you reached (N / max), and
their run through the campaign's emotional arc — shared a dance (The Second Evening), stood by
you (The Longest Night), sacrificed themself, and saved in the finale. A footer tallies how much
of the Vale you won over. Reads entirely from the log (relationship counts + the durable arc
flags). Full-width. Built on WidgetTable + StatNumbers + FhvPortrait.
-->
<script lang="ts">
	import { FHV_VILLAGERS, fhvVillagerName, type CampaignFhv, type FhvVillagerTally } from '$lib/campaign/campaigns/fhv';
	import WidgetTable, { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import FhvPortrait from './FhvPortrait.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { fhv }: { fhv: CampaignFhv | null } = $props();

	interface Row {
		id: string;
		name: string;
		max: number;
		t: FhvVillagerTally;
		engaged: boolean;
	}
	const rows = $derived<Row[]>(
		fhv
			? FHV_VILLAGERS.map((v) => {
					const t = fhv.villagers[v.id];
					return {
						id: v.id,
						name: fhvVillagerName(v.id),
						max: v.max,
						t,
						engaged: (t.maxScore ?? 0) > 0 || t.danced > 0 || t.stood > 0 || t.sacrificed > 0 || t.saved > 0
					};
				})
			: []
	);
	const hasData = $derived(rows.some((r) => r.engaged));

	const columns = [
		{ label: m.campaign_fhv_vale_col_resident() },
		{ label: m.campaign_fhv_vale_col_rel(), align: 'right' as const },
		{ label: m.campaign_fhv_vale_col_danced(), align: 'center' as const },
		{ label: m.campaign_fhv_vale_col_stood(), align: 'center' as const },
		{ label: m.campaign_fhv_vale_col_sacrificed(), align: 'center' as const },
		{ label: m.campaign_fhv_vale_col_saved(), align: 'center' as const }
	];

	// Footer: how much of the Vale you won over (distinct residents).
	const footer = $derived<Stat[][]>(
		hasData
			? [
					[
						{ value: rows.filter((r) => (r.t.maxScore ?? 0) >= 2).length, label: m.campaign_fhv_vale_befriended() },
						{ value: rows.filter((r) => (r.t.maxScore ?? 0) >= r.max).length, label: m.campaign_fhv_vale_maxed() },
						{ value: rows.filter((r) => r.t.stood > 0).length, label: m.campaign_fhv_vale_stood_total() },
						{ value: rows.filter((r) => r.t.sacrificed > 0).length, label: m.campaign_fhv_vale_sacrificed_total() },
						{ value: rows.filter((r) => r.t.saved > 0).length, label: m.campaign_fhv_vale_saved_total() }
					]
				]
			: []
	);
</script>

{#snippet mark(n: number, accent: string)}
	{#if n > 0}
		<span class="{accent} font-semibold tabular-nums">{n > 1 ? `×${n}` : '●'}</span>
	{:else}
		<span class="text-primary-300 dark:text-primary-600">○</span>
	{/if}
{/snippet}

{#if hasData}
	<div class="space-y-4">
		<WidgetTable {columns} {rows} key={(r) => r.id}>
			{#snippet row(r)}
				<td class={widgetTableCell}>
					<span class="flex items-center gap-2">
						<FhvPortrait villager={r.id} size="h-10 w-8" dim={!r.engaged} />
						<span class="font-medium whitespace-nowrap {r.engaged ? 'text-black dark:text-white' : 'text-primary-400'}"
							>{r.name}</span
						>
					</span>
				</td>
				<td class="{widgetTableCell} text-right tabular-nums whitespace-nowrap">
					<span class="font-semibold {(r.t.maxScore ?? 0) >= r.max ? 'text-secondary-600 dark:text-secondary-400' : 'text-black dark:text-white'}"
						>{r.t.maxScore ?? 0}</span
					><span class="text-primary-400 text-xs"> / {r.max}</span>
				</td>
				<td class="{widgetTableCell} text-center">{@render mark(r.t.danced, 'text-rose-600 dark:text-rose-400')}</td>
				<td class="{widgetTableCell} text-center">{@render mark(r.t.stood, 'text-sky-600 dark:text-sky-400')}</td>
				<td class="{widgetTableCell} text-center">{@render mark(r.t.sacrificed, 'text-amber-600 dark:text-amber-400')}</td>
				<td class="{widgetTableCell} text-center">{@render mark(r.t.saved, 'text-emerald-600 dark:text-emerald-400')}</td>
			{/snippet}
		</WidgetTable>
		<StatNumbers rows={footer} />
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_fhv_vale_empty()}</p>
{/if}
