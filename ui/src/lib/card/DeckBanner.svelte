<!--
@component
Block element with fixed height that display some overall information about the deck.
-->
<script lang="ts">
	import {
		Product,
		type Card,
		type Deck,
		type LocalizationResolver,
		deck as deckUtility,
		CardResolver
	} from '@5argon/arkham-kohaku';
	import CardLine from './CardLine.svelte';
	import { getCardColorClassBackground, getCardColorClassBorder } from './coloring.js';
	import clsx from 'clsx';
	import HealthSanity from './HealthSanity.svelte';
	import ImageIconCommit from './ImageIconCommit.svelte';
	import DeckXpTimeline from './DeckXpTimeline.svelte';
	import DeckBannerSecondColumn from './DeckBannerSecondColumn.svelte';
	import * as m from '../paraglide/messages.js';
	import DeckSpecificInformation from './DeckSpecificInformation.svelte';
	import CardLineHoverTooltip from './CardLineHoverTooltip.svelte';
	import { createTooltipState } from '../utility/tooltip-state.svelte.js';
	import { resolve } from '$app/paths';
	import { getCardImagePath } from '../utility/image';
	interface Prop {
		/**
		 * This deck supports an entire history chain stored within one variable.
		 */
		deck: Deck;

		/**
		 * Default mode : campaign.
		 * campaign: Show the latest deck with XP timeline leading to this point.
		 * decklist: Preview card includes side deck and has space for short text excerpt.
		 */
		mode?: 'campaign' | 'decklist';

		/**
		 * Optional click handler for the deck name.
		 * Can be either a callback function or a string URL.
		 * If string, wraps the deck name in an <a> tag.
		 */
		onClick?: (() => void) | string;

		cardResolver: CardResolver;

		localizationResolver?: LocalizationResolver;
		languageCode?: string;

		/**
		 * If true, shows only the deck name and investigator info in a compact format.
		 */
		small?: boolean;
		/**
		 * If true, hides the colored title bar with deck name.
		 */
		hideTitle?: boolean;
		/**
		 * If true, renders the first column content horizontally instead of vertically.
		 * Only works together with `small` prop.
		 */
		smallSingleLine?: boolean;
	}
	const {
		deck,
		localizationResolver,
		languageCode,
		mode,
		onClick,
		cardResolver,
		small = false,
		hideTitle = false,
		smallSingleLine = false
	}: Prop = $props();

	// Generate unique ID for this component instance to avoid SVG mask ID collisions
	const uniqueId = `mask-${Math.random().toString(36).substring(2, 11)}`;
	const fadeGradientId = `fade-${uniqueId}`;
	const maskId = `mask-${uniqueId}`;

	const forwardResult = $derived.by(() => {
		const latestDeck = mode === 'campaign' ? deckUtility.forwardToLatest(deck) : deck;
		const forwarded = deckUtility.forwardDefault(latestDeck, cardResolver);
		return forwarded;
	});
	const deckLatestForwarded = $derived(forwardResult.deck);

	const borderColorClass = $derived(getCardColorClassBorder(deckLatestForwarded.investigator));
	const bgColorClass = $derived(
		getCardColorClassBackground(deckLatestForwarded.investigator.cardClass)
	);

	const frontInvestigator = $derived(
		deckLatestForwarded.meta.alternateFront ?? deckLatestForwarded.investigator
	);
	const backInvestigator = $derived.by(() => {
		if (deckLatestForwarded.meta.alternateFront) {
			// If front is an alt, always show the back regardless of it staying the same or not.
			return deckLatestForwarded.meta.alternateBack ?? deckLatestForwarded.investigator;
		} else {
			// If front is not an alt, back is hidden.
			return deckLatestForwarded.meta.alternateBack;
		}
	});
	const isParallelFront = $derived(frontInvestigator.product === Product.ParallelInvestigators);
	const isParallelBack = $derived(
		backInvestigator ? backInvestigator.product === Product.ParallelInvestigators : false
	);

	const allowSideDeck = $derived(mode === 'decklist' ? true : false);
	const squareBgPath = $derived(getCardImagePath(frontInvestigator.code, 'square'));
	const tooltip = createTooltipState<Card>();
</script>

