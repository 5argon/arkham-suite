<!--
@component
TSK bespoke widget — The Trial. A compact table of every way your campaigns moved a Coterie
member off their DEFAULT Congress vote (e.g. Desi: Yea → Nay when in your debt, Yea → Eerily
silent when unseen), with a count of how many recorded plays pulled off each change. Below it, a
second table of the trial "highs" — the single campaign with the most Yea / Nay-or-Abstain /
Eerily Silent votes among the Coterie, each with the route that achieved it.

The transitions come straight from the finale vote table (tsk-solver `coterieVoteRows`), so they
never drift; the counts are inferred from the campaign log (Desi's split additionally reads the
Congress real/impostor Extra — the stored copy you flip at the Trial). This replaces the old "members on your side" art + finale-outcome
tally — the latter duplicated Congress of the Keys' Meeting Routes.
-->
<script lang="ts">
	import { CardStrip } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';
	import { coterieVoteRows } from '$lib/campaign/tsk-solver';
	import type { CoterieVoteRow } from '$lib/campaign/tsk-solver';
	import type { CampaignTsk } from '$lib/campaign/tsk-profile';
	import { getAllCards } from '$lib/card-data';
	import * as m from '$lib/paraglide/messages.js';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import RoutingTrack from '$lib/components/profile/campaigns/campaign/tsk/RoutingTrack.svelte';

	let { tsk, logOnly = false }: { tsk: CampaignTsk | null; logOnly?: boolean } = $props();

	const cardByCode = new Map<string, Card>(getAllCards().map((c) => [c.code, c]));
	const cardFor = (code?: string): Card | undefined => (code ? cardByCode.get(code) : undefined);

	const voteLabel = (v: CoterieVoteRow['toVote'] | 'absent'): string =>
		v === 'nay'
			? m.campaign_tsk_vote_nay()
			: v === 'yea'
				? m.campaign_tsk_vote_yea()
				: v === 'abstain'
					? m.campaign_tsk_vote_abstain()
					: v === 'silent'
						? m.campaign_tsk_vote_silent()
						: m.campaign_tsk_vote_absent();

	// One row per transition; show the member name only on the first row of each member group.
	const rows = $derived(
		coterieVoteRows().map((r, i, all) => ({
			...r,
			count: tsk?.voteTransitions[r.member]?.[r.toVote] ?? 0,
			firstOfMember: i === 0 || all[i - 1]!.member !== r.member
		}))
	);
	const anyData = $derived(rows.some((r) => r.count > 0));

	// The Trial "highs": the single trial with the most votes in each category, plus its route.
	const voteHighRows = $derived([
		{ id: 'yea_nay', label: m.campaign_tsk_coterie_max_yea_nay(), count: tsk?.voteHighs.yeaOverNay?.count ?? 0, route: tsk?.voteHighs.yeaOverNay?.route ?? null, lead: true },
		{ id: 'nay_yea', label: m.campaign_tsk_coterie_max_nay_yea(), count: tsk?.voteHighs.nayOverYea?.count ?? 0, route: tsk?.voteHighs.nayOverYea?.route ?? null, lead: true },
		{ id: 'silent', label: m.campaign_tsk_coterie_max_silent(), count: tsk?.voteHighs.silent?.count ?? 0, route: tsk?.voteHighs.silent?.route ?? null, lead: false }
	]);
	const anyVoteHigh = $derived(voteHighRows.some((r) => r.count > 0));
	const family = $derived(tsk?.family ?? null);
</script>

{#if tsk && anyData}
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
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
					<td class="{widgetTableCell} align-middle whitespace-nowrap {r.firstOfMember ? 'font-semibold text-black dark:text-white' : 'text-primary-300 dark:text-primary-600'}">
						{#if r.firstOfMember}
							{@const card = cardFor(r.cardCode)}
							<span class="flex items-center gap-2">
								{#if card}<span class="text-lg leading-none"><CardStrip {card} /></span>{/if}
								{r.memberName}
							</span>
						{/if}
					</td>
					<td class="{widgetTableCell} align-middle whitespace-nowrap">
						{#if r.isDefault}
							<span class={r.count > 0 ? 'font-semibold text-black dark:text-white' : 'text-primary-500'}>{voteLabel(r.toVote)}</span>
							<span class="text-primary-400 ml-1 text-xs">({m.campaign_tsk_coterie_default_tag()})</span>
						{:else}
							<span class="text-primary-400">{voteLabel(r.defaultVote)}</span>
							<span class="text-primary-300 dark:text-primary-600 mx-1">→</span>
							<span class={r.count > 0 ? 'font-semibold text-black dark:text-white' : 'text-primary-500'}>{voteLabel(r.toVote)}</span>
						{/if}
					</td>
					<td class="{widgetTableCell} align-middle text-primary-500">{r.isDefault ? '' : r.triggerLabel}</td>
					<td class="{widgetTableCell} align-middle text-right tabular-nums">
						{#if r.count > 0}
							<span class="text-secondary-600 dark:text-secondary-400 font-semibold">×{r.count}</span>
						{:else}
							<span class="text-primary-400">—</span>
						{/if}
					</td>
				{/snippet}
			</WidgetTable>
		</div>

		{#if anyVoteHigh && !logOnly}
			<div>
				<p class="text-primary-500 mb-1 text-xs font-medium">{m.campaign_tsk_coterie_highs_heading()}</p>
				<WidgetTable
					columns={[
						{ label: '' },
						{ label: '' },
						{ label: m.campaign_tsk_info_col_recent_route() }
					]}
					rows={voteHighRows}
					key={(r) => r.id}
				>
					{#snippet row(r)}
						<td class="{widgetTableCell} whitespace-nowrap font-semibold text-black dark:text-white">{r.label}</td>
						<td class="{widgetTableCell} tabular-nums">
							{#if r.count > 0}
								<span class="text-secondary-600 dark:text-secondary-400 font-semibold">{r.lead ? '+' : '×'}{r.count}</span>
							{:else}
								<span class="text-primary-400">—</span>
							{/if}
						</td>
						<td class={widgetTableCell}>
							{#if r.route}
								<RoutingTrack steps={r.route.steps} {family} size="1.4rem" />
							{:else}
								<span class="text-primary-400">—</span>
							{/if}
						</td>
					{/snippet}
				</WidgetTable>
			</div>
		{/if}
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tsk_coterie_empty()}</p>
{/if}
