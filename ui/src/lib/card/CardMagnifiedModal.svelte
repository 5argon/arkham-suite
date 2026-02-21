<!--
@component
A full screen modal that displays a magnified card image.
Clicking anywhere closes the modal.
-->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import { card as cardUtility } from '@5argon/arkham-kohaku';
	import { getCardImagePath, getCardBackImagePath } from '../utility/image.js';
	import MagnifiedModal from '../layout/MagnifiedModal.svelte';

	interface Prop {
		card: Card | null;
		isShowing: boolean;
		onClose: () => void;
		languageCode?: string;
	}

	const { card, isShowing, onClose, languageCode }: Prop = $props();
	const fullImagePath = $derived(card ? getCardImagePath(card.code, 'full', languageCode) : '');
	const backImagePath = $derived(card ? getCardBackImagePath(card, 'full', languageCode) : null);
	const isHorizontalCard = $derived(card ? cardUtility.isHorizontalCard(card) : false);
</script>

<MagnifiedModal {isShowing} {onClose}>
	{#if card}
		<div class="max-h-[80vh] max-w-[80vw]">
			{#if isHorizontalCard && backImagePath}
				<div class="flex flex-col gap-2">
					<img
						src={fullImagePath}
						alt={card.name}
						class="h-auto max-h-[38vh] w-auto rounded-xl object-contain"
					/>
					<img
						src={backImagePath}
						alt={`${card.name} (back)`}
						class="h-auto max-h-[38vh] w-auto rounded-xl object-contain"
					/>
				</div>
			{:else}
				<img
					src={fullImagePath}
					alt={card.name}
					class="h-auto max-h-[80vh] w-auto rounded-xl object-contain"
				/>
			{/if}
		</div>
	{/if}
</MagnifiedModal>
