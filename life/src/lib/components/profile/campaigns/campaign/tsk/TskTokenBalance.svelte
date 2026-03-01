<!--
@component
TSK bespoke widget — Tablet vs Elder Thing balance. TSK starts with one Tablet and
one Elder Thing token; a trust act swaps an Elder Thing for a Tablet and a deception
act the reverse (each capped at 4 → overflow becomes bonus XP). The exact act count
can't be recovered from the ending, but the FINAL chaos bag can: three highlight runs
(most Tablet, most Elder Thing, fewest combined) are shown as a table — each with that
run's full token composition (the same coin art as EotE's Frost tokens), the bonus XP
that run earned from overflow (Tablet + Elder Thing combined), and its route. Fed by
the shared `tsk` aggregate (null until a play recorded a final chaos bag).
-->
<script lang="ts">
	import { ChaosToken } from '@5argon/arkham-kohaku';
	import { ChaosTokenDisplay } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import {
		TSK_BAG_ACTS,
		tskBagActLabel,
		type CampaignTsk,
		type TskBagRun
	} from '$lib/campaign/tsk-profile';
	import WidgetTable, { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import RoutingTrack from '$lib/components/profile/campaigns/campaign/tsk/RoutingTrack.svelte';

	let { tsk }: { tsk: CampaignTsk | null } = $props();

	// The three final-chaos-bag highlight runs, shown as a table so each can carry its bonus XP and
	// route. Each row leads with its headline token; "least combined" has no lead (shows whatever's
	// in the bag). All three are set together (any final bag → all non-null), so the guard is
	// all-or-nothing.
	const bagRows = $derived(
		tsk?.mostTabletRun && tsk.mostElderThingRun && tsk.leastCombinedRun
			? [
					{ id: 'tablet', label: m.campaign_tsk_token_most_tablet_run(), run: tsk.mostTabletRun, lead: 'tablet' as const },
					{ id: 'elder', label: m.campaign_tsk_token_most_elder_run(), run: tsk.mostElderThingRun, lead: 'elder' as const },
					{ id: 'least', label: m.campaign_tsk_token_least_combined_run(), run: tsk.leastCombinedRun, lead: 'tablet' as const }
				]
			: []
	);

	// Per-source act table: every Trust / Deception swap (scenario + action) and how many plays did it.
	// How each one is DETECTED lives in the widget's header doc (the ? icon), not here.
	const trustActs = $derived(TSK_BAG_ACTS.filter((a) => a.kind === 'trust').map((a) => ({ id: a.id, label: tskBagActLabel(a), count: tsk?.bagActCounts[a.id] ?? 0 })));
	const deceptionActs = $derived(TSK_BAG_ACTS.filter((a) => a.kind === 'deception').map((a) => ({ id: a.id, label: tskBagActLabel(a), count: tsk?.bagActCounts[a.id] ?? 0 })));
	const anyActs = $derived(trustActs.some((a) => a.count > 0) || deceptionActs.some((a) => a.count > 0));
	const hasData = $derived(tsk != null && (tsk.mostTabletRun != null || anyActs));
</script>

{#snippet coins(token: ChaosToken, count: number)}
	{#each Array(count) as _, i (i)}<span class="text-xl"><ChaosTokenDisplay {token} hideLabel /></span>{/each}
{/snippet}

{#snippet bagCell(run: TskBagRun, lead: 'tablet' | 'elder')}
	<span class="inline-flex flex-wrap items-center gap-1">
		{#if run.tablet === 0 && run.elderThing === 0}
			<span class="text-primary-400">—</span>
		{:else if lead === 'elder'}
			{@render coins(ChaosToken.TokenElderThing, run.elderThing)}
			{@render coins(ChaosToken.TokenTablet, run.tablet)}
		{:else}
			{@render coins(ChaosToken.TokenTablet, run.tablet)}
			{@render coins(ChaosToken.TokenElderThing, run.elderThing)}
		{/if}
	</span>
{/snippet}

{#if hasData && tsk}
	<div class="flex flex-col gap-4">
		<!-- Final-bag highlights: most Tablet / most Elder Thing / fewest combined, each with the run's
		     full token composition, the bonus XP it earned from overflow, and its route (ties broken by
		     the most recent play). -->
		{#if bagRows.length}
			<WidgetTable
				columns={[
					{ label: '' },
					{ label: m.campaign_tsk_token_final_bag() },
					{ label: m.campaign_tsk_token_bonus_xp() },
					{ label: m.campaign_tsk_info_col_recent_route() }
				]}
				rows={bagRows}
				key={(r) => r.id}
			>
				{#snippet row(r)}
					<td class="{widgetTableCell} font-semibold whitespace-nowrap text-black dark:text-white">
						{r.label}
					</td>
					<td class={widgetTableCell}>{@render bagCell(r.run, r.lead)}</td>
					<td class="{widgetTableCell} tabular-nums">
						{#if r.run.bonusXp > 0}
							<span class="text-secondary-700 dark:text-secondary-300 font-semibold">+{r.run.bonusXp}</span>
						{:else}
							<span class="text-primary-400">—</span>
						{/if}
					</td>
					<td class={widgetTableCell}>
						{#if r.run.route}
							<RoutingTrack steps={r.run.route.steps} family={tsk.family} size="1.4rem" />
						{:else}
							<span class="text-primary-400">—</span>
						{/if}
					</td>
				{/snippet}
			</WidgetTable>
		{/if}

		<!-- Per-source breakdown: every chaos-bag swap, and how many plays did it. The widget's
		     header doc (the ? icon) explains how each one is detected. -->
		{#if anyActs}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<p class="text-primary-700 dark:text-primary-300 mb-1 flex items-center gap-1 text-xs font-semibold">
						{m.campaign_tsk_acts_of_trust()} (+
						<span class="inline-flex text-sm"><ChaosTokenDisplay token={ChaosToken.TokenTablet} hideLabel /></span>
						/ −
						<span class="inline-flex text-sm"><ChaosTokenDisplay token={ChaosToken.TokenElderThing} hideLabel /></span>
						)
					</p>
					<ul class="space-y-0.5 text-xs">
						{#each trustActs as a (a.id)}
							<li class="flex justify-between gap-2 {a.count > 0 ? 'text-black dark:text-white' : 'text-primary-400'}">
								<span class="truncate">{a.label}</span>
								<span class="shrink-0 tabular-nums">{a.count > 0 ? `×${a.count}` : '—'}</span>
							</li>
						{/each}
					</ul>
				</div>
				<div>
					<p class="text-primary-700 dark:text-primary-300 mb-1 flex items-center gap-1 text-xs font-semibold">
						{m.campaign_tsk_acts_of_secrecy()} (−
						<span class="inline-flex text-sm"><ChaosTokenDisplay token={ChaosToken.TokenTablet} hideLabel /></span>
						/ +
						<span class="inline-flex text-sm"><ChaosTokenDisplay token={ChaosToken.TokenElderThing} hideLabel /></span>
						)
					</p>
					<ul class="space-y-0.5 text-xs">
						{#each deceptionActs as a (a.id)}
							<li class="flex justify-between gap-2 {a.count > 0 ? 'text-black dark:text-white' : 'text-primary-400'}">
								<span class="truncate">{a.label}</span>
								<span class="shrink-0 tabular-nums">{a.count > 0 ? `×${a.count}` : '—'}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<p class="text-primary-500 text-sm">
		{m.campaign_tsk_token_empty()}
	</p>
{/if}
