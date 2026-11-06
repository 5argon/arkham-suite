<!--
@component
Someone's picture: a card's art, an image of their own, or the first letter of their name.
-->
<script lang="ts">
	import clsx from 'clsx';

	import CardCircle from '../card/CardCircle.svelte';
	import type { ReviewPerson } from './review-entry.js';

	interface Prop {
		person: ReviewPerson;
		/**
		 * Default `xs`.
		 */
		size?: 'xs' | 'sm' | 'md';
	}
	const { person, size = 'xs' }: Prop = $props();
	const sizeClass = $derived(
		{ xs: 'h-5 w-5 text-xs', sm: 'h-7 w-7 text-sm', md: 'h-10 w-10 text-base' }[size]
	);
</script>

{#if person.avatarCard}
	<CardCircle card={person.avatarCard} {size} />
{:else if person.avatarUrl}
	<img
		alt={person.name}
		class={clsx('shrink-0 rounded-full object-cover', sizeClass)}
		src={person.avatarUrl}
	/>
{:else}
	<span
		class={clsx(
			'bg-primary-300 text-primary-900 dark:bg-primary-700 dark:text-primary-100 inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
			sizeClass
		)}
	>
		{person.name.slice(0, 1).toUpperCase()}
	</span>
{/if}
