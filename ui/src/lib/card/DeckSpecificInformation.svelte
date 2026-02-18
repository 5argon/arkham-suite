<script lang="ts" module>
	import {
		CardType,
		type Card,
		type CardQuantity,
		type Deck,
		card as cardUtil
	} from '@5argon/arkham-kohaku';
	export const maxSplash = 5;
	export interface LeftSideSplashReturn {
		visibleCards: Card[];
		allCards: Card[];
		more: boolean;
		current: number;
		maximum?: number;
	}

	/**
	 * The right side also need to use this function to determine what to not show
	 * because it's already on the left side.
	 */
	export function findLeftSideSplashes(deck: Deck): LeftSideSplashReturn {
		function findVincentHealDamages(d: Deck): CardQuantity[] {
			return d.mainDeck
				.filter((c) => cardUtil.resolveCustomizableTags(c.card, deck.meta)?.includes('hd'))
				.sort((a, b) => card.interestingSorter(deck, a.card, b.card));
		}
		function findCarolynHealHorrors(d: Deck): CardQuantity[] {
			return d.mainDeck
				.filter((c) => cardUtil.resolveCustomizableTags(c.card, deck.meta)?.includes('hh'))
				.sort((a, b) => card.interestingSorter(deck, a.card, b.card));
		}
		function findAkachiUseCharges(d: Deck): CardQuantity[] {
			const pattern = `Uses (.* ${'charges'})`;
			const regex = new RegExp(pattern);
			return d.mainDeck
				.filter((c) => c.card.text?.match(regex))
				.sort((a, b) => card.interestingSorter(deck, a.card, b.card));
		}
		function findSefinaAndMarionEvent(d: Deck): CardQuantity[] {
			return d.mainDeck
				.filter((c) => c.card.cardType === CardType.Event)
				.sort((a, b) => card.interestingSorter(deck, a.card, b.card));
		}
		function findParallelAgnesSpellEvent(d: Deck): CardQuantity[] {
			return d.mainDeck
				.filter(
					(c) =>
						!cardUtil.isWeaknessRestrictionPermanent(c.card) &&
						c.card.cardType === CardType.Event &&
						c.card.traits?.includes('Spell')
				)
				.sort((a, b) => card.interestingSorter(deck, a.card, b.card));
		}
		function findAmandaPracticed(d: Deck): CardQuantity[] {
			return d.mainDeck
				.filter((c) => c.card.tags?.includes('Practiced'))
				.sort((a, b) => card.interestingSorter(deck, a.card, b.card));
		}
		let splashes: CardQuantity[] = [];
		const backInvestigator = deck.meta.alternateBack ?? deck.investigator;
		let maximum: number | undefined;
		if (backInvestigator.code === '98010' || backInvestigator.code === '05001') {
			splashes = findCarolynHealHorrors(deck);
		} else if (backInvestigator.code === '09004') {
			splashes = findVincentHealDamages(deck);
		} else if (backInvestigator.code === '03004') {
			splashes = findAkachiUseCharges(deck);
		} else if (backInvestigator.code === '03003') {
			splashes = findSefinaAndMarionEvent(deck);
		} else if (deck.meta.alternateFront?.code === '90017') {
			splashes = findParallelAgnesSpellEvent(deck);
		} else {
			const findResult = deckUtil.findSplashCards(deck);
			if (findResult.length > 0) {
				splashes = findResult[0].splashes.sort((a, b) =>
					card.interestingSorter(deck, a.card, b.card)
				);
				maximum = findResult[0].option.limit ?? 0;
			}
		}
		const count = splashes.reduce((acc, c) => acc + c.quantity, 0);
		// Display consecutive copies if count is 5 or lower.
		// Otherwise duplicates goes to the end of list to show more variety of cards.
		const splashesFlatMap: CardQuantity[] = [];
		const splashesFlatMapForDuplicates: CardQuantity[] = [];
		for (const splash of splashes) {
			for (let i = 0; i < splash.quantity; i++) {
				if (i >= 1 && count > maxSplash) {
					splashesFlatMapForDuplicates.push({ card: splash.card, quantity: 1 });
				} else {
					splashesFlatMap.push({ card: splash.card, quantity: 1 });
				}
			}
		}
		splashesFlatMap.push(...splashesFlatMapForDuplicates);

		const curatedSplashes = [...splashesFlatMap].splice(0, 5);
		// Sort after curated so if copies get in, they stay close together.
		curatedSplashes.sort((a, b) => {
			const aXp = cardUtil.resolveCustomizableLevel(a.card, deck.meta) ?? 0;
			const bXp = cardUtil.resolveCustomizableLevel(b.card, deck.meta) ?? 0;
			if (aXp !== bXp) {
				return bXp - aXp;
			}
			return a.card.code.localeCompare(b.card.code);
		});

		return {
			allCards: splashesFlatMap.map((c) => c.card),
			visibleCards: curatedSplashes.map((c) => c.card),
			more: splashesFlatMap.length > 5,
			current: count,
			maximum: maximum
		};
	}
