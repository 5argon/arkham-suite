<script lang="ts">
	import EncounterOverview from '$lib/design/pages/tool/campaign/EncounterOverview.svelte';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import { campaignBoxImageUrl } from '@5argon/arkham-life-ui';
	import { u } from '@5argon/arkham-string';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const campaign = $derived(data.campaignData);
	const kohakuCampaign = $derived(data.kohakuCampaign);
	const incomplete = $derived(data.incomplete);

	const campaignNameText = $derived(u.campaignName(kohakuCampaign));
	const campaignImage = $derived(campaignBoxImageUrl(kohakuCampaign));
</script>

<OpenGraph
	description={`Encounter set overview and setup reference for ${campaignNameText}.`}
	image={campaignImage}
	title={campaignNameText}
	url={`/campaign/${kohakuCampaign}`}
/>

<EncounterOverview {campaign} {incomplete} {kohakuCampaign} />
