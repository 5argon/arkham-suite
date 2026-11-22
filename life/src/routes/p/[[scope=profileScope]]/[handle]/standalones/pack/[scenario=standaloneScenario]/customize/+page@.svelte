<script lang="ts">
	import { page } from '$app/state';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { standaloneKey } from '$lib/campaign/standalones/define';
	import CustomizePane from '$lib/components/profile/_framework/CustomizePane.svelte';

	const scenario = $derived((page.params as { scenario: string }).scenario);
	const title = $derived(getCampaignLog('side')?.en.scenarioNames?.[scenario] ?? scenario);
</script>

<CustomizePane pane="standaloneDetail" standalone={standaloneKey('side', scenario)} {title} />
