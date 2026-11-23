<!--
@component
A full screen modal that displays a magnified card image.
Clicking anywhere closes the modal, except on what's shown beside the picture.
-->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import { card as cardUtility } from '@5argon/arkham-kohaku';
	import type { Snippet } from 'svelte';
	import { getCardImagePath, getCardBackImagePath } from '../utility/image.js';
	import MagnifiedModal from '../layout/MagnifiedModal.svelte';

	interface Prop {
		card: Card | null;
		isShowing: boolean;
		onClose: () => void;
		languageCode?: string;
		/**
		 * Shown beside the picture, below it on a small screen. Can be read and pressed without
		 * closing the modal.
		 */
		aside?: Snippet<[Card]>;
	}

	const { card, isShowing, onClose, languageCode, aside }: Prop = $props();
	const fullImagePath = $derived(card ? getCardImagePath(card.code, 'full', languageCode) : '');
	const backImagePath = $derived(card ? getCardBackImagePath(card, 'full', languageCode) : null);
	const isHorizontalCard = $derived(card ? cardUtility.isHorizontalCard(card) : false);
	// Leaves room below the picture for the aside on a small screen.
	const singleClass = $derived(aside ? 'max-h-[55vh] md:max-h-[80vh]' : 'max-h-[80vh]');
	const pairClass = $derived(aside ? 'max-h-[28vh] md:max-h-[38vh]' : 'max-h-[38vh]');
</script>

{#snippet pictures(card: Card)}
	{#if isHorizontalCard && backImagePath}
		<div class="flex flex-col gap-2">
			<img
				src={fullImagePath}
				alt={card.name}
				class="h-auto w-auto rounded-xl object-contain {pairClass}"
			/>
			<img
				src={backImagePath}
				alt={`${card.name} (back)`}
				class="h-auto w-auto rounded-xl object-contain {pairClass}"
			/>
		</div>
	{:else}
		<img
			src={fullImagePath}
			alt={card.name}
			class="h-auto w-auto rounded-xl object-contain {singleClass}"
		/>
	{/if}
{/snippet}

<MagnifiedModal {isShowing} {onClose}>
	{#if card}
		{#if aside}
			<div
				class="flex max-h-[92vh] w-[92vw] max-w-4xl flex-col items-center gap-3 overflow-y-auto md:flex-row md:items-start md:justify-center"
			>
				<div class="shrink-0">
					{@render pictures(card)}
				</div>
				<div
					class="bg-primary-50 dark:bg-primary-950 w-full max-w-md cursor-auto rounded-xl p-3 md:max-h-[80vh] md:w-80 md:shrink-0 md:overflow-y-auto"
					data-magnified-keep-open
				>
					{@render aside(card)}
				</div>
			</div>
		{:else}
			<div class="max-h-[80vh] max-w-[80vw]">
				{@render pictures(card)}
			</div>
		{/if}
	{/if}
</MagnifiedModal>
