<!--
@component
Anything with card links in it, which are elements with the `card-link` class and a
`data-card-code`. Hovering one shows a CardScanFullSmall tooltip, with the card's text beside it
when there is any (and a CardLine instead of the scan on narrow screens); clicking it opens a
CardMagnifiedModal, unless the link is an `<a>` with somewhere to go.

A touch can't hover, so tapping a link shows the same tooltip and keeps it open, with a button that
does what clicking the link does. Tapping anywhere else closes it.
-->
<script lang="ts">
	import { type Card } from '@5argon/arkham-kohaku';
	import type { Snippet } from 'svelte';
	import HoverTooltip from '../container/HoverTooltip.svelte';
	import Button from '../button/Button.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import * as m from '../paraglide/messages.js';
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

	let area = $state<HTMLDivElement | null>(null);
	let tooltipVisible = $state(false);
	let tooltipReferenceElement = $state<HTMLElement | null>(null);
	let hoveredCard = $state<Card | null>(null);
	const hoveredText = $derived(hoveredCard ? resolveText?.(hoveredCard.code) : undefined);
	/**
	 * The link a touch tapped, whose tooltip stays open until tapping elsewhere.
	 */
	let tappedLink = $state<HTMLElement | null>(null);
	const tappedHref = $derived(tappedLink ? hrefOf(tappedLink) : undefined);
	/**
	 * What pressed down last, since a click doesn't say whether it was a tap.
	 */
	let pressedBy: string | undefined;

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

	/**
	 * Where the link goes, as written so the site's router still handles it.
	 */
	function hrefOf(cardLink: HTMLElement): string | undefined {
		if (!(cardLink instanceof HTMLAnchorElement)) return undefined;
		const href = cardLink.getAttribute('href');
		return href === null || href === '' ? undefined : href;
	}

	function showTooltip(cardLink: HTMLElement, card: Card) {
		hoveredCard = card;
		tooltipReferenceElement = cardLink;
		tooltipVisible = true;
	}

	function closeTapped() {
		tappedLink = null;
		// The card stays, so the tooltip animates out with what it showed.
		tooltipVisible = false;
	}

	function magnify(card: Card) {
		magnifiedCard = card;
		isModalShowing = true;
	}

	function handlePointerOver(event: PointerEvent) {
		if (event.pointerType === 'touch' || tappedLink !== null) return;
		const cardLink = getCardLinkAncestor(event.target);
		if (!cardLink) return;
		const card = linkedCard(cardLink);
		if (!card) return;
		showTooltip(cardLink, card);
	}

	function handlePointerOut(event: PointerEvent) {
		if (event.pointerType === 'touch' || tappedLink !== null) return;
		const cardLink = getCardLinkAncestor(event.target);
		if (!cardLink) return;
		const relatedTarget = event.relatedTarget as HTMLElement | null;
		if (relatedTarget && cardLink.contains(relatedTarget)) return;
		// The card stays, so the tooltip animates out with what it showed.
		tooltipVisible = false;
	}

	function handlePointerDown(event: PointerEvent) {
		pressedBy = event.pointerType;
	}

	function handleClick(event: MouseEvent) {
		const tapped = pressedBy === 'touch';
		// A key press clicks too, with nothing pressed down before it.
		pressedBy = undefined;
		const cardLink = getCardLinkAncestor(event.target);
		if (!cardLink) return;
		const card = linkedCard(cardLink);
		if (!card) return;
		if (tapped) {
			event.preventDefault();
			if (cardLink === tappedLink) {
				closeTapped();
				return;
			}
			tappedLink = cardLink;
			showTooltip(cardLink, card);
			return;
		}
		tooltipVisible = false;
		if (hrefOf(cardLink) !== undefined) return;
		magnify(card);
	}

	function handleDocumentPointerDown(event: PointerEvent) {
		if (tappedLink === null) return;
		const target = event.target as Element | null;
		if (target?.closest?.('[data-card-link-tapped]')) return;
		// Tapping a link here again is up to its click.
		if (area?.contains(target) && getCardLinkAncestor(target)) return;
		closeTapped();
	}

	function handleModalClose() {
		isModalShowing = false;
		magnifiedCard = null;
	}

	function handleBlur() {
		if (tappedLink !== null) return;
		// The card stays, so the tooltip animates out with what it showed.
		tooltipVisible = false;
	}
</script>

<svelte:document onpointerdown={handleDocumentPointerDown} />

<div
	bind:this={area}
	onpointerover={handlePointerOver}
	onfocus={() => {}}
	onpointerout={handlePointerOut}
	onpointerdown={handlePointerDown}
	onblur={handleBlur}
	onclick={handleClick}
	role="presentation"
>
	{@render children()}
</div>

{#snippet tappedAction(card: Card)}
	<!-- Closes on the way out, since the next page can be this same one with other cards. -->
	<div class="flex justify-end pt-2" onclick={closeTapped} role="presentation">
		{#if tappedHref !== undefined}
			<Button icon={FaIconType.RightSingle} label={m.card_link_go_to_card()} onClick={tappedHref} />
		{:else}
			<Button
				icon={FaIconType.Magnify}
				label={m.card_link_show_larger()}
				onClick={() => magnify(card)}
			/>
		{/if}
	</div>
{/snippet}

<HoverTooltip
	visible={tooltipVisible}
	referenceElement={tooltipReferenceElement}
	interactive={tappedLink !== null}
>
	{#if hoveredCard}
		<div data-card-link-tapped={tappedLink !== null || undefined}>
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
						{#if tappedLink !== null}
							{@render tappedAction(hoveredCard)}
						{/if}
					</div>
				</div>
			{:else}
				<div class="p-1">
					<CardScanFullSmall card={hoveredCard} />
					{#if tappedLink !== null}
						<div class="pb-1">
							{@render tappedAction(hoveredCard)}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</HoverTooltip>

<CardMagnifiedModal card={magnifiedCard} isShowing={isModalShowing} onClose={handleModalClose} />
