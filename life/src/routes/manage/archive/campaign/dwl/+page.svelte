<script lang="ts">
	import CampaignEditLayout from '$lib/campaign-edit/common/CampaignEditLayout.svelte';
	import { Campaign } from '@5argon/arkham-kohaku';
</script>

{#snippet campaignLogSnippet()}
	campaign log
{/snippet}

{#snippet detailsSnippet()}
	details
{/snippet}

<CampaignEditLayout
	campaign={Campaign.TheDunwichLegacy}
	campaignSpecificData
	{campaignLogSnippet}
	{detailsSnippet}
/>
