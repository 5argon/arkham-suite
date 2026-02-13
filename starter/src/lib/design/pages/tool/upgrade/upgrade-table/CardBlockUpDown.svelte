<script lang="ts">
	import type { Card, CustomizationText } from '@5argon/arkham-kohaku';
	import { Button, FaIconType } from '@5argon/arkham-life-ui';
	import CardBlock from '$lib/design/components/card/CardBlock.svelte';

	interface Props {
		editMode?: boolean;
		viewMode?: boolean;
		card?: Card | null;
		cardId: string;
		onClickDelete?: () => void;
		onDropSwap?: (fromIndex: number, fromRight: boolean, swapTo: string) => void;
		onCustomizableCycle?: () => void;
		customizable?: boolean;
		checkedBoxes?: number;
		isCustomActive?: boolean;
		customizationChoice?: number;
		customizationCount?: number;
		customizationText?: CustomizationText;
		index: number;
		right: boolean;
		disableHoverEffects?: boolean;
		showDeleteButtons?: boolean;
	}

	let {
		editMode = false,
		viewMode = false,
		card = null,
		cardId,
		onClickDelete = () => {},
		onDropSwap = () => {},
		onCustomizableCycle = () => {},
		customizable = false,
		checkedBoxes = 0,
		isCustomActive = false,
		customizationChoice = 0,
		customizationCount = 0,
		customizationText = undefined,
		index,
		right,
		disableHoverEffects = false,
		showDeleteButtons = true
	}: Props = $props();

	let width = $state(0);

	let customLabel = $derived.by(() => {
		if (isCustomActive && customizationCount > 0) {
			const boxes = '☑'.repeat(checkedBoxes);
			const title = customizationText?.title ?? `${checkedBoxes}XP Option`;
			return `${boxes} ${title}`;
		}
		return 'Customize';
	});
</script>

<svelte:window bind:outerWidth={width} />

<div class="flex items-center h-10">
	<CardBlock
		{card}
		{cardId}
		{disableHoverEffects}
		dragDataPrefix={index + ',' + (right ? 'right' : 'left') + ','}
		{onDropSwap}
		small={editMode}
	/>
	{#if showDeleteButtons}
		<Button label="Delete" icon={FaIconType.Delete} onClick={onClickDelete} hideLabel={true} />
	{/if}
	{#if customizable && right}
		{#if isCustomActive}
			<div class="text-xs">
				<Button
					label={customLabel}
					onClick={viewMode ? () => {} : onCustomizableCycle}
					hideLabel={false}
					disabled={viewMode}
				/>
			</div>
		{:else}
			<Button
				label={customLabel}
				icon={FaIconType.Customizable}
				onClick={viewMode ? () => {} : onCustomizableCycle}
				hideLabel
				disabled={viewMode}
			/>
		{/if}
	{/if}
</div>
