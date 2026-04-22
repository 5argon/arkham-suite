<!--
@component
Modal for importing multiple decks from URLs or IDs.
Has three phases: input, loading, and result display with tabs.
-->
<script lang="ts">
	import type { Deck, LocalizationResolver } from '@5argon/arkham-kohaku';
	import {
		service,
		linkedAhdbDeckToDeck,
		CardResolver,
		DeckSource,
		type Taboo
	} from '@5argon/arkham-kohaku';
	import Modal from '../layout/Modal.svelte';
	import ImportDecksForm from './ImportDecksForm.svelte';
	import PlusArea from './PlusArea.svelte';
	import ImportDecksImportResult from './ImportDecksImportResult.svelte';
	import Tabs, { type TabItem } from '../navigation/Tabs.svelte';
	import Button from '../button/Button.svelte';
	import TextArea from '../form/TextArea.svelte';
	import * as m from '../paraglide/messages.js';

	interface Prop {
		isOpen: boolean;
		onClose: () => void;
		confirmButtonText: string;
		onConfirm: (decks: Deck[]) => void;
		cardResolver: CardResolver;
		taboos: Taboo[];
		localizationResolver?: LocalizationResolver;
		languageCode?: string;
		/**
		 * Maximum number of decks that can be imported at once.
		 * If undefined, there is no limit.
		 */
		limit?: number;
		/**
		 * Initial deck IDs or URLs to pre-fill the form.
		 * Useful when reopening the modal to add more decks.
		 */
		initialDeckIds?: string[];
		/**
		 * If true, shows a textarea for batch importing multiple decks at once.
		 * Users can paste deck URLs or IDs line by line.
		 * Skips the preview phase and imports directly.
		 */
		batchImport?: boolean;
		/**
		 * Controls the `mode` prop passed to DeckDisplay / DeckBanner in the result preview step.
		 * Use `'campaign'` to always show the latest deck in the upgrade chain regardless of which
		 * version the user imported.
		 * Defaults to `'decklist'`.
		 */
		previewMode?: 'campaign' | 'decklist';
	}

	const {
		isOpen,
		onClose,
		confirmButtonText,
		onConfirm,
		cardResolver,
		taboos,
		localizationResolver,
		languageCode,
		limit,
		initialDeckIds = [],
		batchImport = false,
		previewMode = 'decklist'
	}: Prop = $props();

	type Phase = 'input' | 'loading' | 'result';
	type ImportResult = { success: true; deck: Deck } | { success: false; error: string };

	let phase = $state<Phase>('input');
	let deckInputs = $state<string[]>(['']);
	let batchTextArea = $state<string>('');
	let savedDeckInputs = $state<string[]>(['']); // Saved state for reset
	let loadingProgress = $state({ current: 0, total: 0 });
	let importResults = $state<ImportResult[]>([]);
	let activeTabIndex = $state(0);

	// Initialize from props
	$effect(() => {
		if (initialDeckIds.length > 0) {
			deckInputs = initialDeckIds;
			savedDeckInputs = initialDeckIds;
			if (batchImport) {
				batchTextArea = initialDeckIds.join('\n');
			}
		}
	});

	function addDeckInput() {
		if (limit !== undefined && deckInputs.length >= limit) {
			return;
		}
		deckInputs = [...deckInputs, ''];
	}

	function removeDeckInput(index: number) {
		deckInputs = deckInputs.filter((_, i) => i !== index);
	}

	function updateDeckInput(index: number, value: string) {
		deckInputs = deckInputs.map((input, i) => (i === index ? value : input));
	}

	// Parse batch text area into lines
	const batchLines = $derived(
		batchImport ? batchTextArea.split('\n').filter((line) => line.trim().length > 0) : []
	);

	// Filter out inputs with unknown sources
	const validInputs = $derived(
		batchImport
			? batchLines.filter((input) => {
					const predicted = service.predictDeckInput(input);
					return predicted.source !== DeckSource.Unknown;
				})
			: deckInputs.filter((input) => {
					if (!input.trim()) return false;
					const predicted = service.predictDeckInput(input);
					return predicted.source !== DeckSource.Unknown;
				})
	);

	// Count deck types for batch import
	const batchStats = $derived.by(() => {
		if (!batchImport) return null;
		const stats = {
			total: validInputs.length,
			arkhamDb: 0,
			arkhamBuild: 0,
			arkhamCards: 0
		};
		validInputs.forEach((input) => {
			const predicted = service.predictDeckInput(input);
			if (
				predicted.source === DeckSource.ArkhamDbPublic ||
				predicted.source === DeckSource.ArkhamDbPublished
			) {
				stats.arkhamDb++;
			} else if (predicted.source === DeckSource.ArkhamBuildShared) {
				stats.arkhamBuild++;
			} else if (predicted.source === DeckSource.ArkhamCards) {
				stats.arkhamCards++;
			}
		});
		return stats;
	});

	const canImport = $derived(validInputs.length > 0);

	const canAddMore = $derived(limit === undefined || deckInputs.length < limit);

	async function handleImport() {
		if (!canImport) return;

		// Save current state before loading
		savedDeckInputs = [...deckInputs];

		phase = 'loading';
		loadingProgress = { current: 0, total: validInputs.length };
		importResults = [];

		// Custom fetch function that disables caching
		const noCacheFetch = (input: string | URL | Request, init?: RequestInit) => {
			return fetch(input, { ...init, cache: 'no-store' });
		};

		const promises = validInputs.map(async (input) => {
			try {
				const linkedDeck = await service.fetchDeckRecursive(noCacheFetch, input);
				const deck = linkedAhdbDeckToDeck(linkedDeck, cardResolver, taboos);
				loadingProgress.current++;
				return { success: true, deck } as ImportResult;
			} catch (error) {
				loadingProgress.current++;
				return {
					success: false,
					error: error instanceof Error ? error.message : m.form_unknown_error()
				} as ImportResult;
			}
		});

		importResults = await Promise.all(promises);

		// In batch mode, skip preview and directly call onConfirm with successful decks
		if (batchImport) {
			const successfulDecks = importResults
				.filter((result): result is { success: true; deck: Deck } => result.success)
				.map((result) => result.deck);
			onConfirm(successfulDecks);
		} else {
			phase = 'result';
			activeTabIndex = 0;
		}
	}

	function handleReset() {
		phase = 'input';
		// Restore saved state instead of resetting to empty
		deckInputs = [...savedDeckInputs];
		importResults = [];
		activeTabIndex = 0;
	}

	function handleConfirm() {
		const successfulDecks = importResults
			.filter((result): result is { success: true; deck: Deck } => result.success)
			.map((result) => result.deck);
		onConfirm(successfulDecks);
	}

	const tabs = $derived<TabItem[]>(
		importResults.map((result, index) => ({
			label: result.success
				? result.deck.name
				: `${m.form_deck()} ${index + 1}`
		}))
	);

	function handleClose() {
		if (phase !== 'loading') {
			onClose();
		}
	}

	const modalMaxWidth = $derived(phase === 'result' ? 'full' : 'md');

	const fetchButtonText = $derived.by(() => {
		if (validInputs.length === 0) {
			return m.button_fetch_decks();
		} else if (validInputs.length === 1) {
			return m.button_fetch_deck_singular({ count: validInputs.length.toString() });
		} else {
			return m.button_fetch_deck_plural({ count: validInputs.length.toString() });
		}
	});
