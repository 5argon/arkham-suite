<script lang="ts">
	import EncounterOverview from '$lib/design/pages/tool/campaign/EncounterOverview.svelte';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import { snapshot } from '$app/navigation';
	import { Button, campaignBoxImageUrl, ReviewList, ReviewRow } from '@5argon/arkham-life-ui';
	import { u } from '@5argon/arkham-string';
	import * as m from '$lib/paraglide/messages.js';

	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const campaign = $derived(data.campaignData);
	const kohakuCampaign = $derived(data.kohakuCampaign);

	const campaignNameText = $derived(u.campaignName(kohakuCampaign));
	const campaignImage = $derived(campaignBoxImageUrl(kohakuCampaign));

	let showReviews = $state(false);
	snapshot({
		id: 'campaign-show-reviews',
		capture: () => showReviews,
		restore: (value) => (showReviews = value)
	});
</script>

<OpenGraph
	description={`Encounter set overview and setup reference for ${campaignNameText}.`}
	image={campaignImage}
	title={campaignNameText}
	url={`/campaign/${kohakuCampaign}`}
	canonical
/>

<EncounterOverview {campaign} hideContent={showReviews} {kohakuCampaign}>
	{#if data.reviews.length > 0}
		<div class="my-4">
			<Button
				highlighted={showReviews}
				label={showReviews
					? m.review_campaign_close()
					: m.review_section_campaign({ count: data.reviews.length })}
				onClick={() => (showReviews = !showReviews)}
			/>
		</div>
		{#if showReviews}
			<ReviewList>
				{#each data.reviews as entry (entry.id)}
					<ReviewRow {entry} />
				{/each}
			</ReviewList>
		{/if}
	{/if}
</EncounterOverview>
