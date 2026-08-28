<!--
@component
Permanent per-member toolbar: each chip always shows the member's identity and
deck status (readiness is purely a main-deck count check: the tool makes
invalid cards, duplicates, and over-quantity impossible by construction).
When solo controls are wired, each chip carries a Solo toggle that narrows the
board to the selected members, bringing far-apart decks closer for dragging.
-->
<script lang="ts">
	import { CardLine } from '@5argon/arkham-life-ui';
	import type { CardCode, CardResolver } from '@5argon/arkham-kohaku';
	import clsx from 'clsx';

	import * as m from '$lib/paraglide/messages.js';
	import { mainDeckCount, overlappingStacksOf } from '$lib/tool/evergreen-team/rules';
	import type { EvergreenState } from '$lib/tool/evergreen-team/types';

	interface Prop {
		team: EvergreenState;
		resolver: CardResolver;
		/**
		 * Deck indices currently soloed; empty = every member shown.
		 */
		soloIndices?: ReadonlySet<number>;
		onToggleSolo?: (deckIndex: number) => void;
		/**
		 * Cards claimed beyond the pool (teams assembled from starter decks).
		 */
		overlaps?: ReadonlySet<CardCode>;
	}
	const { team, resolver, soloIndices, onToggleSolo, overlaps }: Prop = $props();

	const statuses = $derived(
		team.decks.map((deck, deckIndex) => {
			const investigator = resolver.resolve(deck.investigator);
			const size = investigator.deckRequirements?.size ?? 30;
			const count = mainDeckCount(deck);
			const overlapping = overlaps === undefined ? 0 : overlappingStacksOf(deck, overlaps);
			return { deckIndex, investigator, size, count, overlapping };
		})
	);
	const teamReady = $derived(statuses.every((s) => s.count === s.size && s.overlapping === 0));
	const teamOverlapping = $derived(statuses.some((s) => s.overlapping > 0));
</script>

<div class="flex flex-col items-center gap-1 py-1">
	<div class={clsx('chips', `chips-cols-${statuses.length}`)}>
		{#each statuses as status (status.investigator.code)}
			{@const soloed = soloIndices?.has(status.deckIndex) ?? false}
			<span
				class={clsx(
					'flex flex-col gap-0.5 rounded-2xl border px-2 py-1 text-sm',
					status.overlapping > 0
						? 'border-red-600 bg-red-600/10 text-red-700 dark:text-red-400'
						: status.count === status.size
							? 'border-green-600 bg-green-600/10 text-green-700 dark:text-green-400'
							: status.count > status.size
								? 'border-red-600 bg-red-600/10 text-red-700 dark:text-red-400'
								: 'border-amber-600 bg-amber-600/10 text-amber-700 dark:text-amber-400'
				)}
			>
				<span class="flex items-center gap-1.5">
					<CardLine noReserveCardTypeIcon hideIcons card={status.investigator} />
					{#if onToggleSolo}
						<button
							type="button"
							aria-pressed={soloed}
							class={clsx(
								'ml-auto cursor-pointer rounded-full border px-1.5 text-xs font-semibold transition-colors',
								soloed
									? 'border-primary-700 bg-primary-700 dark:border-primary-300 dark:bg-primary-300 dark:text-primary-950 text-white'
									: 'border-primary-400 text-primary-700 hover:bg-primary-200 dark:border-primary-600 dark:text-primary-300 dark:hover:bg-primary-800'
							)}
							onclick={() => onToggleSolo(status.deckIndex)}
						>
							{m.tool_evergreen_team_solo()}
						</button>
					{/if}
				</span>
				<span class="text-xs font-bold">
					{#if status.overlapping > 0}
						{m.tool_evergreen_team_status_overlap({ count: status.overlapping })}
					{:else if status.count === status.size}
						{m.tool_evergreen_team_status_ready()}
					{:else if status.count > status.size}
						{m.tool_evergreen_team_status_over({ count: status.count - status.size })}
					{:else}
						{m.tool_evergreen_team_status_need_more({ count: status.size - status.count })}
					{/if}
				</span>
			</span>
		{/each}
	</div>
	{#if teamReady}
		<span class="rounded-full bg-green-600 px-3 py-0.5 text-sm font-bold text-white">
			{m.tool_evergreen_team_status_team_ready()}
		</span>
	{:else if teamOverlapping}
		<span
			class="max-w-xl rounded-2xl bg-red-600 px-3 py-0.5 text-center text-sm font-bold text-white"
		>
			{m.tool_evergreen_team_status_team_overlap()}
		</span>
	{/if}
</div>

<style>
	/* Chips lay out in a grid sized to the member count, so wrapping is always
	   balanced: 4 members break into 2 + 2 (never 3 + 1), 3 into 2 + 1. */
	.chips {
		display: grid;
		gap: 0.5rem;
		justify-content: center;
		align-items: center;
	}

	.chips-cols-1 {
		grid-template-columns: repeat(1, auto);
	}

	.chips-cols-2 {
		grid-template-columns: repeat(2, auto);
	}

	.chips-cols-3 {
		grid-template-columns: repeat(3, auto);
	}

	.chips-cols-4 {
		grid-template-columns: repeat(4, auto);
	}

	@media (max-width: 1500px) {
		.chips-cols-3,
		.chips-cols-4 {
			grid-template-columns: repeat(2, auto);
		}
	}

	@media (max-width: 640px) {
		.chips-cols-2,
		.chips-cols-3,
		.chips-cols-4 {
			grid-template-columns: repeat(1, auto);
		}
	}
</style>
