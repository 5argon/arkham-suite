<!--
@component
Draggable/clickable wrapper around one CardScanFullTiny stack. All quantity
math and eligibility live in the parent; this only wires the DnD protocol and
the click fallback (the complete path on touch devices, where HTML5 DnD does
not exist).
-->
<script lang="ts">
	import { CardScanFullTiny } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';

	import { type DragSource, EvergreenDnd } from './dnd.svelte';

	interface Prop {
		card: Card;
		source: DragSource;
		dnd: EvergreenDnd;
		quantity: number;
		maxQuantity?: number;
		width?: number;
		dimmed?: boolean;
		badge?: number;
		draggable?: boolean;
		/**
		 * Copies one pickup would carry, shown as the drag ghost stack.
		 */
		dragCopies: number;
		onClick: (source: DragSource) => void;
		/**
		 * Hover in/out, for the card name tooltip (tiny scans are hard to read).
		 */
		onHover?: (card: Card, el: HTMLElement) => void;
		onHoverEnd?: () => void;
	}
	const {
		card,
		source,
		dnd,
		quantity,
		maxQuantity,
		width,
		dimmed,
		badge,
		draggable = true,
		dragCopies,
		onClick,
		onHover,
		onHoverEnd
	}: Prop = $props();

	let stackEl: HTMLDivElement;

	function handleDragStart(ev: DragEvent) {
		onHoverEnd?.();
		dnd.beginDrag(ev, source, stackEl, dragCopies);
	}
</script>

<div
	bind:this={stackEl}
	class="stack"
	class:draggable-stack={draggable && !dimmed}
	draggable={draggable && !dimmed}
	role="button"
	tabindex="0"
	ondragstart={handleDragStart}
	ondragend={() => dnd.endDrag()}
	onclick={() => onClick(source)}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onClick(source);
		}
	}}
	onmouseenter={() => onHover?.(card, stackEl)}
	onmouseleave={() => onHoverEnd?.()}
>
	<CardScanFullTiny {card} {quantity} {maxQuantity} {width} {dimmed} {badge} interactive />
</div>

<style>
	.stack {
		user-select: none;
		-webkit-user-select: none;
		cursor: pointer;
	}

	/* The tiny scan's own hover styling uses cursor: pointer; a draggable
	   stack should read as grabbable instead. */
	.draggable-stack,
	.draggable-stack :global(.interactive) {
		cursor: grab;
	}

	.draggable-stack:active,
	.draggable-stack:active :global(.interactive) {
		cursor: grabbing;
	}

	@media (pointer: coarse) {
		.stack,
		.draggable-stack,
		.draggable-stack :global(.interactive) {
			cursor: pointer;
		}
	}
</style>
