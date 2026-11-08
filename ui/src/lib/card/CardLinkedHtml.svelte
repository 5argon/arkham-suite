<!--
@component
HTML with card links in it, made by the markdown processor. See CardLinkArea for what they do.
-->
<script lang="ts">
	import { type Card } from '@5argon/arkham-kohaku';
	import './deck-description.css';
	import CardLinkArea from './CardLinkArea.svelte';
	import TimingDiagram from '../rules/TimingDiagram.svelte';
	import { splitTimingDiagrams } from '../rules/timing.js';
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

	// Timing diagrams are drawn by a component, between the pieces of HTML around them.
	const segments = $derived(splitTimingDiagrams(html));
</script>

<CardLinkArea {resolveCard} {resolveText}>
	{#each segments as segment, i (i)}
		{#if segment.kind === 'html'}
			<div class="prose dark:prose-invert description-content max-w-none">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html segment.html}
			</div>
		{:else}
			<TimingDiagram timing={segment.timing} />
		{/if}
	{/each}
</CardLinkArea>
