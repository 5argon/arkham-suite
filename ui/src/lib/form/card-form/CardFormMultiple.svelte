<!-- 
 @component
 CardForm variant that allows selecting multiple cards and displays them as a list.
 Each selected card can be removed.
 -->
<script lang="ts">
	import type { Card, CardCode, DecodedMeta } from '@5argon/arkham-kohaku';
	import type { Snippet } from 'svelte';

	import CardLine from '../../card/CardLine.svelte';
	import * as m from '../../paraglide/messages.js';
	import CardForm from './CardForm.svelte';
	import type { CardFormFilter } from './types.js';
	import Button from '../../button/Button.svelte';
	import { FaIconType } from '../../icon/index.js';

	export interface SelectedCardEntry {
		code: CardCode;
		meta?: DecodedMeta;
	}

	export interface ActionButton {
		icon: FaIconType;
		onClick: (entry: SelectedCardEntry) => void;
		hideLabel?: boolean;
		label?: string;
		/**
		 * Optional function to determine if button should be shown for this entry.
		 * If not provided, button is always shown.
		 */
		shouldShow?: (entry: SelectedCardEntry, card: Card) => boolean;
	}

	interface Prop {
		/**
		 * Label for the search input.
		 */
		label: string;

		/**
		 * All available cards to search from.
		 */
		cards: Card[];

		/**
		 * Array of selected card codes (for backward compatibility).
		 */
		selectedCodes?: CardCode[];

		/**
		 * Array of selected card entries with optional meta (new format).
		 */
		selectedEntries?: SelectedCardEntry[];

		/**
		 * Callback when selection changes (card codes only).
		 */
		onSelectionChange?: (codes: CardCode[]) => void;

		/**
		 * Callback when selection changes (full entries with meta).
		 */
		onEntriesChange?: (entries: SelectedCardEntry[]) => void;

		/**
		 * Optional filter for search results.
		 */
		filter?: CardFormFilter;

		/**
		 * Placeholder text for search input.
		 */
		placeholder?: string;

		/**
		 * Allow duplicate entries (same card with different meta).
		 */
		allowDuplicates?: boolean;

		/**
		 * Additional action buttons to show for each entry.
		 */
		actionButtons?: ActionButton[];

		/**
		 * Snippet to render additional content after the card line.
		 */
		afterCardLine?: Snippet<[SelectedCardEntry, Card]>;
	}

	let {
		label,
		cards,
		selectedCodes = [],
		selectedEntries = [],
		onSelectionChange,
		onEntriesChange,
		filter,
		placeholder,
		allowDuplicates = false,
		actionButtons = [],
		afterCardLine
	}: Prop = $props();

	// Create a map for quick lookups
	const cardMap = $derived(new Map(cards.map((c) => [c.code, c])));

	// Normalize to internal format - use entries if provided, otherwise convert from codes
	const entries = $derived.by(() => {
		if (selectedEntries.length > 0) {
			return selectedEntries;
		}
		return selectedCodes.map((code) => ({ code }));
	});

	function handleSelect(card: Card) {
		const newEntry: SelectedCardEntry = { code: card.code };

		if (!allowDuplicates && entries.some((e) => e.code === card.code)) {
			return;
		}

		const newEntries = [...entries, newEntry];

		// Call both callbacks for backward compatibility
		if (onEntriesChange) {
			onEntriesChange(newEntries);
		}
		if (onSelectionChange) {
			onSelectionChange(newEntries.map((e) => e.code));
		}
	}

	function handleRemove(index: number) {
		const newEntries = entries.filter((_, i) => i !== index);

		// Call both callbacks for backward compatibility
		if (onEntriesChange) {
			onEntriesChange(newEntries);
		}
		if (onSelectionChange) {
			onSelectionChange(newEntries.map((e) => e.code));
		}
	}

	function handleClearAll() {
		if (onEntriesChange) {
			onEntriesChange([]);
		}
		if (onSelectionChange) {
			onSelectionChange([]);
		}
	}
</script>

<div class="flex items-start gap-2">
	<div class="w-[400px]">
		<CardForm {label} {cards} {filter} {placeholder} onSelect={handleSelect}>
			{#snippet selectedItems()}
				{#if entries.length > 0}
					<div class="space-y-1">
						{#each entries as entry, index (`${entry.code}-${index}`)}
							{@const card = cardMap.get(entry.code)}
							{#if card}
								<div
									class="hover:bg-primary-100 dark:hover:bg-primary-800 flex items-center gap-2 rounded p-1 transition-colors"
								>
									<div class="flex items-center gap-1">
										<Button
											label={m.button_remove()}
											onClick={() => handleRemove(index)}
											hideLabel
											icon={FaIconType.Delete}
										/>
										{#each actionButtons as actionBtn, i (i)}
											{#if !actionBtn.shouldShow || actionBtn.shouldShow(entry, card)}
												<Button
													label={actionBtn.label ?? ''}
													onClick={() => actionBtn.onClick(entry)}
													hideLabel={actionBtn.hideLabel ?? true}
													icon={actionBtn.icon}
												/>
											{/if}
										{/each}
									</div>
									<div class="flex min-w-0 flex-1 gap-2 space-y-1 align-middle">
										<CardLine {card} meta={(entry as SelectedCardEntry).meta} />
										{#if afterCardLine}
											{@render afterCardLine(entry, card)}
										{/if}
									</div>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			{/snippet}
		</CardForm>
	</div>
	{#if entries.length > 0}
		<div class="pt-6">
			<Button
				label={m.button_clear_all()}
				onClick={handleClearAll}
				icon={FaIconType.DeleteList}
				hideLabel
			/>
		</div>
	{/if}
</div>
