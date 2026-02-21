<script lang="ts">
	import { tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		Boon,
		Ultimatum,
		Refraction,
		getScenarioData,
		refractions,
		type RefractionDetails,
		convert,
		color,
		chapterOneCampaigns,
		chapterOneReturnToCampaigns,
		chapterTwoSmallCampaigns
	} from '@5argon/arkham-kohaku';
	import * as u from '@5argon/arkham-string';
	import {
		BorderedContainer,
		MarginFull,
		MarginText,
		PageLead,
		Tabs,
		TextParagraph,
		FaIcon,
		FaIconType,
		MagnifiedModal
	} from '@5argon/arkham-life-ui';
	import { ProductIcon, EncounterSetIcon } from '@5argon/arkham-icon';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';

	type TabType = 'ultimatums' | 'boons' | 'refractions';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Create lookup map for refraction details
	const refractionDetailsMap = new SvelteMap<Refraction, RefractionDetails>();
	for (const details of refractions) {
		refractionDetailsMap.set(details.refraction, details);
	}

	// Create a combined campaign order list for sorting
	const campaignReleaseOrder = [
		...chapterOneCampaigns,
		...chapterOneReturnToCampaigns,
		...chapterTwoSmallCampaigns
	];

	// Define all items with their enums
	const ultimatums = Object.values(Ultimatum);
	const boons = Object.values(Boon);
	// Sort refractions: first by campaign order, then within each campaign by scenario presence and index
	const refractionsEnum = Object.values(Refraction).sort((a, b) => {
		const detailsA = refractions.find((r) => r.refraction === a);
		const detailsB = refractions.find((r) => r.refraction === b);

		// First, sort by campaign order
		if (!detailsA?.campaign) return 1;
		if (!detailsB?.campaign) return -1;

		const campaignIndexA = campaignReleaseOrder.indexOf(detailsA.campaign);
		const campaignIndexB = campaignReleaseOrder.indexOf(detailsB.campaign);

		if (campaignIndexA !== campaignIndexB) {
			return campaignIndexA - campaignIndexB;
		}

		// Within the same campaign, refractions without scenario come first
		const hasScenarioA = !!detailsA.scenario;
		const hasScenarioB = !!detailsB.scenario;

		if (!hasScenarioA && hasScenarioB) return -1;
		if (hasScenarioA && !hasScenarioB) return 1;

		// If both have scenarios, sort by scenario index
		if (hasScenarioA && hasScenarioB) {
			const indexA = getScenarioData(detailsA.scenario!).index;
			const indexB = getScenarioData(detailsB.scenario!).index;
			return indexA - indexB;
		}

		// If neither has scenario, keep original order
		return 0;
	});

	// Initialize state from server-provided data
	let activeTab = $state<TabType>('ultimatums');
	let selectedIndex = $state(0);
	let magnifiedOpen = $state(false);
	let isDark = $state(false);

	// Track dark mode reactively
	$effect(() => {
		if (!browser) return;
		isDark = document.documentElement.classList.contains('dark');
		const observer = new MutationObserver(() => {
			isDark = document.documentElement.classList.contains('dark');
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
		return () => observer.disconnect();
	});

	// Update state when data changes (e.g., navigation), then scroll into view
	$effect(() => {
		activeTab = data.initialTab;
		selectedIndex = data.initialIndex;
		scrollToSelectedItem();
	});

	// Get current list based on active tab
	const currentList = $derived(() => {
		switch (activeTab) {
			case 'ultimatums':
				return ultimatums;
			case 'boons':
				return boons;
			case 'refractions':
				return refractionsEnum;
		}
	});

	// Get currently selected item
	const selectedItem = $derived(currentList()[selectedIndex] ?? null);

	// Get image path for selected item
	const selectedImagePath = $derived(
		selectedItem ? `/image/ultimatum-boon-refraction/${selectedItem}.webp` : null
	);

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

	// Get thumbnail path for list items
	function getThumbnailPath(item: string): string {
		return `/image/ultimatum-boon-refraction/${item}.webp`;
	}

	// Get campaign color for refractions — adapts to light/dark theme
	function getCampaignColor(item: string): string | null {
		if (activeTab !== 'refractions') return null;
		const details = refractionDetailsMap.get(item as Refraction);
		if (!details?.campaign) return null;
		const product = convert.campaignToProduct(details.campaign);
		const palette = color.productToColors(product);
		return color.getColor(palette, 800, isDark);
	}

	// Update URL when selection changes
	function updateUrl(item: string) {
		if (!browser) return;
		const url = new URL(window.location.href);
		url.searchParams.set('i', item);
		window.history.replaceState({}, '', url);
	}

	// Handle tab change
	function handleTabChange(index: number) {
		const tabs: TabType[] = ['ultimatums', 'boons', 'refractions'];
		activeTab = tabs[index];
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
			href="https://images-cdn.fantasyflightgames.com/filer_public/c1/d0/c1d0fab6-7fa6-4ce2-af6a-16416381a19b/ahc_faq_v25_february_2026-web.pdf"
			target="_blank">FAQ version 2.5</a
		>.
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
			activeTabIndex={activeTab === 'ultimatums' ? 0 : activeTab === 'boons' ? 1 : 2}
			onTabChange={handleTabChange}
			tabs={[{ label: 'Ultimatums' }, { label: 'Boons' }, { label: 'Refractions' }]}
		/>
	</div>

	<!-- Magnified modal for mobile – only opens on narrow screens -->
	<MagnifiedModal isShowing={magnifiedOpen} onClose={() => (magnifiedOpen = false)}>
		<img
			src={selectedImagePath}
			alt={selectedName()}
			class="max-h-[90vh] max-w-[90vw] w-auto rounded-xl object-contain"
		/>
	</MagnifiedModal>

	<div class="flex flex-col gap-4 lg:flex-row lg:items-start">
		<!-- List view -->
		<div class="w-full lg:w-1/2">
			<BorderedContainer>
				<div class="flex flex-col h-150 overflow-y-auto list-scroll-container">
					{#each currentList() as item, index (item)}
						{@const isSelected = index === selectedIndex}
						{@const itemName =
							activeTab === 'ultimatums'
								? u.u.ultimatumName(item as Ultimatum)
								: activeTab === 'boons'
									? u.u.boonName(item as Boon)
									: u.u.refractionName(item as Refraction)}
						{@const campaignColor = getCampaignColor(item)}
						<button
							type="button"
							data-item-index={index}
							class="text-left p-3 transition-colors rounded flex items-center gap-3
								{isSelected
								? 'bg-primary-500/20 dark:bg-primary-500/30'
								: 'hover:bg-primary-500/10 dark:hover:bg-primary-500/20'}"
							onclick={() => handleItemClick(index)}
						>
							<!-- Thumbnail image -->
							<div class="shrink-0 w-16 h-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
								<img
									src={getThumbnailPath(item)}
									alt={itemName}
									class="w-full h-full object-cover object-top"
								/>
							</div>

							<div class="flex-1">
								<div
									class="font-semibold flex items-center gap-2"
									style={campaignColor ? `color: ${campaignColor}` : ''}
								>
									{#if activeTab === 'ultimatums'}
										<FaIcon icon={FaIconType.Ultimatum} duotone={true} />
										<span class="text-primary-950 dark:text-primary-50">{itemName}</span>
									{:else if activeTab === 'boons'}
										<FaIcon icon={FaIconType.Boon} duotone={true} />
										<span class="text-primary-950 dark:text-primary-50">{itemName}</span>
									{:else if activeTab === 'refractions'}
										{@const details = refractionDetailsMap.get(item as Refraction)}
										{#if details}
											<FaIcon
												icon={details.refractionType === 'ultimatum'
													? FaIconType.Ultimatum
													: FaIconType.Boon}
												duotone={true}
											/>
										{/if}
										<span>{itemName}</span>
									{/if}
								</div>

								{#if activeTab === 'refractions'}
									{@const details = refractionDetailsMap.get(item as Refraction)}
									{#if details}
										<div class="text-sm opacity-70 mt-1 flex items-center gap-2 flex-wrap">
											{#if details.campaign}
												{@const product = convert.campaignToProduct(details.campaign)}
												<div class="flex items-center justify-center gap-1">
													<div
														class="flex items-center"
														style={campaignColor ? `color: ${campaignColor}` : ''}
													>
														<ProductIcon {product} />
													</div>
													<span style={campaignColor ? `color: ${campaignColor}` : ''}
														>{u.u.campaignName(details.campaign)}</span
													>
												</div>
											{/if}
											{#if details.scenario}
												{@const scenarioData = getScenarioData(details.scenario)}
												<div class="flex items-center gap-1">
													<div
														class="flex items-center"
														style={campaignColor ? `color: ${campaignColor}` : ''}
													>
														<EncounterSetIcon encounterSet={scenarioData.representativeSet} />
													</div>
													<span style={campaignColor ? `color: ${campaignColor}` : ''}
														>{u.u.encounterSetName(scenarioData.representativeSet)}</span
													>
												</div>
											{/if}
										</div>
									{/if}
								{/if}
							</div>
						</button>
					{/each}
				</div>
			</BorderedContainer>
		</div>

		<!-- Image display – hidden on mobile, shown only at lg breakpoint and above -->
		<div class="hidden lg:block lg:w-1/2">
			<BorderedContainer>
				<div class="h-150 flex items-center justify-center">
					{#if selectedImagePath}
						<img src={selectedImagePath} alt={selectedName()} class="max-h-150 w-auto rounded-[20px]" />
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
