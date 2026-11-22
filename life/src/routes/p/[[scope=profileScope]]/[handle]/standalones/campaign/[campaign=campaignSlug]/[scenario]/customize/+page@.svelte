<script lang="ts">
	import { page } from '$app/state';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { standaloneKey } from '$lib/campaign/standalones/define';
	import CustomizePane from '$lib/components/profile/_framework/CustomizePane.svelte';

	const params = $derived(page.params as { campaign: string; scenario: string });
	const title = $derived(
		getCampaignLog(params.campaign)?.en.scenarioNames?.[params.scenario] ?? params.scenario
	);
</script>

<CustomizePane
	pane="standaloneDetail"
	standalone={standaloneKey(params.campaign, params.scenario)}
	{title}
/>
