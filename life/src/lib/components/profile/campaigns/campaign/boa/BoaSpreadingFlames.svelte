<!-- @component Spreading Flames: whether Miskatonic University was saved or burned, and whether the masked pursuer was defeated. -->
<script lang="ts">
	import { BOA_ARMITAGE_CODE, type CampaignBoa } from '$lib/campaign/campaigns/boa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: boa, ctx }: CampaignWidgetProps<CampaignBoa> = $props();

	const f = $derived(boa?.spreadingFlames);
	const reached = $derived(!!f && f.saved.total + f.burned.total > 0);
</script>

<ScenarioInfo
	{ctx}
	headerCards={[{ code: BOA_ARMITAGE_CODE, objectTop: true }]}
	empty={reached ? null : m.campaign_boa_flames_empty()}
>
	{#snippet stats()}
		<div class="flex flex-wrap justify-center gap-x-16 gap-y-4">
			<StatNumbers
				rows={[
					{
						heading: m.campaign_boa_university_heading(),
						keepEmpty: true,
						stats: [
							{ tally: f?.saved, label: m.campaign_boa_university_saved() },
							{ tally: f?.burned, label: m.campaign_boa_university_burned() }
						]
					}
				]}
			/>
			<StatNumbers
				rows={[
					{
						heading: m.campaign_boa_pursuer_heading(),
						keepEmpty: true,
						stats: [
							{
								tally: boa?.servant.defeatedInSpreadingFlames,
								label: m.campaign_boa_pursuer_defeated()
							},
							{ tally: f?.pursuerGotAway, label: m.campaign_boa_pursuer_got_away() }
						]
					}
				]}
			/>
		</div>
	{/snippet}
</ScenarioInfo>
