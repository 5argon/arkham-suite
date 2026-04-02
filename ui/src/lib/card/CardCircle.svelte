<!--
@component
Circular profile icon for a card.
Layers mirror CardSquare (class-colored outer border → accent border → white border → image)
but with full rounded shape and no level pips.
-->
<script lang="ts">
	import { getCardImagePath } from '../utility/image.js';
	import { cardClass, CardClass, type Card } from '@5argon/arkham-kohaku';
	import clsx from 'clsx';

	interface Prop {
		card: Card;
		greyedOut?: boolean;
	}

	const { card, greyedOut = false }: Prop = $props();
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

<!-- outer: thick class-colored border -->
<div class={clsx('inline-flex rounded-full border-2', borderColorClass, greyedOut && 'opacity-20')}>
	<!-- middle: thin accent-colored border -->
	<div class={clsx('rounded-full border', borderAccentClass)}>
		<!-- inner: thin white border + clip to circle -->
		<div class="overflow-hidden rounded-full border border-white">
			<img class="block h-6 w-6 object-cover" src={completePath} alt={card.name} />
		</div>
	</div>
</div>
