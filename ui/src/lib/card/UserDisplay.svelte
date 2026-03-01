<!--
@component
Compact inline display of a user: circular card avatar beside username.
Used wherever a user identity needs to be shown (profile preview, header, lists, etc.).

Pass either a full `Card` object (preferred) or just `iconCardCode` + the resolved card.
The `size` prop controls how large the circle and text appear.
-->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import CardCircle from '../card/CardCircle.svelte';

	interface Props {
		username: string;
		/** Resolved card object for the avatar. If null, shows a placeholder ring. */
		card: Card | null;
		/**
		 * - `sm`  – small avatar, small text (default for inline / header use)
		 * - `md`  – medium avatar, regular text (for lists)
		 * - `lg`  – large avatar, large text (for profile pages)
		 */
		size?: 'sm' | 'md' | 'lg';
		/**
		 * Renders the name in a muted, darker-primary tone to mark a guest — a
		 * frozen label for someone who isn't a managed roster member.
		 */
		guest?: boolean;
	}

	const { username, card, size = 'md', guest = false }: Props = $props();

	// Guests are intentionally lower-contrast (harder to read) so a managed
	// roster member always reads as the more prominent identity.
	const nameColor = $derived(
		guest ? 'text-primary-500 dark:text-primary-600' : 'text-primary-900 dark:text-primary-100'
	);

	const gapClass = $derived(size === 'sm' ? 'gap-1.5' : 'gap-3');

	const textClass = $derived(
		size === 'sm'
			? 'text-xs font-semibold'
			: size === 'lg'
				? 'text-xl font-bold'
				: 'text-sm font-semibold'
	);

	// For the lg variant we scale the CardCircle image container up a bit
	const circleWrapClass = $derived(size === 'lg' ? 'scale-[2] origin-center mx-4' : '');
</script>

<div class="flex items-center {gapClass}">
	{#if card}
		<span class={circleWrapClass}>
			<CardCircle {card} />
		</span>
	{:else}
		<div
			class="border-primary-400 dark:border-primary-600 h-8 w-8 rounded-full border-2 opacity-30"
		></div>
	{/if}
	<span class="{nameColor} {textClass}">{username}</span>
</div>
