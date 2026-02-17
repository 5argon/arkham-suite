<!--
@component
A generic tooltip that displays custom content inside a rounded frame with transitions.
-->
<script lang="ts">
	import clsx from 'clsx';
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';
	import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom';

	interface Prop {
		visible?: boolean;
		referenceElement?: HTMLElement | null;
		children?: Snippet;
	}

	const { visible = false, referenceElement, children }: Prop = $props();

	let floatingElement: HTMLDivElement | null = $state(null);
	let x = $state(0);
	let y = $state(0);

	// Update position when reference or floating element changes
	$effect(() => {
		if (!visible || !referenceElement || !floatingElement) {
			return;
		}

		// Use autoUpdate to handle scroll/resize/etc.
		const cleanup = autoUpdate(referenceElement, floatingElement, async () => {
			if (!referenceElement || !floatingElement) return;

			const { x: newX, y: newY } = await computePosition(referenceElement, floatingElement, {
				placement: 'top',
				middleware: [
					offset(8), // 8px gap between element and tooltip
					flip(), // Flip to bottom if not enough space on top
					shift({ padding: 8 }) // Shift horizontally if near viewport edge
				]
			});

			x = newX;
			y = newY;
		});

		return cleanup;
	});
</script>

{#if visible && referenceElement}
	<div
		bind:this={floatingElement}
		class={clsx(
			'pointer-events-none fixed z-50',
			'rounded-lg border border-neutral-400 bg-white/70 px-2 shadow-xl backdrop-blur-sm dark:border-neutral-600 dark:bg-black/70'
		)}
		style="left: {x}px; top: {y}px;"
		in:fly={{ y: 10, duration: 150 }}
		out:fly={{ y: 10, duration: 100 }}
	>
		{@render children?.()}
	</div>
{/if}
