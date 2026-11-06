<!--
@component
The text of one side of a card, already made into HTML. Small enough to sit beside what's being read.
Icons come from the icon font every page loads.
-->
<script lang="ts">
	import * as m from '../paraglide/messages.js';
	import type { CardSideHtml } from './review-entry.js';

	interface Prop {
		side: CardSideHtml;
	}
	const { side }: Prop = $props();
</script>

{#snippet rules(html: string)}
	<div
		class="border-primary-400 dark:border-primary-500 text-primary-950 dark:text-primary-50 mb-2 border-l-2 pl-2 text-[0.8rem] leading-snug [&>p]:mb-1 [&>p:last-child]:mb-0"
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</div>
{/snippet}

<div>
	{#if side.traits}
		<p class="text-primary-900 dark:text-primary-100 mb-1 text-[0.8rem] font-semibold italic">
			{side.traits}
		</p>
	{/if}
	{#if side.text}
		{@render rules(side.text)}
	{/if}
	{#if side.customization}
		<p class="text-primary-900 dark:text-primary-100 mb-1 text-[0.8rem] font-semibold">
			{m.card_text_customization()}
		</p>
		{@render rules(side.customization)}
	{/if}
	{#if side.flavor}
		<div
			class="text-primary-800 dark:text-primary-200 mb-2 text-xs leading-snug italic [&>p]:mb-1 [&>p:last-child]:mb-0"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html side.flavor}
		</div>
	{/if}
</div>
