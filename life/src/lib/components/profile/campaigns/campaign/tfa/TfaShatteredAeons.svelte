<!-- @component Shattered Aeons: the endings reached, including the rewind that opens Turn Back Time. -->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { TFA_CARD } from './tfa-shared';

	let { blob: tfa, ctx }: CampaignWidgetProps<CampaignTfa> = $props();

	const a = $derived(tfa?.shatteredAeons);
</script>

<ScenarioInfo {ctx} showPlays headerCards={[TFA_CARD.relic, TFA_CARD.yig]}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tfa_aeons_empty()}
			rows={[
				{
					heading: m.campaign_tfa_aeons_heading(),
					stats: [
						{ value: a?.mendedTear, label: m.campaign_tfa_aeons_mended() },
						{ value: a?.savedSerpents, label: m.campaign_tfa_aeons_serpents() },
						{ value: a?.savedYithians, label: m.campaign_tfa_aeons_yithians() }
					]
				},
				[
					{ value: a?.fabricUnwoven, label: m.campaign_tfa_aeons_unwoven() },
					{ value: a?.turnedBackTime, label: m.campaign_tfa_aeons_turned() }
				]
			]}
		/>
	{/snippet}
</ScenarioInfo>
