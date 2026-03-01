<!--
@component
"Deaths & Insanities" — a cross-play tally of endings that killed or drove the
party insane, derived from the resolution each play recorded (Extra tab) joined
against campaign-data's per-resolution trauma. Headline counts (killed / insane /
pyrrhic win / casualty) plus a per-investigator breakdown for `all`-target
endings and the contributing event list. Aggregate widget; on a campaign page it
is sliced to that family.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { CardScanFullSmall } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { getAllCards } from '$lib/card-data';
	import { resolutionShort, resolutionLabel } from '$lib/campaign/resolutions';
	import type { TraumaTally, TraumaEvent } from '$lib/campaign/trauma';

	let { tally, family = null }: { tally: TraumaTally; family?: string | null } = $props();

	// Per-campaign slice: recompute the headline numbers from the family's events
	// (per-investigator attribution can't be re-sliced from the summary, so it is
	// shown only on the aggregate view).
	const events = $derived(family ? tally.events.filter((e) => e.family === family) : tally.events);
	const sliced = $derived(family);

	const count = (pred: (e: TraumaEvent) => boolean): number => events.filter(pred).length;
	const killed = $derived(count((e) => e.killed === 'yes'));
	const insane = $derived(count((e) => e.insane === 'yes'));
	const killedNotInsane = $derived(count((e) => e.killed === 'yes' && e.insane !== 'yes'));
	const insaneNotKilled = $derived(count((e) => e.insane === 'yes' && e.killed !== 'yes'));
	const pyrrhic = $derived(count((e) => e.pyrrhic));
	const casualties = $derived(count((e) => !e.result && (e.killed === 'yes' || e.insane === 'yes')));
	const possible = $derived(
		count((e) => e.killed !== 'yes' && e.insane !== 'yes' && (e.killed === 'maybe' || e.insane === 'maybe')),
	);

	const byCode = new Map(getAllCards().map((c) => [c.code, c]));
	const perInvestigator = $derived.by((): { card: Card; killed: number; insane: number }[] =>
		(sliced ? [] : tally.perInvestigator)
			.map((i) => ({ card: byCode.get(i.code), killed: i.killed, insane: i.insane }))
			.filter((r): r is { card: Card; killed: number; insane: number } => !!r.card),
	);

	function deslug(id: string): string {
		return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}
	/** Campaign display name re-derived from the base-family code. */
	// i18n: package-sourced (getCampaignLog().db.name; deslug fallback of a data code)
	function campaignName(family: string): string {
		return getCampaignLog(family)?.db.name ?? deslug(family);
	}

	const stats = $derived([
		{ label: m.campaigns_trauma_stat_killed(), sub: m.campaigns_trauma_stat_killed_sub({ count: killedNotInsane }), value: killed, tone: 'text-red-600 dark:text-red-400' },
		{ label: m.campaigns_trauma_stat_insane(), sub: m.campaigns_trauma_stat_insane_sub({ count: insaneNotKilled }), value: insane, tone: 'text-violet-600 dark:text-violet-400' },
		{ label: m.campaigns_trauma_stat_pyrrhic(), sub: m.campaigns_trauma_stat_pyrrhic_sub(), value: pyrrhic, tone: 'text-amber-600 dark:text-amber-400' },
		{ label: m.campaigns_trauma_stat_casualties(), sub: m.campaigns_trauma_stat_casualties_sub(), value: casualties, tone: 'text-primary-700 dark:text-primary-300' },
	]);
</script>

{#if !events.length}
	<p class="text-primary-500 text-sm">
		{m.campaigns_trauma_empty()}
	</p>
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
				<p class="text-primary-700 dark:text-primary-300 mb-2 text-sm font-semibold">
					{m.campaigns_trauma_who_paid()}
					<span class="text-primary-500 font-normal">{m.campaigns_trauma_party_wide_only()}</span>
				</p>
				<div class="overflow-x-auto">
					<div class="flex w-max gap-2">
						{#each perInvestigator as p (p.card.code)}
							<div class="flex flex-col items-center" style="width: 96px;">
								<CardScanFullSmall card={p.card} showCardName hideQuantity />
								<div class="mt-1 flex gap-1 text-xs font-semibold tabular-nums">
									{#if p.killed}
										<span class="rounded bg-red-100 px-1.5 py-0.5 text-red-700 dark:bg-red-900/40 dark:text-red-300">
											†{p.killed}
										</span>
									{/if}
									{#if p.insane}
										<span class="rounded bg-violet-100 px-1.5 py-0.5 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
											☉{p.insane}
										</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<div class="space-y-1.5">
			{#each events as e, i (i)}
				<div
					class="border-primary-100 dark:border-primary-800 flex flex-wrap items-center gap-x-3 gap-y-1 border-b py-1.5 text-sm last:border-0"
				>
					{#if !sliced}
						<span class="text-primary-500 shrink-0 text-xs">{campaignName(e.family)}</span>
					{/if}
					<span class="font-medium text-black dark:text-white">{deslug(e.scenario)}</span>
					<span
						title={resolutionLabel(e.resolution)}
						class="bg-secondary-500 rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums text-white"
					>
						{resolutionShort(e.resolution)}
					</span>
					<div class="ml-auto flex flex-wrap items-center gap-1">
						{#if e.killed === 'yes'}
							<span class="rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">{m.campaigns_trauma_badge_killed()}</span>
						{:else if e.killed === 'maybe'}
							<span class="text-primary-500 rounded border border-red-300 px-1.5 py-0.5 text-xs dark:border-red-700">{m.campaigns_trauma_badge_killed_maybe()}</span>
						{/if}
						{#if e.insane === 'yes'}
							<span class="rounded bg-violet-100 px-1.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">{m.campaigns_trauma_badge_insane()}</span>
						{:else if e.insane === 'maybe'}
							<span class="text-primary-500 rounded border border-violet-300 px-1.5 py-0.5 text-xs dark:border-violet-700">{m.campaigns_trauma_badge_insane_maybe()}</span>
						{/if}
						{#if e.pyrrhic}
							<span class="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{m.campaigns_trauma_badge_pyrrhic()}</span>
						{:else if !e.result}
							<span class="bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 rounded px-1.5 py-0.5 text-xs">{m.campaigns_trauma_badge_casualty()}</span>
						{/if}
						<span class="text-primary-400 text-xs capitalize">{e.difficulty}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
