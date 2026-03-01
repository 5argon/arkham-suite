<!--
@component
TSK — Congress of the Keys (the finale). The shared scenario passport, then the
bespoke "Meeting Routes" specialization: the Congress trial resolves into one of
six "judgments" (the meeting routes), which collapse onto the finale's three
versions — so there are more routes than versions, and hitting the unvisited ones
is a planning goal. Each route is lit when reached in a recorded play, greyed (em
dash) when not. Grouped by the finale version it leads to.
-->
<script lang="ts">
	import { getCardImagePath, HoverTooltip } from '@5argon/arkham-life-ui';
	import { congressJudgments, coterieAllyMembers, coterieEnemyMembers } from '$lib/campaign/tsk-solver';
	import { difficultyBreakdown, times } from '$lib/campaign/difficulty';
	import * as m from '$lib/paraglide/messages.js';
	import TskScenarioInfo from '$lib/components/profile/campaigns/campaign/tsk/TskScenarioInfo.svelte';
	import CountWithBreakdown from '$lib/components/profile/_primitives/CountWithBreakdown.svelte';
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
	const reached = $derived(rows.filter((r) => r.count > 0).length);

	// The final-battle board: members who voted Nay became your Conspirators (allies), members who
	// voted Yea (and have an enemy card) were set aside as enemies — plus the Red-Gloved Man, always an
	// enemy. Each roster lights up by how many campaigns that member took that side.
	const roster = (members: ReturnType<typeof coterieAllyMembers>, stats: Record<string, { total: number; byTier: Record<string, number> }> | undefined) =>
		members.map((a) => {
			const s = stats?.[a.member] ?? null;
			return {
				...a,
				count: s?.total ?? 0,
				breakdown: difficultyBreakdown(s?.byTier ?? {}, times),
				img: a.cardCode ? getCardImagePath(a.cardCode, 'square') : null
			};
		});
	const allies = $derived(roster(coterieAllyMembers(), props.tsk?.finaleAllies));
	const enemies = $derived(roster(coterieEnemyMembers(), props.tsk?.finaleEnemies));
	const anyAlly = $derived(allies.some((a) => a.count > 0));
	const anyEnemy = $derived(enemies.some((a) => a.count > 0));
	let failed = $state<Record<string, boolean>>({});

	// One shared styled tooltip for every roster tile (allies + enemies).
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipText = $state('');
	function showTip(text: string, e: MouseEvent) {
		tipText = text;
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideTip = () => (tipVisible = false);
</script>

{#snippet rosterGrid(list: typeof allies, heading: string, ring: string, accent: string, isAlly: boolean)}
	<div class="flex flex-col gap-2">
		<p class="text-primary-500 text-xs font-medium">{heading}</p>
		<div class="@container">
			<div class="mx-auto grid w-fit grid-cols-4 gap-3 @md:grid-cols-6 @2xl:grid-cols-7">
				{#each list as a (a.member)}
					{@const tip =
						a.count > 0
							? (isAlly ? m.campaign_tsk_congress_ally_tip({ count: a.count }) : m.campaign_tsk_congress_enemy_tip({ count: a.count })) +
								(a.breakdown ? ` (${a.breakdown})` : '')
							: isAlly
								? m.campaign_tsk_congress_ally_never()
								: m.campaign_tsk_congress_enemy_never()}
					<div
						role="img"
						aria-label="{a.memberName} — {tip}"
						class="flex w-16 cursor-default flex-col items-center gap-1"
						onmouseenter={(e) => showTip(`${a.memberName} — ${tip}`, e)}
						onmouseleave={hideTip}
					>
						<div
							class="bg-primary-200 dark:bg-primary-700 relative aspect-square w-full overflow-hidden rounded {a.count > 0 ? `ring-2 ${ring}` : ''}"
						>
							{#if a.img && !failed[a.member]}
								<img
									src={a.img}
									alt={a.memberName}
									onerror={() => (failed = { ...failed, [a.member]: true })}
									class="h-full w-full object-cover object-top transition {a.count > 0 ? '' : 'opacity-30 grayscale'}"
								/>
							{:else}
								<span
									class="text-primary-500 dark:text-primary-300 absolute inset-0 flex items-center justify-center px-1 text-center text-[0.55rem] leading-tight font-medium {a.count > 0 ? '' : 'opacity-40'}"
									>{a.memberName}</span
								>
							{/if}
						</div>
						<span class="text-center text-[0.65rem] tabular-nums {a.count > 0 ? `${accent} font-semibold` : 'text-primary-400'}"
							>{a.count > 0 ? `×${a.count}` : '—'}</span
						>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/snippet}

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
		{@render rosterGrid(allies, m.campaign_tsk_congress_allies_heading(), 'ring-secondary-500', 'text-secondary-600 dark:text-secondary-400', true)}
	{/if}
	{#if anyEnemy}
		{@render rosterGrid(enemies, m.campaign_tsk_congress_enemies_heading(), 'ring-survivor-500', 'text-survivor-600 dark:text-survivor-400', false)}
	{/if}
</div>

<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
	<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">{tipText}</span>
</HoverTooltip>
