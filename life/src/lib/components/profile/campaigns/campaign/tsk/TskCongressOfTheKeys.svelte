<!-- @component Congress of the Keys: the trial outcomes reached and who fought the final battle on each side. -->
<script lang="ts">
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk/profile';
	import {
		congressJudgments,
		coterieAllyMembers,
		coterieEnemyMembers,
		type CoterieBoardMember
	} from '$lib/campaign/campaigns/tsk/solver';
	import { difficultyBreakdown } from '$lib/campaign/utils/difficulty';
	import type { Tally } from '$lib/campaign/utils/tally';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, SectionLabel, WidgetTable, type LitTile } from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import TskCount from './TskCount.svelte';
	import TskScenarioInfo from './TskScenarioInfo.svelte';

	let { blob: tsk, ctx }: CampaignWidgetProps<CampaignTsk> = $props();

	const rows = $derived(congressJudgments().map((j) => ({ ...j, reached: tsk?.judgments[j.id] ?? null })));

	const roster = (members: CoterieBoardMember[], stats: Record<string, Tally> | undefined, ally: boolean): LitTile[] =>
		members.map((a) => {
			const count = stats?.[a.member]?.total ?? 0;
			const breakdown = difficultyBreakdown(stats?.[a.member]?.byTier ?? {});
			const tip = ally ? m.campaign_tsk_congress_ally_tip({ count }) : m.campaign_tsk_congress_enemy_tip({ count });
			return {
				id: a.member,
				code: a.cardCode,
				label: a.memberName,
				count,
				detail: count
					? tip + (breakdown ? ` (${breakdown})` : '')
					: ally
						? m.campaign_tsk_congress_ally_never()
						: m.campaign_tsk_congress_enemy_never()
			};
		});
	const boards = $derived(
		[
			{ id: 'allies', heading: m.campaign_tsk_congress_allies_heading(), tiles: roster(coterieAllyMembers(), tsk?.finaleAllies, true) },
			{ id: 'enemies', heading: m.campaign_tsk_congress_enemies_heading(), tiles: roster(coterieEnemyMembers(), tsk?.finaleEnemies, false) }
		].filter((b) => b.tiles.some((t) => t.count > 0))
	);
</script>

<TskScenarioInfo blob={tsk} {ctx}>
	<WidgetTable
		columns={[
			{ label: m.campaign_tsk_meeting_routes_col_route() },
			{ label: m.campaign_tsk_meeting_routes_col_finale() },
			{ label: m.campaign_tsk_meeting_routes_col_reached(), align: 'right' }
		]}
		{rows}
		key={(r) => r.id}
	>
		{#snippet row(r)}
			<td class="{widgetTableCell} {r.reached?.total ? 'font-semibold text-black dark:text-white' : 'text-primary-400'}">
				{r.label}
			</td>
			<td class="{widgetTableCell} text-primary-500 whitespace-nowrap">
				{m.campaign_tsk_meeting_routes_version({ version: r.version })}
			</td>
			<td class="{widgetTableCell} text-right tabular-nums"><TskCount tally={r.reached} bright /></td>
		{/snippet}
	</WidgetTable>
	{#each boards as b (b.id)}
		<div>
			<SectionLabel>{b.heading}</SectionLabel>
			<LitTileGrid tiles={b.tiles} objectTop colsClass="grid-cols-4 @md:grid-cols-6 @2xl:grid-cols-7" />
		</div>
	{/each}
</TskScenarioInfo>
