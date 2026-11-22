<!-- @component How much experience the decks brought to a standalone scenario, and the leanest tier that won. -->
<script lang="ts">
	import type { StandaloneArchiveStat } from '$lib/campaign/outcomes/standalone-archives';
	import { XP_TIERS } from '$lib/campaign/utils/deck-experience';
	import {
		WidgetEmpty,
		WidgetTable,
		type WidgetTableColumn
	} from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { stat }: { stat: StandaloneArchiveStat | null } = $props();

	const rows = $derived(
		stat
			? XP_TIERS.map((t) => ({
					tier: t.tier,
					label: t.label,
					plays: stat.xpTierPlays[t.tier] ?? 0
				})).filter((r) => r.plays > 0)
			: []
	);
	const columns: WidgetTableColumn[] = [
		{ label: m.standalones_xp_tier_col() },
		{ label: m.standalones_plays_col(), align: 'right' }
	];
</script>

{#if rows.length}
	<WidgetTable {columns} {rows} key={(r) => r.tier}>
		{#snippet row(r)}
			<td class="{widgetTableCell} text-black dark:text-white">
				{r.label}
				{#if stat?.bestWinTier === r.tier}
					<span class="text-secondary-600 dark:text-secondary-400 text-xs"
						>· {m.standalones_best_win()}</span
					>
				{/if}
			</td>
			<td class="{widgetTableCell} text-right tabular-nums">{r.plays}</td>
		{/snippet}
	</WidgetTable>
{:else}
	<WidgetEmpty>{m.standalones_no_decks()}</WidgetEmpty>
{/if}
