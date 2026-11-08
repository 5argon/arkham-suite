<!--
@component
HTML with card links in it, made by the markdown processor. See CardLinkArea for what they do.
-->
<script lang="ts">
	import { type Card } from '@5argon/arkham-kohaku';
	import './deck-description.css';
	import CardLinkArea from './CardLinkArea.svelte';
	import type { CardTextHtml } from '../review/review-entry.js';

	interface Prop {
		html: string;
		resolveCard?: (code: string) => Card | undefined;
		/**
		 * The text of a linked card, shown when hovering it, when the page has it.
		 */
		resolveText?: (code: string) => CardTextHtml | undefined;
	}

	const { html, resolveCard, resolveText }: Prop = $props();
</script>

<CardLinkArea {resolveCard} {resolveText}>
	<div class="prose dark:prose-invert description-content max-w-none">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</div>
</CardLinkArea>
