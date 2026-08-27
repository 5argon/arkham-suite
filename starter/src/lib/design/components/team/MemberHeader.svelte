<!--
@component
One team member's title block: class-colored strip with the investigator's
name line (plus optional trailing controls), the class-composition bar of the
main deck, and the health / sanity / stats / card-access row newcomers need
at a glance. Shared by the deck areas and the team banner.
-->
<script lang="ts">
	import {
		CardLine,
		CardLineHoverTooltip,
		CardSquare,
		HealthSanity,
		ImageIconCommit
	} from '@5argon/arkham-life-ui';
	import { type Card, CardClass, type CardCode, type CardResolver } from '@5argon/arkham-kohaku';
	import clsx from 'clsx';
	import type { Snippet } from 'svelte';

	import AccessSummary from '$lib/design/pages/tool/evergreen-team/setup/AccessSummary.svelte';
	import { accessSummary } from '$lib/tool/evergreen-team/pool';
	import { mainDeckCount } from '$lib/tool/evergreen-team/rules';
	import type { EvergreenState, PoolEntry } from '$lib/tool/evergreen-team/types';

	interface Prop {
		team: EvergreenState;
		deckIndex: number;
		pool: Map<CardCode, PoolEntry>;
		resolver: CardResolver;
		/**
		 * Controls rendered at the right end of the colored strip.
		 */
		trailing?: Snippet;
		/**
		 * Peek row of small card squares under the stats, clipped to one line.
		 */
		notableCards?: Card[];
	}
	const { team, deckIndex, pool, resolver, trailing, notableCards }: Prop = $props();

	let tooltipCard = $state<Card | null>(null);
	let tooltipEl = $state<HTMLElement | null>(null);

	const deck = $derived(team.decks[deckIndex]);
	const investigator = $derived(resolver.resolve(deck.investigator));
	const deckSize = $derived(investigator.deckRequirements?.size ?? 30);
	const mainCount = $derived(mainDeckCount(deck));
	const investigatorClass = $derived(investigator.cardClass?.class1 ?? CardClass.Neutral);

	// Class composition of the main deck (fixed items never count), with a
	// final "missing" segment up to the legal deck size. When over the size,
	// segments scale against the current total instead. Segment order follows
	// the investigator's card access order (their classes first, neutral last).
	const classBarOrder = $derived.by(() => {
		const accessOrder = accessSummary(investigator).lines.map((line) => line.cardClass);
		const rest = [
			CardClass.Guardian,
			CardClass.Seeker,
			CardClass.Rogue,
			CardClass.Mystic,
			CardClass.Survivor,
			CardClass.Neutral
		].filter((c) => !accessOrder.includes(c));
		return [...accessOrder, ...rest];
	});
	const classBarSegments = $derived.by(() => {
		const counts: Partial<Record<CardClass, number>> = {};
		for (const [code, quantity] of Object.entries(deck.main)) {
			const cardClass = pool.get(code)?.card.cardClass?.class1 ?? CardClass.Neutral;
			counts[cardClass] = (counts[cardClass] ?? 0) + quantity;
		}
		const missing = Math.max(0, deckSize - mainCount);
		const denominator = Math.max(deckSize, mainCount);
		const segments = classBarOrder
			.filter((c) => (counts[c] ?? 0) > 0)
			.map((c) => ({ key: c as string, count: counts[c] ?? 0, colorClass: classBarColor(c) }));
		if (missing > 0) {
			segments.push({ key: 'missing', count: missing, colorClass: 'bar-missing' });
		}
		return { segments, denominator };
	});
	function classBarColor(cardClass: CardClass): string {
		switch (cardClass) {
			case CardClass.Guardian:
				return 'bg-guardian-500';
			case CardClass.Seeker:
				return 'bg-seeker-500';
			case CardClass.Rogue:
				return 'bg-rogue-500';
			case CardClass.Mystic:
				return 'bg-mystic-500';
			case CardClass.Survivor:
				return 'bg-survivor-500';
			case CardClass.Neutral:
				return 'bg-neutral-500';
		}
	}
	function headerColorClass(cardClass: CardClass): string {
		switch (cardClass) {
			case CardClass.Guardian:
				return 'bg-guardian-300 dark:bg-guardian-800';
			case CardClass.Seeker:
				return 'bg-seeker-300 dark:bg-seeker-800';
			case CardClass.Rogue:
				return 'bg-rogue-300 dark:bg-rogue-800';
			case CardClass.Mystic:
				return 'bg-mystic-300 dark:bg-mystic-800';
			case CardClass.Survivor:
				return 'bg-survivor-300 dark:bg-survivor-800';
			case CardClass.Neutral:
				return 'bg-neutral-300 dark:bg-neutral-800';
		}
	}
</script>

<div
	class={clsx(
		'flex items-center justify-between gap-2 rounded-t-lg px-2 py-1',
		headerColorClass(investigatorClass)
	)}
>
	<CardLine noReserveCardTypeIcon hideIcons card={investigator} />
	{#if trailing}
		<span class="flex items-center gap-1.5">
			{@render trailing()}
		</span>
	{/if}
</div>
<div class="flex h-1.5 w-full overflow-hidden">
	{#each classBarSegments.segments as segment (segment.key)}
		<div
			class={clsx('h-full transition-all duration-200', segment.colorClass)}
			style:width="{(segment.count / classBarSegments.denominator) * 100}%"
		></div>
	{/each}
</div>
<div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 px-2 py-1">
	<span class="flex items-center gap-2">
		<HealthSanity health={investigator.health} sanity={investigator.sanity} />
		<ImageIconCommit card={investigator} />
	</span>
	<AccessSummary {investigator} />
</div>
{#if notableCards !== undefined && notableCards.length > 0}
	<div class="notable-row px-2 pb-1.5">
		{#each notableCards as card (card.code)}
			<div
				role="img"
				aria-label={card.name}
				class="shrink-0"
				onmouseenter={(ev) => {
					tooltipCard = card;
					tooltipEl = ev.currentTarget;
				}}
				onmouseleave={() => (tooltipCard = null)}
			>
				<CardSquare {card} small />
			</div>
		{/each}
	</div>
	{#if tooltipCard}
		<CardLineHoverTooltip card={tooltipCard} visible={true} referenceElement={tooltipEl} />
	{/if}
{/if}

<style>
	/* Extra squares wrap onto hidden lines, so only whole squares ever show. */
	.notable-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.25rem;
		max-height: 1.75rem;
		overflow: hidden;
	}

	.bar-missing {
		background-color: rgba(0, 0, 0, 0.12);
	}

	:global(.dark) .bar-missing {
		background-color: rgba(255, 255, 255, 0.15);
	}
</style>
