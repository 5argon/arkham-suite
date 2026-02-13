<!--
@component
CSS flex of vertical cards, with optional grouping.
-->
<script lang="ts">
	import CardScanFullSmall from './CardScanFullSmall.svelte';
	import CardMagnifiedModal from './CardMagnifiedModal.svelte';
	import GroupingRender from './GroupingRender.svelte';
	import { fade } from 'svelte/transition';
	import type { CardItem, RecursivelyGroupedCardItem } from './card-item.js';
	import { noMoreGroup, getCardItemKey } from './card-item.js';
	import type { Card } from '@5argon/arkham-kohaku';
	import { BorderedContainer } from '../container/index.js';
	import { SvelteMap } from 'svelte/reactivity';

	interface Prop {
		groups: RecursivelyGroupedCardItem[];

		/**
		 * Card title is not very readable at this size.
		 */
		showCardName?: boolean;
		onClick?: (card: Card) => void;
		languageCode?: string;
		hideQuantity?: boolean;
	}

	const { groups, showCardName, onClick, languageCode, hideQuantity }: Prop = $props();
	let magnifiedCard = $state<Card | null>(null);
	let isModalShowing = $state(false);

	// Recursively collect all cards to calculate maxQuantity
	function collectAllCards(
		items: RecursivelyGroupedCardItem[]
	): import('./card-item.js').CardItem[] {
		const result: import('./card-item.js').CardItem[] = [];
		for (const group of items) {
			for (const item of group.items) {
				if (noMoreGroup(item)) {
					result.push(item);
				} else {
					result.push(...collectAllCards([item]));
				}
			}
		}
		return result;
	}

	const allCards = $derived(collectAllCards(groups));
	const maxQuantity = $derived(Math.max(...allCards.map((c) => c.quantity ?? 1)));

	// Compute sequential index for each card for staggered fade-in
	function computeCardIndices(grps: RecursivelyGroupedCardItem[]): SvelteMap<string, number> {
		const map = new SvelteMap<string, number>();
		let index = 0;
		function traverse(group: RecursivelyGroupedCardItem) {
			for (const item of group.items) {
				if (noMoreGroup(item)) {
					const key = getCardItemKey(item, true);
					if (!map.has(key)) {
						map.set(key, index++);
					}
				} else {
					traverse(item);
				}
			}
		}
		for (const group of grps) {
			traverse(group);
		}
		return map;
	}

	const cardIndexMap = $derived(computeCardIndices(groups));

	function handleCardClick(card: Card) {
		if (onClick) {
			onClick(card);
		} else {
			magnifiedCard = card;
			isModalShowing = true;
		}
	}

	function handleModalClose(): void {
		isModalShowing = false;
		magnifiedCard = null;
	}
</script>

{#snippet cardRender(item: CardItem, animIndex: number)}
	<div
		role="button"
		in:fade={{ duration: 80, delay: animIndex * 20 }}
		tabindex="0"
		onclick={() => handleCardClick(item.card)}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handleCardClick(item.card);
			}
		}}
		class="cursor-pointer transition-all hover:brightness-110"
	>
		<CardScanFullSmall
			card={item.card}
			{showCardName}
			quantity={item.quantity}
			{maxQuantity}
			greyedOutQuantity={item.greyedOutQuantity}
			owner={item.owner}
			labels={item.labels}
			metaDisplay={item.metaDisplay}
			{hideQuantity}
		/>
	</div>
{/snippet}

{#snippet renderNestedGroupsAndCards(group: RecursivelyGroupedCardItem, layer: number)}
	{@const groups = group.items.filter((item) => !noMoreGroup(item))}
	{#each group.items as item, itemIdx (noMoreGroup(item) ? getCardItemKey(item, true) : item.name + itemIdx)}
		{#if noMoreGroup(item)}
			<!-- Cards are collected and rendered together after nested groups -->
		{:else}
			{@const groupIdx = groups.indexOf(item)}
			<div class="w-full">
				{@render renderGroup(item, layer, group.items.length === 1, groupIdx)}
			</div>
		{/if}
	{/each}
	<div class="flex flex-wrap gap-2">
		{#each group.items as item, itemIdx (noMoreGroup(item) ? getCardItemKey(item, true) : item.name + itemIdx)}
			{#if noMoreGroup(item)}
				{@render cardRender(item, cardIndexMap.get(getCardItemKey(item, true)) ?? 0)}
			{/if}
		{/each}
	</div>
{/snippet}

{#snippet renderGroup(
	group: RecursivelyGroupedCardItem,
	layer: number,
	onlyGroup: boolean,
	groupIdx: number = 0
)}
	{#if layer === 0}
		{#if group.name.length > 0}
			<GroupingRender {group} animationDelayIndex={layer} small={false} />
		{/if}
		<BorderedContainer>
			{@render renderNestedGroupsAndCards(group, 1)}
		</BorderedContainer>
	{:else}
		<div>
			{#if layer > 0 && layer < 2 && !onlyGroup}
				<GroupingRender {group} animationDelayIndex={layer} small={true} />
			{/if}
			{#if layer >= 2 && groupIdx > 0}
				<div style="height: 12px"></div>
			{/if}
			<div style={layer >= 2 ? 'padding-left: 4px; padding-right: 4px;' : ''}>
				{#each group.items as item, itemIdx (noMoreGroup(item) ? getCardItemKey(item, true) : item.name + itemIdx)}
					{#if noMoreGroup(item)}
						<!-- Cards are collected and rendered together after nested groups -->
					{:else}
						{@const groups = group.items.filter((it) => !noMoreGroup(it))}
						{@const groupIdx = groups.indexOf(item)}
						{@render renderGroup(item, layer + 1, group.items.length === 1, groupIdx)}
					{/if}
				{/each}
				<div class="flex flex-wrap gap-2">
					{#each group.items as item, itemIdx (noMoreGroup(item) ? getCardItemKey(item, true) : item.name + itemIdx)}
						{#if noMoreGroup(item)}
							{@render cardRender(item, cardIndexMap.get(getCardItemKey(item, true)) ?? 0)}
						{/if}
					{/each}
				</div>
			</div>
		</div>
	{/if}
{/snippet}

<div>
	{#each groups as group, groupIndex (group.name + groupIndex)}
		{@render renderGroup(group, 0, groups.length === 1)}
	{/each}
</div>

<CardMagnifiedModal
	card={magnifiedCard}
	isShowing={isModalShowing}
	onClose={handleModalClose}
	{languageCode}
/>
