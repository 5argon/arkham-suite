<!-- @component Heart of the Elders: whom you consulted to find the way, and Poisoned gained over both parts. -->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers, type StatGroup } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { poisonedStat, TFA_CARD } from './tfa-shared';

	let { blob: tfa, ctx }: CampaignWidgetProps<CampaignTfa> = $props();

	const h = $derived(tfa?.heartOfElders);
	const rows = $derived<StatGroup[]>([
		{
			heading: m.campaign_tfa_hote_heading(),
			nonLog: true,
			stats: [
				{ value: h?.consultIchtaca, label: m.campaign_tfa_hote_ichtaca() },
				{ value: h?.consultAlejandro, label: m.campaign_tfa_hote_alejandro() },
				{ value: h?.consultJournal, label: m.campaign_tfa_hote_journal() },
				{ value: h?.consultNothing, label: m.campaign_tfa_hote_nothing() }
			]
		},
		{
			nonLog: true,
			stats: [poisonedStat(tfa, 'heart_of_the_elders_part_1', 'heart_of_the_elders_part_2')]
		}
	]);
</script>

<ScenarioInfo {ctx} showPlays headerCards={[TFA_CARD.ichtaca, TFA_CARD.alejandro]}>
	{#snippet stats()}
		<StatNumbers
			logOnly={ctx.logOnly}
			empty={ctx.logOnly ? undefined : m.campaign_tfa_hote_empty()}
			{rows}
		/>
	{/snippet}
</ScenarioInfo>
