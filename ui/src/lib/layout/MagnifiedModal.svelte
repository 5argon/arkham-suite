<!--
@component
A full-screen modal with a black translucent background that can show any content.
Clicking the overlay or pressing Escape closes the modal.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Prop {
		isShowing: boolean;
		onClose: () => void;
		children: Snippet;
	}

	const { isShowing, onClose, children }: Prop = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isShowing) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isShowing}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
		onclick={onClose}
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				onClose();
			}
		}}
		in:fade={{ duration: 70 }}
		out:fade={{ duration: 40 }}
	>
		{@render children()}
	</div>
{/if}
