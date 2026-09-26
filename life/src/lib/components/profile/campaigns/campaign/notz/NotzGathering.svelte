<!-- @component The Gathering: your house's fate, whether Lita was recruited, and whether the Ghoul Priest was slain. -->
<script lang="ts">
	import { NOTZ_LITA_CODE, type CampaignNotz } from '$lib/campaign/campaigns/notz';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: notz, ctx }: CampaignWidgetProps<CampaignNotz> = $props();

	const g = $derived(notz?.gathering);
</script>

<ScenarioInfo {ctx} headerCards={[{ code: NOTZ_LITA_CODE, objectTop: true }]}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_notz_gathering_empty()}
			rows={[
				{
					heading: m.campaign_notz_house_heading(),
					stats: [
						{ tally: g?.houseStanding, label: m.campaign_notz_house_standing() },
						{ tally: g?.houseBurned, label: m.campaign_notz_house_burned() }
					]
				},
				{
					heading: m.campaign_notz_lita_heading(),
					stats: [
						{ tally: g?.litaRecruited, label: m.campaign_notz_lita_recruited() },
						{ tally: g?.litaFindsOthers, label: m.campaign_notz_lita_found_others() }
					]
				},
				{
					heading: m.campaign_notz_ghoul_heading(),
					stats: [
						{ tally: g?.ghoulPriestSlain, label: m.campaign_notz_ghoul_slain() },
						{ tally: g?.ghoulPriestSurvived, label: m.campaign_notz_ghoul_survived() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
