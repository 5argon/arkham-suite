<script lang="ts">
	import {
		noMoreGroup,
		getCardItemKey,
		type CardItem,
		type RecursivelyGroupedCardItem
	} from './card-item.js';
	import GroupingRender from './GroupingRender.svelte';
	import CardLine from './CardLine.svelte';
	import type { Snippet } from 'svelte';
	import type { Card, DecodedMeta } from '@5argon/arkham-kohaku';

	type ColumnRender = (cardItem: CardItem) => ReturnType<Snippet>;

	interface Prop {
		/**
		 * Create this many columns before the CardLine column.
		 */
		beforeRenders?: ColumnRender[];
		afterRenders?: ColumnRender[];

		/**
		 * Each grouping header spans the whole row.
		 */
		groups: RecursivelyGroupedCardItem[];

		/**
		 * Optional click handler for each card row.
		 */
		onClick?: (card: Card) => void;
		/**
		 * If true, do not render quantity counters
		 */
		hideQuantity?: boolean;
		/**
		 * Deck metadata for calculating customizable card XP levels
		 */
		meta?: DecodedMeta;
		/**
		 * If true, the CardLine column will have reduced space with clipping overflow,
		 * ensuring afterRenders always have space to render fully.
		 */
		cardLineOverflow?: boolean;
	}

	const {
		beforeRenders,
		afterRenders,
		groups,
		onClick,
		hideQuantity,
		meta,
		cardLineOverflow
	}: Prop = $props();
	const totalColumns = $derived((beforeRenders?.length ?? 0) + 1 + (afterRenders?.length ?? 0));
</script>

<div class:overflow-x-auto={cardLineOverflow}>

{#snippet renderGroup(
	group: RecursivelyGroupedCardItem,
	layer: number,
	onlyGroup: boolean,
	groupIdx: number = 0
)}
	{#if group.name.length > 0 && (layer === 0 || (layer > 0 && layer < 2 && !onlyGroup))}
		<tr>
			<td colspan={totalColumns}>
				<GroupingRender {group} animationDelayIndex={layer} small={layer > 0} />
			</td>
		</tr>
	{/if}
	{#if layer >= 2 && groupIdx > 0}
		<tr>
			<td colspan={totalColumns} style="height: 12px;"></td>
		</tr>
	{/if}
	{#each group.items as item, i (noMoreGroup(item) ? getCardItemKey(item) : i)}
		{#if noMoreGroup(item)}
			<tr
				role={onClick ? 'button' : undefined}
				tabindex={onClick ? 0 : undefined}
				onclick={onClick ? () => onClick(item.card) : undefined}
				onkeydown={onClick
					? (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								onClick(item.card);
							}
						}
					: undefined}
				class={onClick ? 'hover:bg-primary-500/10 cursor-pointer transition-colors' : ''}
			>
				{#if beforeRenders}
					{#each beforeRenders as render, i (i)}
						<td>
							{@render render(item)}
						</td>
					{/each}
				{/if}
				<td>
					<CardLine
						card={item.card}
						quantity={item.quantity}
						quantityColor={item.quantityColor}
						greyedOutQuantity={item.greyedOutQuantity}
						{hideQuantity}
						{meta}
					/>
				</td>
				{#if afterRenders}
					{#each afterRenders as render, i (i)}
						<td class="pl-2" class:sticky-right={cardLineOverflow}>
							{@render render(item)}
						</td>
					{/each}
				{/if}
			</tr>
		{:else}
			{@const groups = group.items.filter((it) => !noMoreGroup(it))}
			{@const groupIdx = groups.indexOf(item)}
			{@render renderGroup(item, layer + 1, group.items.length === 1, groupIdx)}
		{/if}
	{/each}
{/snippet}

<table>
	<tbody>
		{#each groups as group, i (i)}
			{@render renderGroup(group, 0, groups.length === 1)}
		{/each}
	</tbody>
</table>

</div>

<style>
	.sticky-right {
		position: sticky;
		right: 0;
	}
</style>
