<script lang="ts">
	import CardBlock from '$lib/design/components/card/CardBlock.svelte';
	import { Button, FaIconType } from '@5argon/arkham-life-ui';
	import { placeholderCard } from '$lib/tool/upgrade/interface';

	interface Props {
		onAddToLeftSide?: (cardId: string) => void;
		onAddToRightSide?: (cardId: string) => void;
	}

	let { onAddToLeftSide = () => {}, onAddToRightSide = () => {} }: Props = $props();
</script>

<div class="card-block-wrapper">
	<CardBlock
		card={null}
		cardId={placeholderCard}
		disableHoverEffects
		dragDataPrefix="-1,staging,"
		small
	/>
	<Button
		hideLabel
		icon={FaIconType.ArrowLeftBordered}
		label="Add to left side"
		onClick={() => onAddToLeftSide(placeholderCard)}
	/>
	<Button
		hideLabel
		icon={FaIconType.ArrowRightBordered}
		label="Add to right side"
		onClick={() => onAddToRightSide(placeholderCard)}
	/>
</div>

<style>
	.card-block-wrapper {
		display: flex;
		align-items: center;
	}
</style>
