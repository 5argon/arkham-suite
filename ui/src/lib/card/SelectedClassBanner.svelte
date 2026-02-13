<script lang="ts">
	import { type CardClass } from '@5argon/arkham-kohaku';
	import { u } from '@5argon/arkham-string';
	import { getCardColorClassBackground } from './coloring.js';
	import clsx from 'clsx';
	import ImageIconClass from './ImageIconClass.svelte';

	interface Prop {
		/**
		 * The class to display. If undefined, uses primary color.
		 */
		cardClass?: CardClass;
		/**
		 * The text label to display. If not provided, uses the class name.
		 */
		label?: string;
		/**
		 * Hide the icon before the label.
		 */
		hideIcon?: boolean;
	}
	const { cardClass, label, hideIcon = false }: Prop = $props();

	const color = $derived(
		cardClass
			? getCardColorClassBackground({ class1: cardClass }, 'lighter')
			: 'bg-primary-100 dark:bg-primary-700'
	);
	const displayLabel = $derived(label ?? (cardClass ? u.cardClass(cardClass) : ''));
</script>

<div class="flex items-center gap-1">
	{#if !hideIcon && cardClass}
		<span><ImageIconClass {cardClass} /></span>
	{/if}
	<span class={clsx(color, 'rounded-sm px-1 text-[0.5rem]', 'text-black dark:text-white')}
		>{displayLabel}</span
	>
</div>
