<!--
@component
The "what have I cleared?" grid: every official campaign box × the player's
tracked difficulty tiers. Each cell shows the campaign's full set of ending icons
(lit when reached at that tier, dimmed when not), matching the style of the
Campaign Overview widget. Unowned products are hidden.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import { ENDING_KIND_ORDER, type ClearGridRow, type CampaignEndings } from '$lib/campaign/outcomes/clear-status';
	import OutcomeFace from '$lib/components/profile/_primitives/OutcomeFace.svelte';
	import type { DifficultyTier } from '$lib/campaign/profile/profile-settings';
	import { capitalizeFirst } from '$lib/campaign/utils/entry-text';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';

	let {
		grid,
		trackedTiers,
		endings = [],
	}: { grid: ClearGridRow[]; trackedTiers: DifficultyTier[]; endings?: CampaignEndings[] } =
		$props();

	const tiers = $derived(
		trackedTiers.length ? trackedTiers : (['standard', 'hard'] as DifficultyTier[]),
	);
	const rows = $derived(grid.filter((r) => r.owned));

	const endingsByFamily = $derived(Object.fromEntries(endings.map((e) => [e.family, e])));

	const reachDetail = (n: number): string =>
		n > 0 ? m.home_cleargrid_reached({ count: n }) : m.home_cleargrid_not_reached();
</script>

{#if rows.length}
	<div class="border-primary-200 dark:border-primary-700 overflow-x-auto rounded border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-primary-200 dark:border-primary-700 border-b">
					<th class="px-3 py-2 text-left font-semibold text-black dark:text-white"
						>{m.home_cleargrid_col_campaign()}</th
					>
					{#each tiers as t (t)}
						<th class="px-3 py-2 text-center font-semibold text-black dark:text-white"
							>{difficultyLabel(t)}</th
						>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.family)}
					{@const familyEndings = endingsByFamily[row.family]?.endings ?? []}
					{@const sortedEndings = [...familyEndings].sort(
						(a, b) => ENDING_KIND_ORDER.indexOf(a.kind) - ENDING_KIND_ORDER.indexOf(b.kind),
					)}
					<tr class="border-primary-100 dark:border-primary-800 border-b last:border-0">
						<td class="px-3 py-2 text-black dark:text-white">{row.name}</td>
						{#each tiers as t (t)}
							{@const state = row.byTier[t]}
							<td class="px-3 py-2">
								{#if !state}
									<div class="flex justify-center">
										<span class="text-primary-300 dark:text-primary-600">—</span>
									</div>
								{:else if sortedEndings.length}
									<div class="flex justify-center flex-wrap gap-1.5">
										{#each sortedEndings as e (e.key)}
											{@const n = e.byTier?.[t] ?? 0}
											<OutcomeFace
												kind={e.kind}
												reached={n > 0}
												label="{capitalizeFirst(e.text)} — {reachDetail(n)}"
											/>
										{/each}
									</div>
								{:else}
									<div class="flex justify-center">
										{#if state === 'cleared'}
											<span
												class="text-rogue-500 dark:text-rogue-400 text-xl"
												title={m.home_cleargrid_cleared()}
												><FaIcon icon={FaIconType.EndingWin} /></span
											>
										{:else if state === 'special'}
											<span
												class="text-violet-500 dark:text-violet-400 text-xl"
												title={m.home_cleargrid_special_ending()}
												><FaIcon icon={FaIconType.EndingSpecial} /></span
											>
										{:else if state === 'attempted'}
											<span
												class="text-survivor-500 dark:text-survivor-400 text-xl"
												title={m.home_cleargrid_attempted_lost()}
												><FaIcon icon={FaIconType.EndingLoss} /></span
											>
										{/if}
									</div>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
