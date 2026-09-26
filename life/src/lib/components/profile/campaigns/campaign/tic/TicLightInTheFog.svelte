<!-- @component A Light in the Fog: the key and map to Y'ha-nthlei, and whether you kept a Diving Suit. -->
<script lang="ts">
	import type { CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tic, ctx }: CampaignWidgetProps<CampaignTic> = $props();

	const l = $derived(tic?.lightInTheFog);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tic_lif_empty()}
			rows={[
				[
					{ tally: l?.key, label: m.campaign_tic_lif_key() },
					{ tally: l?.map, label: m.campaign_tic_lif_map() },
					{ tally: l?.divingSuit, label: m.campaign_tic_lif_suit() }
				]
			]}
		/>
	{/snippet}
</ScenarioInfo>
