<!--
@component
Compact "this campaign" header for a campaign detail page: a big play count, a
per-difficulty section (only the tiers the player tracks) showing each tier's
clear state + its win / loss / special tally, and a row of ending icons — every
ending the campaign offers, lit when reached and faded when not, hover revealing
the ending text and how many times it was reached. So the W/L numbers and the
"which endings have I seen" are both traceable. (No "in progress" — an unrecorded
ending just means that ending hasn't been reached, not that a play is unfinished.)
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { FaIcon, FaIconType, HoverTooltip } from '@5argon/arkham-life-ui';
	import type {
		WinLossRecord,
		ClearGridRow,
		CampaignEndings,
		EndingKind
	} from '$lib/campaign/clear-status';
	import type { DifficultyTier } from '$lib/campaign/profile-settings';
	import { difficultyLabel } from '$lib/campaign/difficulty';
	import { capitalizeFirst } from '$lib/campaign/entry-text';

	let {
		record,
		clear,
		endings,
		trackedTiers
	}: {
		record: WinLossRecord | null;
		clear: ClearGridRow | null;
		endings: CampaignEndings | null;
		trackedTiers: DifficultyTier[];
	} = $props();

	const tiers = $derived(
		trackedTiers.length ? trackedTiers : (['standard', 'hard'] as DifficultyTier[])
	);
	// Cleared = Rogue green, Attempted = Survivor red (the highest clear's face icon
	// stands in for the old checkmark; an attempt shows no icon).
	const stateMeta: Record<string, { label: string; cls: string }> = {
		cleared: {
			label: m.campaign_summary_state_cleared(),
			cls: 'bg-rogue-100 dark:bg-rogue-900 text-rogue-700 dark:text-rogue-300'
		},
		special: {
			label: m.campaign_summary_state_special(),
			cls: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
		},
		attempted: {
			label: m.campaign_summary_state_attempted(),
			cls: 'bg-survivor-100 dark:bg-survivor-900 text-survivor-700 dark:text-survivor-300'
		},
		blank: {
			label: m.campaign_summary_state_blank(),
			cls: 'bg-primary-100 dark:bg-primary-800 text-primary-500'
		}
	};

	const plays = $derived(record?.plays ?? clear?.plays ?? 0);

	// Each ending kind → its face icon (shape carries the meaning; colour only
	// marks reached vs not, in the primary palette).
	const endingIcon: Record<EndingKind, FaIconType> = {
		best: FaIconType.EndingBetterWin,
		win: FaIconType.EndingWin,
		special: FaIconType.EndingSpecial,
		loss: FaIconType.EndingLoss
	};
	const order: EndingKind[] = ['best', 'win', 'special', 'loss'];
	const sortedEndings = $derived(
		endings
			? [...endings.endings].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind))
			: []
	);
	const reachDetail = (n: number): string =>
		n > 0 ? m.campaign_summary_reached_times({ count: n }) : m.campaign_summary_not_reached();

	// The clear-state badge shows the best ending FACE achieved at that tier — a
	// superior win beams; a special ending is astonished; a plain attempt has none.
	const reachedBestAtTier = (t: string): boolean =>
		sortedEndings.some((e) => e.kind === 'best' && (e.byTier?.[t] ?? 0) > 0);
	function clearIcon(st: string, t: string): FaIconType | null {
		if (st === 'cleared')
			return reachedBestAtTier(t) ? FaIconType.EndingBetterWin : FaIconType.EndingWin;
		if (st === 'special') return FaIconType.EndingSpecial;
		return null;
	}

	// ── single shared tooltip for the ending icons ───────────────────────────
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipTitle = $state('');
	let tipDetail = $state('');
	function showTip(title: string, detail: string, e: MouseEvent) {
		tipTitle = title;
		tipDetail = detail;
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideTip = () => (tipVisible = false);
</script>

<div>
	{#if plays === 0}
		<p class="text-primary-500 text-sm">{m.campaign_summary_not_played_yet()}</p>
	{:else}
		<div class="flex items-baseline gap-2">
			<span class="text-4xl leading-none font-bold text-black tabular-nums dark:text-white"
				>{plays}</span
			>
			<span class="text-primary-500 text-sm">{m.campaign_summary_play({ count: plays })}</span>
		</div>

		<!-- One block per tracked difficulty: clear state + W / L / special, then the
		     endings reached AT that difficulty (lit) vs not (faded); hover = text +
		     times reached at this difficulty. -->
		<div class="mt-3 space-y-2">
			{#each tiers as t (t)}
				{@const tr = record?.byTier?.[t]}
				{@const st = clear?.byTier?.[t] ?? 'blank'}
				{@const icon = clearIcon(st, t)}
				<div class="border-primary-200 dark:border-primary-700 rounded border p-2.5">
					<div class="flex items-center gap-2 text-sm">
						<span class="w-16 shrink-0 font-semibold text-black dark:text-white"
							>{difficultyLabel(t)}</span
						>
						<span
							class="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium {stateMeta[st]
								.cls}"
						>
							{#if icon !== null}<FaIcon {icon} />{/if}
							{stateMeta[st].label}
						</span>
						{#if tr && tr.plays > 0}
							<span class="text-primary-600 dark:text-primary-300 flex gap-2 tabular-nums">
								<span>{tr.wins}W</span>
								<span>{tr.losses}L</span>
								{#if tr.special > 0}<span>{tr.special}◆</span>{/if}
							</span>
						{/if}
					</div>
					{#if sortedEndings.length}
						<div class="mt-2 flex flex-wrap gap-2.5">
							{#each sortedEndings as e (e.key)}
								{@const n = e.byTier?.[t] ?? 0}
								<span
									role="img"
									aria-label="{capitalizeFirst(e.text)} — {reachDetail(n)}"
									class="cursor-default"
									onmouseenter={(ev) => showTip(capitalizeFirst(e.text), reachDetail(n), ev)}
									onmouseleave={hideTip}
								>
									<FaIcon
										icon={endingIcon[e.kind]}
										class="text-xl {n > 0
											? 'text-primary-700 dark:text-primary-200'
											: 'text-primary-300 dark:text-primary-700'}"
									/>
								</span>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
	<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">
		<span class="font-semibold">{tipTitle}</span>
		{#if tipDetail}
			<br />
			<span class="text-neutral-600 dark:text-neutral-300">{tipDetail}</span>
		{/if}
	</span>
</HoverTooltip>
