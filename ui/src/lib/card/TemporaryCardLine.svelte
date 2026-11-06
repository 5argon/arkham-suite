<!--
@component
Stands in for a CardLine when a card has been revealed but isn't in the card data yet, so all there
is to go on is what was stated about it. An empty frame takes the place of its picture.
-->
<script lang="ts" module>
	import type { CardType, ClassSlots } from '@5argon/arkham-kohaku';

	/**
	 * What's known of a card that isn't in the card data yet.
	 */
	export interface TemporaryCard {
		name: string;
		cardType: CardType;
		cardClass: ClassSlots;
		/**
		 * Experience cost, left out or 0 for a level 0 card.
		 */
		xp?: number;
	}
</script>

<script lang="ts">
	import { cardClass, CardClass } from '@5argon/arkham-kohaku';
	import clsx from 'clsx';

	import * as m from '../paraglide/messages.js';
	import CardTypeIcon from './CardTypeIcon.svelte';
	import { getCardColorClass } from './coloring.js';
	import ImageIconClassSlots from './ImageIconClassSlots.svelte';
	import LevelPips from './LevelPips.svelte';

	interface Prop {
		card: TemporaryCard;
	}
	const { card }: Prop = $props();

	const borderClass = $derived.by(() => {
		if (cardClass.isMulticlass(card.cardClass))
			return 'border-multiclass-600 dark:border-multiclass-400';
		switch (card.cardClass.class1) {
			case CardClass.Guardian:
				return 'border-guardian-600 dark:border-guardian-400';
			case CardClass.Seeker:
				return 'border-seeker-600 dark:border-seeker-400';
			case CardClass.Rogue:
				return 'border-rogue-600 dark:border-rogue-400';
			case CardClass.Mystic:
				return 'border-mystic-600 dark:border-mystic-400';
			case CardClass.Survivor:
				return 'border-survivor-600 dark:border-survivor-400';
			default:
				return 'border-neutral-600 dark:border-neutral-400';
		}
	});
	const textColorClass = $derived(getCardColorClass(card));
</script>

<div class="line flex items-center gap-1 overflow-x-hidden" title={m.card_temporary_line_help()}>
	<div class={clsx('strip shrink-0 border border-l-4 border-dashed', borderClass)}></div>
	<CardTypeIcon cardType={card.cardType} class={textColorClass} />
	<span class="dark:bg-primary-950/10 bg-primary-50/30 flex items-center rounded px-1 py-0.5">
		<span class="mr-1">
			<ImageIconClassSlots classSlots={card.cardClass} />
		</span>
		<span class={clsx('name inline-block leading-none whitespace-nowrap', textColorClass)}>
			{card.name}
		</span>
	</span>
	{#if card.xp}
		<LevelPips themed xp={card.xp} />
	{/if}
</div>

<style>
	.line {
		height: 28px;
	}

	/* The same room a CardStrip takes. */
	.strip {
		width: 66px;
		height: 24px;
	}

	.name {
		font-size: 0.8rem;
	}
</style>
