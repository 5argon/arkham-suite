<!--
@component
Generic modal with dark overlay that can be closed with Escape or clicking the overlay.
-->
<script lang="ts">
	import { lockPageScroll } from '../utility/scroll-lock.js';
	import type { Snippet } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import Button from '../button/Button.svelte';
	import * as m from '../paraglide/messages.js';

	interface Prop {
		isOpen: boolean;
		onClose: () => void;
		children: Snippet;
		footer?: Snippet;
		disableOverlayClose?: boolean;
		maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		title?: string;
	}

	const {
		isOpen,
		onClose,
		children,
		footer,
		disableOverlayClose = false,
		maxWidth = 'md',
		title
	}: Prop = $props();

	const maxWidthClass = $derived(
		maxWidth === 'sm'
			? 'max-w-md'
			: maxWidth === 'md'
				? 'max-w-2xl'
				: maxWidth === 'lg'
					? 'max-w-4xl'
					: maxWidth === 'xl'
						? 'max-w-6xl'
						: 'max-w-[95vw]'
	);

	let modalElement: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (isOpen && modalElement) {
			modalElement.focus();
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (!disableOverlayClose && e.key === 'Escape') {
			// A modal opened from inside another closes on its own.
			e.stopPropagation();
			onClose();
		}
	}

	/** A drag that starts inside the dialog, like selecting text, and ends on the overlay still clicks
	 *  the overlay, so only a press that began on it closes the modal. */
	let pressedOverlay = false;

	function handleOverlayPointerDown(e: PointerEvent) {
		pressedOverlay = e.target === e.currentTarget;
	}

	function handleOverlayClick(e: MouseEvent) {
		if (!disableOverlayClose && pressedOverlay && e.target === e.currentTarget) {
			onClose();
		}
		pressedOverlay = false;
	}
</script>

{#if isOpen}
	<div
		bind:this={modalElement}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 [--page-text-inset:0px]"
		{@attach lockPageScroll}
		transition:fade={{ duration: 200 }}
		onpointerdown={handleOverlayPointerDown}
		onclick={handleOverlayClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div
			class="bg-primary-100 dark:bg-primary-900 relative flex max-h-[90vh] w-full flex-col rounded-lg shadow-xl {maxWidthClass}"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<div class="absolute top-2 right-2 z-10">
				<Button label={m.button_close()} hideLabel onClick={onClose} icon={FaIconType.Clear} />
			</div>

			{#if title}
				<h3 class="text-secondary-900 dark:text-secondary-100 px-6 pt-6 pb-2 text-xl">
					{title}
				</h3>
			{/if}

			<div class="flex-1 overflow-y-auto px-6 pb-6 {title ? 'pt-2' : 'pt-6'}">
				{@render children()}
			</div>

			{#if footer}
				<div class="border-primary-300 dark:border-primary-700 mt-2 border-t px-6 py-4">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	h3 {
		font-family: 'Heading';
	}
</style>
