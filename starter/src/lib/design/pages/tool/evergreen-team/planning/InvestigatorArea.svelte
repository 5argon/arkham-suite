<!--
@component
One player's drop area: header with the stats newcomers need at a glance,
the fixed signature/weakness row, the main deck, and a side deck zone that
appears once Lv. 1+ cards land. The whole area is a single drop target; the
destination zone is decided by the card's level, not the drop position.
-->
<script lang="ts">
	import { Button, CardScanFullTiny, FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import { type Card, CardClass, type CardCode, type CardResolver } from '@5argon/arkham-kohaku';
	import clsx from 'clsx';
	import { flip } from 'svelte/animate';
	import { fade, scale } from 'svelte/transition';

	import * as m from '$lib/paraglide/messages.js';
	import MemberHeader from '$lib/design/components/team/MemberHeader.svelte';
	import { fixedItemsFor } from '$lib/tool/evergreen-team/pool';
	import {
		computeMoveQuantity,
		deckLimitOf,
		mainDeckCount,
		matchesFocus,
		availableOf,
		sideDeckXp,
		titleCountInDeck,
		wantOf
	} from '$lib/tool/evergreen-team/rules';
	import type {
		EvergreenFocus,
		EvergreenState,
		EvergreenZone,
		PoolEntry
	} from '$lib/tool/evergreen-team/types';

	import CardStack from './CardStack.svelte';
	import { DRAG_MIME, type DragSource, EvergreenDnd } from './dnd.svelte';

	interface Prop {
		team: EvergreenState;
		deckIndex: number;
		pool: Map<CardCode, PoolEntry>;
		eligibility: Map<CardCode, boolean[]>;
		dnd: EvergreenDnd;
		resolver: CardResolver;
		viewMode?: boolean;
		/**
		 * View mode only: smaller cards so more fit on screen (screencaps).
		 */
		compact?: boolean;
		/**
		 * View filter: only matching stacks render; counts and the class bar
		 * always reflect the whole deck.
		 */
		focus?: EvergreenFocus;
		onStackClick?: (source: DragSource) => void;
		onDropFrom?: (source: DragSource, deckIndex: number) => void;
		onClearZone?: (deckIndex: number, zone: EvergreenZone) => void;
		/**
		 * Offered in place of the clear button while the deck is empty.
		 */
		onSwapInvestigator?: (deckIndex: number) => void;
		/**
		 * View mode: opens this deck in a full DeckDisplay modal.
		 */
		onOpenDeck?: (deckIndex: number) => void;
		onCardHover?: (card: Card, el: HTMLElement) => void;
		onCardHoverEnd?: () => void;
		/**
		 * Cards claimed beyond the pool; their whole stacks render red.
		 */
		overlaps?: ReadonlySet<CardCode>;
	}
	const {
		team,
		deckIndex,
		pool,
		eligibility,
		dnd,
		resolver,
		viewMode = false,
		compact = false,
		focus = 'none',
		onStackClick,
		onDropFrom,
		onClearZone,
		onSwapInvestigator,
		onOpenDeck,
		onCardHover,
		onCardHoverEnd,
		overlaps
	}: Prop = $props();

	const deck = $derived(team.decks[deckIndex]);
	const investigator = $derived(resolver.resolve(deck.investigator));
	const fixedItems = $derived(fixedItemsFor(investigator, resolver));
	const deckSize = $derived(investigator.deckRequirements?.size ?? 30);
	const mainCount = $derived(mainDeckCount(deck));
	const sideXp = $derived(sideDeckXp(deck, (code) => resolver.resolve(code)));

	const cardWidth = $derived(viewMode && compact ? 48 : 64);

	function zoneEntries(zone: EvergreenZone): { card: Card; quantity: number }[] {
		return Object.entries(deck[zone])
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([code, quantity]) => ({ card: pool.get(code)!.card, quantity }));
	}
	const mainEntries = $derived(zoneEntries('main'));
	const sideEntries = $derived(zoneEntries('side'));
	const focusedFixedItems = $derived(fixedItems.filter((item) => matchesFocus(item, focus)));
	const focusedMainEntries = $derived(mainEntries.filter((e) => matchesFocus(e.card, focus)));
	const focusedSideEntries = $derived(sideEntries.filter((e) => matchesFocus(e.card, focus)));
	const zoneMax = (entries: { quantity: number }[]) =>
		Math.max(1, ...entries.map((e) => e.quantity));

	function deckSource(zone: EvergreenZone, cardCode: CardCode): DragSource {
		if (team.pickMode !== 'class') {
			return { kind: 'deck', deckIndex, zone, cardCode };
		}
		// Class pickup works inversely too: grabbing one card sweeps its whole
		// class group in this zone along when returned to the collection.
		const targetClass = pool.get(cardCode)?.card.cardClass?.class1 ?? CardClass.Neutral;
		const group = [
			cardCode,
			...zoneEntries(zone)
				.filter(
					(e) =>
						e.card.code !== cardCode &&
						(e.card.cardClass?.class1 ?? CardClass.Neutral) === targetClass
				)
				.map((e) => e.card.code)
		];
		return { kind: 'deck', deckIndex, zone, cardCode, classGroup: group };
	}

	function moveQuantityFor(source: DragSource): number {
		const entry = pool.get(source.cardCode);
		if (entry === undefined) return 0;
		const remainingAtSource =
			source.kind === 'collection'
				? availableOf(team, pool, source.cardCode)
				: (team.decks[source.deckIndex]?.[source.zone][source.cardCode] ?? 0);
		return computeMoveQuantity({
			want: wantOf(team, entry.card),
			remainingAtSource,
			deckLimit: deckLimitOf(entry.card),
			inTargetDeck: titleCountInDeck(deck, pool, entry.titleKey)
		});
	}

	const eligible = $derived.by(() => {
		const active = dnd.active;
		if (viewMode || active === null) return false;
		if (active.kind === 'deck' && active.deckIndex === deckIndex) return false;
		if (!(eligibility.get(active.cardCode)?.[deckIndex] ?? false)) return false;
		return moveQuantityFor(active) > 0;
	});
	const dragRejected = $derived.by(() => {
		const active = dnd.active;
		if (viewMode || active === null || eligible) return false;
		// The source deck itself is not a target; do not grey it out.
		return !(active.kind === 'deck' && active.deckIndex === deckIndex);
	});
	const showSideZone = $derived(sideEntries.length > 0);

	// Counter, not a boolean: dragenter/dragleave fire on every child boundary
	// inside a large drop area.
	let hoverDepth = $state(0);
	const hovering = $derived(hoverDepth > 0);

	function isOurDrag(ev: DragEvent): boolean {
		return ev.dataTransfer?.types.includes(DRAG_MIME) ?? false;
	}

	function handleDragOver(ev: DragEvent) {
		if (!eligible || !isOurDrag(ev)) return;
		ev.preventDefault();
		if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
	}

	function handleDrop(ev: DragEvent) {
		ev.preventDefault();
		hoverDepth = 0;
		const parsed = EvergreenDnd.parsePayload(ev.dataTransfer);
		const active = dnd.active;
		if (parsed === null || active === null || parsed.cardCode !== active.cardCode) {
			dnd.endDrag();
			return;
		}
		onDropFrom?.(parsed, deckIndex);
		dnd.endDrag();
	}

	function borderColorClass(cardClass: CardClass): string {
		switch (cardClass) {
			case CardClass.Guardian:
				return 'border-guardian-700 dark:border-guardian-300';
			case CardClass.Seeker:
				return 'border-seeker-700 dark:border-seeker-300';
			case CardClass.Rogue:
				return 'border-rogue-700 dark:border-rogue-300';
			case CardClass.Mystic:
				return 'border-mystic-700 dark:border-mystic-300';
			case CardClass.Survivor:
				return 'border-survivor-700 dark:border-survivor-300';
			case CardClass.Neutral:
				return 'border-neutral-700 dark:border-neutral-300';
		}
	}
	const investigatorClass = $derived(investigator.cardClass?.class1 ?? CardClass.Neutral);
