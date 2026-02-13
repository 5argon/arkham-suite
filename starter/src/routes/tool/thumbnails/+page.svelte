<script lang="ts">
	import {
		Button,
		CardFormMultiple,
		Checkbox,
		FormRow,
		HelpParagraph,
		MarginFull,
		PageLead,
		RadioButtons
	} from '@5argon/arkham-life-ui';
	import { card } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import * as m from '$lib/paraglide/messages.js';

	const allCards = getAllCards();

	type FilterMode = 'deckbuilding' | 'all';
	let filterMode = $state<FilterMode>('deckbuilding');

	// Array of rows, each containing card codes
	let rows = $state<string[][]>([[]]);

	// Array tracking whether each row uses square thumbnails
	let rowSquareModes = $state<boolean[]>([false]);

	// Choose filter based on mode
	const cardFilter = $derived(
		filterMode === 'deckbuilding'
			? card.deckbuildingPlayerCardsFilter
			: card.playerCardsNonCampaignFilter
	);

	// Add a new row
	function addRow() {
		rows = [...rows, []];
		rowSquareModes = [...rowSquareModes, false];
	}

	// Remove a row
	function removeRow(index: number) {
		rows = rows.filter((_, i) => i !== index);
		rowSquareModes = rowSquareModes.filter((_, i) => i !== index);
	}

	// Calculate dimensions for a row
	function getRowDimensions(cardCount: number, isSquare: boolean) {
		const effectiveCount = Math.max(3, Math.min(6, cardCount));
		const startingWidth = 470;

		if (isSquare) {
			// Square mode: width capped at 160px, height equals width
			const width = Math.min(160, Math.floor(startingWidth / effectiveCount));
			const height = width;
			const borderRadius = Math.max(5, 8 - (effectiveCount - 3));
			return { width, height, borderRadius };
		} else {
			// Default mode: rectangular aspect ratio
			const width = Math.floor(startingWidth / effectiveCount);
			const height = Math.round((width * 88) / 61.5);
			const borderRadius = Math.max(5, 8 - (effectiveCount - 3));
			return { width, height, borderRadius };
		}
	}

	// Generate HTML for the thumbnail table
	const generatedHtml = $derived.by(() => {
		if (rows.length === 0 || rows.every((row) => row.length === 0)) {
			return '';
		}

		const tables: string[] = [];

		for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
			const row = rows[rowIndex];
			if (row.length === 0) continue;

			const isSquare = rowSquareModes[rowIndex] || false;
			const { width, height, borderRadius } = getRowDimensions(row.length, isSquare);
			const baseUrl = isSquare
				? 'https://assets.arkham.build/thumbnails'
				: 'https://assets.arkham.build/optimized';

			// Each row is its own table with fixed layout to control column widths
			let tableHtml =
				'<table style="margin:0 auto; border-spacing: 4px; border-collapse: separate; table-layout: fixed; width:fit-content;">\n';

			// Define column widths using colgroup
			tableHtml += '<colgroup>\n';
			for (let i = 0; i < row.length; i++) {
				tableHtml += `<col style="width: ${width}px; max-width: ${width}px;">\n`;
			}
			tableHtml += '</colgroup>\n';

			tableHtml += '<tr>\n';

			// Generate table cells for each image
			for (const code of row) {
				tableHtml += `<td style="padding:0;"><img style="height:${height}px; width:${width}px; border-radius: ${borderRadius}px;" src="${baseUrl}/${code}.avif"/></td>\n`;
			}

			tableHtml += '</tr>\n';
			tableHtml += '</table>\n';

			tables.push(tableHtml);
		}

		return tables.join('\n');
	});

	// Copy to clipboard
	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(generatedHtml);
			alert('HTML copied to clipboard!');
		} catch (err) {
			console.error('Failed to copy:', err);
			alert('Failed to copy to clipboard');
		}
	}
</script>

<OpenGraph
	description="Generate HTML code for card thumbnail tables."
	image="image/resource/thumbnails.webp"
	title="Card Thumbnails"
	url="/tool/thumbnails"
/>

<PageLead
	description="Generate HTML code for card thumbnail tables. Add rows, select cards, and copy the generated HTML to use in your deck guides. Image hosting in the generated code is courtesy of arkham.build. Thank you!"
	title="Card Thumbnails"
/>

<HelpParagraph>
	Rounded corners stop working after you publish the deck on arkhamdb.com for some reason, but
	everything else works fine.
</HelpParagraph>

<MarginFull>
	<FormRow>
		<RadioButtons
			bind:selectedValue={filterMode}
			choices={[
				{ value: 'deckbuilding', label: 'Deckbuilding Player Cards' },
				{ value: 'all', label: 'All Player Cards' }
			]}
			label="Card Filter"
		/>

		<Button label="Add Row" onClick={addRow} />
	</FormRow>

	<!-- Rows -->
	<div class="mt-8 flex flex-col gap-6">
		{#each rows as row, i (i)}
			<div class="border-primary-300 dark:border-primary-700 rounded border p-4">
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-4">
						<h3 class="text-primary-900 dark:text-primary-100 text-lg font-semibold">
							Row {i + 1} ({row.length}
							{row.length === 1 ? 'card' : 'cards'})
						</h3>
						<Checkbox label="Square" bind:checked={rowSquareModes[i]} />
					</div>
					{#if rows.length > 1}
						<Button label="Remove Row" onClick={() => removeRow(i)} />
					{/if}
				</div>

				<CardFormMultiple
					label="Search for cards (max 6 per row)"
					cards={allCards}
					selectedCodes={row}
					onSelectionChange={(codes: string[]) => {
						// Limit to 6 cards per row
						rows[i] = codes.slice(0, 6);
					}}
					placeholder={m.common_search_placeholder()}
					filter={cardFilter}
				/>
			</div>
		{/each}
	</div>

	<!-- Preview -->
	{#if generatedHtml}
		<div class="mt-8">
			<h2 class="text-primary-900 dark:text-primary-100 mb-4 text-xl font-bold">Preview</h2>
			<div
				class="bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 rounded border p-6"
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html generatedHtml}
			</div>
		</div>

		<!-- Generated HTML -->
		<div class="mt-8">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-primary-900 dark:text-primary-100 text-xl font-bold">Generated HTML</h2>
				<Button label="Copy to Clipboard" onClick={copyToClipboard} />
			</div>
			<textarea
				class="bg-primary-50 dark:bg-primary-900 text-primary-900 dark:text-primary-100 border-primary-300 dark:border-primary-700 w-full rounded border p-4 font-mono text-sm"
				rows="15"
				readonly
				value={generatedHtml}
			></textarea>
		</div>
	{/if}
</MarginFull>
