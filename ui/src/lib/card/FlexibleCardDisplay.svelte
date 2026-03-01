<!--
@component
Flexible card display with multiple rendering modes and checklist functionality.
-->
<script lang="ts">
	import type {
		CardItem,
		GroupingSortingSettings,
		RecursivelyGroupedCardItem
	} from './card-item.js';
	import {
		applyGroupingSorting,
		areGroupingSortingSettingsEqual,
		noMoreGroup
	} from './card-item.js';
	import type { Card } from '@5argon/arkham-kohaku';
	import CardSquareGrid from './CardSquareGrid.svelte';
	import CardScanFullSmallGrid from './CardScanFullSmallGrid.svelte';
	import CardLineList from './CardLineList.svelte';
	import GroupingSortingModal from './GroupingSortingModal.svelte';
	import { RadioButtons, Checkbox } from '../form/index.js';
	import { Button } from '../button/index.js';
	import { SvelteMap } from 'svelte/reactivity';
	import * as m from '../paraglide/messages.js';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import FormRow from '../form/FormRow.svelte';
	import { fly } from 'svelte/transition';

	interface Prop {
		cards: CardItem[];
		languageCode?: string;
		defaultSettings?: GroupingSortingSettings;
		/**
		 * Starting state for currentSettings. Falls back to defaultSettings when omitted.
		 * Use this to seed state from a URL or storage without changing the modal's Reset target.
		 */
		initialSettings?: GroupingSortingSettings;
		/**
		 * If true, hide the checklist mode checkbox
		 */
		hideChecklistMode?: boolean;
		/**
		 * If true, do not render quantity counters
		 */
		hideQuantity?: boolean;
		/**
		 * Default view mode ('icons' | 'scans' | 'list')
		 */
		defaultViewMode?: 'icons' | 'scans' | 'list';

		hideIconsView?: boolean;
		/**
		 * If true, hide the view-mode selector. Combined with a fixed
		 * `defaultViewMode`, this locks the display to a single mode.
		 */
		hideViewMode?: boolean;
		/**
		 * If true, hide the grouping/sorting button.
		 */
		hideGroupingSorting?: boolean;
		/**
		 * If true, render each card's `iconCount` as a small badge in the icons
		 * AND scans views (e.g. a usage count). No effect in the list mode.
		 */
		showIconCount?: boolean;
		/**
		 * Fired whenever the user applies new grouping/sorting from the modal.
		 * Use this to mirror state to the URL, storage, or analytics.
		 */
		onSettingsApply?: (settings: GroupingSortingSettings) => void;
	}

	const {
		cards,
		languageCode,
		defaultSettings = { grouping: [], sortingOrder: [] },
		initialSettings,
		hideChecklistMode = false,
		hideQuantity = false,
		defaultViewMode = 'scans',
		hideIconsView = false,
		hideViewMode = false,
		hideGroupingSorting = false,
		showIconCount = false,
		onSettingsApply
	}: Prop = $props();

	type DisplayMode = 'icons' | 'scans' | 'list';
	let displayMode = $derived<DisplayMode>('scans');
	let checklistMode = $state(false);
	let showGroupingSortingModal = $state(false);
	// svelte-ignore state_referenced_locally
	let currentSettings = $state<GroupingSortingSettings>({
		...(initialSettings ?? defaultSettings)
	});

	// Sync with defaultViewMode when it changes
	$effect(() => {
		displayMode = defaultViewMode;
	});

	// Track greyed out quantity per card code when in checklist mode
	let checklistState = new SvelteMap<string, number>();
	let isChecklistInitialized = $state(false);

	// Apply grouping and sorting to cards
	const groupedCards = $derived(applyGroupingSorting(cards, currentSettings));

	// Check if current settings differ from defaults
	const settingsDifferFromDefaults = $derived(
		!areGroupingSortingSettingsEqual(currentSettings, defaultSettings)
	);

	// Derive the actual card items to display
	const displayGroups = $derived.by(() => {
		if (!checklistMode || !isChecklistInitialized) {
			return groupedCards;
		}
		function applyGreyedOut(group: RecursivelyGroupedCardItem): RecursivelyGroupedCardItem {
			const newItems = group.items.map((item) => {
				if (noMoreGroup(item)) {
					return {
						...item,
						greyedOutQuantity: checklistState.get(item.card.code) ?? 0
					};
				} else {
					return applyGreyedOut(item);
				}
			});

			return {
				...group,
				items: newItems as RecursivelyGroupedCardItem[] | CardItem[]
			};
		}

		return groupedCards.map(applyGreyedOut);
	});

	// Filter view mode choices based on hideIconsView
	const viewModeChoices = $derived.by(() => {
		const allChoices = [
			{
				value: 'scans' as const,
				label: m.form_view_mode_scans(),
				icon: FaIconType.CardViewModeScans
			},
			{ value: 'list' as const, label: m.form_view_mode_list(), icon: FaIconType.CardViewModeList },
			{
				value: 'icons' as const,
				label: m.form_view_mode_icons(),
				icon: FaIconType.CardViewModeIcons
			}
		];
		return hideIconsView ? allChoices.filter((c) => c.value !== 'icons') : allChoices;
	});

	function handleIconsOrListClick(card: Card) {
		if (!checklistMode) return;

		const cardItem = cards.find((item) => item.card.code === card.code);
		if (!cardItem) return;

		const currentGreyed = checklistState.get(card.code) ?? 0;
		const quantity = cardItem.quantity;

		// Toggle: if not all disabled, set to all disabled. Otherwise, set to 0.
		if (currentGreyed < quantity) {
			checklistState.set(card.code, quantity);
		} else {
			checklistState.set(card.code, 0);
		}
		checklistState = new SvelteMap(checklistState); // Trigger reactivity
	}

	function handleChecklistModeChange() {
		checklistMode = !checklistMode;
		if (checklistMode && !isChecklistInitialized) {
			checklistState = new SvelteMap(cards.map((item) => [item.card.code, 0]));
			isChecklistInitialized = true;
		}
	}

	function handleScansClick(card: Card) {
		if (!checklistMode) return;

		const cardItem = cards.find((item) => item.card.code === card.code);
		if (!cardItem) return;

		const currentGreyed = checklistState.get(card.code) ?? 0;
		const quantity = cardItem.quantity;

		// Cycle through: increment by 1, or reset to 0 if all disabled
		if (currentGreyed >= quantity) {
			checklistState.set(card.code, 0);
		} else {
			checklistState.set(card.code, currentGreyed + 1);
		}
		checklistState = new SvelteMap(checklistState); // Trigger reactivity
	}
