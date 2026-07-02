<!--
@component
TDC bespoke widget — "Side Tasks". At "An Offer You Can't Refuse" each investigator picks one of 8
personal tasks. Shows which of the 8 the crew took (`hidden.picked_*`), the best single-expedition
and lifetime progress (`task_progress`) + the `obligations` gate (≥5 progress), and — from the Extra
tab — which task each investigator took (paired card + investigator, newest-first). Half-width;
nonLog: the assignment roster hides under Log-only mode. Built on LitTileGrid + StatNumbers + CardLineList.
-->
<script lang="ts">
	import { CardStrip, getCardImagePath } from '@5argon/arkham-life-ui';
	import { TDC_TASKS, type CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import { getAllCards } from '$lib/card-data';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import CardLineList from '$lib/components/profile/_primitives/CardLineList.svelte';
	import FinishDate from '$lib/components/profile/_primitives/FinishDate.svelte';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';

	let { tdc, logOnly = false }: { tdc: CampaignTdc | null; logOnly?: boolean } = $props();

	const byCode = new Map(getAllCards().map((c) => [c.code, c]));
	const t = $derived(tdc?.tasks ?? null);

	const tiles = $derived<LitTile[]>(
		tdc
			? TDC_TASKS.map(({ id, code }): LitTile => {
					const c = tdc.tasks.picked[id] ?? 0;
					return {
						id,
						image: getCardImagePath(code, 'square'),
						label: byCode.get(code)?.name ?? id,
						count: c,
						detail: c > 0 ? m.campaign_tdc_tasks_taken({ times: times(c) }) : m.campaign_tdc_tasks_not_taken()
					};
				})
			: []
	);
	const anyPicked = $derived(tiles.some((t) => t.count > 0));

	const rows = $derived<Stat[][]>(
		t
			? [
					[
						{ value: t.best, label: m.campaign_tdc_tasks_best() },
						{ value: t.total, label: m.campaign_tdc_tasks_total() },
						{ value: t.obligations, label: m.campaign_tdc_tasks_obligations() }
					]
				]
			: []
	);

	// Extra roster (nonLog): each recorded task → the investigator who took it, newest-first.
	const roster = $derived(
		(t?.assignments ?? []).map((a) => ({
			code: a.code,
			bearer: a.investigator ?? undefined,
			date: a.finishDate
		}))
	);
	const showRoster = $derived(!logOnly && roster.length > 0);
	const hasData = $derived(!!t && (anyPicked || t.total > 0 || showRoster));
</script>

{#if hasData && t}
	<div class="space-y-4">
		{#if anyPicked}
			<LitTileGrid {tiles} colsClass="grid-cols-4 @3xl:grid-cols-8" />
		{/if}
		{#if t.total > 0}
			<StatNumbers {rows} />
		{/if}
		{#if showRoster}
			<div>
				<SectionLabel variant="heading" align="center">{m.campaign_tdc_tasks_roster_heading()}</SectionLabel>
				<CardLineList items={roster} align="right">
					{#snippet trailing(it)}
						{@const bearerCard = it.bearer ? byCode.get(it.bearer) : undefined}
						{#if it.date || bearerCard}
							<span class="inline-flex items-center justify-end gap-2">
								{#if it.date}<FinishDate ms={it.date} />{/if}
								{#if bearerCard}<CardStrip card={bearerCard} />{/if}
							</span>
						{/if}
					{/snippet}
				</CardLineList>
			</div>
		{/if}
	</div>
	<p class="text-primary-500 mt-3 text-center text-xs">{m.campaign_tdc_tasks_note()}</p>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tdc_tasks_empty()}</p>
{/if}