</script>

<script lang="ts">
	import {
		card,
		deck as deckUtil,
		CardClass,
		cardClass,
		Product,
		SkillIcon,
		type CardCode
	} from '@5argon/arkham-kohaku';
	import { getCardColorClassBackground } from './coloring.js';
	import * as m from '../paraglide/messages.js';
	import clsx from 'clsx';
	import CardStrip from './CardStrip.svelte';
	import ImageIconSkill from './ImageIconSkill.svelte';
	import CardSquare from './CardSquare.svelte';
	import CardSquarePlaceholder from './CardSquarePlaceholder.svelte';
	import { PluralResolver } from '../mf2/compile.js';
	import SelectedClassBanner from './SelectedClassBanner.svelte';
	import DeckbuildingChoiceDisplay from './DeckbuildingChoiceDisplay.svelte';

	interface Prop {
		deck: Deck;
		onCardHover?: (card: Card, event: MouseEvent) => void;
		onCardLeave?: () => void;
		onlyDeckbuildingChoices?: boolean;
	}
	const { deck, onCardHover, onCardLeave, onlyDeckbuildingChoices }: Prop = $props();
	const investigator = $derived(deck.investigator);
	const meta = $derived(deck.meta);
	const isParallelFront = $derived(
		deck.meta.alternateFront !== undefined &&
			deck.meta.alternateFront.product === Product.ParallelInvestigators
	);
	const frontInvestigator = $derived(deck.meta.alternateFront ?? deck.investigator);
	const backInvestigator = $derived(deck.meta.alternateBack ?? deck.investigator);

	function findLolaMainRole(d: Deck): CardClass[] {
		const mainRoles: CardClass[] = [];
		const classCount = deck.mainDeck.reduce(
			(acc, c) => {
				const classSlots = c.card.cardClass;
				if (cardClass.classSlotsContains(classSlots, { class1: CardClass.Guardian })) {
					acc[CardClass.Guardian] = (acc[CardClass.Guardian] ?? 0) + c.quantity;
				}
				if (cardClass.classSlotsContains(classSlots, { class1: CardClass.Seeker })) {
					acc[CardClass.Seeker] = (acc[CardClass.Seeker] ?? 0) + c.quantity;
				}
				if (cardClass.classSlotsContains(classSlots, { class1: CardClass.Rogue })) {
					acc[CardClass.Rogue] = (acc[CardClass.Rogue] ?? 0) + c.quantity;
				}
				if (cardClass.classSlotsContains(classSlots, { class1: CardClass.Mystic })) {
					acc[CardClass.Mystic] = (acc[CardClass.Mystic] ?? 0) + c.quantity;
				}
				if (cardClass.classSlotsContains(classSlots, { class1: CardClass.Survivor })) {
					acc[CardClass.Survivor] = (acc[CardClass.Survivor] ?? 0) + c.quantity;
				}
				return acc;
			},
			{} as Record<CardClass, number>
		);
		for (const [class1, count] of Object.entries(classCount)) {
			if (count >= 7) {
				mainRoles.push(class1 as CardClass);
			}
		}
		return mainRoles;
	}

	function findLilyDisciplines(d: Deck): Card[] {
		// Go to beginning, and search in order, pushing each new discipline to the array.
		const allDisciplines: CardCode[] = ['08011a', '08012a', '08013a', '08014a'];
		const foundDisciplines: Card[] = [];

		let current: Deck | undefined = d;
		while (current.previousDeck !== undefined) {
			current = current.previousDeck;
		}
		while (current !== undefined) {
			for (const card of current.mainDeck) {
				if (allDisciplines.includes(card.card.code)) {
					if (!foundDisciplines.some((c) => c.code === card.card.code)) {
						foundDisciplines.push(card.card);
					}
				}
			}
			current = current.nextDeck;
		}
		return foundDisciplines;
	}

	function getDisciplineSkill(discipline: Card): SkillIcon {
		switch (discipline.code) {
			case '08011a':
				return SkillIcon.Willpower;
			case '08012a':
				return SkillIcon.Intellect;
			case '08013a':
				return SkillIcon.Combat;
			case '08014a':
				return SkillIcon.Agility;
			default:
				throw new Error(`Unknown discipline ${discipline.code}`);
		}
	}
	const leftSplashes = $derived(findLeftSideSplashes(deck));
	const cardsPlural = new PluralResolver((count) => {
		return {
			one: `${count} Card`,
			other: `${count} Cards`
		};
	});
