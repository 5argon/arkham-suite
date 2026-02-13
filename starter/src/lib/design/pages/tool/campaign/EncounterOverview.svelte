<script lang="ts">
	import {
		BackButton,
		campaignBoxImageUrl,
		Checkbox,
		PageLead,
		SectionSeparator,
		Tabs
	} from '@5argon/arkham-life-ui';
	import { Campaign as KohakuCampaign } from '@5argon/arkham-kohaku';
	import { u } from '@5argon/arkham-string';

	import { type Campaign } from '$lib/core/campaign';
	import * as m from '$lib/paraglide/messages.js';

	import { findCoreEncounters, findUniqueScenarios, sortEncounters } from './campaign-analyze';
	import EncounterIconFlex from './EncounterIconFlex.svelte';
	import EncounterMatrixTab from './EncounterMatrixTab.svelte';
	import EncounterScenariosTab from './EncounterScenariosTab.svelte';
	import { fly } from 'svelte/transition';

	interface Prop {
		campaign: Campaign;
		kohakuCampaign: KohakuCampaign;
		incomplete?: boolean;
	}

	const { campaign, kohakuCampaign, incomplete = false }: Prop = $props();

	let scenarioTabIndex = $state(0);
	let showName = $state(false);
	let showSetCount = $state(true);
	let shortScenarioName = $state(false);
	let activeTab = $state(0);
	let pendingTab: number | null = $state(null);
	let contentHost: HTMLDivElement | null = $state(null);
	let frozenContentHeight: number | null = $state(null);

	const requestTabChange = (index: number) => {
		if (index === activeTab) {
			return;
		}

		frozenContentHeight = contentHost?.clientHeight ?? null;
		pendingTab = index;
		activeTab = -1;
	};

	const handleOutroEnd = () => {
		if (pendingTab === null) {
			return;
		}

		activeTab = pendingTab;
		pendingTab = null;
		frozenContentHeight = null;
	};

	const tabs = [{ label: 'Encounter Set Matrix' }, { label: 'Setup Reference Cards' }];

	const coreEncounters = $derived(sortEncounters(findCoreEncounters(campaign, kohakuCampaign)));
	const campaignNameText = $derived(u.campaignName(kohakuCampaign));
	const campaignImage = $derived(campaignBoxImageUrl(kohakuCampaign));
</script>

<BackButton label={m.campaign_back_to_list()} onClick="/campaign" />

<PageLead image={campaignImage} title={campaignNameText} />

<div class="my-4 flex gap-4">
	<Checkbox bind:checked={showSetCount} label="Show Set Count" />
	<Checkbox bind:checked={showName} label="Show Name" />
</div>

<SectionSeparator title="Required Core Encounter Sets" />
<EncounterIconFlex
	encounterSets={coreEncounters}
	hideNumbers={!showSetCount}
	{kohakuCampaign}
	{showName}
/>

{#if campaign.commonEncounterSets !== undefined}
	<SectionSeparator title="Situational Encounter Sets" />
	<EncounterIconFlex
		encounterSets={campaign.commonEncounterSets}
		{showName}
		hideNumbers={!showSetCount}
		{kohakuCampaign}
	/>
{/if}

<div class="mt-6">
	<Tabs
		activeTabIndex={pendingTab ?? activeTab}
		direction="horizontal"
		onTabChange={requestTabChange}
		{tabs}
	/>

	<div
		bind:this={contentHost}
		class="mt-4"
		style:min-height={frozenContentHeight ? `${frozenContentHeight}px` : undefined}
	>
		{#if activeTab === 0}
			<div
				in:fly={{ y: -10, duration: 200 }}
				out:fly={{ y: 10, duration: 50 }}
				onoutroend={handleOutroEnd}
			>
				<EncounterMatrixTab
					{shortScenarioName}
					{campaign}
					{kohakuCampaign}
					{showName}
					onGoToScenario={(s) => {
						requestTabChange(1);
						const index = findUniqueScenarios(campaign).findIndex((x) => x === s);
						scenarioTabIndex = index;
					}}
				/>
			</div>
		{:else if activeTab === 1}
			<div
				in:fly={{ y: -10, duration: 200 }}
				out:fly={{ y: 10, duration: 50 }}
				onoutroend={handleOutroEnd}
			>
				<EncounterScenariosTab
					{kohakuCampaign}
					{campaign}
					{showSetCount}
					dropdownIndex={scenarioTabIndex}
					onDropdownIndexChanged={(n) => {
						scenarioTabIndex = n;
					}}
					{incomplete}
				/>
			</div>
		{/if}
	</div>
</div>
