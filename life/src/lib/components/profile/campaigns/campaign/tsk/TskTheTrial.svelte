<!-- @component The Trial: how often each Coterie member ended on each Congress vote, and the most lopsided trials. -->
<script lang="ts">
	import { CardStrip } from '@5argon/arkham-life-ui';
	import type { CampaignTsk, TskVoteHigh } from '$lib/campaign/campaigns/tsk/profile';
	import { coterieVoteRows } from '$lib/campaign/campaigns/tsk/solver';
	import { cardByCode } from '$lib/card-data';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { SectionLabel, WidgetEmpty, WidgetTable } from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import RouteHighlightTable from './RouteHighlightTable.svelte';
	import TskCount from './TskCount.svelte';

	let { blob: tsk, ctx }: CampaignWidgetProps<CampaignTsk> = $props();

	const VOTE_LABEL: Record<string, () => string> = {
		nay: m.campaign_tsk_vote_nay,
		yea: m.campaign_tsk_vote_yea,
		abstain: m.campaign_tsk_vote_abstain,
		silent: m.campaign_tsk_vote_silent,
		absent: m.campaign_tsk_vote_absent
	};

	const rows = $derived(
		coterieVoteRows().map((r, i, all) => ({
			...r,
			count: tsk?.voteTransitions[r.member]?.[r.toVote] ?? 0,
			firstOfMember: i === 0 || all[i - 1].member !== r.member
		}))
	);
	const anyData = $derived(rows.some((r) => r.count > 0));

	const high = (id: string, label: string, h: TskVoteHigh | null | undefined, prefix: string) => ({
		id,
		label,
		count: h?.count ?? 0,
		route: h?.route ?? null,
		prefix
	});
	const highs = $derived(
		tsk && !ctx.logOnly
			? [
					high('yea_nay', m.campaign_tsk_coterie_max_yea_nay(), tsk.voteHighs.yeaOverNay, '+'),
					high('nay_yea', m.campaign_tsk_coterie_max_nay_yea(), tsk.voteHighs.nayOverYea, '+'),
					high('silent', m.campaign_tsk_coterie_max_silent(), tsk.voteHighs.silent, '×')
				]
			: []
	);
</script>

{#snippet vote(v: string, lit: boolean)}
	<span class={lit ? 'font-semibold text-black dark:text-white' : 'text-primary-500'}>{VOTE_LABEL[v]?.()}</span>
{/snippet}

{#if anyData}
	<div class="flex flex-col gap-4">
		<WidgetTable
			columns={[
				{ label: m.campaign_tsk_coterie_col_member() },
				{ label: m.campaign_tsk_coterie_col_change() },
				{ label: m.campaign_tsk_coterie_col_trigger() },
				{ label: m.campaign_tsk_coterie_col_times(), align: 'right' }
			]}
			{rows}
			key={(_, i) => i}
			compact
		>
			{#snippet row(r)}
				<td class="{widgetTableCell} align-middle whitespace-nowrap font-semibold text-black dark:text-white">
					{#if r.firstOfMember}
						{@const card = r.cardCode ? cardByCode(r.cardCode) : undefined}
						<span class="flex items-center gap-2">
							{#if card}<span class="text-lg leading-none"><CardStrip {card} /></span>{/if}
							{r.memberName}
						</span>
					{/if}
				</td>
				<td class="{widgetTableCell} align-middle whitespace-nowrap">
					{#if r.isDefault}
						{@render vote(r.toVote, r.count > 0)}
						<span class="text-primary-400 ml-1 text-xs">({m.campaign_tsk_coterie_default_tag()})</span>
					{:else}
						<span class="text-primary-400">{VOTE_LABEL[r.defaultVote]?.()}</span>
						<span class="text-primary-300 dark:text-primary-600 mx-1">→</span>
						{@render vote(r.toVote, r.count > 0)}
					{/if}
				</td>
				<td class="{widgetTableCell} text-primary-500 align-middle">{r.triggerLabel}</td>
				<td class="{widgetTableCell} text-right align-middle tabular-nums"><TskCount value={r.count} bright /></td>
			{/snippet}
		</WidgetTable>

		{#if highs.some((h) => h.count > 0)}
			<div>
				<SectionLabel>{m.campaign_tsk_coterie_highs_heading()}</SectionLabel>
				<RouteHighlightTable
					rows={highs}
					columns={[{ label: '' }, { label: '' }, { label: m.campaign_tsk_info_col_recent_route() }]}
				>
					{#snippet cells(h)}
						<td class="{widgetTableCell} tabular-nums"><TskCount value={h.count} prefix={h.prefix} bright /></td>
					{/snippet}
				</RouteHighlightTable>
			</div>
		{/if}
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tsk_coterie_empty()}</WidgetEmpty>
{/if}
