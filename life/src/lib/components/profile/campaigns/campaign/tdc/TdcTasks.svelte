<!-- @component The side tasks taken, the subject's task progress, and who took which task. -->
<script lang="ts">
	import { CardStrip } from '@5argon/arkham-life-ui';
	import { cardByCode } from '$lib/card-data';
	import { TDC_TASKS, type CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		CardLineList,
		FinishDate,
		LitTileGrid,
		SectionLabel,
		StatNumbers,
		WidgetEmpty,
		WidgetNote,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: tdc, ctx }: CampaignWidgetProps<CampaignTdc> = $props();

	const t = $derived(tdc?.tasks);
	const tiles = $derived<LitTile[]>(
		TDC_TASKS.map(({ id, code }) => {
			const count = t?.picked[id] ?? 0;
			return {
				id,
				code,
				count,
				detail: count
					? m.campaign_tdc_tasks_taken({ times: times(count) })
					: m.campaign_tdc_tasks_not_taken()
			};
		})
	);
	const anyPicked = $derived(tiles.some((tile) => tile.count > 0));
	const roster = $derived(ctx.logOnly ? [] : (t?.assignments ?? []));
	const hasData = $derived(anyPicked || !!t?.total || roster.length > 0);
</script>

{#if hasData && t}
	<div class="space-y-4">
		{#if anyPicked}
			<LitTileGrid {tiles} colsClass="grid-cols-4 @3xl:grid-cols-8" />
		{/if}
		<StatNumbers
			rows={[
				[
					{ value: t.best, label: m.campaign_tdc_tasks_best() },
					{ value: t.total, label: m.campaign_tdc_tasks_total() },
					{ value: t.obligations, label: m.campaign_tdc_tasks_obligations() }
				]
			]}
		/>
		{#if roster.length}
			<div>
				<SectionLabel variant="heading" align="center"
					>{m.campaign_tdc_tasks_roster_heading()}</SectionLabel
				>
				<CardLineList items={roster} align="right">
					{#snippet trailing(a)}
						{@const bearer = a.investigator ? cardByCode(a.investigator) : undefined}
						{#if a.finishDate || bearer}
							<span class="inline-flex items-center justify-end gap-2">
								{#if a.finishDate}<FinishDate ms={a.finishDate} />{/if}
								{#if bearer}<CardStrip card={bearer} />{/if}
							</span>
						{/if}
					{/snippet}
				</CardLineList>
			</div>
		{/if}
	</div>
	<WidgetNote>{m.campaign_tdc_tasks_note()}</WidgetNote>
{:else}
	<WidgetEmpty>{m.campaign_tdc_tasks_empty()}</WidgetEmpty>
{/if}
