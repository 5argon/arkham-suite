<!-- @component The Lair of Dagon: whether Dagon woke, the gatekeeper, and the Order's ritual. -->
<script lang="ts">
	import type { CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tic, ctx }: CampaignWidgetProps<CampaignTic> = $props();

	const d = $derived(tic?.lairOfDagon);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tic_lod_empty()}
			rows={[
				[
					{ tally: d?.slumbers, label: m.campaign_tic_lod_slumbers() },
					{ tally: d?.awoke, label: m.campaign_tic_lod_awoke() }
				],
				[
					{ tally: d?.gatekeeperDefeated, label: m.campaign_tic_lod_gatekeeper() },
					{ tally: d?.ritualDisrupted, label: m.campaign_tic_lod_ritual() }
				]
			]}
		/>
	{/snippet}
</ScenarioInfo>
