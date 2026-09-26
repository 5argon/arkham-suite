<!--
@component
A record's decks: imported upgrade chains, or an investigator without a deck. Each shows its owner
and, for a standalone, its Standalone Mode XP tier; a multi-handed solo numbers each deck's hand.
-->
<script lang="ts">
	import {
		Button,
		CardFormMultiple,
		DeckBanner,
		DeckDisplay,
		FaIconType,
		FormLabelWithHelp,
		getToastContext,
		ImportDecksModal,
		Modal,
		SectionSeparator,
		UserDisplay,
		type SelectedCardEntry
	} from '@5argon/arkham-life-ui';
	import { card, type Deck } from '@5argon/arkham-kohaku';
	import * as m from '$lib/paraglide/messages.js';
	import {
		createCardResolver,
		getAllCards,
		loadAllTabooLists,
		resolveCardOrNull
	} from '$lib/card-data';
	import { databaseStore } from '$lib/database/database.svelte';
	import type { ResolvedDeck, ResolvedPlayer } from '$lib/database/repository';
	import { deckPreview, importedVersions, standaloneDeckXp } from './deck-records';

	interface Props {
		recordId: string;
		decks: ResolvedDeck[];
		players: ResolvedPlayer[];
		/** Standalone: one deck, no upgrades. */
		singleDeck: boolean;
		/** Multi-handed solo: number each deck's hand. */
		showHands: boolean;
	}
	let { recordId, decks, players, singleDeck, showHands }: Props = $props();

	const toast = getToastContext();
	const cardResolver = createCardResolver();
	const tabooLists = loadAllTabooLists();
	const investigatorCards = getAllCards().filter(card.deckbuildingInvestigatorCardsFilter);

	const previews = $derived(new Map(decks.map((d) => [d.id, deckPreview(d, cardResolver, tabooLists)])));

	let showImportModal = $state(false);
	// Bumped after the close transition to remount a fresh import modal (bumping on open skips its fade).
	let importModalKey = $state(0);
	function closeImportModal() {
		showImportModal = false;
		setTimeout(() => importModalKey++, 250);
	}
	function importDecks(imported: Deck[]) {
		closeImportModal();
		for (const deck of imported) {
			const { investigator, versions, trimmed } = importedVersions(deck, singleDeck);
			if (trimmed) toast.error(m.archive_deck_standalone_trimmed());
			databaseStore.addDeck(recordId, { investigator, versions });
		}
	}

	let addInvestigatorOpen = $state(false);
	let addInvestigatorEntries = $state<SelectedCardEntry[]>([]);
	function closeAddInvestigator() {
		addInvestigatorOpen = false;
		addInvestigatorEntries = [];
	}
	function addInvestigators() {
		for (const entry of addInvestigatorEntries) {
			databaseStore.addDeck(recordId, { investigator: entry.code, versions: [] });
		}
		closeAddInvestigator();
	}

	let assignOwnerDeck = $state<ResolvedDeck | null>(null);
	function assignOwner(ownerUid: string | null) {
		if (assignOwnerDeck) databaseStore.assignDeckOwner(recordId, assignOwnerDeck.id, ownerUid);
		assignOwnerDeck = null;
	}
	const assignLabel = (deck: ResolvedDeck) =>
		deck.versions.length ? m.archive_assign_owner() : m.archive_assign_player();

	function setHand(deckId: string, raw: string) {
		const n = Math.floor(Number(raw));
		databaseStore.assignDeckHand(recordId, deckId, Number.isFinite(n) && n >= 1 ? Math.min(n, 4) : null);
	}

	/** The deck whose contents are shown in the deck modal. */
	let openDeck = $state<Deck | null>(null);
</script>

