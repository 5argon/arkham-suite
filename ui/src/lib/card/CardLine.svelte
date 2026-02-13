<!--
@component
Flex element with CardStrip in front and other information about the card following it.
Line break not allowed.
-->
<script lang="ts">
	import { CardType, LocalizationResolver, card as cardUtil, type Card, type DecodedMeta, CardClass } from '@5argon/arkham-kohaku';
	import CardStrip from './CardStrip.svelte';
	import clsx from 'clsx';
	import ImageIconClassSlots from './ImageIconClassSlots.svelte';
	import { getCardColorClass } from './coloring.js';
	import LevelPips from './LevelPips.svelte';
	import CardSetInfo from './CardSetInfo.svelte';
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import CardTypeIcon from './CardTypeIcon.svelte';

	interface Prop {
		card: Card;
		localizationResolver?: LocalizationResolver;
		languageCode?: string;
		hideStrip?: boolean;
		hideName?: boolean;
		hideCardTypeIcon?: boolean;
		hideCardClassIcon?: boolean;
		quantity?: number;
		quantityColor?: CardClass;
		greyedOutQuantity?: number;
		hideSet?: boolean;
		hideIcons?: boolean;
		/**
		 * If true, unsupported card types will not reserve space in CardTypeIcon
		 */
		noReserveCardTypeIcon?: boolean;
		/**
		 * If true, do not render the quantity counter
		 */
		hideQuantity?: boolean;
		/**
		 * Deck metadata used to calculate the true XP level of customizable cards
		 */
		meta?: DecodedMeta;
	}

	const {
		card,
		hideStrip,
		quantity,
		quantityColor,
		greyedOutQuantity,
		hideSet,
		hideName,
		hideIcons,
		hideCardTypeIcon,
		hideCardClassIcon,
		localizationResolver,
		languageCode,
		noReserveCardTypeIcon,
		hideQuantity,
		meta
	}: Prop = $props();
	const localizedCard = $derived(
		localizationResolver?.getLocalizedCard(card, languageCode) ?? card
	);
	let textColorClass = $derived(getCardColorClass(card));
	const isGreyedOut = $derived(
		greyedOutQuantity !== undefined && greyedOutQuantity >= (quantity ?? 1)
	);
	
	// Calculate effective XP level for customizable cards
	const effectiveXp = $derived(meta ? cardUtil.resolveCustomizableLevel(card, meta) : card.xp);

	function getQuantityColorClass(color?: CardClass): string {
		switch (color) {
			case CardClass.Guardian:
				return 'text-guardian-600 dark:text-guardian-400';
			case CardClass.Seeker:
				return 'text-seeker-600 dark:text-seeker-400';
			case CardClass.Rogue:
				return 'text-rogue-600 dark:text-rogue-400';
			case CardClass.Mystic:
				return 'text-mystic-600 dark:text-mystic-400';
			case CardClass.Survivor:
				return 'text-survivor-600 dark:text-survivor-400';
			case CardClass.Neutral:
				return 'text-neutral-600 dark:text-neutral-400';
			default:
				return 'text-black dark:text-white';
		}
	}

	const quantityColorClass = $derived(getQuantityColorClass(quantityColor));
</script>

<div
	class={clsx(
		'fixed-line-size flex items-center gap-1 overflow-x-hidden',
		isGreyedOut && 'opacity-30'
	)}
>
	{#if !hideStrip}
		<div class="shrink-0">
			<CardStrip {card} greyedOut={isGreyedOut} />
		</div>
	{/if}
	{#if !hideCardTypeIcon}
		<CardTypeIcon cardType={card.cardType} class={textColorClass} {noReserveCardTypeIcon} />
	{/if}
	{#if quantity && !hideQuantity}
		<span
			class={clsx(
				'inline-block w-5 shrink-0 text-center text-lg leading-none',
				quantityColorClass
			)}>{quantity}<span class="text-xs">x</span></span
		>
	{/if}
	{#if !hideName}
		<span class="dark:bg-primary-950/10 bg-primary-50/30 flex items-center rounded px-1 py-0.5">
			{#if card.cardClass && !hideCardClassIcon}
				<span class="mr-1">
					<ImageIconClassSlots classSlots={card.cardClass} />
				</span>
			{/if}
			<span class="inline-flex flex-col">
				<span
					class={clsx(
						localizedCard.name.length >= 18 ? 'small-card-name' : 'card-name',
						'inline-block leading-none whitespace-nowrap',
						textColorClass
					)}>{localizedCard.name}</span
				>
				{#if localizedCard.subname}
					<span
						class={clsx('inline-block leading-none whitespace-nowrap', textColorClass, 'subname')}
						>{localizedCard.subname}</span
					>
				{/if}
			</span>
		</span>
	{/if}

	{#if effectiveXp}
		<LevelPips themed xp={effectiveXp} />
	{/if}
	{#if card.chained}
		<span
			class={clsx(
				'inline-block text-[0.55rem] leading-none',
				'text-primary-600 dark:text-primary-400'
			)}
		>
			({card.chained > 0 ? '+' : '-'}{card.chained})
		</span>
	{/if}
	{#if !hideSet}
		<CardSetInfo {card} />
	{/if}
	{#if !hideIcons}
		<span class="inline-flex items-center gap-0.5 text-xs">
			{#if card.weakness}<FaIcon duotone icon={FaIconType.AnyWeakness} />{/if}
			{#if card.cardType === CardType.Investigator}
				<FaIcon duotone icon={FaIconType.Investigator} />
			{/if}
			{#if card.restrictions}
				{#if card.restrictions.investigator.length > 0}
					<FaIcon duotone icon={FaIconType.InvestigatorRestriction} />
				{/if}
				{#if card.restrictions.trait.length > 0}
					<FaIcon duotone icon={FaIconType.Specialist} />
				{/if}
			{/if}
			{#if card.customizationOptions}<FaIcon duotone icon={FaIconType.Customizable} />{/if}
			{#if card.permanent === true}<FaIcon duotone icon={FaIconType.Permanent} />{/if}
			{#if card.exceptional === true}<FaIcon duotone icon={FaIconType.Exceptional} />{/if}
			{#if card.advanced === true}<FaIcon duotone icon={FaIconType.Advanced} />{/if}
			{#if card.reward === true}<FaIcon duotone icon={FaIconType.Reward} />{/if}
			{#if card.bondedCards || card.bondedTo}<FaIcon duotone icon={FaIconType.Bonded} />{/if}
			{#if card.myriad === true}<FaIcon duotone icon={FaIconType.Myriad} />{/if}
			{#if card.researched === true}<FaIcon duotone icon={FaIconType.Researched} />{/if}
			{#if card.fast === true}<FaIcon duotone icon={FaIconType.Fast} />{/if}
		</span>
	{/if}
</div>

<style>
	.fixed-line-size {
		height: 28px;
		/* Why it has mysterious margin initially? */
		margin-bottom: 0px;
	}

	.small-card-name {
		font-size: 0.7rem;
	}

	.card-name {
		font-size: 0.8rem;
	}

	.subname {
		font-size: 0.5rem;
	}

	.set-text {
		font-size: 0.6rem;
	}
</style>
