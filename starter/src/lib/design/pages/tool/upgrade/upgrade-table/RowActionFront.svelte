<script lang="ts">
	import { Button, FaIcon, FaIconType } from '@5argon/arkham-life-ui';

	interface Props {
		onDelete: () => void;
		hoveringOnGrip: (hovering: boolean) => void;
	}

	let { onDelete, hoveringOnGrip }: Props = $props();

	function hovering() {
		hoveringOnGrip(true);
	}

	function notHovering() {
		hoveringOnGrip(false);
	}
</script>

<td class="action-cell col-grip">
	<span
		class="flex cursor-grab items-center rounded-l bg-primary-200 px-2 py-1 hover:brightness-110 dark:bg-primary-700"
		draggable="false"
		onblur={notHovering}
		onfocus={hovering}
		onmouseout={notHovering}
		onmouseover={hovering}
		role="button"
		tabindex="0"
	>
		<FaIcon duotone icon={FaIconType.Grip} />
	</span>
</td>
<td class="action-cell col-delete">
	<Button hideLabel icon={FaIconType.Delete} label="Delete row" onClick={onDelete} />
</td>

<!-- <RowActionUpDown onClickUp={onMoveRowUp} onClickDown={onMoveRowDown} /> -->

<style>
	.action-cell {
		vertical-align: middle;
		padding: 2px;
		white-space: nowrap;
	}
</style>