{#snippet parallelIndicator(front: boolean, back: boolean)}
	{@const parallelFront = m.card_parallel_front()}
	{@const parallelBack = m.card_parallel_back()}
	{@const regularFront = m.card_regular_front()}
	{@const regularBack = m.card_regular_back()}
	{#if front || back}
		<div class="flex items-center justify-center text-center text-[0.5rem] leading-none">
			<div
				class={clsx(
					'cursor-default rounded-l px-1 py-0.5 select-none',
					front ? 'bg-primary-950 text-white' : 'bg-primary-200 text-black'
				)}
			>
				{front ? parallelFront : regularFront}
			</div>
			<div
				class={clsx(
					'cursor-default rounded-r px-1 py-0.5 select-none',
					back ? 'bg-primary-950 text-white' : 'bg-primary-200 text-black'
				)}
			>
				{back ? parallelBack : regularBack}
			</div>
		</div>
	{/if}
{/snippet}

{#snippet investigatorCardLine()}
	<div class="flex gap-1">
		<CardLine
			noReserveCardTypeIcon
			hideIcons
			card={frontInvestigator}
			{localizationResolver}
			{languageCode}
			meta={deckLatestForwarded.meta}
		/>
		{#if backInvestigator && backInvestigator.code !== frontInvestigator.code && backInvestigator.product !== frontInvestigator.product}
			<CardLine
				hideName
				hideStrip
				hideIcons
				card={backInvestigator}
				{localizationResolver}
				{languageCode}
				meta={deckLatestForwarded.meta}
			/>
		{/if}
	</div>
{/snippet}

<svg width="0" height="0">
	<defs>
		<linearGradient id={fadeGradientId}>
			<stop offset="0%" style="stop-color: white; stop-opacity: 1" />
			<stop offset="100%" style="stop-color: white; stop-opacity: 0" />
		</linearGradient>
		<mask id={maskId} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
			<rect width="1" height="1" fill="url(#{fadeGradientId})" />
		</mask>
	</defs>
</svg>

<div
	class={clsx(
		!(small && smallSingleLine) && 'w-[330px] md:w-[550px]',
		'relative border bg-white/50 shadow-lg dark:bg-black/30',
		borderColorClass,
		small && 'md:w-auto'
	)}
>
	{#if !hideTitle}
		<div
			class={clsx(
				'line-clamp-2 flex h-12 items-center justify-center px-2 text-center text-left text-xs text-ellipsis text-black md:line-clamp-1 md:h-6 md:justify-start md:text-base dark:text-white',
				bgColorClass,
				onClick && 'cursor-pointer transition-opacity hover:opacity-80'
			)}
			role={onClick && typeof onClick === 'function' ? 'button' : undefined}
			tabindex={onClick && typeof onClick === 'function' ? 0 : undefined}
			onclick={onClick && typeof onClick === 'function' ? onClick : undefined}
			onkeydown={onClick && typeof onClick === 'function'
				? (e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							onClick();
						}
					}
				: undefined}
		>
			{#if onClick && typeof onClick === 'string'}
				<a href={resolve(onClick, {})} class="block w-full">{deckLatestForwarded.name}</a>
			{:else}
				{deckLatestForwarded.name}
			{/if}
		</div>
	{/if}

	{#if !small}
		<div class="relative">
			<div class="absolute">
				<img
					class="h-48 opacity-40 md:h-32"
					src={squareBgPath}
					alt={frontInvestigator.name}
					style="mask: url(#{maskId}); filter: grayscale(100%);"
				/>
				<div
					class="bg-primary-500 absolute inset-0 h-48 md:h-32"
					style="mask: url(#{maskId}); mix-blend-mode: multiply; opacity: 0.4;"
				></div>
			</div>
			<div
				class="relative flex h-48 flex-col justify-center gap-2 p-2 md:h-32 md:flex-row md:justify-evenly"
			>
				<!-- First Column -->
				<div class={clsx('flex flex-col items-center justify-center gap-0.5 md:basis-[280px]')}>
					{@render investigatorCardLine()}
					<div>
						<span>{@render parallelIndicator(isParallelFront, isParallelBack)}</span>
					</div>
					<div class="flex items-center gap-2">
						<span
							><HealthSanity health={frontInvestigator.health} sanity={frontInvestigator.sanity} />
						</span>
						<span><ImageIconCommit card={frontInvestigator} /></span>
					</div>
					<div>
						<DeckSpecificInformation
							deck={deckLatestForwarded}
							onCardHover={tooltip.show}
							onCardLeave={tooltip.hide}
						/>
					</div>
				</div>
				<!-- Second Column -->
				<DeckBannerSecondColumn
					deck={deckLatestForwarded}
					{allowSideDeck}
					onCardHover={tooltip.show}
					onCardLeave={tooltip.hide}
				/>
			</div>
		</div>
		{#if mode !== 'decklist'}
			<div class={clsx('border-t-primary-400/20 h-8 border-t bg-white/20 dark:bg-black/20')}>
				<DeckXpTimeline deck={deckLatestForwarded} />
			</div>
		{/if}
	{:else}
		<!-- Small mode: Only show investigator CardLine -->
		<div
			class={clsx(
				'px-3 py-1',
				smallSingleLine ? 'flex-row' : 'flex-col',
				'flex items-center justify-center gap-1'
			)}
		>
			<div class="flex justify-center gap-1">
				{@render investigatorCardLine()}
				{@render parallelIndicator(isParallelFront, isParallelBack)}
			</div>
			<div class="flex items-center justify-center gap-2">
				<span
					><HealthSanity health={frontInvestigator.health} sanity={frontInvestigator.sanity} />
				</span>
				<span class="hidden md:block"><ImageIconCommit card={frontInvestigator} /></span>
				<div>
					<DeckSpecificInformation
						onlyDeckbuildingChoices
						deck={deckLatestForwarded}
						onCardHover={tooltip.show}
						onCardLeave={tooltip.hide}
					/>
				</div>
			</div>
		</div>
	{/if}
</div>

{#if tooltip.data}
	<CardLineHoverTooltip
		card={tooltip.data}
		{localizationResolver}
		{languageCode}
		visible={tooltip.visible}
		referenceElement={tooltip.referenceElement}
	/>
{/if}
