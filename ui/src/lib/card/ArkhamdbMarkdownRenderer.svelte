<!--
@component
Renders ArkhamDB markdown content (from deck descriptions, etc.) as HTML with inline game icons.
Hovering a card link shows a CardScanFullSmall tooltip; clicking it opens a CardMagnifiedModal.
-->
<script lang="ts">
	import { type CardResolver, type Card } from '@5argon/arkham-kohaku';
	import { markdownToHtml } from './markdown-processor.js';
	import './deck-description.css';
	import HoverTooltip from '../container/HoverTooltip.svelte';
	import CardScanFullSmall from './CardScanFullSmall.svelte';
	import CardMagnifiedModal from './CardMagnifiedModal.svelte';

	interface Prop {
		descriptionMd: string;
		cardResolver?: CardResolver;
	}

	const { descriptionMd, cardResolver }: Prop = $props();

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

<HoverTooltip visible={tooltipVisible} referenceElement={tooltipReferenceElement}>
	{#if hoveredCard}
    <div class="p-1">
		<CardScanFullSmall card={hoveredCard} />
    </div>
	{/if}
</HoverTooltip>

<CardMagnifiedModal card={magnifiedCard} isShowing={isModalShowing} onClose={handleModalClose} />
