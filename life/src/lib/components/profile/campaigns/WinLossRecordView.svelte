<!-- @component Per campaign: plays, wins / losses / special endings / unfinished, and plays per difficulty. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import { difficultyAbbr, orderedDifficulties } from '$lib/campaign/utils/difficulty';
	import type { WinLossRecord } from '$lib/campaign/outcomes/clear-status';

	let { records, showFamilyName = true }: { records: WinLossRecord[]; showFamilyName?: boolean } =
		$props();

	const withPlays = $derived(records.filter((r) => r.plays > 0).sort((a, b) => b.plays - a.plays));

	function tierPlays(r: WinLossRecord): string {
		const plays = Object.fromEntries(Object.entries(r.byTier).map(([t, v]) => [t, v.plays]));
		return orderedDifficulties(plays)
			.map((t) => `${plays[t]}× ${difficultyAbbr(t)}`)
			.join(', ');
	}
</script>

{#if withPlays.length}
	<div class="space-y-2">
		{#each withPlays as r (r.family)}
			<div
				class="border-primary-200 dark:border-primary-700 flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2"
			>
				{#if showFamilyName}
					<span class="font-medium text-black dark:text-white">{r.name}</span>
				{/if}
				<div class="flex items-center gap-3 text-sm tabular-nums">
					<span class="text-primary-500">{m.campaigns_plays({ count: r.plays })}</span>
					<span class="flex items-center gap-2">
						{#if r.wins}<span class="text-secondary-600 dark:text-secondary-400">{r.wins}W</span>{/if}
						{#if r.losses}<span class="text-amber-600 dark:text-amber-400">{r.losses}L</span>{/if}
						{#if r.special}
							<span class="inline-flex items-center gap-0.5 text-purple-500"
								>{r.special}<FaIcon icon={FaIconType.EndingSpecial} /></span
							>
						{/if}
						{#if r.inProgress}<span class="text-primary-400">{r.inProgress}?</span>{/if}
					</span>
					<span class="text-primary-400 hidden sm:inline">{tierPlays(r)}</span>
				</div>
			</div>
		{/each}
	</div>
{/if}