</script>

<div class="space-y-4">
	{#if !hideViewMode || !hideGroupingSorting || !hideChecklistMode}
		<FormRow>
			{#if !hideViewMode}
				<div in:fly={{ y: -10, duration: 200 }}>
					<RadioButtons
						label={m.form_view_mode()}
						bind:selectedValue={displayMode}
						choices={viewModeChoices}
					/>
				</div>
			{/if}
			{#if !hideGroupingSorting}
				<div in:fly={{ y: -10, duration: 200, delay: 50 }}>
					<Button
						icon={FaIconType.GroupingSorting}
						label={settingsDifferFromDefaults
							? m.button_grouping_sorting() + ' *'
							: m.button_grouping_sorting()}
						onClick={() => (showGroupingSortingModal = true)}
					/>
				</div>
			{/if}
			{#if !hideChecklistMode}
				<div in:fly={{ y: -10, duration: 200, delay: 100 }}>
					<Checkbox
						label={m.form_checklist_mode()}
						checked={checklistMode}
						onChange={handleChecklistModeChange}
					/>
				</div>
			{/if}
		</FormRow>
	{/if}

	<!-- Display -->
	{#if displayMode === 'icons'}
		<div in:fly={{ x: -20, duration: 200 }}>
			<CardSquareGrid
				groups={displayGroups}
				{languageCode}
				{showIconCount}
				onClick={checklistMode ? handleIconsOrListClick : undefined}
			/>
		</div>
	{:else if displayMode === 'scans'}
		<div in:fly={{ x: -20, duration: 200 }}>
			<CardScanFullSmallGrid
				groups={displayGroups}
				{languageCode}
				onClick={checklistMode ? handleScansClick : undefined}
				showCardName
				{hideQuantity}
				{showIconCount}
			/>
		</div>
	{:else if displayMode === 'list'}
		<div in:fly={{ x: -20, duration: 200 }}>
			<CardLineList
				groups={displayGroups}
				{languageCode}
				onClick={checklistMode ? handleIconsOrListClick : undefined}
				{hideQuantity}
			/>
		</div>
	{/if}
</div>

<GroupingSortingModal
	isOpen={showGroupingSortingModal}
	settings={currentSettings}
	{defaultSettings}
	onClose={() => (showGroupingSortingModal = false)}
	onApply={(newSettings) => {
		currentSettings = newSettings;
		onSettingsApply?.(newSettings);
		showGroupingSortingModal = false;
	}}
/>
