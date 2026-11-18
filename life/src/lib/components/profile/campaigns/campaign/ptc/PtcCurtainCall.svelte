<!-- @component Curtain Call: whether the police were warned, and which Act 2b advanced. -->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: ptc, ctx }: CampaignWidgetProps<CampaignPtc> = $props();
	const c = $derived(ptc?.curtainCall);

	const ACT2B: Record<string, () => string> = {
		a_city_aflame: m.campaign_ptc_curtain_act2b_a_city_aflame,
		the_path_is_mine: m.campaign_ptc_curtain_act2b_the_path_is_mine,
		the_shores_of_hali: m.campaign_ptc_curtain_act2b_the_shores_of_hali,
		alaran_mists: m.campaign_ptc_curtain_act2b_alaran_mists,
		under_the_city: m.campaign_ptc_curtain_act2b_under_the_city,
		here_is_my_reply: m.campaign_ptc_curtain_act2b_here_is_my_reply
	};
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			logOnly={ctx.logOnly}
			empty={m.campaign_ptc_curtain_empty()}
			rows={[
				[
					{ value: c?.warnedPolice, label: m.campaign_ptc_curtain_warned() },
					{ value: c?.didNotWarn, label: m.campaign_ptc_curtain_not_warned() }
				],
				{
					heading: m.campaign_ptc_curtain_act2b_heading(),
					nonLog: true,
					stats: (c?.act2b ?? []).map((a) => ({ tally: a.plays, label: ACT2B[a.id]?.() ?? a.id }))
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
