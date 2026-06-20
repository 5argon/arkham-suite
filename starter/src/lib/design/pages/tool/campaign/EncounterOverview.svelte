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
	import CampaignAchievements from './CampaignAchievements.svelte';
	import { fly } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';

	interface Prop {
		campaign: Campaign;
		kohakuCampaign: KohakuCampaign;
	}

	const { campaign, kohakuCampaign }: Prop = $props();

	const MATRIX_TAB = 0;
	const SETUP_TAB = 1;
	const ACHIEVEMENTS_TAB = 2;

	// This page is prerendered, so we read URL parameters on the client only and
	// seed the initial state from them (accepting a 1-frame-late update). `tab`
	// selects the tab (`matrix` | `setup`); `s` is the 1-based scenario page,
	// only meaningful on the setup tab.
	const initial = (() => {
		if (!browser) {
			return { tab: MATRIX_TAB, scenario: 0 };
		}
		const params = new URLSearchParams(window.location.search);
		const tabParam = params.get('tab');
		const tab =
			tabParam === 'setup'
				? SETUP_TAB
				: tabParam === 'achievements'
					? ACHIEVEMENTS_TAB
					: MATRIX_TAB;
		const sRaw = Number(params.get('s'));
		const scenarioCount = findUniqueScenarios(campaign).length;
		const scenario = Number.isFinite(sRaw)
			? Math.min(Math.max(0, Math.trunc(sRaw) - 1), Math.max(0, scenarioCount - 1))
			: 0;
		return { tab, scenario };
	})();

	let scenarioTabIndex = $state(initial.scenario);
	let showName = $state(false);
	let showSetCount = $state(true);
	let shortScenarioName = $state(false);
	let activeTab = $state(initial.tab);
	let pendingTab: number | null = $state(null);
	let contentHost: HTMLDivElement | null = $state(null);
	let frozenContentHeight: number | null = $state(null);

	const syncUrl = (tab: number, scenario: number) => {
		if (!browser) {
			return;
		}
		const url = new URL(window.location.href);
		if (tab === SETUP_TAB) {
			url.searchParams.set('tab', 'setup');
			url.searchParams.set('s', String(scenario + 1));
		} else if (tab === ACHIEVEMENTS_TAB) {
			url.searchParams.set('tab', 'achievements');
			url.searchParams.delete('s');
		} else {
			url.searchParams.set('tab', 'matrix');
			url.searchParams.delete('s');
		}
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		replaceState(url, page.state);
	};

	const requestTabChange = (index: number) => {
		if (index === activeTab) {
			return;
		}

		syncUrl(index, scenarioTabIndex);
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

	const tabs = [
		{ label: 'Encounter Set Matrix' },
		{ label: 'Setup Reference Cards' },
		{ label: 'Achievements' }
	];

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
						const index = findUniqueScenarios(campaign).findIndex((x) => x === s);
						scenarioTabIndex = index;
						requestTabChange(SETUP_TAB);
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
						syncUrl(SETUP_TAB, n);
					}}
				/>
			</div>
		{:else if activeTab === 2}
			<div
				in:fly={{ y: -10, duration: 200 }}
				out:fly={{ y: 10, duration: 50 }}
				onoutroend={handleOutroEnd}
			>
				<CampaignAchievements {campaign} {kohakuCampaign} />
			</div>
		{/if}
	</div>
</div>
