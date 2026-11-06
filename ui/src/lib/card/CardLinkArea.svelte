<!--
@component
Anything with card links in it, which are elements with the `card-link` class and a
`data-card-code`. Hovering one shows a CardScanFullSmall tooltip, with the card's text beside it
when there is any (and a CardLine instead of the scan on narrow screens); clicking it opens a
CardMagnifiedModal.
-->
<script lang="ts">
	import { type Card } from '@5argon/arkham-kohaku';
	import type { Snippet } from 'svelte';
	import HoverTooltip from '../container/HoverTooltip.svelte';
	import CardScanFullSmall from './CardScanFullSmall.svelte';
	import CardMagnifiedModal from './CardMagnifiedModal.svelte';
	import CardLine from './CardLine.svelte';
	import CardTextBlock from '../review/CardTextBlock.svelte';
	import type { CardTextHtml } from '../review/review-entry.js';

	interface Prop {
		resolveCard?: (code: string) => Card | undefined;
		/**
		 * The card's text to show next to it, when there is any.
		 */
		resolveText?: (code: string) => CardTextHtml | undefined;
		children: Snippet;
	}

	const { resolveCard, resolveText, children }: Prop = $props();

	let tooltipVisible = $state(false);
	let tooltipReferenceElement = $state<HTMLElement | null>(null);
	let hoveredCard = $state<Card | null>(null);
	const hoveredText = $derived(hoveredCard ? resolveText?.(hoveredCard.code) : undefined);

	let magnifiedCard = $state<Card | null>(null);
	let isModalShowing = $state(false);

	function getCardLinkAncestor(el: EventTarget | null): HTMLElement | null {
		let current = el as HTMLElement | null;
		while (current) {
			if (current.classList?.contains('card-link')) return current;
			current = current.parentElement;
		}
		return null;
	}

	function linkedCard(cardLink: HTMLElement): Card | undefined {
		const cardCode = cardLink.dataset.cardCode;
		return cardCode ? resolveCard?.(cardCode) : undefined;
	}

	function handleMouseOver(event: MouseEvent) {
		const cardLink = getCardLinkAncestor(event.target);
		if (!cardLink) return;
		const card = linkedCard(cardLink);
		if (!card) return;
		hoveredCard = card;
		tooltipReferenceElement = cardLink;
		tooltipVisible = true;
	}

	function handleMouseOut(event: MouseEvent) {
		const cardLink = getCardLinkAncestor(event.target);
		if (!cardLink) return;
		const relatedTarget = event.relatedTarget as HTMLElement | null;
		if (relatedTarget && cardLink.contains(relatedTarget)) return;
		// The card stays, so the tooltip animates out with what it showed.
		tooltipVisible = false;
	}

	function handleClick(event: MouseEvent) {
		const cardLink = getCardLinkAncestor(event.target);
		if (!cardLink) return;
		const card = linkedCard(cardLink);
		if (!card) return;
		tooltipVisible = false;
		magnifiedCard = card;
		isModalShowing = true;
	}

	function handleModalClose() {
		isModalShowing = false;
		magnifiedCard = null;
	}

	function handleBlur() {
		// The card stays, so the tooltip animates out with what it showed.
		tooltipVisible = false;
	}
</script>

<div
	onmouseover={handleMouseOver}
	onfocus={() => {}}
	onmouseout={handleMouseOut}
	onblur={handleBlur}
	onclick={handleClick}
	role="presentation"
>
	{@render children()}
</div>

<HoverTooltip visible={tooltipVisible} referenceElement={tooltipReferenceElement}>
	{#if hoveredCard}
		{#if hoveredText}
			<div class="flex max-w-[calc(100vw-1rem)] items-start gap-3 py-2">
				<div class="hidden shrink-0 sm:block">
					<CardScanFullSmall card={hoveredCard} />
				</div>
				<div class="w-72 max-w-full min-w-0">
					<div class="mb-2 sm:hidden">
						<CardLine card={hoveredCard} hideQuantity />
					</div>
					<CardTextBlock side={hoveredText.front} />
					{#if hoveredText.back}
						<div class="border-t border-neutral-400 pt-2 dark:border-neutral-600">
							<CardTextBlock side={hoveredText.back} />
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="p-1">
				<CardScanFullSmall card={hoveredCard} />
			</div>
		{/if}
	{/if}
</HoverTooltip>

<CardMagnifiedModal card={magnifiedCard} isShowing={isModalShowing} onClose={handleModalClose} />