</script>

<div
	class={clsx(
		'area relative min-w-0 rounded-lg border bg-white/50 shadow dark:bg-black/30',
		borderColorClass(investigatorClass),
		eligible && 'eligible',
		eligible && hovering && 'hovering',
		dragRejected && 'drag-rejected'
	)}
	role="region"
	ondragover={handleDragOver}
	ondragenter={(ev) => {
		if (eligible && isOurDrag(ev)) hoverDepth++;
	}}
	ondragleave={() => {
		if (hoverDepth > 0) hoverDepth--;
	}}
	ondrop={handleDrop}
>
	<MemberHeader {team} {deckIndex} {pool} {resolver}>
		{#snippet trailing()}
			{#if viewMode && onOpenDeck}
				<Button
					hideLabel
					icon={FaIconType.CardViewModeList}
					label={m.tool_evergreen_team_view_deck()}
					onClick={() => onOpenDeck(deckIndex)}
				/>
			{/if}
			<span
				class={clsx(
					'rounded px-1.5 py-0.5 text-sm font-bold whitespace-nowrap',
					mainCount === deckSize
						? 'bg-green-600 text-white'
						: mainCount > deckSize
							? 'bg-red-600 text-white'
							: 'bg-black/20 text-black dark:bg-white/20 dark:text-white'
				)}
			>
				{mainCount}/{deckSize}
			</span>
			{#if !viewMode && mainEntries.length === 0 && sideEntries.length === 0 && onSwapInvestigator}
				<button
					type="button"
					class="clear-zone swap"
					aria-label={m.tool_evergreen_team_swap_investigator()}
					title={m.tool_evergreen_team_swap_investigator()}
					onclick={() => onSwapInvestigator(deckIndex)}
				>
					<FaIcon icon={FaIconType.Swap} />
				</button>
			{:else if !viewMode && onClearZone}
				<button
					type="button"
					class="clear-zone"
					class:invisible={mainEntries.length === 0}
					aria-label={m.tool_evergreen_team_clear_section()}
					title={m.tool_evergreen_team_clear_section()}
					onclick={() => onClearZone(deckIndex, 'main')}
				>
					✕
				</button>
			{/if}
		{/snippet}
	</MemberHeader>
	<div class="px-2 pb-2">
		<div class="fixed-row mb-1 flex flex-wrap gap-1 opacity-80">
			{#each focusedFixedItems as item, idx (item.code + idx)}
				<div
					role="img"
					onmouseenter={(ev) => onCardHover?.(item, ev.currentTarget as HTMLElement)}
					onmouseleave={() => onCardHoverEnd?.()}
				>
					<CardScanFullTiny card={item} hideQuantity width={Math.round(cardWidth * 0.75)} />
				</div>
			{/each}
		</div>

		<div class="flex flex-wrap gap-1">
			{#each focusedMainEntries as entry (entry.card.code)}
				<div
					class:overlap={overlaps?.has(entry.card.code) ?? false}
					animate:flip={{ duration: 200 }}
					in:scale={{ duration: 150 }}
					out:fade={{ duration: 100 }}
				>
					{#if viewMode}
						<div
							role="img"
							onmouseenter={(ev) => onCardHover?.(entry.card, ev.currentTarget as HTMLElement)}
							onmouseleave={() => onCardHoverEnd?.()}
						>
							<CardScanFullTiny
								card={entry.card}
								quantity={entry.quantity}
								maxQuantity={zoneMax(mainEntries)}
								width={cardWidth}
								badge={entry.quantity}
							/>
						</div>
					{:else}
						<CardStack
							card={entry.card}
							source={deckSource('main', entry.card.code)}
							{dnd}
							quantity={entry.quantity}
							maxQuantity={zoneMax(mainEntries)}
							width={cardWidth}
							badge={entry.quantity}
							dragCopies={team.pickMode === 'one' ? 1 : entry.quantity}
							onClick={(source) => onStackClick?.(source)}
							onHover={onCardHover}
							onHoverEnd={onCardHoverEnd}
						/>
					{/if}
				</div>
			{/each}
		</div>

		{#if showSideZone}
			<div
				class="border-primary-400 dark:border-primary-600 mt-2 rounded border border-dashed p-1"
				transition:fade={{ duration: 150 }}
			>
				<div class="flex items-baseline gap-2 px-1 text-sm">
					<span class="text-primary-900 dark:text-primary-100 font-semibold">
						{m.tool_evergreen_team_side_deck()}
					</span>
					<span class="text-primary-700 dark:text-primary-300 font-bold">
						{m.tool_evergreen_team_side_deck_xp({ xp: sideXp })}
					</span>
					{#if !viewMode && onClearZone}
						<button
							type="button"
							class="clear-zone ml-auto"
							aria-label={m.tool_evergreen_team_clear_section()}
							title={m.tool_evergreen_team_clear_section()}
							onclick={() => onClearZone(deckIndex, 'side')}
						>
							✕
						</button>
					{/if}
				</div>
				<div class="mt-1 flex min-h-8 flex-wrap gap-1">
					{#each focusedSideEntries as entry (entry.card.code)}
						<div
							class:overlap={overlaps?.has(entry.card.code) ?? false}
							animate:flip={{ duration: 200 }}
							in:scale={{ duration: 150 }}
							out:fade={{ duration: 100 }}
						>
							{#if viewMode}
								<div
									role="img"
									onmouseenter={(ev) => onCardHover?.(entry.card, ev.currentTarget as HTMLElement)}
									onmouseleave={() => onCardHoverEnd?.()}
								>
									<CardScanFullTiny
										card={entry.card}
										quantity={entry.quantity}
										maxQuantity={zoneMax(sideEntries)}
										width={cardWidth}
										badge={entry.quantity}
									/>
								</div>
							{:else}
								<CardStack
									card={entry.card}
									source={deckSource('side', entry.card.code)}
									{dnd}
									quantity={entry.quantity}
									maxQuantity={zoneMax(sideEntries)}
									width={cardWidth}
									badge={entry.quantity}
									dragCopies={team.pickMode === 'one' ? 1 : entry.quantity}
									onClick={(source) => onStackClick?.(source)}
									onHover={onCardHover}
									onHoverEnd={onCardHoverEnd}
								/>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* The outline width is constant (transparent when inactive) and outlines
	   never take layout space, so highlights cannot shift the layout. The
	   panels around the areas provide the padding that keeps the outline from
	   being clipped at container edges. */
	.area {
		outline: 3px solid transparent;
		outline-offset: 2px;
		transition:
			outline-color 120ms ease,
			filter 120ms ease,
			opacity 120ms ease;
	}

	.area.eligible {
		outline-color: rgba(220, 38, 38, 0.85);
	}

	.area.eligible.hovering {
		outline-color: rgb(220, 38, 38);
		background-color: rgba(220, 38, 38, 0.08);
	}

	.area.drag-rejected {
		filter: grayscale(1);
		opacity: 0.6;
		cursor: no-drop;
	}

	/* Overlapping stack: red tint over the whole stack, the drag target of
	   a fix (return it to the collection). */
	.overlap {
		position: relative;
		border-radius: 0.25rem;
		outline: 2px solid rgb(220, 38, 38);
		outline-offset: 1px;
	}

	.overlap::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 0.25rem;
		background-color: rgba(220, 38, 38, 0.35);
		pointer-events: none;
	}

	.clear-zone {
		cursor: pointer;
		border-radius: 0.25rem;
		padding: 0 0.375rem;
		font-size: 0.75rem;
		line-height: 1.25rem;
		background-color: rgba(0, 0, 0, 0.2);
		color: white;
		transition: background-color 120ms ease;
	}

	.clear-zone:hover {
		background-color: rgb(220, 38, 38);
	}

	.clear-zone.swap:hover {
		background-color: var(--color-primary-600);
	}
</style>
