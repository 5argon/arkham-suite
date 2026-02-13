<!--
@component
A full screen modal that displays a magnified card image.
Clicking anywhere closes the modal.
-->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import { card as cardUtility } from '@5argon/arkham-kohaku';
	import { getCardImagePath, getCardBackImagePath } from '../utility/image.js';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut, quintOut } from 'svelte/easing';

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

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isShowing) {
			onClose();
		}
	}
	export function scaleX(
		node: Element,
		{ delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}
	) {
		const style = getComputedStyle(node);
		const target_opacity = +style.opacity;
		const transform = style.transform === 'none' ? '' : style.transform;
		const sd = 1 - start;
		const od = target_opacity * (1 - opacity);
		return {
			delay,
			duration,
			easing,
			css: (_t: any, u: any) => `
			transform: ${transform} scale(${1 - sd * u});
			opacity: ${target_opacity - od * u}
		`
		};
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isShowing}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
		onclick={onClose}
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				onClose();
			}
		}}
		in:fade={{ duration: 70 }}
		out:fade={{ duration: 40 }}
	>
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
	</div>
{/if}
