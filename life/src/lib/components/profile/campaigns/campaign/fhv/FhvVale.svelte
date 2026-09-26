<!-- @component The Vale's cast: each villager's best relationship level and their dance → stood by you → sacrificed → saved arc. -->
<script lang="ts">
	import { FHV_VILLAGERS, fhvVillagerName, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import type { Tally } from '$lib/campaign/utils/tally';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		CountWithBreakdown,
		StatNumbers,
		WidgetEmpty,
		WidgetTable
	} from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import FhvPortrait from './FhvPortrait.svelte';

	let { blob: fhv }: CampaignWidgetProps<CampaignFhv> = $props();

	const rows = $derived(
		fhv
			? FHV_VILLAGERS.map((v) => {
					const t = fhv.villagers[v.id];
					const score = t.maxScore ?? 0;
					return {
						id: v.id,
						max: v.max,
						score,
						t,
						engaged:
							score > 0 || [t.danced, t.stood, t.sacrificed, t.saved].some((x) => x.total > 0)
					};
				})
			: []
	);
	const summary = $derived(fhv?.valeSummary);

	const columns = [
		{ label: m.campaign_fhv_vale_col_resident() },
		{ label: m.campaign_fhv_vale_col_rel(), align: 'right' as const },
		{ label: m.campaign_fhv_vale_col_danced(), align: 'center' as const },
		{ label: m.campaign_fhv_vale_col_stood(), align: 'center' as const },
		{ label: m.campaign_fhv_vale_col_sacrificed(), align: 'center' as const },
		{ label: m.campaign_fhv_vale_col_saved(), align: 'center' as const }
	];
</script>

{#snippet mark(t: Tally, accent: string)}
	{#if t.total > 0}
		<CountWithBreakdown
			value={t.total > 1 ? `×${t.total}` : '●'}
			tally={t}
			class="{accent} font-semibold tabular-nums"
		/>
	{:else}
		<span class="text-primary-300 dark:text-primary-600">○</span>
	{/if}
{/snippet}

{#if rows.some((r) => r.engaged)}
	<div class="space-y-4">
		<WidgetTable {columns} {rows} key={(r) => r.id}>
			{#snippet row(r)}
				<td class={widgetTableCell}>
					<span class="flex items-center gap-2">
						<FhvPortrait villager={r.id} size="h-10 w-8" dim={!r.engaged} />
						<span
							class="font-medium whitespace-nowrap {r.engaged
								? 'text-black dark:text-white'
								: 'text-primary-400'}">{fhvVillagerName(r.id)}</span
						>
					</span>
				</td>
				<td class="{widgetTableCell} text-right whitespace-nowrap tabular-nums">
					<span
						class="font-semibold {r.score >= r.max
							? 'text-secondary-600 dark:text-secondary-400'
							: 'text-black dark:text-white'}">{r.score}</span
					><span class="text-primary-400 text-xs"> / {r.max}</span>
				</td>
				<td class="{widgetTableCell} text-center"
					>{@render mark(r.t.danced, 'text-rose-600 dark:text-rose-400')}</td
				>
				<td class="{widgetTableCell} text-center"
					>{@render mark(r.t.stood, 'text-sky-600 dark:text-sky-400')}</td
				>
				<td class="{widgetTableCell} text-center"
					>{@render mark(r.t.sacrificed, 'text-amber-600 dark:text-amber-400')}</td
				>
				<td class="{widgetTableCell} text-center"
					>{@render mark(r.t.saved, 'text-emerald-600 dark:text-emerald-400')}</td
				>
			{/snippet}
		</WidgetTable>
		<StatNumbers
			rows={[
				[
					{ value: summary?.befriended, label: m.campaign_fhv_vale_befriended() },
					{ value: summary?.maxed, label: m.campaign_fhv_vale_maxed() },
					{ value: summary?.stood, label: m.campaign_fhv_vale_stood_total() },
					{ value: summary?.sacrificed, label: m.campaign_fhv_vale_sacrificed_total() },
					{ value: summary?.saved, label: m.campaign_fhv_vale_saved_total() }
				]
			]}
		/>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_fhv_vale_empty()}</WidgetEmpty>
{/if}
