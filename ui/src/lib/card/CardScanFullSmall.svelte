<!--
@component
Fixed size vertical card designed to be in a flex.
-->
<script lang="ts">
	import { getCardImagePath, getCardBackImagePath } from '../utility/image.js';
	import type { Card, LocalizationResolver, DecodedMeta } from '@5argon/arkham-kohaku';
	import { card as cardUtility } from '@5argon/arkham-kohaku';
	import { getCardColorClass } from './coloring.js';
	import clsx from 'clsx';
	import LevelPips from './LevelPips.svelte';
	import CardSetInfo from './CardSetInfo.svelte';
	import CardStrip from './CardStrip.svelte';
	import CardLabel, { type CardLabelProp } from './CardLabel.svelte';
	import DeckbuildingChoiceDisplay from './DeckbuildingChoiceDisplay.svelte';

	interface Prop {
		card: Card;
		localizationResolver?: LocalizationResolver;
		languageCode?: string;
		quantity?: number;

		/**
		 * Reserve height for this many quantity.
		 * To display neatly in a grid therefore, if deck has any card with 3 quantity,
		 * all cards in the grid should have max quantity of 3.
		 */
		maxQuantity?: number;

		/**
		 * Card title is not very readable at this size.
		 */
		showCardName?: boolean;

		/**
		 * How many copies should be greyed out. They will appear at the back of the stack.
		 */
		greyedOutQuantity?: number;

		/**
		 * Owner card (typically an investigator) to display below the card name.
		 */
		owner?: Card;

		/**
		 * Labels to display as colored tags below the card name.
		 */
		labels?: CardLabelProp[];

		/**
		 * Metadata for displaying deckbuilding choices (faction/option selection).
		 */
		metaDisplay?: DecodedMeta;

		/**
		 * If true, always show 1 quantity (ignore the quantity prop)
		 */
		hideQuantity?: boolean;
	}

	const {
		card,
		quantity,
		languageCode,
		maxQuantity,
		showCardName,
		greyedOutQuantity,
		localizationResolver,
		owner,
		labels,
		metaDisplay,
		hideQuantity
	}: Prop = $props();
	const fullSmallImagePath = $derived(getCardImagePath(card.code, 'full-small', languageCode));
	const backSmallImagePath = $derived(getCardBackImagePath(card, 'full-small', languageCode));
	const textColorClass = $derived(getCardColorClass(card));
	const effectiveQuantity = $derived(hideQuantity ? 1 : (quantity ?? 1));
	const effectiveMaxQuantity = $derived(maxQuantity ?? quantity ?? 1);
	const effectiveGreyedOut = $derived(greyedOutQuantity ?? 0);
	const baseCardStackPadding = 16;

	const limitStackingQuantity = 3;
	// No matter how many cards, it could only take up equal to how 3 cards
	// are stacked with base padding.
	const cardStackPadding = $derived(
		effectiveQuantity <= limitStackingQuantity
			? baseCardStackPadding
			: (baseCardStackPadding * (limitStackingQuantity - 1)) / (effectiveQuantity - 1)
	);
	const cardStackMaxPadding = $derived(
		effectiveMaxQuantity <= limitStackingQuantity
			? baseCardStackPadding
			: (baseCardStackPadding * (limitStackingQuantity - 1)) / (effectiveMaxQuantity - 1)
	);
	const inverseIterationCount = $derived.by(() => {
		if (effectiveMaxQuantity > limitStackingQuantity) {
			if (effectiveQuantity <= limitStackingQuantity) {
				return limitStackingQuantity;
			} else {
				return effectiveQuantity;
			}
		} else {
			return effectiveMaxQuantity;
		}
	});

	const isHorizontalCard = $derived(cardUtility.isHorizontalCard(card));

	const verticalCardHeight = 168;
	// Add padding for each quantity needed above 1.
	const cardStackVerticalReserve = $derived(
		verticalCardHeight + cardStackMaxPadding * (effectiveMaxQuantity - 1)
	);
	const localizedCard = $derived(
		localizationResolver?.getLocalizedCard(card, languageCode) ?? card
	);
</script>

