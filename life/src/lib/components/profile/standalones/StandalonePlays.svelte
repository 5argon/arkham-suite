<!-- @component Every play of a standalone scenario, newest first: when, at which difficulty, inside which campaign if any, how it ended and who played. -->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import type { StandaloneArchiveStat } from '$lib/campaign/outcomes/standalone-archives';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import {
		CardThumb,
		FinishDate,
		OutcomeFace,
		WidgetEmpty,
		WidgetTable,
		type WidgetTableColumn
	} from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import ResolutionChips from '$lib/components/profile/campaigns/campaign/ResolutionChips.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { stat, logOnly }: { stat: StandaloneArchiveStat | null; logOnly: boolean } = $props();

	const campaignName = (family: string) => getCampaignLog(family)?.db.name ?? family;

	const history = $derived(stat?.history ?? []);
	const showTeam = $derived(!logOnly && history.some((h) => h.investigators.length > 0));
	const columns = $derived<WidgetTableColumn[]>([
		{ label: m.standalones_col_date() },
		{ label: m.standalones_col_ending() },
		...(showTeam ? [{ label: m.standalones_col_team() }] : [])
	]);
</script>

{#if history.length}
	<WidgetTable {columns} rows={history} compact>
		{#snippet row(h)}
			<td class={widgetTableCell}>
				<div class="flex flex-col">
					<FinishDate ms={h.date} />
					<span class="text-primary-500 text-xs">{difficultyLabel(h.tier)}</span>
					{#if h.hostFamily}
						<span class="text-primary-400 text-xs"
							>{m.standalones_plays_inside({ campaign: campaignName(h.hostFamily) })}</span
						>
					{/if}
				</div>
			</td>
			<td class={widgetTableCell}>
				<div class="flex items-center gap-2">
					{#if h.verdict}
						<OutcomeFace
							kind={h.verdict === 'won' ? 'win' : 'loss'}
							label={h.verdict === 'won'
								? m.standalones_verdict_won()
								: m.standalones_verdict_lost()}
						/>
					{/if}
					{#if h.resolution}
						<ResolutionChips ids={[h.resolution]} visited={new Set([h.resolution])} />
					{:else}
						<span class="text-primary-400 text-xs">{m.standalones_no_resolution()}</span>
					{/if}
				</div>
			</td>
			{#if showTeam}
				<td class={widgetTableCell}>
					<div class="flex flex-wrap gap-1">
						{#each h.investigators as code, i (`${code}-${i}`)}
							<CardThumb {code} size="h-8 w-8" />
						{/each}
					</div>
				</td>
			{/if}
		{/snippet}
	</WidgetTable>
{:else}
	<WidgetEmpty>{m.standalones_plays_empty()}</WidgetEmpty>
{/if}
