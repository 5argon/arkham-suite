<script lang="ts">
	interface Props {
		disableHoverEffects?: boolean;
		onDropSwap?: (fromIndex: number, fromRight: boolean, swapTo: string) => void;
	}

	let { disableHoverEffects = false, onDropSwap = () => {} }: Props = $props();

	let hovering = $state(false);

	// Reset hovering state when drag effects are disabled
	$effect(() => {
		if (disableHoverEffects) {
			hovering = false;
		}
	});

	function dragLeaveHandler() {
		if (disableHoverEffects) {
			return;
		}
		hovering = false;
	}

	function dragEnterHandler() {
		if (disableHoverEffects) {
			return;
		}
		hovering = true;
	}

	function dragStartHandler() {}

	function dragoverHandler(e: DragEvent & { currentTarget: HTMLDivElement }) {
		if (disableHoverEffects) {
			return;
		}
		e.preventDefault();
		if (e.dataTransfer !== null) {
			if (e.dataTransfer.types.length === 1 && e.dataTransfer.types[0] === 'text/plain') {
				hovering = true;
				e.dataTransfer.dropEffect = 'move';
			} else {
				e.dataTransfer.dropEffect = 'none';
			}
		}
	}

	function dropHandler(e: DragEvent & { currentTarget: HTMLDivElement }) {
		if (disableHoverEffects) {
			return;
		}
		e.preventDefault();
		hovering = false;
		if (e.dataTransfer !== null) {
			const receive = e.dataTransfer.getData('text/plain').split(',');
			if (receive.length === 3) {
				onDropSwap(parseInt(receive[0], 10), receive[1] === 'right', receive[2]);
			}
		}
	}

	function dragendHandler(e: DragEvent & { currentTarget: HTMLDivElement }) {
		e.preventDefault();
		hovering = false;
		if (e.dataTransfer !== null) {
			if (e.dataTransfer.dropEffect !== 'none') {
				// Do nothing, since swap at drop target will remove this one.
			}
		}
	}
</script>

<div class="grey-empty-outer">
	<div
		class="grey-empty"
		class:hovering
		ondragend={dragendHandler}
		ondragenter={dragEnterHandler}
		ondragleave={dragLeaveHandler}
		ondragover={dragoverHandler}
		ondragstart={dragStartHandler}
		ondrop={dropHandler}
		role="button"
		tabindex="-1"
	></div>
</div>

<style>
	.grey-empty-outer {
		height: 45px;
		display: flex;
		align-items: center;
	}

	.grey-empty {
		flex: 1;
		height: 25px;
		background-color: rgba(0, 0, 0, 0.01);
		border: 1px dashed rgba(0, 0, 0, 0.1);
	}

	.hovering {
		background-color: rgba(255, 234, 0, 0.385);
	}
</style>