{#snippet oneCard(shadow: boolean, greyedOut: boolean, notFront: boolean)}
	{#if isHorizontalCard}
		<div class="horizontal-card-container">
			<img
				src={fullSmallImagePath}
				alt={card.name}
				style="transform: translateZ(0);"
				class={clsx(
					notFront && !greyedOut ? 'not-front' : '',
					shadow ? 'cast-shadow' : '',
					greyedOut ? 'brightness-40 grayscale' : '',
					'horizontal-card',
					'shadow'
				)}
			/>
			{#if backSmallImagePath}
				<img
					src={backSmallImagePath}
					alt={`${card.name} (back)`}
					style="transform: translateZ(0);"
					class={clsx(
						notFront && !greyedOut ? 'not-front' : '',
						shadow ? 'cast-shadow' : '',
						greyedOut ? 'brightness-40 grayscale' : '',
						'horizontal-card',
						'shadow'
					)}
				/>
			{/if}
		</div>
	{:else}
		<img
			src={fullSmallImagePath}
			alt={card.name}
			style="transform: translateZ(0);"
			class={clsx(
				notFront && !greyedOut ? 'not-front' : '',
				shadow ? 'cast-shadow' : '',
				greyedOut ? 'brightness-40 grayscale' : '',
				'fixed-size-card',
				'shadow'
			)}
		/>
	{/if}
{/snippet}

<div class="fixed-outer-width">
	<div style="height: {cardStackVerticalReserve}px; isolation: isolate;">
		{#each Array(inverseIterationCount) as _, i (i)}
			<!-- Cast shadow this copy if it just render a copy in previous iteration -->
			{@const shadow = i - 1 >= inverseIterationCount - effectiveQuantity}
			{@const renderIndex = i - (inverseIterationCount - effectiveQuantity)}
			{@const greyedOut = renderIndex < effectiveGreyedOut}
			{@const notFront = i < inverseIterationCount - 1}
			<div style="height: {cardStackPadding}px;">
				{#if i >= inverseIterationCount - effectiveQuantity}
					{@render oneCard(shadow, greyedOut, notFront)}
				{/if}
			</div>
		{/each}
	</div>
	{#if showCardName}
		<!-- Flex on this div is to position the entire thing in the center of display area. -->
		<div
			class={clsx(
				textColorClass,
				'name-below bg-primary-50/50  dark:bg-primary-950/50 mt-1 flex flex-col items-center justify-center gap-0.5 p-1 text-center'
			)}
		>
			<!-- Card name line -->
			<span class="inline">
				<span>{localizedCard.name}</span>
				<span class="pips">
					{#if card.xp}
						<LevelPips themed xp={card.xp} />
					{/if}
				</span>
				<span class="card-set-info-shift">
					<CardSetInfo {card} />
				</span>
			</span>
			<!-- Owner and labels line -->
			{#if owner}
				<span class="inline-block" style="font-size: 0.6rem;">
					<CardStrip card={owner} />
				</span>
			{/if}
			{#if metaDisplay}
				<span class="flex flex-wrap items-center justify-center gap-px">
					<DeckbuildingChoiceDisplay investigator={card} meta={metaDisplay} hideIcon />
				</span>
			{/if}
			{#if labels && labels.length > 0}
				<span class="flex flex-wrap items-center justify-center gap-px">
					{#if labels}
						{#each labels as label, idx (idx)}
							<CardLabel {label} />
						{/each}
					{/if}
				</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.fixed-outer-width {
		width: 120px;
	}

	.name-below {
		border-radius: 0px 0px 4px 4px;
		min-height: 2.5rem;
		font-size: 0.7rem;
		line-height: 1;
	}

	/* Applying this to img will stretch graphics to this size. To the outer div prevent text below from expanding the item. */
	.fixed-size-card {
		width: 120px;
		height: 168px;
		border-radius: 6px;
	}

	.horizontal-card-container {
		display: flex;
		flex-direction: column;
		gap: 0;
		align-items: center;
		justify-content: center;
		height: 168px;
	}

	.horizontal-card {
		width: 115px;
		height: 82px;
		border-radius: 6px;
	}

	.cast-shadow {
		box-shadow: 0px -4px 4px rgba(0, 0, 0, 0.5);
	}

	.not-front {
		filter: brightness(0.8);
	}

	.card-set-info-shift {
		/* 
		Card set info is an inline of small font size
		but here we want everything to flow as if they are the same font size. 
		It will appear bottom align in the line because line runs below.
		Shift up manually by half a line size making it as if it is vertically aligned in the line.
		*/
		display: inline-block;
		transform: translateY(-0.1em);
	}
</style>
