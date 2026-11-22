<!-- @component Blood Money: whether the Children of Blood were stopped, Priscilla Thomas walking away from the deal, the epilogue read after it, and the Chosen of Zburamoarte reward card. -->
<script lang="ts">
	import {
		COB_PRISCILLA_CODE,
		COB_WILKES_CODE,
		type CampaignCob
	} from '$lib/campaign/campaigns/cob';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { CHOSEN_OF_ZBURAMOARTE_CODE } from '$lib/campaign/rewards/reward-defs';
	import { RewardLine, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: cob, ctx }: CampaignWidgetProps<CampaignCob> = $props();

	const b = $derived(cob?.bloodMoney);
	const e = $derived(cob?.epilogue);
</script>

<ScenarioInfo
	{ctx}
	headerCards={[
		{ code: COB_WILKES_CODE, label: m.campaign_cob_wilkes(), tone: 'danger', objectTop: true },
		{ code: COB_PRISCILLA_CODE, label: m.campaign_cob_priscilla(), objectTop: true }
	]}
>
	{#snippet stats()}
		<div class="flex flex-wrap justify-center gap-x-16 gap-y-4">
			<StatNumbers
				rows={[
					{
						heading: m.campaign_cob_children_heading(),
						keepEmpty: true,
						stats: [
							{ tally: b?.stopped, label: m.campaign_cob_children_stopped() },
							{ tally: b?.failedToStop, label: m.campaign_cob_children_failed() }
						]
					}
				]}
			/>
			<StatNumbers
				rows={[
					{
						heading: m.campaign_cob_priscilla(),
						keepEmpty: true,
						stats: [
							{ tally: b?.priscillaWalkedAway, label: m.campaign_cob_priscilla_walked_away() }
						]
					}
				]}
			/>
		</div>
		<StatNumbers
			empty={m.campaign_cob_money_empty()}
			rows={[
				{
					heading: m.campaign_cob_epilogue_heading(),
					stats: [
						{ tally: e?.arkhamRecovers, label: m.campaign_cob_epilogue_recovers() },
						{ tally: e?.rumorsReturn, label: m.campaign_cob_epilogue_rumors() },
						{ tally: e?.bloodbath, label: m.campaign_cob_epilogue_bloodbath() },
						{ tally: e?.juliaSeenAgain, label: m.campaign_cob_epilogue_julia() }
					]
				}
			]}
		/>
		{#if !ctx.logOnly}
			<RewardLine code={CHOSEN_OF_ZBURAMOARTE_CODE} tally={b?.chosenOfZburamoarte} />
		{/if}
	{/snippet}
</ScenarioInfo>
