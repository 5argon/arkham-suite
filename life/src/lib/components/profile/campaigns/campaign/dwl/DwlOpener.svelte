<!-- @component An opening case, split by whether it was played first or second. -->
<script lang="ts">
	import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import { scenarioVersions } from '$lib/campaign/stats/version-stats';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import ScenarioVersionTable from '../ScenarioVersionTable.svelte';

	let { ctx }: CampaignWidgetProps<CampaignDwl> = $props();

	const labels: Record<string, () => string> = {
		first: m.campaign_dwl_opener_first,
		second: m.campaign_dwl_opener_second
	};
	const played = $derived(scenarioVersions(ctx.scenarios, ctx.scenario ?? '').hasPlays);
</script>

<ScenarioInfo {ctx} showPlays hideResolutions hideVp empty={played ? null : m.campaign_dwl_opener_empty()}>
	{#snippet stats()}
		<ScenarioVersionTable {ctx} label={(v) => labels[v]?.() ?? v} showPlays showXp />
	{/snippet}
</ScenarioInfo>
