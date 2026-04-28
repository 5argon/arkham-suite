<script lang="ts">
	import { type CardResolver, type Card } from '@5argon/arkham-kohaku';
	import Button from '../button/Button.svelte';
	import * as m from '../paraglide/messages.js';
	import { markdownToHtml } from './markdown-processor.js';
	import './deck-description.css';
	import HoverTooltip from '../container/HoverTooltip.svelte';
	import CardScanFullSmall from './CardScanFullSmall.svelte';
	import CardMagnifiedModal from './CardMagnifiedModal.svelte';

	interface Prop {
		descriptionMd: string;
		cardResolver?: CardResolver;
		onClose: () => void;
	}

	const { descriptionMd, cardResolver, onClose }: Prop = $props();

	// Process the description markdown into HTML with inline icons
	const processedHtml = $derived(markdownToHtml(descriptionMd, cardResolver));

	let tooltipVisible = $state(false);
	let tooltipReferenceElement = $state<HTMLElement | null>(null);
	let hoveredCard = $state<Card | null>(null);

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

	function handleMouseOver(event: MouseEvent) {
		if (!cardResolver) return;
		const cardLink = getCardLinkAncestor(event.target);
		if (!cardLink) return;
		const cardCode = cardLink.dataset.cardCode;
		if (!cardCode) return;
		try {
			const card = cardResolver.resolve(cardCode);
			hoveredCard = card;
			tooltipReferenceElement = cardLink;
			tooltipVisible = true;
		} catch {
			// card not found
		}
	}

	function handleMouseOut(event: MouseEvent) {
		const cardLink = getCardLinkAncestor(event.target);
		if (!cardLink) return;
		const relatedTarget = event.relatedTarget as HTMLElement | null;
		if (relatedTarget && cardLink.contains(relatedTarget)) return;
		tooltipVisible = false;
		hoveredCard = null;
		tooltipReferenceElement = null;
	}

	function handleClick(event: MouseEvent) {
		if (!cardResolver) return;
		const cardLink = getCardLinkAncestor(event.target);
		if (!cardLink) return;
		const cardCode = cardLink.dataset.cardCode;
		if (!cardCode) return;
		try {
			const card = cardResolver.resolve(cardCode);
			tooltipVisible = false;
			magnifiedCard = card;
			isModalShowing = true;
		} catch {
			// card not found
		}
	}

	function handleModalClose() {
		isModalShowing = false;
		magnifiedCard = null;
	}

	function handleBlur() {
		tooltipVisible = false;
		hoveredCard = null;
		tooltipReferenceElement = null;
	}
</script>

<div class="flex h-full flex-col">
	<!-- Header with close button -->
	<div
		class="bg-primary-200 dark:bg-primary-800 border-primary-300 dark:border-primary-700 flex items-center justify-between border-b px-4 py-3"
	>
		<h2 class="text-primary-900 dark:text-primary-100 text-lg font-semibold">
			{m.card_deck_description()}
		</h2>
		<Button label={m.card_close_description()} onClick={onClose} />
	</div>

	<!-- Description content -->
	<div class="flex-1 overflow-y-auto p-6 bg-primary-50/40 dark:bg-primary-950/40">
		<div
			class="prose dark:prose-invert description-content max-w-none"
			onmouseover={handleMouseOver}
			onfocus={() => {}}
			onmouseout={handleMouseOut}
			onblur={handleBlur}
			onclick={handleClick}
			role="presentation"
		>
			{@html processedHtml}
		</div>
	</div>
</div>

<HoverTooltip visible={tooltipVisible} referenceElement={tooltipReferenceElement}>
	{#if hoveredCard}
		<CardScanFullSmall card={hoveredCard} />
	{/if}
</HoverTooltip>

<CardMagnifiedModal card={magnifiedCard} isShowing={isModalShowing} onClose={handleModalClose} />