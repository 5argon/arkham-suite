<!--
@component
Width-parameterized card scan stacked by quantity, for dense boards where many
stacks must fit at once (e.g. drafting a whole collection). Same stacking
visuals as CardScanFullSmall but with every dimension derived from `width`,
no name block, and lazy-loaded images.
-->
<script lang="ts">
	import { ProductIcon } from '@5argon/arkham-icon';
	import type { Card } from '@5argon/arkham-kohaku';
	import { card as cardUtility } from '@5argon/arkham-kohaku';
	import clsx from 'clsx';

	import { getCardBackImagePath, getCardImagePath } from '../utility/image.js';
	import { computeStackLayout } from './card-stack-layout.js';

	interface Prop {
		card: Card;
		/**
		 * Card width in px; height and stack spacing keep CardScanFullSmall's
		 * 120x168 proportions.
		 */
		width?: number;
		quantity?: number;

		/**
		 * Reserve height for this many quantity so a grid row stays aligned.
		 */
		maxQuantity?: number;

		/**
		 * How many copies should be greyed out, from the back of the stack.
		 */
		greyedOutQuantity?: number;

		/**
		 * Darken the entire stack (e.g. a depleted collection stack showing its
		 * last placeholder copy).
		 */
		dimmed?: boolean;

		/**
		 * Copy count shown as "×n" in the bottom-left corner. When set, the
		 * card's product icon also shows in the bottom-right corner so beginners
		 * can tell which box a card came from.
		 */
		badge?: number;

		/**
		 * If true, always show 1 quantity (ignore the quantity prop).
		 */
		hideQuantity?: boolean;

		languageCode?: string;

		/**
		 * Eager-load images instead of the default lazy loading.
		 */
		eager?: boolean;

		/**
		 * Hover highlight for stacks that respond to click/drag.
		 */
		interactive?: boolean;
	}

	const {
		card,
		width = 72,
		quantity,
		maxQuantity,
		greyedOutQuantity,
		dimmed,
		badge,
		hideQuantity,
		languageCode,
		eager,
		interactive
	}: Prop = $props();

	const fullSmallImagePath = $derived(getCardImagePath(card.code, 'full-small', languageCode));
	const backSmallImagePath = $derived(getCardBackImagePath(card, 'full-small', languageCode));
	const effectiveQuantity = $derived(hideQuantity ? 1 : (quantity ?? 1));
	const effectiveMaxQuantity = $derived(hideQuantity ? 1 : (maxQuantity ?? quantity ?? 1));
	const effectiveGreyedOut = $derived(greyedOutQuantity ?? 0);
	const layout = $derived(computeStackLayout(width, effectiveQuantity, effectiveMaxQuantity));
	const isHorizontalCard = $derived(cardUtility.isHorizontalCard(card));
	const loading = $derived(eager ? 'eager' : 'lazy');
</script>

{#snippet oneCard(shadow: boolean, greyedOut: boolean, notFront: boolean)}
	{#if isHorizontalCard}
		<div class="horizontal-card-container" style:height="{layout.cardHeight}px">
			<img
				src={fullSmallImagePath}
				alt={card.name}
				draggable="false"
				{loading}
				decoding="async"
				style:width="{layout.horizontalCardWidth}px"
				style:height="{layout.horizontalCardHeight}px"
				style:border-radius="{layout.borderRadius}px"
				class={clsx(
					notFront && !greyedOut && !dimmed ? 'not-front' : '',
					shadow ? 'cast-shadow' : '',
					greyedOut || dimmed ? 'brightness-40 grayscale' : '',
					'shadow'
				)}
			/>
			{#if backSmallImagePath}
				<img
					src={backSmallImagePath}
					alt={`${card.name} (back)`}
					draggable="false"
					{loading}
					decoding="async"
					style:width="{layout.horizontalCardWidth}px"
					style:height="{layout.horizontalCardHeight}px"
					style:border-radius="{layout.borderRadius}px"
					class={clsx(
						notFront && !greyedOut && !dimmed ? 'not-front' : '',
						shadow ? 'cast-shadow' : '',
						greyedOut || dimmed ? 'brightness-40 grayscale' : '',
						'shadow'
					)}
				/>
			{/if}
		</div>
	{:else}
		<img
			src={fullSmallImagePath}
			alt={card.name}
			draggable="false"
			{loading}
			decoding="async"
			style:width="{layout.cardWidth}px"
			style:height="{layout.cardHeight}px"
			style:border-radius="{layout.borderRadius}px"
			class={clsx(
				notFront && !greyedOut && !dimmed ? 'not-front' : '',
				shadow ? 'cast-shadow' : '',
				greyedOut || dimmed ? 'brightness-40 grayscale' : '',
				'shadow'
			)}
		/>
	{/if}
{/snippet}

<div class={clsx('relative select-none', interactive && 'interactive')} style:width="{width}px">
	<!-- Copies are positioned explicitly (offset and z-order by index) so the
	     front copy always sits lowest and on top, whatever the surroundings. -->
	<div class="reserve" style:height="{layout.verticalReserve}px">
		{#each Array(layout.iterationCount) as _, i (i)}
			<!-- Cast shadow on this copy if the previous iteration rendered a copy behind it -->
			{@const shadow = i - 1 >= layout.iterationCount - effectiveQuantity}
			{@const renderIndex = i - (layout.iterationCount - effectiveQuantity)}
			{@const greyedOut = renderIndex < effectiveGreyedOut}
			{@const notFront = i < layout.iterationCount - 1}
			{#if i >= layout.iterationCount - effectiveQuantity}
				<div class="copy" style:top="{i * layout.stackPadding}px" style:z-index={i}>
					{@render oneCard(shadow, greyedOut, notFront)}
				</div>
			{/if}
		{/each}
	</div>
	{#if badge !== undefined}
		<div
			class={clsx(
				'badge absolute bottom-0 left-0 rounded-tr px-1 font-bold text-white',
				dimmed ? 'bg-black/60' : 'bg-black/80'
			)}
		>
			×{badge}
		</div>
		<div
			class={clsx(
				'badge set-badge absolute right-0 bottom-0 flex items-center rounded-tl px-1 text-white',
				dimmed ? 'bg-black/60' : 'bg-black/80'
			)}
		>
			<ProductIcon product={card.product} />
		</div>
	{/if}
</div>

<style>
	.reserve {
		position: relative;
		isolation: isolate;
	}

	.copy {
		position: absolute;
		left: 0;
	}

	.cast-shadow {
		box-shadow: 0px -4px 4px rgba(0, 0, 0, 0.5);
	}

	.not-front {
		filter: brightness(0.8);
	}

	.horizontal-card-container {
		display: flex;
		flex-direction: column;
		gap: 0;
		align-items: center;
		justify-content: center;
	}

	.badge {
		font-size: 0.6rem;
		line-height: 1.1rem;
		z-index: 1;
	}

	.interactive {
		cursor: pointer;
	}

	/* Hover brightens the copies themselves rather than filtering the whole
	   container: a container filter toggling on hover makes Safari re-layer
	   the stack and can flip the copies' paint order. */
	.interactive:hover .copy img {
		filter: brightness(1.1);
	}

	.interactive:hover .copy img.not-front {
		filter: brightness(0.9);
	}
</style>
