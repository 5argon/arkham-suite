<!-- @component Endings that killed or drove the party insane: headline counts, who paid, and each ending reached. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { scenarioName } from '$lib/campaign/records/campaign-log-source';
	import { withCards } from '$lib/campaign/utils/card-filters';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import type { TraumaTally, TraumaEvent } from '$lib/campaign/outcomes/trauma';
	import { CardScanWall, SectionLabel, WidgetEmpty } from '$lib/components/profile/_primitives';
	import ResolutionChips from './campaign/ResolutionChips.svelte';

	let { tally, family = null }: { tally: TraumaTally; family?: string | null } = $props();

	// A campaign page recounts its headline from its own events; the per-investigator attribution
	// can't be sliced that way, so only the cross-campaign view shows it.
	const events = $derived(
		family ? tally.events.filter((e) => e.families.includes(family)) : tally.events
	);
	const count = (pred: (e: TraumaEvent) => boolean): number => events.filter(pred).length;
	const possible = $derived(
		count(
			(e) =>
				e.killed !== 'yes' &&
				e.insane !== 'yes' &&
				(e.killed === 'maybe' || e.insane === 'maybe')
		)
	);
	const stats = $derived([
		{
			label: m.campaigns_trauma_stat_killed(),
			sub: m.campaigns_trauma_stat_killed_sub({
				count: count((e) => e.killed === 'yes' && e.insane !== 'yes')
			}),
			value: count((e) => e.killed === 'yes'),
			tone: 'text-red-600 dark:text-red-400'
		},
		{
			label: m.campaigns_trauma_stat_insane(),
			sub: m.campaigns_trauma_stat_insane_sub({
				count: count((e) => e.insane === 'yes' && e.killed !== 'yes')
			}),
			value: count((e) => e.insane === 'yes'),
			tone: 'text-violet-600 dark:text-violet-400'
		},
		{
			label: m.campaigns_trauma_stat_pyrrhic(),
			sub: m.campaigns_trauma_stat_pyrrhic_sub(),
			value: count((e) => e.pyrrhic),
			tone: 'text-amber-600 dark:text-amber-400'
		},
		{
			label: m.campaigns_trauma_stat_casualties(),
			sub: m.campaigns_trauma_stat_casualties_sub(),
			value: count((e) => !e.result && (e.killed === 'yes' || e.insane === 'yes')),
			tone: 'text-primary-700 dark:text-primary-300'
		}
	]);

	const perInvestigator = $derived(
		family ? [] : withCards(tally.perInvestigator).map((i) => ({ ...i, count: i.killed + i.insane }))
	);

	const campaignName = (f: string): string => getCampaignLog(f)?.db.name ?? f;

	const chip = 'rounded px-1.5 py-0.5 text-xs';
	const killedChip = `${chip} bg-red-100 font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300`;
	const insaneChip = `${chip} bg-violet-100 font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300`;
</script>

{#if !events.length}
	<WidgetEmpty>{m.campaigns_trauma_empty()}</WidgetEmpty>
{:else}
	<div class="border-primary-200 dark:border-primary-700 space-y-4 rounded border p-4">
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
			{#each stats as s (s.label)}
				<div class="border-primary-100 dark:border-primary-800 rounded border px-3 py-2 text-center">
					<div class="text-2xl font-bold tabular-nums {s.tone}">{s.value}</div>
					<div class="text-primary-800 dark:text-primary-200 text-xs font-semibold">{s.label}</div>
					<div class="text-primary-500 text-[0.65rem]">{s.sub}</div>
				</div>
			{/each}
		</div>

		{#if possible}
			<p class="text-primary-500 text-xs">
				{@html m.campaigns_trauma_possible({ count: possible })}
			</p>
		{/if}

		{#if perInvestigator.length}
			<div>
				<SectionLabel variant="heading">
					{m.campaigns_trauma_who_paid()}
					<span class="text-primary-500 font-normal">{m.campaigns_trauma_party_wide_only()}</span>
				</SectionLabel>
				<CardScanWall items={perInvestigator} width={96}>
					{#snippet badge(p)}
						<div class="mt-1 flex gap-1 tabular-nums">
							{#if p.killed}<span class={killedChip}>†{p.killed}</span>{/if}
							{#if p.insane}<span class={insaneChip}>☉{p.insane}</span>{/if}
						</div>
					{/snippet}
				</CardScanWall>
			</div>
		{/if}

		<div class="space-y-1.5">
			{#each events as e, i (i)}
				<div
					class="border-primary-100 dark:border-primary-800 flex flex-wrap items-center gap-x-3 gap-y-1 border-b py-1.5 text-sm last:border-0"
				>
					{#if !family}
						<span class="text-primary-500 shrink-0 text-xs">{campaignName(e.family)}</span>
					{/if}
					<span class="font-medium text-black dark:text-white">{scenarioName(e.family, e.scenario)}</span>
					<ResolutionChips ids={[e.resolution]} visited={new Set([e.resolution])} />
					<div class="ml-auto flex flex-wrap items-center gap-1">
						{#if e.killed === 'yes'}
							<span class={killedChip}>{m.campaigns_trauma_badge_killed()}</span>
						{:else if e.killed === 'maybe'}
							<span class="{chip} text-primary-500 border border-red-300 dark:border-red-700"
								>{m.campaigns_trauma_badge_killed_maybe()}</span
							>
						{/if}
						{#if e.insane === 'yes'}
							<span class={insaneChip}>{m.campaigns_trauma_badge_insane()}</span>
						{:else if e.insane === 'maybe'}
							<span class="{chip} text-primary-500 border border-violet-300 dark:border-violet-700"
								>{m.campaigns_trauma_badge_insane_maybe()}</span
							>
						{/if}
						{#if e.pyrrhic}
							<span
								class="{chip} bg-amber-100 font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
								>{m.campaigns_trauma_badge_pyrrhic()}</span
							>
						{:else if !e.result}
							<span class="{chip} bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300"
								>{m.campaigns_trauma_badge_casualty()}</span
							>
						{/if}
						<span class="text-primary-400 text-xs">{difficultyLabel(e.difficulty)}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
