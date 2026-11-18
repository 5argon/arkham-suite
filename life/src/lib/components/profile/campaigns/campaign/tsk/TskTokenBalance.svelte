<!-- @component Tablet vs Elder Thing: the final-bag extremes with their bonus XP and route, and how often each swap was made. -->
<script lang="ts">
	import { ChaosToken } from '@5argon/arkham-kohaku';
	import { ChaosTokenDisplay } from '@5argon/arkham-life-ui';
	import type { CampaignTsk, TskBagRun } from '$lib/campaign/campaigns/tsk/profile';
	import { TSK_BAG_ACTS, type BagAct } from '$lib/campaign/campaigns/tsk/rules';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { WidgetEmpty } from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import RouteHighlightTable, { type RouteHighlightRow } from './RouteHighlightTable.svelte';
	import TskCount from './TskCount.svelte';
	import TskCountList from './TskCountList.svelte';
	import { tskBagActLabel } from './tsk-labels';

	let { blob: tsk }: CampaignWidgetProps<CampaignTsk> = $props();

	interface BagRow extends RouteHighlightRow {
		run: TskBagRun;
		/** The token drawn first. */
		lead: ChaosToken;
	}
	const bagRows = $derived.by((): BagRow[] => {
		const row = (id: string, label: string, run: TskBagRun | null | undefined, lead: ChaosToken) =>
			run ? [{ id, label, run, lead, route: run.route }] : [];
		return [
			...row('tablet', m.campaign_tsk_token_most_tablet_run(), tsk?.mostTabletRun, ChaosToken.TokenTablet),
			...row('elder', m.campaign_tsk_token_most_elder_run(), tsk?.mostElderThingRun, ChaosToken.TokenElderThing),
			...row('least', m.campaign_tsk_token_least_combined_run(), tsk?.leastCombinedRun, ChaosToken.TokenTablet)
		];
	});

	const acts = (kind: BagAct['kind']) =>
		TSK_BAG_ACTS.filter((a) => a.kind === kind).map((a) => ({
			id: a.id,
			label: tskBagActLabel(a),
			count: tsk?.bagActCounts[a.id] ?? 0
		}));
	const trustActs = $derived(acts('trust'));
	const deceptionActs = $derived(acts('deception'));
	const anyActs = $derived([...trustActs, ...deceptionActs].some((a) => a.count > 0));
</script>

{#snippet coins(token: ChaosToken, count: number)}
	{#each Array(count) as _, i (i)}<span class="text-xl"><ChaosTokenDisplay {token} hideLabel sealed={false} /></span>{/each}
{/snippet}

{#snippet coin(token: ChaosToken)}
	<span class="inline-flex text-sm"><ChaosTokenDisplay sealed={false} {token} hideLabel /></span>
{/snippet}

{#if bagRows.length || anyActs}
	<div class="flex flex-col gap-4">
		{#if bagRows.length}
			<RouteHighlightTable
				rows={bagRows}
				columns={[
					{ label: '' },
					{ label: m.campaign_tsk_token_final_bag() },
					{ label: m.campaign_tsk_token_bonus_xp() },
					{ label: m.campaign_tsk_info_col_recent_route() }
				]}
			>
				{#snippet cells(r)}
					{@const tokens = [
						{ token: ChaosToken.TokenTablet, count: r.run.tablet },
						{ token: ChaosToken.TokenElderThing, count: r.run.elderThing }
					].sort((a, b) => Number(b.token === r.lead) - Number(a.token === r.lead))}
					<td class={widgetTableCell}>
						<span class="inline-flex flex-wrap items-center gap-1">
							{#if r.run.tablet + r.run.elderThing === 0}
								<span class="text-primary-400">—</span>
							{:else}
								{#each tokens as t (t.token)}{@render coins(t.token, t.count)}{/each}
							{/if}
						</span>
					</td>
					<td class="{widgetTableCell} tabular-nums"><TskCount value={r.run.bonusXp} prefix="+" /></td>
				{/snippet}
			</RouteHighlightTable>
		{/if}

		{#if anyActs}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<TskCountList rows={trustActs}>
					{#snippet heading()}
						<span class="inline-flex items-center gap-1">
							{m.campaign_tsk_acts_of_trust()} (+{@render coin(ChaosToken.TokenTablet)} / −{@render coin(ChaosToken.TokenElderThing)})
						</span>
					{/snippet}
				</TskCountList>
				<TskCountList rows={deceptionActs}>
					{#snippet heading()}
						<span class="inline-flex items-center gap-1">
							{m.campaign_tsk_acts_of_secrecy()} (−{@render coin(ChaosToken.TokenTablet)} / +{@render coin(ChaosToken.TokenElderThing)})
						</span>
					{/snippet}
				</TskCountList>
			</div>
		{/if}
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tsk_token_empty()}</WidgetEmpty>
{/if}
