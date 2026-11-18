<!-- @component The Depths of Yoth: how deep you descended, and the starting agenda Yig's Fury seeded. -->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { depthsAgendaStats, TFA_CARD } from './tfa-shared';

	let { blob: tfa, ctx }: CampaignWidgetProps<CampaignTfa> = $props();

	const depth = $derived(tfa?.depthsOfYoth.finalDepth);
</script>

<ScenarioInfo {ctx} showPlays headerCards={[TFA_CARD.yig]}>
	{#snippet stats()}
		<StatNumbers
			logOnly={ctx.logOnly}
			empty={m.campaign_tfa_yoth_empty()}
			rows={[
				{
					nonLog: true,
					stats: [
						{ value: depth?.max, label: m.campaign_tfa_yoth_depth_max() },
						{ value: depth?.min, label: m.campaign_tfa_yoth_depth_min() }
					]
				},
				{ heading: m.campaign_tfa_yoth_agenda_heading(), stats: depthsAgendaStats(tfa) }
			]}
		/>
	{/snippet}
</ScenarioInfo>
