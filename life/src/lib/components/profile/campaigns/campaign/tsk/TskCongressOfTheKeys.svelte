<!--
@component
TSK — Congress of the Keys (the finale). The shared scenario passport, then the
bespoke "Meeting Routes" specialization: the Congress trial resolves into one of
six "judgments" (the meeting routes), which collapse onto the finale's three
versions — so there are more routes than versions, and hitting the unvisited ones
is a planning goal. Each route is lit when reached in a recorded play, greyed (em
dash) when not. Grouped by the finale version it leads to. Below, the final-battle
board: who fought with you (Conspirators) and who stood against you (enemies),
each a lit tile via the shared LitTileGrid.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { congressJudgments, coterieAllyMembers, coterieEnemyMembers } from '$lib/campaign/campaigns/tsk-solver';
	import { difficultyBreakdown, times } from '$lib/campaign/utils/difficulty';
	import * as m from '$lib/paraglide/messages.js';
	import TskScenarioInfo from '$lib/components/profile/campaigns/campaign/tsk/TskScenarioInfo.svelte';
	import CountWithBreakdown from '$lib/components/profile/_primitives/CountWithBreakdown.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import type { TskScenarioWidgetProps } from '$lib/components/profile/campaigns/campaign/tsk/tsk-scenario';

	let props: TskScenarioWidgetProps = $props();

	const rows = $derived(
		congressJudgments().map((j) => ({
			label: j.label.replace(/\s*→.*$/, ''), // drop the "→ finale v.X" suffix (its own column)
			version: j.version,
			count: props.tsk?.judgments[j.id]?.total ?? 0,
			byTier: props.tsk?.judgments[j.id]?.byTier ?? {}
		}))
	);

	// The final-battle board: members who voted Nay became your Conspirators (allies), members who
	// voted Yea (and have an enemy card) were set aside as enemies — plus the Red-Gloved Man, always an
	// enemy. Each roster lights up by how many campaigns that member took that side.
	const roster = (
		members: ReturnType<typeof coterieAllyMembers>,
		stats: Record<string, { total: number; byTier: Record<string, number> }> | undefined,
		isAlly: boolean
	): LitTile[] =>
		members.map((a) => {
			const s = stats?.[a.member] ?? null;
			const count = s?.total ?? 0;
			const breakdown = difficultyBreakdown(s?.byTier ?? {}, times);
			return {
				id: a.member,
				image: a.cardCode ? getCardImagePath(a.cardCode, 'square') : '',
				label: a.memberName,
				count,
				detail:
					count > 0
						? (isAlly
								? m.campaign_tsk_congress_ally_tip({ count })
								: m.campaign_tsk_congress_enemy_tip({ count })) +
							(breakdown ? ` (${breakdown})` : '')
						: isAlly
							? m.campaign_tsk_congress_ally_never()
							: m.campaign_tsk_congress_enemy_never()
			};
		});
	const allies = $derived(roster(coterieAllyMembers(), props.tsk?.finaleAllies, true));
	const enemies = $derived(roster(coterieEnemyMembers(), props.tsk?.finaleEnemies, false));
	const anyAlly = $derived(allies.some((a) => a.count > 0));
	const anyEnemy = $derived(enemies.some((a) => a.count > 0));
</script>

<div class="flex flex-col gap-4">
	<TskScenarioInfo scenarioId="congress_of_the_keys" {...props} />

	<!-- Meeting Routes: the six Congress judgments → three finale versions. -->
	<div class="flex flex-col gap-2">
		<WidgetTable
			columns={[
				{ label: m.campaign_tsk_meeting_routes_col_route() },
				{ label: m.campaign_tsk_meeting_routes_col_finale() },
				{ label: m.campaign_tsk_meeting_routes_col_reached(), align: 'right' }
			]}
			{rows}
			key={(_, i) => i}
		>
			{#snippet row(r)}
				<td
					class="{widgetTableCell} {r.count > 0
						? 'font-semibold text-black dark:text-white'
						: 'text-primary-400'}"
				>
					{r.label}
				</td>
				<td class="{widgetTableCell} text-primary-500 whitespace-nowrap"
					>{m.campaign_tsk_meeting_routes_version({ version: r.version })}</td
				>
				<td class="{widgetTableCell} text-right tabular-nums">
					{#if r.count > 0}
						<CountWithBreakdown
							value="×{r.count}"
							byTier={r.byTier}
							class="text-secondary-600 dark:text-secondary-400 font-semibold"
						/>
					{:else}
						<span class="text-primary-400">—</span>
					{/if}
				</td>
			{/snippet}
		</WidgetTable>
	</div>

	<!-- The final-battle board: who fought with you (Conspirators) and who stood against you (enemies). -->
	{#if anyAlly}
		<div class="flex flex-col gap-2">
			<SectionLabel>{m.campaign_tsk_congress_allies_heading()}</SectionLabel>
			<LitTileGrid tiles={allies} objectTop colsClass="grid-cols-4 @md:grid-cols-6 @2xl:grid-cols-7" />
		</div>
	{/if}
	{#if anyEnemy}
		<div class="flex flex-col gap-2">
			<SectionLabel>{m.campaign_tsk_congress_enemies_heading()}</SectionLabel>
			<LitTileGrid tiles={enemies} objectTop colsClass="grid-cols-4 @md:grid-cols-6 @2xl:grid-cols-7" />
		</div>
	{/if}
</div>
