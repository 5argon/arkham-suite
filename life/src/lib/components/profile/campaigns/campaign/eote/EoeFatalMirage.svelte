<!-- @component Fatal Mirage: how many times each campaign returned to it, and memories banished per run. -->
<script lang="ts">
	import type { CampaignEoe } from '$lib/campaign/campaigns/eoe';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: eoe, ctx }: CampaignWidgetProps<CampaignEoe> = $props();

	const runs = $derived(eoe?.fatalMiragePlayCounts);
	const banished = $derived(eoe?.banishedPerRun);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_eote_fatal_empty()}
			rows={[
				[
					{ value: runs?.once, label: m.campaign_eote_fatal_played_once() },
					{ value: runs?.twice, label: m.campaign_eote_fatal_played_twice() },
					{ value: runs?.thrice, label: m.campaign_eote_fatal_played_thrice() }
				],
				[
					{ value: banished?.max, label: m.campaign_eote_fatal_most_banished() },
					{ value: banished?.min, label: m.campaign_eote_fatal_fewest_banished() }
				]
			]}
		/>
	{/snippet}
</ScenarioInfo>
