<!--
@component
DWL bespoke widget — "Blood on the Altar". A table of the five Dunwich allies (Rice, Morgan,
Armitage, Zebulon Whateley, Earl Sawyer) — each rendered as a CardLine — with separate Survived and
Sacrificed columns, every count hovering to a per-difficulty breakdown (CountWithBreakdown inside a
WidgetTable). Below the table, Silas Bishop's fate — also decided here — put out of his misery /
restored / banished, as lifetime counts (StatNumbers).
-->
<script lang="ts">
	import { CardLine } from '@5argon/arkham-life-ui';
	import { getAllCards } from '$lib/card-data';
	import { DWL_SACRIFICE_ALLIES, type CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import CountWithBreakdown from '$lib/components/profile/_primitives/CountWithBreakdown.svelte';
	import StatNumbers, {
		type StatGroup
	} from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		dwl,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		dwl: CampaignDwl | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	// The five allies, resolved to their Ally story-asset cards (CardLine draws name + art). The whole
	// cast is shown whenever any of them has a record, so a survivor and a sacrifice read side by side.
	const byCode = new Map(getAllCards().map((c) => [c.code, c] as const));
	const allyRows = $derived(
		dwl
			? DWL_SACRIFICE_ALLIES.flatMap((a) => {
					const card = byCode.get(a.code);
					const t = dwl.sacrifices[a.id];
					return card && t
						? [{ id: a.id, card, survived: t.survived, sacrificed: t.sacrificed }]
						: [];
				})
			: []
	);
	const hasAllies = $derived(allyRows.some((r) => r.survived.total > 0 || r.sacrificed.total > 0));

	const columns = [
		{ label: m.campaign_dwl_sacrifices_ally() },
		{ label: m.campaign_dwl_sacrifices_survived(), align: 'right' as const },
		{ label: m.campaign_dwl_sacrifices_sacrificed(), align: 'right' as const }
	];

	// Silas Bishop's fate — also decided at Blood on the Altar (log-derived; safe in log-only mode).
	const silas = $derived(dwl?.silas);
	const hasSilas = $derived(!!silas && (silas.killed > 0 || silas.restored > 0 || silas.banished > 0));
	const silasRows = $derived<StatGroup[]>(
		hasSilas && silas
			? [
					{
						heading: m.campaign_dwl_silas_heading(),
						stats: [
							{ value: silas.killed, label: m.campaign_dwl_silas_killed() },
							{ value: silas.restored, label: m.campaign_dwl_silas_restored() },
							{ value: silas.banished, label: m.campaign_dwl_silas_banished() }
						]
					}
				]
			: []
	);
	const hasData = $derived(hasAllies || hasSilas);
</script>

<ScenarioInfo
	scenarioId="blood_on_the_altar"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet stats()}
		{#if hasData}
			<div class="space-y-4">
				{#if hasAllies}
					<WidgetTable {columns} rows={allyRows} key={(r) => r.id}>
						{#snippet row(r)}
							<td class="py-2 pr-3 align-middle"><CardLine card={r.card} hideQuantity /></td>
							<td class="py-2 pr-3 text-right align-middle">
								<CountWithBreakdown
									value={r.survived.total || '—'}
									byTier={r.survived.byTier}
									class="font-semibold tabular-nums text-black dark:text-white"
								/>
							</td>
							<td class="py-2 pr-3 text-right align-middle">
								<CountWithBreakdown
									value={r.sacrificed.total || '—'}
									byTier={r.sacrificed.byTier}
									class="text-secondary-700 dark:text-secondary-300 font-semibold tabular-nums"
								/>
							</td>
						{/snippet}
					</WidgetTable>
				{/if}
				{#if hasSilas}
					<StatNumbers rows={silasRows} />
				{/if}
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_dwl_sacrifices_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
