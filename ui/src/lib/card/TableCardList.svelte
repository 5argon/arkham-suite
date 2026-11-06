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
		onClick?: (card: Card, item: CardItem) => void;
		/**
		 * Makes each row a link, instead of something to click on.
		 */
		cardHref?: (item: CardItem) => string;
		/**
		 * If true, do not render quantity counters
		 */
		hideQuantity?: boolean;
		/**
		 * If true, do not render card type icons
		 */
		hideCardTypeIcon?: boolean;
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
		cardHref,
		hideQuantity,
		hideCardTypeIcon,
		meta,
		cardLineOverflow
	}: Prop = $props();
	const totalColumns = $derived((beforeRenders?.length ?? 0) + 1 + (afterRenders?.length ?? 0));
</script>

<div class:overflow-x-auto={cardLineOverflow}>
	<!-- A table row can't be a link, so each cell is, with only the card line taking keyboard focus. -->
	{#snippet linked(item: CardItem, focusable: boolean, content: Snippet)}
		{#if cardHref}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a class="block" href={cardHref(item)} tabindex={focusable ? undefined : -1}>
				{@render content()}
			</a>
		{:else}
			{@render content()}
		{/if}
	{/snippet}

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
					onclick={onClick ? () => onClick(item.card, item) : undefined}
					onkeydown={onClick
						? (e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onClick(item.card, item);
								}
							}
						: undefined}
					class={onClick || cardHref ? 'hover:bg-primary-500/10 cursor-pointer transition-colors' : ''}
				>
					{#if beforeRenders}
						{#each beforeRenders as render, i (i)}
							<td>
								{@render render(item)}
							</td>
						{/each}
					{/if}
					<td>
						{#snippet line()}
							<CardLine
								card={item.card}
								quantity={item.quantity}
								quantityColor={item.quantityColor}
								greyedOutQuantity={item.greyedOutQuantity}
								{hideCardTypeIcon}
								{hideQuantity}
								{meta}
							/>
						{/snippet}
						{@render linked(item, true, line)}
					</td>
					{#if afterRenders}
						{#each afterRenders as render, i (i)}
							<td class="pl-2" class:sticky-right={cardLineOverflow}>
								{#snippet after()}
									{@render render(item)}
								{/snippet}
								{@render linked(item, false, after)}
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
