<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import CardBlock from '$lib/design/components/card/CardBlock.svelte';
	import { Button, FaIconType } from '@5argon/arkham-life-ui';

	interface Props {
		card: Card | null;
		quantity?: number;
		collapse?: boolean;
		editMode?: boolean;
		onClickDelete?: () => void;
		onClickLeft?: () => void;
		onClickRight?: () => void;
	}

	let {
		card,
		quantity,
		collapse = false,
		editMode = true,
		onClickDelete = () => {},
		onClickLeft = () => {},
		onClickRight = () => {}
	}: Props = $props();
</script>

{#if !collapse && editMode}
	<td class="button-cell">
		<Button hideLabel label="Delete" onClick={onClickDelete} icon={FaIconType.Delete} />
	</td>
{/if}

<td class="card-cell">
	<CardBlock
		{card}
		cardId={card?.code ?? ''}
		disableHoverEffects
		dragDataPrefix="-1,staging,"
		{quantity}
		small={!editMode}
	/>
</td>

{#if !editMode}
	<td class="button-cell">
		<Button hideLabel label="Left" onClick={onClickLeft} icon={FaIconType.ArrowLeftBordered} />
	</td>
	<td class="button-cell">
		<Button hideLabel label="Right" onClick={onClickRight} icon={FaIconType.ArrowRightBordered} />
	</td>
{/if}

<style>
	.button-cell {
		vertical-align: middle;
		padding: 2px 4px;
		white-space: nowrap;
	}

	.card-cell {
		vertical-align: middle;
		padding: 2px 4px;
		width: 100%;
	}
</style>
