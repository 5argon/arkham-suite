<!--
@component
The "what have I cleared?" grid: every official campaign box × the player's
tracked difficulty tiers. Each cell shows the campaign's full set of ending icons
(lit when reached at that tier, dimmed when not), matching the style of the
Campaign Overview widget. Unowned products are hidden. Used on both the home page
(own clears) and a public profile.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { FaIcon, FaIconType, HoverTooltip } from '@5argon/arkham-life-ui';
	import type { ClearGridRow, CampaignEndings, EndingKind } from '$lib/campaign/clear-status';
	import type { DifficultyTier } from '$lib/campaign/profile-settings';
	import { capitalizeFirst } from '$lib/campaign/entry-text';
	import { difficultyLabel } from '$lib/campaign/difficulty';

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

	const endingIcon: Record<EndingKind, FaIconType> = {
		best: FaIconType.EndingBetterWin,
		win: FaIconType.EndingWin,
		special: FaIconType.EndingSpecial,
		loss: FaIconType.EndingLoss,
	};
	const kindOrder: EndingKind[] = ['best', 'win', 'special', 'loss'];

	const reachDetail = (n: number): string =>
		n > 0 ? m.home_cleargrid_reached({ count: n }) : m.home_cleargrid_not_reached();

	// ── Single shared tooltip ────────────────────────────────────────────────
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
						(a, b) => kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind),
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
											<span
												role="img"
												aria-label="{capitalizeFirst(e.text)} — {reachDetail(n)}"
												class="cursor-default text-lg {n > 0
													? 'text-primary-700 dark:text-primary-200'
													: 'text-primary-200 dark:text-primary-700'}"
												onmouseenter={(ev) =>
													showTip(capitalizeFirst(e.text), reachDetail(n), ev)}
												onmouseleave={hideTip}
											>
												<FaIcon icon={endingIcon[e.kind]} />
											</span>
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

	<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
		<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">
			<span class="font-semibold">{tipTitle}</span>
			{#if tipDetail}
				<br />
				<span class="text-neutral-600 dark:text-neutral-300">{tipDetail}</span>
			{/if}
		</span>
	</HoverTooltip>
{/if}
