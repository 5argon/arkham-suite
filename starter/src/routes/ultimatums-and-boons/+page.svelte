<script lang="ts">
	import { tick } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { Boon, Ultimatum, Refraction } from '@5argon/arkham-kohaku';
	import * as u from '@5argon/arkham-string';
	import {
		BorderedContainer,
		MarginFull,
		MarginText,
		PageLead,
		Tabs,
		TextParagraph,
		MagnifiedModal,
		UltimatumBoonItem
	} from '@5argon/arkham-life-ui';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import { ultimatumBoonImagePath } from '$lib/ultimatum-boon';
	import { browser } from '$app/env';
	import type { PageData } from './$types';
	import { chapterLists, chapters, tabTypes, type Chapter, type TabType } from './chapter';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Initialize state from server-provided data
	let activeChapter = $state<Chapter>(chapters[0]);
	let activeTab = $state<TabType>('ultimatums');
	let selectedIndex = $state(0);
	let magnifiedOpen = $state(false);

	// Items whose card image failed to load, shown as a placeholder instead
	const missingImages = new SvelteSet<string>();

	// Update state when data changes (e.g., navigation), then scroll into view
	$effect(() => {
		activeChapter = data.initialChapter;
		activeTab = data.initialTab;
		selectedIndex = data.initialIndex;
		scrollToSelectedItem();
	});

	// Get current list based on active chapter and tab
	const currentList = $derived(() => chapterLists[activeChapter][activeTab]);

	// Get currently selected item
	const selectedItem = $derived(currentList()[selectedIndex] ?? null);

	// Get image path for selected item
	const selectedImagePath = $derived(selectedItem ? ultimatumBoonImagePath(selectedItem) : null);

	// Get name for selected item
	const selectedName = $derived(() => {
		if (!selectedItem) return '';
		switch (activeTab) {
			case 'ultimatums':
				return u.u.ultimatumName(selectedItem as Ultimatum);
			case 'boons':
				return u.u.boonName(selectedItem as Boon);
			case 'refractions':
				return u.u.refractionName(selectedItem as Refraction);
		}
	});

	function markImageMissing(item: string | null) {
		if (item) missingImages.add(item);
	}

	// Update URL when selection changes
	function updateUrl(item: string) {
		if (!browser) return;
		const url = new URL(window.location.href);
		url.searchParams.set('c', String(activeChapter));
		url.searchParams.set('i', item);
		window.history.replaceState({}, '', url);
	}

	// Handle chapter change, keeping the same item selected if the other chapter also lists it
	function handleChapterChange(index: number) {
		const previousItem = currentList()[selectedIndex];
		activeChapter = chapters[index];
		selectedIndex = Math.max(currentList().indexOf(previousItem), 0);
		const newItem = currentList()[selectedIndex];
		if (newItem) updateUrl(newItem);
		scrollToSelectedItem();
	}

	// Handle tab change
	function handleTabChange(index: number) {
		activeTab = tabTypes[index];
		selectedIndex = 0; // Reset selection when changing tabs
		const newItem = currentList()[0];
		if (newItem) updateUrl(newItem);
	}

	// Handle item selection
	function handleItemClick(index: number) {
		selectedIndex = index;
		const item = currentList()[index];
		if (item) updateUrl(item);
		// On mobile (below lg breakpoint) open the magnified modal instead of the side panel
		if (browser && window.innerWidth < 1024) {
			magnifiedOpen = true;
		}
	}

	// Scroll selected item into view, centered in the container
	async function scrollToSelectedItem() {
		if (!browser) return;
		await tick();
		const selectedButton = document.querySelector(
			`[data-item-index="${selectedIndex}"]`
		) as HTMLElement;
		const container = document.querySelector('.list-scroll-container') as HTMLElement;
		if (selectedButton && container) {
			const buttonRect = selectedButton.getBoundingClientRect();
			const containerRect = container.getBoundingClientRect();
			// Calculate scroll offset to center the button within the container
			const scrollTop =
				container.scrollTop +
				buttonRect.top -
				containerRect.top -
				container.clientHeight / 2 +
				selectedButton.clientHeight / 2;
			container.scrollTo({ top: scrollTop, behavior: 'smooth' });
		}
	}

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		const list = currentList();
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			const newIndex = Math.min(selectedIndex + 1, list.length - 1);
			if (newIndex !== selectedIndex) {
				selectedIndex = newIndex;
				const item = currentList()[selectedIndex];
				if (item) updateUrl(item);
				scrollToSelectedItem();
			}
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			const newIndex = Math.max(selectedIndex - 1, 0);
			if (newIndex !== selectedIndex) {
				selectedIndex = newIndex;
				const item = currentList()[selectedIndex];
				if (item) updateUrl(item);
				scrollToSelectedItem();
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#snippet missingCard()}
	<div
		class="flex h-96 w-64 flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-gray-400 p-4 text-center text-gray-500"
	>
		<span class="font-semibold">{selectedName()}</span>
		<span class="text-sm">Card image not available yet</span>
	</div>
{/snippet}

<OpenGraph
	description="Browse official Ultimatum, Boon, and Refraction cards to alter gameplay difficulty."
	image="image/resource/ultimatum.webp"
	title="Ultimatums and Boons"
	url="/ultimatums-and-boons"
/>

<MarginFull>
	<PageLead
		title="Ultimatums and Boons"
		description="Browse official Ultimatums, Boons, and Refractions to alter gameplay difficulty."
		image="/image/resource/ultimatum.webp"
	/>
</MarginFull>

<MarginText>
	<TextParagraph>
		Each Ultimatum is a restriction, limitation, or additional rule that makes the game harder for
		that group of investigators. Conversely, Boons reduce certain limitations and restrictions to
		make the game easier for a group of investigators. For more details, read "Ultimatums and Boons"
		section in the <a
			href="https://cdn.svc.asmodee.net/production-fantasyflightgames/uploads/2026/09/ahc_faq_v25_february_2026-web-1.pdf"
			target="_blank">FAQ version 2.5</a
		> (Chapter 1) and <a
			href="https://www.fantasyflightgames.com/product/arkham-horror-the-card-game/"
			target="_blank">The Arkham Grimoire</a
		> (Chapter 2).
	</TextParagraph>

	<TextParagraph>
		These visual representation aren't official and only made for easier browsing. If you are interested in
		these graphic assets, you can find them in this <a
			href="https://drive.google.com/drive/folders/12M8eFWklxruSpeojdZiCCbJfJ2oBmMYm?usp=share_link"
			target="_blank">Google Drive folder</a
		>.
	</TextParagraph>

	<div class="mb-4">
		<Tabs
			direction="horizontal"
			activeTabIndex={chapters.indexOf(activeChapter)}
			onTabChange={handleChapterChange}
			tabs={chapters.map((chapter) => ({ label: `Chapter ${chapter}` }))}
		/>
		<Tabs
			direction="horizontal"
			activeTabIndex={tabTypes.indexOf(activeTab)}
			onTabChange={handleTabChange}
			tabs={[{ label: 'Ultimatums' }, { label: 'Boons' }, { label: 'Refractions' }]}
		/>
	</div>

	<!-- Magnified modal for mobile – only opens on narrow screens -->
	<MagnifiedModal isShowing={magnifiedOpen} onClose={() => (magnifiedOpen = false)}>
		{#if selectedItem && missingImages.has(selectedItem)}
			{@render missingCard()}
		{:else}
			<img
				src={selectedImagePath}
				alt={selectedName()}
				class="max-h-[90vh] max-w-[90vw] w-auto rounded-xl object-contain"
				onerror={() => markImageMissing(selectedItem)}
			/>
		{/if}
	</MagnifiedModal>

	<div class="flex flex-col gap-4 lg:flex-row lg:items-start">
		<!-- List view -->
		<div class="w-full lg:w-1/2">
			<BorderedContainer>
				<div class="flex flex-col h-150 overflow-y-auto list-scroll-container">
					{#each currentList() as item, index (item)}
						{@const isSelected = index === selectedIndex}
						<button
							type="button"
							data-item-index={index}
							class="text-left p-3 transition-colors rounded
								{isSelected
								? 'bg-primary-500/20 dark:bg-primary-500/30'
								: 'hover:bg-primary-500/10 dark:hover:bg-primary-500/20'}"
							onclick={() => handleItemClick(index)}
						>
							<UltimatumBoonItem
								item={item as Ultimatum | Boon | Refraction}
								imageSrc={ultimatumBoonImagePath(item)}
							/>
						</button>
					{/each}
				</div>
			</BorderedContainer>
		</div>

		<!-- Image display – hidden on mobile, shown only at lg breakpoint and above -->
		<div class="hidden lg:block lg:w-1/2">
			<BorderedContainer>
				<div class="h-150 flex items-center justify-center">
					{#if selectedItem && missingImages.has(selectedItem)}
						{@render missingCard()}
					{:else if selectedImagePath}
						<img
							src={selectedImagePath}
							alt={selectedName()}
							class="max-h-150 w-auto rounded-[20px]"
							onerror={() => markImageMissing(selectedItem)}
						/>
					{:else}
						<div class="flex items-center justify-center h-96 text-gray-500">
							Select an item to view its card
						</div>
					{/if}
				</div>
			</BorderedContainer>
		</div>
	</div>
</MarginText>

<style>
	button:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}
</style>
