<!-- @component City of the Elder Things: plays, results and XP per version faced (Extra: `city_version`). -->
<script lang="ts">
	import type { CampaignEoe } from '$lib/campaign/campaigns/eoe';
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import { scenarioVersions } from '$lib/campaign/stats/version-stats';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import ScenarioVersionTable from '../ScenarioVersionTable.svelte';

	let { ctx }: CampaignWidgetProps<CampaignEoe> = $props();

	const resolutions = $derived(
		(scenarioMeta(ctx.family, ctx.scenario ?? '')?.resolutions ?? []).filter(
			(r) => r !== 'no_resolution'
		)
	);
	const played = $derived(scenarioVersions(ctx.scenarios, ctx.scenario ?? '').hasPlays);
</script>

<ScenarioInfo {ctx} empty={played ? null : m.campaign_eote_city_empty()}>
	{#snippet stats()}
		<ScenarioVersionTable
			{ctx}
			label={(version) => m.campaign_eote_city_version_label({ version })}
			resolutionIds={() => resolutions}
			showSucceedFailed
			showXp
		/>
	{/snippet}
</ScenarioInfo>
