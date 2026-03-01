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

	/**
	 * Move the floating node to `<body>` so it has NO containing-block ancestor — a
	 * `position: fixed` tooltip must resolve against the viewport, but any ancestor with
	 * a `transform`/`filter`/`backdrop-filter`/`contain` or a `container-type` (Tailwind
	 * `@container`) silently becomes its containing block and the tooltip mis-anchors.
	 * Rendered at the document root, it's immune to whatever wraps the trigger.
	 */
	function portalToBody(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	// Update position when reference or floating element changes
	$effect(() => {
		if (!visible || !referenceElement || !floatingElement) {
			return;
		}

		// Use autoUpdate to handle scroll/resize/etc.
		const cleanup = autoUpdate(referenceElement, floatingElement, async () => {
			if (!referenceElement || !floatingElement) return;

			const { x: newX, y: newY } = await computePosition(referenceElement, floatingElement, {
				// The floating node is `position: fixed`; match the strategy so floating-ui
				// resolves coordinates against the SAME containing block the browser uses for
				// fixed elements. Without this it defaults to 'absolute' and mis-anchors as soon
				// as an ancestor (a `transform`, or a Tailwind `@container` → container-type)
				// establishes a fixed-positioning containing block.
				strategy: 'fixed',
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
		use:portalToBody
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
