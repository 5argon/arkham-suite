<!--
@component
A full deck description reader that processes markdown with HTML,
replaces card links with colored text. Icons are rendered via webfont CSS.
-->
<script lang="ts">
	import { type CardResolver } from '@5argon/arkham-kohaku';
	import Button from '../button/Button.svelte';
	import * as m from '../paraglide/messages.js';
	import { markdownToHtml } from './markdown-processor.js';

	interface Prop {
		descriptionMd: string;
		cardResolver?: CardResolver;
		onClose: () => void;
	}

	const { descriptionMd, cardResolver, onClose }: Prop = $props();

	// Process the description markdown into HTML with inline icons
	const processedHtml = $derived(markdownToHtml(descriptionMd, cardResolver));
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
	<div class="flex-1 overflow-y-auto p-6">
		<div class="prose dark:prose-invert description-content max-w-none">
			{@html processedHtml}
		</div>
	</div>
</div>

<style>
    @reference "../../app.css";

	:global(.description-content) {
        @apply text-primary-900 text-sm;
	}

	:global(.dark .description-content) {
        @apply text-primary-100;
	}

	:global(.description-content p),
	:global(.description-content li),
	:global(.description-content th),
	:global(.description-content td),
	:global(.description-content span:not(.card-link)),
	:global(.description-content div) {
		@apply text-primary-900;
	}

	:global(.dark .description-content p),
	:global(.dark .description-content li),
	:global(.dark .description-content th),
	:global(.dark .description-content td),
	:global(.dark .description-content span:not(.card-link)),
	:global(.dark .description-content div) {
		@apply text-primary-100;
	}

	:global(.description-content .card-link) {
		@apply font-semibold underline decoration-dotted;
	}

	:global(.description-content h1) {
		@apply text-primary-900 mb-4 mt-6 text-2xl font-bold;
	}

	:global(.dark .description-content h1) {
		@apply text-primary-100;
	}

	:global(.description-content h2) {
		@apply text-primary-900 mb-3 mt-5 text-xl font-bold;
	}

	:global(.dark .description-content h2) {
		@apply text-primary-100;
	}

	:global(.description-content h3) {
		@apply text-primary-900 mb-2 mt-4 text-lg font-semibold;
	}

	:global(.dark .description-content h3) {
		@apply text-primary-100;
	}

	:global(.description-content p) {
		@apply mb-4;
	}

	:global(.description-content strong) {
		@apply text-primary-900 font-semibold;
	}

	:global(.dark .description-content strong) {
		@apply text-primary-100;
	}

	:global(.description-content em) {
		@apply text-primary-900 italic;
	}

	:global(.dark .description-content em) {
		@apply text-primary-100;
	}

	:global(.description-content a) {
		@apply text-secondary-600;
	}

	:global(.dark .description-content a) {
		@apply text-secondary-400;
	}

	:global(.description-content a:hover) {
		@apply underline;
	}

	:global(.description-content a img) {
		@apply block m-0;
	}

	:global(.description-content blockquote) {
		@apply border-l-4 border-primary-300 pl-4 my-4 text-primary-900 italic;
	}

	:global(.dark .description-content blockquote) {
		@apply border-primary-700 text-primary-100;
	}

	:global(.description-content code) {
		@apply bg-primary-100 px-1 py-0.5 rounded font-mono text-sm text-primary-900;
	}

	:global(.dark .description-content code) {
		@apply bg-primary-800 text-primary-100;
	}

	:global(.description-content pre) {
		@apply bg-primary-100 p-4 rounded-md overflow-x-auto my-4 text-primary-900;
	}

	:global(.dark .description-content pre) {
		@apply bg-primary-800 text-primary-100;
	}

	:global(.description-content pre code) {
		@apply bg-transparent p-0;
	}

	:global(.description-content ul) {
		@apply mb-4 ml-6 text-primary-900 list-disc;
	}

	:global(.description-content ol) {
		@apply mb-4 ml-6 text-primary-900 list-decimal;
	}

	:global(.dark .description-content ul),
	:global(.dark .description-content ol) {
		@apply text-primary-100;
	}

	:global(.description-content li) {
		@apply mb-1;
	}

	:global(.description-content table) {
		@apply mb-4 w-full border-collapse text-primary-900;
	}

	:global(.dark .description-content table) {
		@apply text-primary-100;
	}

	:global(.description-content th),
	:global(.description-content td) {
		@apply text-left;
	}

	:global(.description-content th) {
		@apply px-3 py-2 font-semibold;
	}

	:global(.description-content td) {
		@apply p-1;
	}

	:global(.description-content hr) {
		@apply border-primary-300 my-6;
	}

	:global(.dark .description-content hr) {
		@apply border-primary-700;
	}

	:global(.description-content img:not(.inline-icon)) {
		@apply my-4 mx-auto max-w-full rounded-md block;
	}

	:global(.description-content center) {
		@apply text-center;
	}

	:global(.description-content center span) {
		@apply text-inherit;
	}

	/* Icon font rendering - handled by icons-icon.css */
	:global(.description-content [class^="icon-"]),
	:global(.description-content [class*=" icon-"]) {
		@apply inline-block text-base align-text-bottom leading-none;
	}
</style>