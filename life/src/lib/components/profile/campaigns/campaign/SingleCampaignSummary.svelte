<!-- @component A campaign's plays and, per tracked difficulty, its clear state, win / loss tally and every ending lit when reached. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import {
		ENDING_KIND_ORDER,
		type WinLossRecord,
		type ClearGridRow,
		type CampaignEndings
	} from '$lib/campaign/outcomes/clear-status';
	import type { DifficultyTier } from '$lib/campaign/profile/profile-settings';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import { trackedTierList } from '$lib/campaign/records/tracking';
	import { capitalizeFirst } from '$lib/campaign/utils/entry-text';
	import { OutcomeFace, StatNumbers, WidgetEmpty } from '$lib/components/profile/_primitives';

	let {
		record,
		clear,
		endings,
		trackedTiers,
		logOnly = false
	}: {
		record: WinLossRecord | null;
		clear: ClearGridRow | null;
		endings: CampaignEndings | null;
		trackedTiers: DifficultyTier[];
		logOnly?: boolean;
	} = $props();

	const tiers = $derived(trackedTierList(trackedTiers));
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

	const sortedEndings = $derived(
		(endings?.endings ?? [])
			// An ending the log alone can't establish (DWL's Act-4 R2) would look unreachable.
			.filter((e) => !(logOnly && e.nonLog))
			.sort((a, b) => ENDING_KIND_ORDER.indexOf(a.kind) - ENDING_KIND_ORDER.indexOf(b.kind))
	);
	const reachDetail = (n: number): string =>
		n > 0 ? m.campaign_summary_reached_times({ count: n }) : m.campaign_summary_not_reached();

	// The clear-state badge wears the best ending face reached at that tier.
	const reachedBestAtTier = (t: string): boolean =>
		sortedEndings.some((e) => e.kind === 'best' && (e.byTier?.[t] ?? 0) > 0);
	function clearIcon(st: string, t: string): FaIconType | null {
		if (st === 'cleared')
			return reachedBestAtTier(t) ? FaIconType.EndingBetterWin : FaIconType.EndingWin;
		if (st === 'special') return FaIconType.EndingSpecial;
		return null;
	}
</script>

<div>
	{#if plays === 0}
		<WidgetEmpty>{m.campaign_summary_not_played_yet()}</WidgetEmpty>
	{:else}
		<StatNumbers rows={[[{ value: plays, label: m.campaign_summary_play({ count: plays }) }]]} />

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
							<span class="text-primary-600 dark:text-primary-300 flex items-center gap-2 tabular-nums">
								<span>{tr.wins}W</span>
								<span>{tr.losses}L</span>
								{#if tr.special > 0}
									<span class="inline-flex items-center gap-0.5"
										>{tr.special}<FaIcon icon={FaIconType.EndingSpecial} /></span
									>
								{/if}
							</span>
						{/if}
					</div>
					{#if sortedEndings.length}
						<div class="mt-2 flex flex-wrap gap-2.5">
							{#each sortedEndings as e (e.key)}
								{@const n = e.byTier?.[t] ?? 0}
								<OutcomeFace
									kind={e.kind}
									reached={n > 0}
									size="text-xl"
									label="{capitalizeFirst(e.text)} — {reachDetail(n)}"
								/>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
