<!--
@component
Inline rectangle representing a card. Its height is 1 em.
-->
<script lang="ts">
	import { getCardImagePath } from '../utility/image.js';
	import {
		card as cardUtil,
		cardClass,
		CardClass,
		type Card,
		type DecodedMeta
	} from '@5argon/arkham-kohaku';
	import clsx from 'clsx';
	import LevelPips from './LevelPips.svelte';

	interface Prop {
		card: Card;
		small?: boolean;

		/**
		 * Used to resolve customizable card's level. Otherwise it will be 0.
		 */
		meta?: DecodedMeta;

		/**
		 * Whether this card should be displayed as greyed out.
		 */
		greyedOut?: boolean;
	}

	const { card, small, meta, greyedOut }: Prop = $props();
	const completePath = $derived(getCardImagePath(card.code, 'square'));

	const borderColorClass = $derived.by(() => {
		if (card.cardClass === undefined) {
			return 'border-neutral-600 dark:border-neutral-400';
		} else if (cardClass.isMulticlass(card.cardClass)) {
			return 'border-multiclass-600 dark:border-multiclass-400';
		} else {
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
				case CardClass.Neutral:
					return 'border-neutral-600 dark:border-neutral-400';
			}
		}
	});
	const borderAccentClass = $derived.by(() => {
		if (card.cardClass === undefined) {
			return 'border-neutral-500';
		} else if (cardClass.isMulticlass(card.cardClass)) {
			return 'border-multiclass-500';
		} else {
			switch (card.cardClass.class1) {
				case CardClass.Guardian:
					return 'border-guardian-500';
				case CardClass.Seeker:
					return 'border-seeker-500';
				case CardClass.Rogue:
					return 'border-rogue-500';
				case CardClass.Mystic:
					return 'border-mystic-500';
				case CardClass.Survivor:
					return 'border-survivor-500';
				case CardClass.Neutral:
					return 'border-neutral-500';
			}
		}
	});
</script>

{#snippet inside()}
	<div>
		<div
			class={clsx(
				small ? 'origin-left translate-x-[1px] -translate-y-[1px] scale-50' : '',
				'absolute flex'
			)}
		>
			<LevelPips
				keepWhite
				xp={meta ? (cardUtil.resolveCustomizableLevel(card, meta) ?? 0) : (card.xp ?? 0)}
				shadowed
			/>
		</div>
		<img
			class={clsx(small ? 'h-5 w-5' : 'h-8 w-8', greyedOut && '')}
			src={completePath}
			alt={card.name}
		/>
	</div>
{/snippet}

<div class={clsx(small ? 'border-l-2' : 'border-l-4', borderColorClass, greyedOut ? 'opacity-20': '')}>
	<div class={clsx('border-wrapper', borderAccentClass)}>
		<div class="border-inner relative">
			{@render inside()}
		</div>
	</div>
</div>

<style>
	.border-wrapper-left-extend {
		border-left-width: 4px;
	}

	.border-wrapper {
		border-width: 1px;
	}

	.border-inner {
		border: 1px solid white;
	}
</style>
