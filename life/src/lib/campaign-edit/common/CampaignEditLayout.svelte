<script lang="ts" generics="CampaignSpecificData">
	import type { Campaign } from '@5argon/arkham-kohaku';
	import type { CommonCampaignData } from '$lib/campaign-edit/common/common-campaign-data';
	import { InnerHeading, PageLead, Tabs } from '@5argon/arkham-life-ui';
	import { u } from '@5argon/arkham-string';
	import * as m from '$lib/paraglide/messages';
	import { campaignBoxImageUrl, campaignColor } from '$lib/mapping/campaign';
	import type { Snippet } from 'svelte';
	import PlayerAndDeckEditor from './PlayerAndDeckEditor.svelte';
	import TabContentSlideIn from './TabContentSlideIn.svelte';

	interface Prop<CampaignSpecificData> {
		campaign: Campaign;

		/**
		 * Can be `undefined` if creating a new one.
		 */
		commonCampaignData?: CommonCampaignData;

		/**
		 * Can be `undefined` if creating a new one.
		 */
		campaignSpecificData?: CampaignSpecificData;

		campaignLogSnippet: Snippet;
		detailsSnippet: Snippet;
	}
	const {
		campaign,
		commonCampaignData,
		campaignSpecificData,
		campaignLogSnippet: campaignLog,
		detailsSnippet: details
	}: Prop<CampaignSpecificData> = $props();
	const campaignName = u.campaignName(campaign);
	const campaignImage = campaignBoxImageUrl(campaign);
	const accentColor = campaignColor(campaign);

	let activeTabIndex = $state(0);
	const playerAndDecksTab = m.east_whole_beaver_hike();
	const campaignLogTab = m.new_slow_dog_radiate();
	const detailsTab = m.nice_grand_shark_heal();
</script>

<div class="flex flex-col lg:flex-row">
	<aside class="lg:w-1/4">
		<header>
			<PageLead title={campaignName} image={campaignImage} />
		</header>
		<nav>
			<Tabs
				{accentColor}
				{activeTabIndex}
				onTabChange={(d) => {
					activeTabIndex = d;
				}}
				direction={'vertical'}
				tabs={[{ label: playerAndDecksTab }, { label: campaignLogTab }, { label: detailsTab }]}
			/>
		</nav>
	</aside>
	<main class="m-4 lg:w-3/4">
		{#if activeTabIndex === 0}
			<TabContentSlideIn>
				<InnerHeading title={playerAndDecksTab} {accentColor} />
				<PlayerAndDeckEditor />
			</TabContentSlideIn>
		{:else if activeTabIndex === 1}
			<TabContentSlideIn>
				<InnerHeading title={campaignLogTab} {accentColor} />
				{@render campaignLog()}
			</TabContentSlideIn>
		{:else if activeTabIndex === 2}
			<TabContentSlideIn>
				<InnerHeading title={detailsTab} {accentColor} />
				{@render details()}
			</TabContentSlideIn>
		{/if}
	</main>
</div>
