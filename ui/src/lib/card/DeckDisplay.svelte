<!--
@component
Complete deck display with banner, investigator cards, list view, and grid view.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		type Deck,
		type LocalizationResolver,
		type CardResolver,
		CardType,
		deck as deckUtility,
		DeckSource,
		service,
		CardClass
	} from '@5argon/arkham-kohaku';
	import DeckBanner from './DeckBanner.svelte';
	import DeckDisplayList from './DeckDisplayList.svelte';
	import DeckDisplayGrid from './DeckDisplayGrid.svelte';
	import DeckDescriptionReader from './DeckDescriptionReader.svelte';
	import ExportDeckCardRender from './ExportDeckCardRender.svelte';
	import ExportDeckModal from './ExportDeckModal.svelte';
	import CardScanFullSmallGridInvestigator from './CardScanFullSmallGridInvestigator.svelte';
	import type { CardItem, GroupingSortingSettings } from './card-item.js';
	import SectionSeparator from '../typography/SectionSeparator.svelte';
	import FlexibleCardDisplay from './FlexibleCardDisplay.svelte';
	import Checkbox from '../form/Checkbox.svelte';
	import Button from '../button/Button.svelte';
	import Modal from '../layout/Modal.svelte';
	import {
		findLinkedCardsSpecial,
		deckAdvancedCombinedSettings,
		deckAdvancedMainSettings,
		deckAdvancedSideSettings,
		deckAdvancedLinkedSettings,
		deckAdvancedExtraSettings
	} from './card-item.js';

	import * as m from '../paraglide/messages.js';
	import { markdownToPlainText } from './markdown-processor.js';
	import { FaIconType } from '../icon';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import TextParagraph from '../typography/TextParagraph.svelte';

	interface Prop {
		deck: Deck;
		cardResolver: CardResolver;
		localizationResolver?: LocalizationResolver;
		languageCode?: string;
		mode?: 'campaign' | 'decklist';
		toolbar?: boolean;
		/**
		 * Lazy factory for the share URL. Called only when the export modal or export view is opened.
		 * Should be provided by the application layer (uses protobuf compression).
		 */
		getShareUrl?: () => string | undefined;
		/**
		 * URL to view this deck in our own deck viewer (e.g. `/deck/view?id=4931805`).
		 * When provided, a "View in Deck Viewer" button is shown that opens it in a new tab.
		 * Provided by the application layer since the route is app-specific.
		 */
		deckViewerUrl?: string;
		/**
		 * Rendered between the description / toolbar and the card lists, e.g.
		 * tabs that switch what the lists below show.
		 */
		beforeList?: Snippet;
		/**
		 * Skips the card lists (the caller renders something else after).
		 */
		hideList?: boolean;
		/**
		 * Skips the banner, buttons, and description preview: lists only.
		 */
		hideHeader?: boolean;
		/**
		 * Passed to the banner: small attribution lines under the deck name.
		 */
		byline?: { label: string; href?: string }[];
		/**
		 * Passed to the banner: investigator stats at or above this value render emphasized.
		 */
		highlightStatsAtLeast?: number;
		/**
		 * Passed to the banner: investigator stats at or below this value render dimmed.
		 */
		dimStatsAtMost?: number;
	}

	let {
		deck,
		cardResolver,
		localizationResolver,
		languageCode,
		mode = 'decklist',
		toolbar = false,
		getShareUrl,
		deckViewerUrl,
		beforeList,
		hideList = false,
		hideHeader = false,
		byline,
		highlightStatsAtLeast,
		dimStatsAtMost,
		showExportView = $bindable(false),
		showDescriptionReader = $bindable(false)
	}: Prop & { showExportView?: boolean; showDescriptionReader?: boolean } = $props();

	let shareUrl = $state<string | undefined>(undefined);

	function openExportModal() {
		shareUrl = getShareUrl?.();
		showExportModal = true;
	}

	function openExportView() {
		shareUrl = getShareUrl?.();
		showExportView = true;
	}

	let advanced = $state(false);
	let combineCards = $state(false);
	let showExportModal = $state(false);
	let showArkhamDbIncompatibilityModal = $state(false);

	const forwardResult = $derived.by(() => {
		const latestDeck = mode === 'campaign' ? deckUtility.forwardToLatest(deck) : deck;
		const forwarded = deckUtility.forwardDefault(latestDeck, cardResolver);
		return forwarded;
	});
	const deckLatestForwarded = $derived(forwardResult.deck);
	const tabooEffective = $derived(forwardResult.anyChanges);

	const mainCards = $derived(
		deckLatestForwarded.mainDeck.map((cq): CardItem => ({
			card: cq.card,
			quantity: cq.quantity
		}))
	);

	const sideCards = $derived(
		deckLatestForwarded.sideDeck.map((cq): CardItem => ({
			card: cq.card,
			quantity: cq.quantity
		}))
	);

	const extraCards: CardItem[] = $derived(
		deckLatestForwarded.meta.extraDeck?.map((cq): CardItem => ({
			card: cq.card,
			quantity: cq.quantity
		})) ?? []
	);

	// Find all linked cards (bonded and customizable upgrades) from main and side decks
	const linkedCards = $derived.by(() => {
		if (!cardResolver) return [];

		const allCards = [
			...deckLatestForwarded.mainDeck.map((cq) => cq.card),
			...deckLatestForwarded.sideDeck.map((cq) => cq.card)
		];

		const linkedSet = new Set<string>();
		const linkedCardItems: CardItem[] = [];

		for (const card of allCards) {
			const linked = findLinkedCardsSpecial(card, cardResolver);
			for (const linkedCard of linked) {
				if (!linkedSet.has(linkedCard.code)) {
					linkedSet.add(linkedCard.code);
					linkedCardItems.push({
						card: linkedCard,
						quantity: linkedCard.cardType === CardType.Upgrade ? 1 : linkedCard.quantity
					});
				}
			}
		}

		return linkedCardItems;
	});

	// Labeled versions of cards for combined display
	// Add unique IDs to prevent duplicate keys when the same card appears in multiple sections
	const mainCardsLabeled = $derived(
		mainCards.map((ci, idx): CardItem => ({ ...ci, id: `main-${ci.card.code}-${idx}` }))
	);
	const sideCardsLabeled = $derived(
		sideCards.map((ci, idx): CardItem => ({
			...ci,
			id: `side-${ci.card.code}-${idx}`,
			quantityColor: CardClass.Survivor,
			labels: [{ text: m.card_side(), color: CardClass.Survivor }]
		}))
	);
	const linkedCardsLabeled = $derived(
		linkedCards.map((ci, idx): CardItem => ({
			...ci,
			id: `linked-${ci.card.code}-${idx}`,
			quantityColor: CardClass.Seeker,
			labels: [{ text: m.card_linked(), color: CardClass.Seeker }]
		}))
	);
	const extraCardsLabeled = $derived(
		extraCards.map((ci, idx): CardItem => ({
			...ci,
			id: `extra-${ci.card.code}-${idx}`,
			quantityColor: CardClass.Mystic,
			labels: [{ text: m.card_extra(), color: CardClass.Mystic }]
		}))
	);

	const allCombinedCards = $derived([
		...mainCardsLabeled,
		...sideCardsLabeled,
		...linkedCardsLabeled,
		...extraCardsLabeled
	]);

	// Prepare description preview
	const descriptionPreview: string | null = $derived.by(() => {
		const intro = deckLatestForwarded.meta.introMd;
		const desc = deckLatestForwarded.descriptionMd;

		let textToPreview = '';
		if (intro && intro.trim().length > 0) {
			textToPreview = intro;
		} else if (desc && desc.trim().length > 0) {
			textToPreview = desc;
		} else {
			return null;
		}
		const descriptionPreviewLength = 400;
		textToPreview = textToPreview.substring(0, descriptionPreviewLength) + '...';
		// Process markdown to plain text (strips HTML tags and markdown formatting)
		return markdownToPlainText(textToPreview);
	});

	const hasDescription = $derived(
		(deckLatestForwarded.meta.introMd && deckLatestForwarded.meta.introMd.trim().length > 0) ||
			(deckLatestForwarded.descriptionMd && deckLatestForwarded.descriptionMd.trim().length > 0)
	);

	const hasArkhamDbIncompatibility = $derived(
		(deck.source === DeckSource.ArkhamDbPublished || deck.source === DeckSource.ArkhamDbPublic) &&
			Boolean(deckLatestForwarded.meta.hiddenSlots)
	);
