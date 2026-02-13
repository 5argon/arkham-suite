<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import { CardLine } from '@5argon/arkham-life-ui';

	interface Props {
		card?: Card | null;
		cardId: string;
		quantity?: number | null;
		dragDataPrefix?: string;
		disableHoverEffects?: boolean;
		onChangeHovering?: (h: boolean) => void;
		onDropSwap?: (fromIndex: number, fromRight: boolean, swapTo: string) => void;
		small: boolean;
		text?: string;
	}

	let {
		card = null,
		cardId,
		quantity = null,
		dragDataPrefix = '',
		disableHoverEffects = false,
		onChangeHovering = () => {},
		onDropSwap = () => {},
		small,
		text
	}: Props = $props();

	let hovering = $state(false);

	// Reset hovering state when drag effects are disabled
	$effect(() => {
		if (disableHoverEffects) {
			hovering = false;
			onChangeHovering(false);
		}
	});

	function dragLeaveHandler(e: DragEvent & { currentTarget: HTMLDivElement }) {
		if (disableHoverEffects) {
			return;
		}
		if (e.dataTransfer !== null) {
			hovering = false;
			onChangeHovering(false);
		}
	}

	function dragEnterHandler(e: DragEvent & { currentTarget: HTMLDivElement }) {
		if (disableHoverEffects) {
			return;
		}
		// Need to also cover the entering moment, just dragover is not enough.
		if (e.dataTransfer !== null) {
			hovering = true;
			onChangeHovering(true);
		}
	}

	function dragStartHandler(e: DragEvent & { currentTarget: HTMLDivElement }) {
		if (e.dataTransfer !== null) {
			e.dataTransfer.setData('text/plain', dragDataPrefix + cardId);
		}
	}

	function dragoverHandler(e: DragEvent & { currentTarget: HTMLDivElement }) {
		if (disableHoverEffects) {
			return;
		}
		// Prevent default on the event or above here will make the green + appear
		// on the cursor when dragging incompatible things over.
		e.preventDefault();
		if (e.dataTransfer !== null) {
			if (e.dataTransfer.types.length === 1 && e.dataTransfer.types[0] === 'text/plain') {
				// Apparently this allows dragging over the characters... lol
				hovering = true;
				e.dataTransfer.dropEffect = 'move';
			} else {
				e.dataTransfer.dropEffect = 'none';
			}
		}
	}

	function dropHandler(e: DragEvent & { currentTarget: HTMLDivElement }) {
		e.preventDefault();
		if (e.dataTransfer !== null) {
			hovering = false;
			const receive = e.dataTransfer.getData('text/plain').split(',');
			if (receive.length === 3) {
				// Expecting format "3,left/right,01234" (index, left/right, card ID)
				onDropSwap(parseInt(receive[0], 10), receive[1] === 'right', receive[2]);
			}
		}
	}

	function dragendHandler(e: DragEvent & { currentTarget: HTMLDivElement }) {
		e.preventDefault();
		hovering = false;
		onChangeHovering(false);
		if (e.dataTransfer !== null) {
			if (e.dataTransfer.dropEffect !== 'none') {
				// Do nothing, since swap at drop target will remove this one.
			}
		}
	}
</script>

<div
	class="block bg-primary-100 dark:bg-primary-900 border-primary-500 dark:border-primary-500 border rounded-sm overflow-x-hidden"
	class:hovering
	draggable={true}
	ondragend={dragendHandler}
	ondragenter={dragEnterHandler}
	ondragleave={dragLeaveHandler}
	ondragover={dragoverHandler}
	ondragstart={dragStartHandler}
	ondrop={dropHandler}
	role="button"
	tabindex="-1"
>
	{#if cardId === 'p'}
		<span class="text-primary-700 dark:text-primary-300">Placeholder</span>
	{:else if card}
		<CardLine
			{card}
			quantity={quantity ?? undefined}
			hideCardClassIcon
			hideIcons={small}
			hideCardTypeIcon
		/>
	{:else}
		<span class="text-primary-700 dark:text-primary-300">Card not found: {cardId}</span>
	{/if}
</div>

<style>
	.block {
		flex: 1;
		padding: 2px 10px;
		margin: 2px 2px;
		display: flex;
		cursor: grab;
	}

	.hovering {
		background-color: rgba(255, 234, 0, 0.385);
	}
</style>
