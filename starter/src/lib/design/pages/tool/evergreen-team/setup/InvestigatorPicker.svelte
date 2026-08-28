<!--
@component
Roster grid of selectable investigator tiles, shared by the setup page and
the swap modal. With focusIndex set, only that player's slot is being
changed: the other players' picks are greyed out and locked.
-->
<script lang="ts">
	import { CardScanFullTiny } from '@5argon/arkham-life-ui';
	import type { Card, CardCode } from '@5argon/arkham-kohaku';
	import clsx from 'clsx';

	import * as m from '$lib/paraglide/messages.js';

	import AccessSummary from './AccessSummary.svelte';

	interface Prop {
		roster: Card[];
		selected: CardCode[];
		onToggle: (code: CardCode) => void;
		/**
		 * Index into selected of the one slot being changed; the other picks
		 * become locked. Undefined = free multi-select (setup page).
		 */
		focusIndex?: number;
	}
	const { roster, selected, onToggle, focusIndex }: Prop = $props();
</script>

<div class="flex flex-wrap justify-center gap-3">
	{#each roster as investigator (investigator.code)}
		{@const selectionIndex = selected.indexOf(investigator.code)}
		{@const isSelected = selectionIndex !== -1}
		{@const locked = focusIndex !== undefined && isSelected && selectionIndex !== focusIndex}
		<button
			type="button"
			class={clsx(
				'relative flex w-32 flex-col items-center gap-1 rounded-lg border-2 p-2 transition-colors',
				locked ? 'cursor-not-allowed opacity-40 grayscale' : 'cursor-pointer',
				isSelected
					? 'border-primary-500 bg-primary-100 dark:bg-primary-900'
					: 'hover:border-primary-300 border-transparent'
			)}
			disabled={locked}
			onclick={() => onToggle(investigator.code)}
		>
			{#if isSelected}
				<span
					class="bg-primary-600 absolute -top-2 -right-2 z-10 rounded-full px-2 py-0.5 text-xs font-bold text-white"
				>
					{m.tool_evergreen_team_player_n({ n: selectionIndex + 1 })}
				</span>
			{/if}
			<CardScanFullTiny card={investigator} eager hideQuantity width={96} />
			<span class="text-primary-900 dark:text-primary-100 text-sm font-medium">
				{investigator.name}
			</span>
			<AccessSummary {investigator} />
		</button>
	{/each}
</div>
