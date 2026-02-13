<script lang="ts">
	import { rowDragPrefix } from './UpgradeRow.svelte';

	interface Props {
		showDropTarget?: boolean;
		onDropSwap?: (fromIndex: number) => void;
	}

	let { showDropTarget = false, onDropSwap = () => {} }: Props = $props();

	let hovering = $state(false);

	function dragLeaveHandler(e: DragEvent & { currentTarget: HTMLDivElement }) {
		e.preventDefault();
		if (e.dataTransfer !== null) {
			hovering = false;
		}
	}

	function dragEnterHandler(e: DragEvent & { currentTarget: HTMLDivElement }) {
		e.preventDefault();
		if (e.dataTransfer !== null) {
			hovering = true;
		}
	}

	function dragoverHandler(e: DragEvent & { currentTarget: HTMLDivElement }) {
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
			if (receive.length === 2 && receive[0] === rowDragPrefix) {
				onDropSwap(parseInt(receive[1], 10));
			}
		}
	}
</script>

<tr
	class="drop-target-row"
	class:bring-to-front={showDropTarget}
	ondragenter={dragEnterHandler}
	ondragleave={dragLeaveHandler}
	ondragover={dragoverHandler}
	ondrop={dropHandler}
	role="button"
	tabindex="-1"
>
	<td class="drop-target-cell" colspan={9}>
		<div
			class="drop-target-inner"
			class:hovering={showDropTarget && hovering}
			class:show-drop-target={showDropTarget}
		></div>
	</td>
</tr>

<style>
	.drop-target-row {
		height: 20px;
		position: relative;
		z-index: -10;
	}

	.bring-to-front {
		/* Temporarily let the drop zone wins over the next list items. */
		z-index: 1;
	}

	.drop-target-cell {
		padding: 0;
		height: 20px;
		margin: -10px 0;
	}

	.drop-target-inner {
		width: 100%;
		height: 2px;
		z-index: -1;
		margin: 9px 0;
	}

	.show-drop-target {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.hovering {
		background-color: rgba(255, 115, 0, 0.8);
	}
</style>