{#snippet guestChip()}
	<span
		class="bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 rounded px-2 py-0.5 text-xs font-semibold"
		>{m.archive_guest()}</span
	>
{/snippet}

<SectionSeparator title={m.archive_tab_decks()} />

<div class="mt-4">
	<div class="mb-4 flex flex-wrap gap-3">
		{#each decks as deckRow (deckRow.id)}
			{@const deck = previews.get(deckRow.id)}
			{@const deckLess = deckRow.versions.length === 0}
			<div class="flex flex-col items-center gap-2">
				{#if deck}
					<DeckBanner
						{deck}
						{cardResolver}
						mode="campaign"
						onClick={deckLess ? undefined : () => (openDeck = deck)}
					/>
				{:else}
					<div
						class="border-primary-300 dark:border-primary-600 flex h-20 w-32 items-center justify-center rounded border p-2 text-center text-xs font-semibold text-black dark:text-white"
					>
						{resolveCardOrNull(deckRow.investigator.investigatorCode)?.name ??
							deckRow.investigator.investigatorCode}
					</div>
				{/if}

				{#if singleDeck && !deckLess}
					{@const xp = standaloneDeckXp(deckRow.versions)}
					{#if xp?.tier}
						<span
							class="bg-secondary-100 text-secondary-800 dark:bg-secondary-900/40 dark:text-secondary-200 inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold"
							title={m.archive_deck_xp_title({ xp: xp.total })}
						>
							{xp.tier.label}
						</span>
					{:else if xp}
						<span
							class="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-200"
							title={m.archive_deck_xp_over_title()}
						>
							⚠ {m.archive_deck_xp_over({ xp: xp.total })}
						</span>
					{/if}
				{/if}

				{#if deckRow.owner}
					<UserDisplay
						username={deckRow.owner.name}
						card={resolveCardOrNull(deckRow.owner.iconCardCode)}
						size="sm"
					/>
				{:else}
					<span
						class="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
					>
						⚠ {m.archive_deck_no_owner()}
					</span>
				{/if}

				{#if showHands}
					<label
						class="text-primary-700 dark:text-primary-300 flex items-center gap-1 text-xs font-semibold"
					>
						{m.archive_deck_hand()}
						<input
							type="number"
							min="1"
							max="4"
							value={deckRow.hand ?? ''}
							onchange={(e) => setHand(deckRow.id, e.currentTarget.value)}
							class="border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-800 w-12 rounded border px-1.5 py-0.5 text-center text-black dark:text-white"
						/>
					</label>
				{/if}

				<div class="flex gap-1">
					<Button
						label={assignLabel(deckRow)}
						icon={FaIconType.Investigator}
						onClick={() => (assignOwnerDeck = deckRow)}
					/>
					<Button
						label={m.archive_logs_remove()}
						icon={FaIconType.Delete}
						danger
						hideLabel
						onClick={() => databaseStore.removeDeck(recordId, deckRow.id)}
					/>
				</div>
			</div>
		{/each}
	</div>

	<div class="flex flex-wrap gap-2">
		<FormLabelWithHelp label={m.archive_import_decks()} disableClick>
			<Button
				label={m.archive_import_decks()}
				icon={FaIconType.Import}
				onClick={() => (showImportModal = true)}
			/>
		</FormLabelWithHelp>
		<FormLabelWithHelp label={m.archive_add_investigator()} disableClick>
			<Button
				label={m.archive_add_investigator()}
				icon={FaIconType.Investigator}
				onClick={() => (addInvestigatorOpen = true)}
			/>
		</FormLabelWithHelp>
	</div>
</div>

{#key importModalKey}
	<ImportDecksModal
		{cardResolver}
		taboos={tabooLists}
		confirmButtonText={m.archive_import_decks()}
		isOpen={showImportModal}
		onClose={closeImportModal}
		onConfirm={importDecks}
		previewMode="campaign"
	/>
{/key}

<Modal
	isOpen={assignOwnerDeck !== null}
	onClose={() => (assignOwnerDeck = null)}
	title={assignOwnerDeck ? assignLabel(assignOwnerDeck) : ''}
	maxWidth="sm"
>
	<div class="flex flex-col gap-2 py-2">
		<button
			class="hover:bg-primary-100 dark:hover:bg-primary-800 rounded p-2 text-left text-sm text-black dark:text-white"
			onclick={() => assignOwner(null)}
		>
			{m.archive_deck_no_owner()}
		</button>
		{#each players as player (player.uid)}
			<button
				class="hover:bg-primary-100 dark:hover:bg-primary-800 flex items-center gap-2 rounded p-2 text-left"
				onclick={() => assignOwner(player.uid)}
			>
				<UserDisplay username={player.name} card={resolveCardOrNull(player.iconCardCode)} size="sm" />
				{#if player.isGuest}{@render guestChip()}{/if}
			</button>
		{/each}
	</div>
</Modal>

<Modal
	isOpen={addInvestigatorOpen}
	onClose={closeAddInvestigator}
	title={m.archive_add_investigator()}
	maxWidth="lg"
>
	<div class="flex flex-col gap-4 pb-4">
		<p class="text-primary-500 dark:text-primary-400 text-sm">{m.archive_add_investigator_help()}</p>
		<CardFormMultiple
			allowDuplicates={false}
			cards={investigatorCards}
			filter={card.deckbuildingInvestigatorCardsFilter}
			label={m.archive_add_investigator_search()}
			onEntriesChange={(entries) => (addInvestigatorEntries = entries)}
			selectedEntries={addInvestigatorEntries}
		/>
		<Button
			label={m.archive_logs_add()}
			highlighted
			disabled={addInvestigatorEntries.length === 0}
			onClick={addInvestigators}
		/>
	</div>
</Modal>

<Modal
	isOpen={openDeck !== null}
	onClose={() => (openDeck = null)}
	title={m.archive_tab_decks()}
	maxWidth="full"
>
	{#if openDeck}
		<DeckDisplay deck={openDeck} {cardResolver} mode="campaign" />
	{/if}
</Modal>