</script>

{#snippet textTopic(text: string, currentCount?: number, maxCount?: number)}
	<span
		class={clsx(
			'dark:bg-primary-700 bg-primary-100 flex flex-col items-center text-center rounded px-2 py-0.5 text-[0.6rem] leading-none text-black dark:text-white'
		)}
	>
		<div>{text}</div>
		{#if currentCount && !maxCount}
			<div class="dark:text-primary-400 text-primary-600 text-[0.5rem]">
				{cardsPlural.resolve(currentCount)}
			</div>
		{/if}
		{#if currentCount && maxCount}
			<div class="dark:text-primary-400 text-primary-600 text-[0.5rem]">
				{currentCount}/{cardsPlural.resolve(maxCount)}
			</div>
		{/if}
	</span>
{/snippet}

<div class="flex flex-col gap-1">
	<div class="flex items-center gap-3">
		{#if meta.deckSizeSelected != undefined}
			<span class="flex items-center gap-1">
				{@render textTopic(m.card_deck_size())}
				<span class="leading-none text-black dark:text-white">{meta.deckSizeSelected}</span>
			</span>
		{/if}
		{#if meta.optionSelected != undefined}
			<span class="flex items-center gap-1">
				{@render textTopic(m.card_selected_option())}
				<DeckbuildingChoiceDisplay investigator={backInvestigator} meta={meta} />
			</span>
		{/if}
		{#if meta.factionSelected !== undefined}
			<span class="flex items-center gap-1">
				{@render textTopic(m.card_selected_class_singular())}
				<DeckbuildingChoiceDisplay investigator={backInvestigator} meta={meta} />
			</span>
		{/if}
		{#if meta.faction1 !== undefined && meta.faction2 !== undefined}
			<span class="flex items-center gap-1">
				{@render textTopic(m.card_selected_class_plural())}
				<DeckbuildingChoiceDisplay investigator={backInvestigator} meta={meta} />
			</span>
		{/if}
		{#if !onlyDeckbuildingChoices}
			<!-- Parallel Roland shows his directives. -->
			{#if isParallelFront && investigator.code === '01001'}
				{@const allDirectives :CardCode[]= ['90025', '90026', '90027', '90028', '90029']}
				{@const directives = deck.mainDeck.filter((c) => allDirectives.includes(c.card.code))}
				{#if directives.length > 0}
					<div class="flex items-center justify-center gap-0.5">
						{@render textTopic(m.card_directive())}
						{#each directives as directive, i (i)}
							<div>
								<div
									class="dark:bg-primary-700 bg-primary-100 flex h-[10px] items-center justify-center gap-0.5 rounded-t-sm"
								>
									<div class="dark:text-primary-300 text-primary-700 text-[0.4rem] leading-none">
										{directive.card.subname}
									</div>
								</div>
								<CardStrip card={directive.card} />
							</div>
						{/each}
					</div>
				{/if}
			{/if}

			<!-- Lola show classes that has 7 or over cards in her deck. -->
			{#if investigator.code === '03006'}
				{@const classesWith7OrMore = findLolaMainRole(deck)}
				{#if classesWith7OrMore.length > 0}
					<div class="flex flex-wrap items-center gap-1">
						{@render textTopic(m.card_main_roles())}
						{#each classesWith7OrMore as c, i (i)}
							<SelectedClassBanner cardClass={c} />
						{/each}
					</div>
				{/if}
			{/if}

			<!-- Lily show disciplines in XP breakpoint order. -->
			{#if investigator.code === '08010'}
				{@const disciplines = findLilyDisciplines(deck)}
				{#if disciplines.length > 0}
					<div class="flex flex-wrap items-center gap-1">
						{#if disciplines.length <= 2}
							{@render textTopic('Discipline')}
						{/if}
						{#each disciplines as discipline, i (i)}
							{@const disciplineSkill = getDisciplineSkill(discipline)}
							<div>
								<div
									class="dark:bg-primary-700 bg-primary-100 flex h-[10px] items-center justify-center gap-0.5 rounded-t-sm"
								>
									<div class="scale-75"><ImageIconSkill icon={disciplineSkill} /></div>
									<div class="dark:text-primary-300 text-primary-700 text-[0.5rem] leading-none">
										{i * 15} XP
									</div>
								</div>
								<div>
									<CardStrip card={discipline} />
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		{/if}
	</div>
	{#if !onlyDeckbuildingChoices}
		{#if leftSplashes.visibleCards.length > 0}
			<div class="flex flex-wrap items-center gap-1">
				{#if backInvestigator.code === '98010' || backInvestigator.code === '05001'}
					{@render textTopic('Heal Horror', leftSplashes.current)}
				{:else if backInvestigator.code === '09004'}
					{@render textTopic('Heal Damage', leftSplashes.current)}
				{:else if backInvestigator.code === '03004'}
					{@render textTopic('Use Charge', leftSplashes.current)}
				{:else if backInvestigator.code === '03003'}
					{@render textTopic('Event', leftSplashes.current)}
				{:else if frontInvestigator.code === '90017'}
					{@render textTopic('Spell Event', leftSplashes.current)}
				{:else}
					{@render textTopic('Limited', leftSplashes.current, leftSplashes.maximum)}
				{/if}
				{#each leftSplashes.visibleCards as card, i (i)}
					<div
						onmouseenter={(e) => onCardHover?.(card, e)}
						onmouseleave={() => onCardLeave?.()}
						role="button"
						tabindex="0"
					>
						<CardSquare small {card} meta={deck.meta} />
					</div>
				{/each}
				<!-- If splashes are no more than 5 max, fill the rest with placeholders. -->
				{#if leftSplashes.maximum && leftSplashes.maximum <= 5}
					{#each new Array(5 - leftSplashes.visibleCards.length) as _, i (i)}
						<div>
							<CardSquarePlaceholder small />
						</div>
					{/each}
				{/if}
				{#if leftSplashes.more}
					<div
						class="dark:text-primary-300 text-primary-700 flex items-center gap-0.5 text-[0.5rem] leading-none"
					>
						<span>.</span>
						<span>.</span>
						<span>.</span>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>
