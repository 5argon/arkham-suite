<!--
@component
Screenshot-friendly full-screen view of a whole team: every investigator's
deck rendered non-interactively with no scroll traps, a readiness strip, a
per-deck full DeckDisplay modal, exports, and an Unused Cards view of what is
left in the pool. Shared by the team builder's view mode and the pre-built
team page.
-->
<script lang="ts">
	import {
		Button,
		CardLineHoverTooltip,
		CardScanFullTiny,
		Checkbox,
		DeckDisplay,
		FaIconType,
		LIMIT_STACKING_QUANTITY,
		Modal
	} from '@5argon/arkham-life-ui';
	import { ProductIcon } from '@5argon/arkham-icon';
	import { type Card, type Deck, linkedAhdbDeckToDeck } from '@5argon/arkham-kohaku';
	import { u as stringUtils } from '@5argon/arkham-string';

	import { createCardResolver, getAllCards, loadAllTabooLists } from '$lib/card-data';
	import { EvergreenDnd } from '$lib/design/pages/tool/evergreen-team/planning/dnd.svelte';
	import ExportTeamModal from '$lib/design/pages/tool/evergreen-team/planning/ExportTeamModal.svelte';
	import InvestigatorArea from '$lib/design/pages/tool/evergreen-team/planning/InvestigatorArea.svelte';
	import TeamStatusBar from '$lib/design/pages/tool/evergreen-team/planning/TeamStatusBar.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { toAhdbDeck } from '$lib/tool/evergreen-team/export';
	import { buildPool, poolSections } from '$lib/tool/evergreen-team/pool';
	import { buildEligibility, remainingOf } from '$lib/tool/evergreen-team/rules';
	import type { DeckMeta, EvergreenState } from '$lib/tool/evergreen-team/types';

	interface Prop {
		team: EvergreenState;
		/**
		 * Name and description per deck, parallel to team.decks.
		 */
		deckMeta: DeckMeta[];
	}
	const { team, deckMeta }: Prop = $props();

	const allCards = getAllCards();
	const resolver = createCardResolver();
	const getFrozenSetup = () => team.setup;
	const pool = buildPool(getFrozenSetup(), allCards);
	const eligibility = buildEligibility(
		getFrozenSetup().investigators.map((code) => resolver.resolve(code)),
		pool
	);
	// The viewer never drags.
	const dnd = new EvergreenDnd();

	// Card name tooltip, same as the editor: tiny scans are hard to read.
	let tooltipCard = $state<Card | null>(null);
	let tooltipEl = $state<HTMLElement | null>(null);
	function handleCardHover(card: Card, el: HTMLElement) {
		tooltipCard = card;
		tooltipEl = el;
	}
	function handleCardHoverEnd() {
		tooltipCard = null;
	}

	let compact = $state(false);
	let showUnused = $state(false);
	let showExport = $state(false);
	const cardWidth = $derived(compact ? 48 : 64);

	// Per-deck full DeckDisplay modal, built the same way other pages show
	// imported decks: our deck -> ArkhamDB JSON -> kohaku Deck.
	let openDeck = $state<Deck | null>(null);
	function openDeckModal(deckIndex: number) {
		const investigator = resolver.resolve(team.decks[deckIndex].investigator);
		const ahdbDeck = toAhdbDeck({
			state: team,
			deckIndex,
			resolver,
			name: deckMeta[deckIndex]?.name ?? investigator.name,
			description: deckMeta[deckIndex]?.description ?? ''
		});
		openDeck = linkedAhdbDeckToDeck({ deck: ahdbDeck }, resolver, loadAllTabooLists());
	}

	// The unused cards the team could still take, like the editor's collection.
	const usable = new Set(
		[...pool.keys()].filter((code) => (eligibility.get(code) ?? []).some(Boolean))
	);
	const allSections = poolSections(getFrozenSetup(), pool);
	const unusedSections = $derived(
		allSections
			.map((section) => ({
				product: section.product,
				entries: section.entries
					.filter((e) => usable.has(e.card.code))
					.map((e) => ({ entry: e, remaining: remainingOf(team, pool, e.card.code) }))
					.filter((x) => x.remaining > 0)
			}))
			.filter((section) => section.entries.length > 0)
	);
	const gridMaxQuantity = $derived(
		Math.min(
			LIMIT_STACKING_QUANTITY,
			Math.max(1, ...unusedSections.flatMap((s) => s.entries.map((x) => x.remaining)))
		)
	);
</script>

<div class="flex flex-wrap items-center justify-center gap-3">
	<Checkbox
		label={m.tool_evergreen_team_compact()}
		checked={compact}
		onChange={() => (compact = !compact)}
	/>
	<Checkbox
		label={m.tool_evergreen_team_unused_cards()}
		checked={showUnused}
		onChange={() => (showUnused = !showUnused)}
	/>
	<Button
		icon={FaIconType.Import}
		label={m.tool_evergreen_team_export()}
		onClick={() => (showExport = true)}
	/>
</div>
<TeamStatusBar {team} {resolver} />
{#if showUnused}
	<div class="mt-2 flex flex-col gap-3">
		{#each unusedSections as section (section.product)}
			<div>
				<div
					class="border-primary-300 dark:border-primary-700 text-primary-900 dark:text-primary-100 mb-1 flex items-center gap-2 border-b pb-0.5"
				>
					<ProductIcon product={section.product} />
					<span class="font-semibold">{stringUtils.productName(section.product)}</span>
					<span class="text-primary-600 dark:text-primary-400 ml-auto text-xs">
						{section.entries.reduce((sum, x) => sum + x.remaining, 0)}
					</span>
				</div>
				<div class="flex flex-wrap gap-1.5">
					{#each section.entries as { entry, remaining } (entry.card.code)}
						<div
							role="img"
							onmouseenter={(ev) => handleCardHover(entry.card, ev.currentTarget as HTMLElement)}
							onmouseleave={handleCardHoverEnd}
						>
							<CardScanFullTiny
								card={entry.card}
								quantity={remaining}
								maxQuantity={gridMaxQuantity}
								width={cardWidth}
								badge={remaining}
							/>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{:else}
	<div class="mt-2 grid grid-cols-1 gap-3" class:lg:grid-cols-2={team.decks.length >= 2}>
		{#each team.decks as deck, deckIndex (deck.investigator)}
			<InvestigatorArea
				{team}
				{deckIndex}
				{pool}
				{eligibility}
				{dnd}
				{resolver}
				viewMode
				{compact}
				onOpenDeck={openDeckModal}
				onCardHover={handleCardHover}
				onCardHoverEnd={handleCardHoverEnd}
			/>
		{/each}
	</div>
{/if}

{#if tooltipCard}
	<CardLineHoverTooltip card={tooltipCard} visible={true} referenceElement={tooltipEl} />
{/if}

<Modal
	isOpen={openDeck !== null}
	maxWidth="full"
	onClose={() => (openDeck = null)}
	title={openDeck?.name ?? ''}
>
	{#if openDeck !== null}
		<DeckDisplay cardResolver={resolver} deck={openDeck} mode="decklist" />
	{/if}
</Modal>

<ExportTeamModal
	{team}
	{resolver}
	{deckMeta}
	isOpen={showExport}
	onClose={() => (showExport = false)}
/>
