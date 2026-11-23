<!--
@component
A full-screen modal with a black translucent background that can show any content.
Clicking the overlay or pressing Escape closes the modal. Clicks and keys inside an element marked
`data-magnified-keep-open` don't, so what's there can be read and pressed.
-->
<script lang="ts">
	import { lockPageScroll } from '../utility/scroll-lock.js';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Prop {
		isShowing: boolean;
		onClose: () => void;
		children: Snippet;
	}

	const { isShowing, onClose, children }: Prop = $props();

	// Checked rather than stopped inside, so a link there still reaches the router.
	function isKeptOpen(event: Event): boolean {
		return (
			event.target instanceof Element && event.target.closest('[data-magnified-keep-open]') !== null
		);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isShowing) {
			// Before it reaches a modal this one was opened from, which should stay open.
			event.stopPropagation();
			onClose();
		}
	}
</script>

<svelte:window onkeydowncapture={handleKeydown} />

{#if isShowing}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
		{@attach lockPageScroll}
		onclick={(event) => {
			if (!isKeptOpen(event)) onClose();
		}}
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			if ((e.key === 'Enter' || e.key === ' ') && !isKeptOpen(e)) {
				onClose();
			}
		}}
		in:fade={{ duration: 70 }}
		out:fade={{ duration: 40 }}
	>
		{@render children()}
	</div>
{/if}
