<!--
@component
Generic modal with dark overlay that can be closed with Escape or clicking the overlay.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import Button from '../button/Button.svelte';

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
			onClose();
		}
	}

	function handleOverlayClick(e: MouseEvent) {
		if (!disableOverlayClose && e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

{#if isOpen}
	<div
		bind:this={modalElement}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		transition:fade={{ duration: 200 }}
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
			<div class="absolute right-2 top-2 z-10">
				<Button label="Close" hideLabel onClick={onClose} icon={FaIconType.Clear} />
			</div>

			{#if title}
				<h3 class="text-secondary-900 dark:text-secondary-100 px-6 pb-2 pt-6 text-xl">
					{title}
				</h3>
			{/if}

			<div class="flex-1 overflow-y-auto px-6 {title ? 'pt-2' : 'pt-6'}">
				{@render children()}
			</div>

			{#if footer}
				<div class="border-primary-300 dark:border-primary-700 border-t px-6 py-4 mt-2">
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
