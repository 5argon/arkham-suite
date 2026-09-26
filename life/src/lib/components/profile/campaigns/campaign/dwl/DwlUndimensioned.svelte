<!-- @component Undimensioned and Unseen: how many broods escaped, and whether the townsfolk were calmed. -->
<script lang="ts">
	import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: dwl, ctx }: CampaignWidgetProps<CampaignDwl> = $props();
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_dwl_broods_empty()}
			rows={[
				(dwl?.broods ?? []).map((b) => ({
					tally: b.tally,
					label: b.escaped === 0 ? m.campaign_dwl_broods_none() : m.campaign_dwl_broods_label({ n: b.escaped })
				})),
				[
					{ value: dwl?.townsfolk.calmed, label: m.campaign_dwl_townsfolk_calmed() },
					{ value: dwl?.townsfolk.warned, label: m.campaign_dwl_townsfolk_warned() }
				]
			]}
		/>
	{/snippet}
</ScenarioInfo>
