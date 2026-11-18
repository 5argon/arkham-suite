<!-- @component Blood on the Altar: which allies survived or were sacrificed, and Silas Bishop's fate. -->
<script lang="ts">
	import { CardLine } from '@5argon/arkham-life-ui';
	import { cardByCode } from '$lib/card-data';
	import { DWL_SACRIFICE_ALLIES, type CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		CountWithBreakdown,
		StatNumbers,
		WidgetTable
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: dwl, ctx }: CampaignWidgetProps<CampaignDwl> = $props();

	const allies = $derived(
		DWL_SACRIFICE_ALLIES.flatMap(({ id, code }) => {
			const card = cardByCode(code);
			const t = dwl?.sacrifices[id];
			return card && t ? [{ id, card, ...t }] : [];
		})
	);
	const hasAllies = $derived(allies.some((a) => a.survived.total || a.sacrificed.total));
	const silas = $derived(dwl?.silas);
	const hasSilas = $derived(!!silas && silas.killed + silas.restored + silas.banished > 0);

	const columns = [
		{ label: m.campaign_dwl_sacrifices_ally() },
		{ label: m.campaign_dwl_sacrifices_survived(), align: 'right' as const },
		{ label: m.campaign_dwl_sacrifices_sacrificed(), align: 'right' as const }
	];
</script>

<ScenarioInfo {ctx} empty={hasAllies || hasSilas ? null : m.campaign_dwl_sacrifices_empty()}>
	{#snippet stats()}
		{#if hasAllies}
			<WidgetTable {columns} rows={allies} key={(r) => r.id}>
				{#snippet row(r)}
					<td class="py-2 pr-3 align-middle"><CardLine card={r.card} hideQuantity /></td>
					<td class="py-2 pr-3 text-right align-middle">
						<CountWithBreakdown
							value={r.survived.total || '—'}
							tally={r.survived}
							class="font-semibold tabular-nums text-black dark:text-white"
						/>
					</td>
					<td class="py-2 pr-3 text-right align-middle">
						<CountWithBreakdown
							value={r.sacrificed.total || '—'}
							tally={r.sacrificed}
							class="text-secondary-700 dark:text-secondary-300 font-semibold tabular-nums"
						/>
					</td>
				{/snippet}
			</WidgetTable>
		{/if}
		<StatNumbers
			rows={[
				{
					heading: m.campaign_dwl_silas_heading(),
					stats: [
						{ value: silas?.killed, label: m.campaign_dwl_silas_killed() },
						{ value: silas?.restored, label: m.campaign_dwl_silas_restored() },
						{ value: silas?.banished, label: m.campaign_dwl_silas_banished() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
