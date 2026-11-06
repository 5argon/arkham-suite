<!--
@component
Renders ArkhamDB markdown content (from deck descriptions, etc.) as HTML with inline game icons.
Hovering a card link shows a CardScanFullSmall tooltip; clicking it opens a CardMagnifiedModal.
-->
<script lang="ts">
	import { type CardResolver, type Card } from '@5argon/arkham-kohaku';
	import { markdownToHtml } from './markdown-processor.js';
	import CardLinkedHtml from './CardLinkedHtml.svelte';

	interface Prop {
		descriptionMd: string;
		cardResolver?: CardResolver;
	}

	const { descriptionMd, cardResolver }: Prop = $props();

	const processedHtml = $derived(markdownToHtml(descriptionMd, cardResolver));

	function resolveCard(code: string): Card | undefined {
		try {
			return cardResolver?.resolve(code);
		} catch {
			return undefined;
		}
	}
</script>

<CardLinkedHtml html={processedHtml} {resolveCard} />