</script>

{#snippet flexibleDisplay(cards: CardItem[], settings: GroupingSortingSettings)}
	<FlexibleCardDisplay defaultViewMode="list" {cards} {languageCode} defaultSettings={settings} />
{/snippet}

{#snippet bannerAndInvestigator()}
	{@const showArkhamDbPublishedButton = deck.source === DeckSource.ArkhamDbPublished}
	{@const showArkhamDbPublicButton = deck.source === DeckSource.ArkhamDbPublic}
	{@const showArkhamBuildViewButton = deck.source === DeckSource.ArkhamDbPublic}
	{@const showArkhamBuildSharedButton = deck.source === DeckSource.ArkhamBuildShared}

	<div class="flex flex-wrap items-center justify-center gap-4">
		<div class="shrink-0">
			<DeckBanner
				{cardResolver}
				{deck}
				{mode}
				{localizationResolver}
				{languageCode}
				{byline}
				{highlightStatsAtLeast}
				{dimStatsAtMost}
			/>
		</div>
		<div class="flex flex-wrap gap-2">
			<CardScanFullSmallGridInvestigator {deck} {cardResolver} {languageCode} {mode} />
		</div>
		<!-- Show buttons to the hosted site -->
		<div class="flex max-w-60 flex-col gap-2">
			{#if deckViewerUrl}
				<Button
					icon={FaIconType.ExternalLink}
					label="View in Deck Viewer"
					onClick={deckViewerUrl}
					newTab
				/>
			{/if}
			{#if showArkhamDbPublishedButton}
				<div class="flex items-center gap-2">
					<Button
						icon={FaIconType.ExternalLink}
						label="Send some love to the author on arkhamdb.com"
						onClick={service.createArkhamDbPublishedDeckBrowserUrl(deck.id)}
					/>
					{#if hasArkhamDbIncompatibility}
						<Button
							icon={FaIconType.NoticeError}
							label={m.card_arkhamdb_incompatibility_help()}
							hideLabel
							onClick={() => {
								showArkhamDbIncompatibilityModal = true;
							}}
						/>
					{/if}
				</div>
			{/if}
			{#if showArkhamDbPublicButton}
				<div class="flex items-center gap-2">
					<Button
						icon={FaIconType.ExternalLink}
						label="View on arkhamdb.com"
						onClick={service.createArkhamDbPublicDeckBrowserUrl(deck.id)}
					/>
					{#if hasArkhamDbIncompatibility}
						<Button
							icon={FaIconType.NoticeError}
							label={m.card_arkhamdb_incompatibility_help()}
							hideLabel
							onClick={() => {
								showArkhamDbIncompatibilityModal = true;
							}}
						/>
					{/if}
				</div>
			{/if}
			{#if showArkhamBuildViewButton}
				<Button
					icon={FaIconType.ExternalLink}
					label="View on arkham.build"
					onClick={service.createArkhamBuildViewBrowserUrl(deck.id)}
				/>
			{/if}
			{#if showArkhamBuildSharedButton}
				<Button
					icon={FaIconType.ExternalLink}
					label="View on arkham.build"
					onClick={service.createArkhamBuildShareBrowserUrl(deck.id)}
				/>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet deckDisplayList()}
	<div class="flex justify-center">
		<DeckDisplayList
			{mainCards}
			{sideCards}
			{linkedCards}
			{extraCards}
			meta={deckLatestForwarded.meta}
		/>
	</div>
{/snippet}

{#if showExportView}
	<!-- Export Deck-Card view -->
	<ExportDeckCardRender
		{deck}
		{cardResolver}
		{mainCards}
		{sideCards}
		{linkedCards}
		{extraCards}
		meta={deckLatestForwarded.meta}
		{localizationResolver}
		{languageCode}
		{shareUrl}
		onBack={() => {
			showExportView = false;
		}}
	/>
{:else if showDescriptionReader}
	<!-- Two-column layout with description reader -->
	<div class="flex flex-wrap justify-center gap-2">
		<!-- Left column: Deck list -->
		<div
			class="border-primary-300 dark:border-primary-700 h-[80vh] w-[550px] overflow-y-auto rounded border p-4"
		>
			<div class="flex flex-col gap-2">
				{@render bannerAndInvestigator()}
				{@render deckDisplayList()}
			</div>
		</div>

		<!-- Right column: Description reader -->
		<div
			class="border-primary-300 dark:border-primary-700 h-[80vh] w-[600px] overflow-hidden rounded border"
		>
			<DeckDescriptionReader
				descriptionMd={deckLatestForwarded.descriptionMd}
				{cardResolver}
				onClose={() => {
					showDescriptionReader = false;
				}}
			/>
		</div>
	</div>
{:else}
	<!-- Normal layout -->
	<div class="flex flex-col gap-2">
		{#if !hideHeader}
			{@render bannerAndInvestigator()}
		{/if}

		<!-- Description Preview -->
		{#if !hideHeader && hasDescription && descriptionPreview}
			<div
				class="bg-primary-50 dark:bg-primary-900/50 border-primary-300 dark:border-primary-700 flex items-start gap-4 rounded border p-4"
			>
				<div class="flex-1 overflow-hidden">
					<p class="text-primary-700 dark:text-primary-300 line-clamp-2 text-sm">
						{descriptionPreview}
					</p>
				</div>
				<div class="shrink-0">
					<Button
						label={m.card_read_full_description()}
						onClick={() => {
							showDescriptionReader = true;
						}}
					/>
				</div>
			</div>
		{/if}

		<!-- Toolbar -->
		{#if toolbar}
			<div class="flex gap-2 rounded">
				{#if tabooEffective}
					<div
						class="text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/30 rounded border px-2 py-1 text-sm"
					>
						Taboo: {deckLatestForwarded.taboo.date_start}
					</div>
				{/if}
				<Checkbox bind:checked={advanced} label={m.card_advanced()} />
				{#if advanced}
					<Checkbox bind:checked={combineCards} label={m.card_combine_cards()} />
					<Button label="View Deck-Card" onClick={openExportView} />
					<Button
						icon={FaIconType.Export}
						label={m.button_export_deck()}
						onClick={openExportModal}
					/>
				{/if}
			</div>
		{/if}

		{#if beforeList}
			{@render beforeList()}
		{/if}

		<!-- Display Sections -->
		{#if hideList}
			<!-- The caller renders its own content in place of the lists. -->
		{:else if !advanced}
			<!-- Standard Display -->
			{@render deckDisplayList()}
			<div in:fly|global={{ duration: 250, delay: 200, easing: quintOut }}>
				<SectionSeparator title="Scans" />
				<DeckDisplayGrid {mainCards} {sideCards} {linkedCards} {extraCards} />
			</div>
		{:else if combineCards}
			<!-- Combined Advanced Display -->
			<SectionSeparator title="Combined Cards" />
			{@render flexibleDisplay(allCombinedCards, deckAdvancedCombinedSettings)}
		{:else}
			<!-- Separated Advanced Display -->
			{#if mainCards.length > 0}
				<SectionSeparator title="Deck" />
				{@render flexibleDisplay(mainCards, deckAdvancedMainSettings)}
			{/if}
			{#if sideCards.length > 0}
				<SectionSeparator title="Side Deck" />
				{@render flexibleDisplay(sideCards, deckAdvancedSideSettings)}
			{/if}
			{#if linkedCards.length > 0}
				<SectionSeparator title="Linked Cards" />
				{@render flexibleDisplay(linkedCards, deckAdvancedLinkedSettings)}
			{/if}
			{#if extraCards.length > 0}
				<SectionSeparator title="Extra Deck" />
				{@render flexibleDisplay(extraCards, deckAdvancedExtraSettings)}
			{/if}
		{/if}
	</div>
{/if}

<!-- Export Deck Modal -->
<ExportDeckModal
	isOpen={showExportModal}
	onClose={() => {
		showExportModal = false;
	}}
	deck={deckLatestForwarded}
	{shareUrl}
/>

<Modal
	isOpen={showArkhamDbIncompatibilityModal}
	onClose={() => {
		showArkhamDbIncompatibilityModal = false;
	}}
	maxWidth="md"
	title={m.card_arkhamdb_incompatibility_title()}
>
	<TextParagraph>
		{m.card_arkhamdb_incompatibility_description()}
	</TextParagraph>
</Modal>
