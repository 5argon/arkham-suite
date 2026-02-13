<script lang="ts">
	import { PageLead } from '@5argon/arkham-life-ui';
	import CampaignMenu from '$lib/design/components/campaign/CampaignMenu.svelte';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import * as m from '$lib/paraglide/messages.js';
</script>

<OpenGraph
	description="Encounter set overviews, and quick setup references for each scenario."
	image="image/resource/campaign.webp"
	title="Campaign References"
	url="/campaign"
/>

<PageLead
	description="Encounter set overviews, and quick setup references for each scenario."
	title={m.campaign_title()}
/>

<CampaignMenu />
