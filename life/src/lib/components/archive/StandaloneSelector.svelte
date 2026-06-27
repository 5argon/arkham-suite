<!--
@component
Selector for a NEW Standalone Archive. Two tabs:
  • Scenario Packs — the dedicated standalone products, as a graphic grid grouped by
    chapter. A single-scenario pack creates immediately; a multi-scenario pack
    (Guardians of the Abyss) opens a scenario-pick modal.
  • From Campaign — reuses the campaign grid (CampaignSelector); clicking a campaign
    opens a modal to pick which scenario to play in Standalone Mode.
Emits the chosen play via `onSelect`; the parent creates the record.
-->
<script module lang="ts">
	export interface StandaloneSelection {
		source: 'pack' | 'campaign';
		/** campaign-data catalogue code to load — 'side' for a pack, host campaign code otherwise. */
		campaignCode: string;
		scenario: string;
		title: string;
	}
</script>

<script lang="ts">
	import { EncounterSetIcon, GraphicButton, Modal, SectionSeparator, Tabs } from '@5argon/arkham-life-ui';
	import {
		type Campaign,
		type Product,
		productStandaloneChapterOne,
		productStandaloneChapterTwo,
		productStandaloneScenarios,
		color,
	} from '@5argon/arkham-kohaku';
	import { ProductIcon } from '@5argon/arkham-icon';
	import { u } from '@5argon/arkham-string';
	import { standaloneScenarios } from '@5argon/arkham-campaign-data';
	import {
		campaignPlayableScenarios,
		scenarioRepresentativeSet,
	} from '$lib/campaign/utils/standalone-scenarios';
	import CampaignSelector from './CampaignSelector.svelte';

	const { onSelect }: { onSelect: (selection: StandaloneSelection) => void } = $props();

	let activeTab = $state(0);

	// Display names for pack scenarios come from the `side` catalogue.
	const packScenarioName = new Map(standaloneScenarios().map((s) => [s.scenario, s.name]));
	function packName(scenario: string): string {
		return packScenarioName.get(scenario) ?? scenario;
	}

	function productArt(product: Product): string {
		return `/image/product/${product}.webp`;
	}
	function accentFor(product: Product): string {
		return color.getColor(color.productToColors(product), 950, false);
	}

	// ─── Scenario-pick modal (multi-scenario packs + campaigns) ──────────────────
	// The pick differs only by source + catalogue code, so store those rather than a
	// callback-in-state; `pick` builds the selection.
	let modalOpen = $state(false);
	let modalTitle = $state('');
	let modalChoices = $state<{ scenario: string; name: string }[]>([]);
	let modalSource = $state<'pack' | 'campaign'>('pack');
	let modalCampaignCode = $state('side');

	function openModal(
		title: string,
		choices: { scenario: string; name: string }[],
		source: 'pack' | 'campaign',
		campaignCode: string,
	) {
		modalTitle = title;
		modalChoices = choices;
		modalSource = source;
		modalCampaignCode = campaignCode;
		modalOpen = true;
	}

	function clickPack(product: Product) {
		const scenarios = productStandaloneScenarios(product);
		if (scenarios.length === 1) {
			onSelect({ source: 'pack', campaignCode: 'side', scenario: scenarios[0], title: packName(scenarios[0]) });
			return;
		}
		openModal(u.productName(product), scenarios.map((s) => ({ scenario: s, name: packName(s) })), 'pack', 'side');
	}

	function clickCampaign(campaign: Campaign) {
		openModal(u.campaignName(campaign), campaignPlayableScenarios(campaign), 'campaign', campaign);
	}

	function pick(scenario: string, name: string) {
		modalOpen = false;
		onSelect({ source: modalSource, campaignCode: modalCampaignCode, scenario, title: name });
	}
</script>

<Tabs
	direction="horizontal"
	activeTabIndex={activeTab}
	onTabChange={(i) => (activeTab = i)}
	tabs={[{ label: 'Scenario Packs' }, { label: 'From Campaign' }]}
/>

{#if activeTab === 0}
	<SectionSeparator title="Chapter One" />
	<div class="grid">
		{#each productStandaloneChapterOne as product (product)}
			<GraphicButton
				text={u.productName(product)}
				graphic={productArt(product)}
				accentColor={accentFor(product)}
				small
				onClick={() => clickPack(product)}
			>
				<ProductIcon {product} />
			</GraphicButton>
		{/each}
	</div>
	{#if productStandaloneChapterTwo.length}
		<SectionSeparator title="Chapter Two" />
		<div class="grid">
			{#each productStandaloneChapterTwo as product (product)}
				<GraphicButton
					text={u.productName(product)}
					graphic={productArt(product)}
					accentColor={accentFor(product)}
					small
					onClick={() => clickPack(product)}
				>
					<ProductIcon {product} />
				</GraphicButton>
			{/each}
		</div>
	{/if}
{:else}
	<p class="text-primary-500 mb-2 mt-2 text-sm">
		Pick a campaign, then choose which of its scenarios you played in Standalone Mode.
	</p>
	<CampaignSelector showUnspecified={false} onSelect={(c) => c && clickCampaign(c)} />
{/if}

<Modal isOpen={modalOpen} onClose={() => (modalOpen = false)} title={modalTitle} maxWidth="sm">
	<p class="text-primary-500 mb-3 text-sm">Which scenario did you play?</p>
	<div class="flex flex-col gap-2">
		{#each modalChoices as choice (choice.scenario)}
			{@const iconSet = scenarioRepresentativeSet(choice.scenario)}
			<button
				type="button"
				class="border-primary-200 dark:border-primary-700 hover:bg-primary-100 dark:hover:bg-primary-800 flex items-center gap-2 rounded border px-3 py-2 text-left text-black dark:text-white"
				onclick={() => pick(choice.scenario, choice.name)}
			>
				{#if iconSet}
					<span class="text-primary-600 dark:text-primary-300 text-lg leading-none">
						<EncounterSetIcon encounterSet={iconSet} />
					</span>
				{/if}
				{choice.name}
			</button>
		{/each}
	</div>
</Modal>

<style>
	.grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 4px;
		margin: 8px 0;
	}
</style>