</script>

<Modal
	{isOpen}
	onClose={handleClose}
	disableOverlayClose={phase === 'loading'}
	maxWidth={modalMaxWidth}
	title={m.form_import_decks()}
>
	{#if phase === 'input'}
		{#if batchImport}
			<div class="space-y-3">
				<TextArea
					bind:value={batchTextArea}
					label={m.form_batch_import_label()}
					placeholder="https://arkhamdb.com/deck/view/1234567
https://arkhamdb.com/decklist/view/12345
https://arkham.build/deck/view/1234567
https://arkham.build/share/asdfasdfasdfasd
"
					rows={10}
					help={m.form_batch_import_help()}
				/>
				{#if batchStats && batchStats.total > 0}
					<div class="bg-primary-200 dark:bg-primary-800 rounded p-3 text-sm">
						<p class="font-semibold text-black dark:text-white">
							{m.form_valid_decks_detected()}: {batchStats.total}
						</p>
						<ul class="text-primary-700 dark:text-primary-300 mt-1 space-y-1">
							{#if batchStats.arkhamDb > 0}
								<li>ArkhamDB: {batchStats.arkhamDb}</li>
							{/if}
							{#if batchStats.arkhamBuild > 0}
								<li>Arkham.build: {batchStats.arkhamBuild}</li>
							{/if}
							{#if batchStats.arkhamCards > 0}
								<li>ArkhamCards: {batchStats.arkhamCards}</li>
							{/if}
						</ul>
					</div>
				{/if}
			</div>
		{:else}
			<div class="space-y-3">
				{#each deckInputs as _, index (index)}
					<ImportDecksForm
						bind:value={deckInputs[index]}
						onChange={(value) => updateDeckInput(index, value)}
						onRemove={() => removeDeckInput(index)}
						showRemove={deckInputs.length > 1}
						deckNumber={index + 1}
					/>
				{/each}
				{#if limit !== 1}
					<PlusArea onClick={addDeckInput} disabled={!canAddMore} />
					{#if limit !== undefined && deckInputs.length >= limit}
						<p class="text-primary-600 dark:text-primary-400 text-center text-sm">
							{m.form_deck_limit_reached({ limit: limit.toString() })}
						</p>
					{/if}
				{/if}
			</div>
		{/if}
	{:else if phase === 'loading'}
		<div class="flex flex-col items-center gap-4 py-8">
			<div
				class="border-primary-200 border-t-primary-600 dark:border-primary-700 dark:border-t-primary-400 h-16 w-16 animate-spin rounded-full border-4"
			></div>
			<p class="text-lg text-black dark:text-white">
				{loadingProgress.total === 1
					? m.form_loading_deck_singular({
							current: loadingProgress.current.toString(),
							total: loadingProgress.total.toString()
						})
					: m.form_loading_deck_plural({
							current: loadingProgress.current.toString(),
							total: loadingProgress.total.toString()
						})}
			</p>
		</div>
	{:else if phase === 'result'}
		<div class="flex flex-col gap-4">
			<Tabs
				direction="horizontal"
				{tabs}
				{activeTabIndex}
				onTabChange={(index) => (activeTabIndex = index)}
			/>
			{#if importResults[activeTabIndex]}
				<ImportDecksImportResult
					{cardResolver}
					result={importResults[activeTabIndex]}
					{localizationResolver}
					{languageCode}
					mode={previewMode}
				/>
			{/if}
		</div>
	{/if}

	{#snippet footer()}
		{#if phase === 'input'}
			<div class="flex justify-end gap-2">
				<Button label={m.button_cancel()} onClick={onClose} />
				<Button label={fetchButtonText} onClick={handleImport} disabled={!canImport} highlighted />
			</div>
		{:else if phase === 'result'}
			<div class="flex justify-end gap-2">
				<Button label={m.button_reset()} onClick={handleReset} />
				<Button label={confirmButtonText} onClick={handleConfirm} highlighted />
			</div>
		{/if}
	{/snippet}
</Modal>
