<!--
@component
Renders ArkhamDB markdown content (from deck descriptions, etc.) as HTML with inline game icons.
Hovering a card link shows a CardScanFullSmall tooltip; clicking it opens a CardMagnifiedModal.
-->
<script lang="ts">
	import { type CardResolver, type Card } from '@5argon/arkham-kohaku';
	import { markdownToHtml } from './markdown-processor.js';
	import CardLinkedHtml from './CardLinkedHtml.svelte';
	import type { CardTextHtml } from '../review/review-entry.js';

	interface Prop {
		descriptionMd: string;
		cardResolver?: CardResolver;
		/**
		 * The text of a linked card, shown when hovering it, when the page has it.
		 */
		resolveText?: (code: string) => CardTextHtml | undefined;
	}

	const { descriptionMd, cardResolver, resolveText }: Prop = $props();

	const processedHtml = $derived(markdownToHtml(descriptionMd, cardResolver));

	function resolveCard(code: string): Card | undefined {
		try {
			return cardResolver?.resolve(code);
		} catch {
			return undefined;
		}
	}
</script>

<CardLinkedHtml html={processedHtml} {resolveCard} {resolveText} />
