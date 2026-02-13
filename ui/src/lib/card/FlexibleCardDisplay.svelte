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
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	interface Prop {
		cards: CardItem[];
		languageCode?: string;
		defaultSettings?: GroupingSortingSettings;
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
	}

	const {
		cards,
		languageCode,
		defaultSettings = { grouping: [], sortingOrder: [] },
		hideChecklistMode = false,
		hideQuantity = false,
		defaultViewMode = 'scans',
		hideIconsView = false
	}: Prop = $props();

	type DisplayMode = 'icons' | 'scans' | 'list';
let displayMode = $derived<DisplayMode>('scans');
	let checklistMode = $state(false);
	let showGroupingSortingModal = $state(false);
	let currentSettings = $state<GroupingSortingSettings>({
		grouping: [],
		sortingOrder: []
	});

	// Sync with defaultViewMode when it changes
	$effect(() => {
		displayMode = defaultViewMode;
	});

	// Sync with defaultSettings when it changes
	$effect(() => {
		if (defaultSettings) {
			currentSettings = { ...defaultSettings };
		}
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
			{ value: 'scans' as const, label: m.form_view_mode_scans(), icon: FaIconType.CardViewModeScans },
			{ value: 'list' as const, label: m.form_view_mode_list(), icon: FaIconType.CardViewModeList },
			{ value: 'icons' as const, label: m.form_view_mode_icons(), icon: FaIconType.CardViewModeIcons }
		];
		return hideIconsView ? allChoices.filter(c => c.value !== 'icons') : allChoices;
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
	<FormRow>
		<div in:fly={{ y: -10, duration: 200 }}>
			<RadioButtons
				label={m.form_view_mode()}
				bind:selectedValue={displayMode}
				choices={viewModeChoices}
			/>
		</div>
		<div in:fly={{ y: -10, duration: 200, delay: 50 }}>
			<Button
				icon={FaIconType.GroupingSorting}
				label={settingsDifferFromDefaults
					? m.button_grouping_sorting() + ' *'
					: m.button_grouping_sorting()}
				onClick={() => (showGroupingSortingModal = true)}
			/>
		</div>
		<div in:fly={{ y: -10, duration: 200, delay: 100 }}>
			{#if !hideChecklistMode}
				<Checkbox
					label={m.form_checklist_mode()}
					checked={checklistMode}
					onChange={handleChecklistModeChange}
				/>
			{/if}
		</div>
	</FormRow>

	<!-- Display -->
	{#if displayMode === 'icons'}
		<div in:fly={{ x: -20, duration: 200 }}>
			<CardSquareGrid
				groups={displayGroups}
				{languageCode}
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
		showGroupingSortingModal = false;
	}}
/>
