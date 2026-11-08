<!--
@component
Block element with fixed height that display some overall information about the deck.
-->
<script lang="ts">
	import type { CardTextHtml } from '../review/review-entry.js';
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
	import { onMount } from 'svelte';

	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import ArkhamdbMarkdownRenderer from './ArkhamdbMarkdownRenderer.svelte';
	import DeckBannerSecondColumn from './DeckBannerSecondColumn.svelte';
	import * as m from '../paraglide/messages.js';
	import DeckSpecificInformation from './DeckSpecificInformation.svelte';
	import CardLineHoverTooltip from './CardLineHoverTooltip.svelte';
	import { createTooltipState } from '../utility/tooltip-state.svelte.js';
	import { resolve } from '$app/paths';
	import { getCardImagePath } from '../utility/image';
	import CardCircle from './CardCircle.svelte';
	import type { BylineEntry } from './byline.js';
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
		/**
		 * The text of a linked card, shown when hovering it, when the page has it.
		 */
		resolveText?: (code: string) => CardTextHtml | undefined;

		localizationResolver?: LocalizationResolver;
		languageCode?: string;

		/**
		 * Investigator stats at or above this value render emphasized.
		 */
		highlightStatsAtLeast?: number;
		/**
		 * Investigator stats at or below this value render dimmed.
		 */
		dimStatsAtMost?: number;
		/**
		 * Small attribution lines under the deck name (author, series, ...).
		 * Entries with an href render as internal links.
		 */
		byline?: BylineEntry[];
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
		/**
		 * If true, renders only the colored title and optional byline.
		 */
		headerOnly?: boolean;
		/**
		 * If true, fills the parent's width instead of a fixed width, so the parent must give it
		 * one (a shrink-to-fit parent collapses it). Only for the full banner, not `small` or
		 * `headerOnly`. The layout follows the banner's own width either way.
		 */
		fluid?: boolean;
	}
	const {
		deck,
		localizationResolver,
		languageCode,
		mode,
		onClick,
		cardResolver,
		resolveText,
		byline,
		highlightStatsAtLeast,
		dimStatsAtMost,
		small = false,
		hideTitle = false,
		smallSingleLine = false,
		headerOnly = false,
		fluid = false
	}: Prop = $props();
	const fullBanner = $derived(!headerOnly && !small);

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

	// The markdown sanitizer needs a DOM, so the excerpt renders after hydration.
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});
	const squareBgPath = $derived(getCardImagePath(frontInvestigator.code, 'square'));
	const tooltip = createTooltipState<Card>();
</script>

{#snippet bylineIcon(line: BylineEntry)}
	{#if line.iconCard}
		<CardCircle card={line.iconCard} shape={line.iconShape} size="xs" />
	{/if}
{/snippet}

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
		headerOnly
			? 'w-full'
			: fullBanner && fluid
				? 'w-full'
				: !(small && smallSingleLine) && 'w-[330px] md:w-[550px]',
		fullBanner && '@container',
		'relative border bg-white/50 shadow-lg dark:bg-black/30',
		borderColorClass,
		small && 'md:w-auto'
	)}
>
	{#if !hideTitle}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class={clsx(
				'flex items-center justify-center px-2 text-center text-ellipsis text-black dark:text-white',
				fullBanner
					? 'h-6 text-sm @min-[500px]:justify-start @min-[500px]:text-left @min-[500px]:text-base'
					: 'line-clamp-2 h-12 text-xs md:line-clamp-1 md:h-6 md:justify-start md:text-left md:text-base',
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
				<a
					href={resolve(onClick as any)}
					class={clsx('block w-full', fullBanner && 'truncate')}
					title={fullBanner ? deckLatestForwarded.name : undefined}>{deckLatestForwarded.name}</a
				>
			{:else if fullBanner}
				<span class="w-full truncate" title={deckLatestForwarded.name}
					>{deckLatestForwarded.name}</span
				>
			{:else}
				{deckLatestForwarded.name}
			{/if}
		</div>
		{#if byline && byline.length > 0}
			<div
				class={clsx(
					'flex flex-wrap items-center justify-center gap-x-1.5 px-2 pb-0.5 text-[0.65rem] leading-tight text-black/80 dark:text-white/80',
					fullBanner ? '@min-[500px]:justify-start' : 'md:justify-start',
					bgColorClass
				)}
			>
				{#each byline as line, i (i)}
					{#if i > 0}
						<span class="opacity-60" aria-hidden="true"
							><FaIcon icon={FaIconType.RightSingle} /></span
						>
					{/if}
					{#if line.href}
						<a
							class="inline-flex items-center gap-1 hover:underline"
							href={resolve(line.href as any)}>{@render bylineIcon(line)}{line.label}</a
						>
					{:else}
						<span class="inline-flex items-center gap-1"
							>{@render bylineIcon(line)}{line.label}</span
						>
					{/if}
				{/each}
			</div>
		{/if}
	{/if}

	{#if !headerOnly && !small}
		<div class="relative">
			<div class="absolute">
				<img
					class="h-48 opacity-40 @min-[500px]:h-32"
					src={squareBgPath}
					alt={frontInvestigator.name}
					style="mask: url(#{maskId}); filter: grayscale(100%);"
				/>
				<div
					class="bg-primary-500 absolute inset-0 h-48 @min-[500px]:h-32"
					style="mask: url(#{maskId}); mix-blend-mode: multiply; opacity: 0.4;"
				></div>
			</div>
			<div
				class="relative flex h-48 flex-col justify-center gap-2 p-2 @min-[500px]:h-32 @min-[500px]:flex-row @min-[500px]:justify-evenly"
			>
				<!-- First Column -->
				<div
					class={clsx(
						'flex flex-col items-center justify-center gap-0.5 @min-[500px]:basis-[280px]'
					)}
				>
					{@render investigatorCardLine()}
					<div>
						<span>{@render parallelIndicator(isParallelFront, isParallelBack)}</span>
					</div>
					<div class="flex items-center gap-2">
						<span
							><HealthSanity health={frontInvestigator.health} sanity={frontInvestigator.sanity} />
						</span>
						<span
							><ImageIconCommit
								card={frontInvestigator}
								highlightAtLeast={highlightStatsAtLeast}
								dimAtMost={dimStatsAtMost}
							/></span
						>
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
		{:else if deckLatestForwarded.meta.introMd}
			<!-- Always three text lines tall: longer excerpts clip with an ellipsis, shorter ones center. -->
			<div
				class="intro-md border-t-primary-400/20 flex h-[4.25rem] items-center border-t bg-white/20 px-3 text-sm leading-5 dark:bg-black/20"
			>
				{#if mounted}
					<div class="line-clamp-3 w-full">
						<ArkhamdbMarkdownRenderer
							descriptionMd={deckLatestForwarded.meta.introMd}
							{cardResolver}
							{resolveText}
						/>
					</div>
				{/if}
			</div>
		{/if}
	{:else if !headerOnly}
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
				<span class="hidden md:block"
					><ImageIconCommit
						card={frontInvestigator}
						highlightAtLeast={highlightStatsAtLeast}
						dimAtMost={dimStatsAtMost}
					/></span
				>
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

<CardLineHoverTooltip
	card={tooltip.data}
	{localizationResolver}
	{languageCode}
	visible={tooltip.visible}
	referenceElement={tooltip.referenceElement}
/>

<style>
	/* Excerpt block: keep the markdown compact inside the banner. */
	.intro-md :global(p) {
		margin: 0;
	}
</style>
