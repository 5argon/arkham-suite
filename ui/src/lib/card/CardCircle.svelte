<!--
@component
Circular profile icon for a card.
Layers mirror CardSquare (class-colored outer border → accent border → white border → image)
but with full rounded shape and no level pips. The `rounded` shape keeps the same
layers as a rounded square, for icons that should read as a thing rather than a person.
-->
<script lang="ts">
	import { getCardImagePath } from '../utility/image.js';
	import { cardClass, CardClass, type Card } from '@5argon/arkham-kohaku';
	import clsx from 'clsx';

	interface Prop {
		card: Card;
		greyedOut?: boolean;
		/**
		 * Default `circle`.
		 */
		shape?: 'circle' | 'rounded';
		/**
		 * Image edge length. Default `sm` (1.5rem).
		 * `xs` 1rem, `md` 2.5rem, `lg` 4rem, `xl` 6rem.
		 */
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	}

	const { card, greyedOut = false, shape = 'circle', size = 'sm' }: Prop = $props();
	const roundClass = $derived(shape === 'circle' ? 'rounded-full' : 'rounded-[25%]');
	const sizeClass = $derived(
		{
			xs: 'h-4 w-4',
			sm: 'h-6 w-6',
			md: 'h-10 w-10',
			lg: 'h-16 w-16',
			xl: 'h-24 w-24'
		}[size]
	);
	const outerBorderClass = $derived(
		size === 'xs' ? 'border' : size === 'lg' || size === 'xl' ? 'border-4' : 'border-2'
	);
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
<span
	class={clsx(
		'inline-flex shrink-0',
		roundClass,
		outerBorderClass,
		borderColorClass,
		greyedOut && 'opacity-20'
	)}
>
	<!-- middle: thin accent-colored border -->
	<span class={clsx('block border', roundClass, borderAccentClass)}>
		<!-- inner: thin white border + clip to shape -->
		<span class={clsx('block overflow-hidden border border-white', roundClass)}>
			<img class={clsx('block object-cover', sizeClass)} src={completePath} alt={card.name} />
		</span>
	</span>
</span>
