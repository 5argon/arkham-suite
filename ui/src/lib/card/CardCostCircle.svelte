<script lang="ts">
	import { getCardColorClass, getCardColorClassBorder } from './coloring.js';
	import type { Card } from '@5argon/arkham-kohaku';

	interface Prop {
		card: Card;
	}
	const { card }: Prop = $props();

	const cost = $derived(card.cost === 'x' ? 'X' : card.cost);
	const borderColorClass = $derived(getCardColorClassBorder(card));
	const textColorClass = $derived(getCardColorClass(card));
</script>

{#if cost !== undefined}
	<div class={`cost-circle ${borderColorClass} ${textColorClass}`}>
		<span class="shift-baseline">
			{cost}
		</span>
	</div>
{/if}

<style>
	.cost-circle {
		user-select: none;
		cursor: default;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.6rem;
		border-radius: 50%;
		width: 1rem;
		height: 1rem;
		border-width: 1px;
		border-style: solid;
	}
</style>
