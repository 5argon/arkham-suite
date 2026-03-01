<!--
@component
CSS flex of square card images with hover tooltips, with optional grouping.
-->
<script lang="ts">
	import CardSquare from './CardSquare.svelte';
	import CardLineHoverTooltip from './CardLineHoverTooltip.svelte';
	import CardMagnifiedModal from './CardMagnifiedModal.svelte';
	import GroupingRender from './GroupingRender.svelte';
	import type { CardItem, RecursivelyGroupedCardItem } from './card-item.js';
	import { noMoreGroup, getCardItemKey } from './card-item.js';
	import type { Card, LocalizationResolver } from '@5argon/arkham-kohaku';
	import { BorderedContainer } from '../container/index.js';
	import { createTooltipState } from '../utility/tooltip-state.svelte.js';

	interface Prop {
		groups: RecursivelyGroupedCardItem[];
		showQuantity?: boolean;
		localizationResolver?: LocalizationResolver;
		languageCode?: string;
		onClick?: (card: Card) => void;
		/** Overlay each card's `iconCount` as a small badge (e.g. a usage count). */
		showIconCount?: boolean;
	}

	const { groups, showQuantity, localizationResolver, languageCode, onClick, showIconCount }: Prop =
		$props();
	const tooltip = createTooltipState<{ card: Card; quantity: number }>();
	let magnifiedCard = $state<Card | null>(null);
	let isModalShowing = $state(false);

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

{#snippet cardRender(item: CardItem)}
	<div class="flex flex-col items-center">
		<div
			role="button"
			tabindex="0"
			onmouseenter={(e) => tooltip.show({ card: item.card, quantity: item.quantity }, e)}
			onmouseleave={tooltip.hide}
			onclick={() => handleCardClick(item.card)}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleCardClick(item.card);
				}
			}}
			class="cursor-pointer hover:brightness-120"
		>
			<CardSquare
				card={item.card}
				greyedOut={item.greyedOutQuantity !== undefined && item.greyedOutQuantity >= item.quantity}
			/>
		</div>
		{#if showIconCount}
			<!-- A real, reserved row below the card for the count (badge only when > 0), so a
			     card with a number is exactly the same size as one without. The grid below
			     counters this row's height at the bottom so the container looks unchanged. -->
			<div class="mt-px flex h-4 w-full items-center justify-end">
				{#if (item.iconCount ?? 0) > 0}
					<span
						class="bg-primary-100/90 dark:bg-primary-900/90 text-primary-700 dark:text-primary-200 min-w-[1rem] rounded px-1 text-center text-[10px] leading-4 font-bold tabular-nums"
					>
						{item.iconCount}
					</span>
				{/if}
			</div>
		{/if}
	</div>
{/snippet}

{#snippet renderNestedGroupsAndCards(group: RecursivelyGroupedCardItem, layer: number)}
	{@const nestedGroups = group.items.filter((item) => !noMoreGroup(item))}
	{#each group.items as item, i (noMoreGroup(item) ? getCardItemKey(item) : i)}
		{#if noMoreGroup(item)}
			<!-- Cards are collected and rendered together after nested groups -->
		{:else}
			{@const groupIdx = nestedGroups.indexOf(item)}
			<div class="w-full">
				{@render renderGroup(item, layer, group.items.length === 1, groupIdx)}
			</div>
		{/if}
	{/each}
	<div class="flex flex-wrap gap-1{showIconCount ? ' -mb-2 lg:-mb-4' : ''}">
		{#each group.items as item, i (noMoreGroup(item) ? getCardItemKey(item) : i)}
			{#if noMoreGroup(item)}
				{@render cardRender(item)}
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
				{#each group.items as item, i (noMoreGroup(item) ? getCardItemKey(item) : i)}
					{#if noMoreGroup(item)}
						<!-- Cards are collected and rendered together after nested groups -->
					{:else}
						{@const nestedGroups = group.items.filter((it) => !noMoreGroup(it))}
						{@const groupIdx = nestedGroups.indexOf(item)}
						{@render renderGroup(item, layer + 1, group.items.length === 1, groupIdx)}
					{/if}
				{/each}
				<div class="flex flex-wrap gap-1{showIconCount ? ' -mb-2 lg:-mb-4' : ''}">
					{#each group.items as item, i (noMoreGroup(item) ? getCardItemKey(item) : i)}
						{#if noMoreGroup(item)}
							{@render cardRender(item)}
						{/if}
					{/each}
				</div>
			</div>
		</div>
	{/if}
{/snippet}

<div class="space-y-4">
	{#each groups as group, groupIndex (group.name + groupIndex)}
		{@render renderGroup(group, 0, groups.length === 1)}
	{/each}
</div>

{#if tooltip.data}
	<CardLineHoverTooltip
		card={tooltip.data.card}
		quantity={showQuantity ? tooltip.data.quantity : undefined}
		{localizationResolver}
		{languageCode}
		visible={tooltip.visible}
		referenceElement={tooltip.referenceElement}
	/>
{/if}

<CardMagnifiedModal
	card={magnifiedCard}
	isShowing={isModalShowing}
	onClose={handleModalClose}
	{languageCode}
/>
