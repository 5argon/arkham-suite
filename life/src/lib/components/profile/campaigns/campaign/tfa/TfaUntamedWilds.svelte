<!-- @component The Untamed Wilds: where Ichtaca and Alejandro stand, the cleared path, and Poisoned gained. -->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers, type StatGroup } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { poisonedStat, TFA_CARD } from './tfa-shared';

	let { blob: tfa, ctx }: CampaignWidgetProps<CampaignTfa> = $props();

	const rows = $derived<StatGroup[]>([
		{
			heading: m.campaign_tfa_wilds_ichtaca_heading(),
			stats: [
				{ value: tfa?.ichtaca.trust, label: m.campaign_tfa_wilds_ichtaca_trust() },
				{ value: tfa?.ichtaca.wary, label: m.campaign_tfa_wilds_ichtaca_wary() }
			]
		},
		{
			heading: m.campaign_tfa_wilds_alejandro_heading(),
			stats: [
				{ value: tfa?.alejandro.followed, label: m.campaign_tfa_wilds_alejandro_followed() },
				{ value: tfa?.alejandro.remained, label: m.campaign_tfa_wilds_alejandro_remained() }
			]
		},
		{ stats: [{ value: tfa?.untamedWilds.clearedPath, label: m.campaign_tfa_wilds_cleared() }] },
		// Poisoned is an Extra input.
		{ nonLog: true, stats: [poisonedStat(tfa, 'the_untamed_wilds')] }
	]);
</script>

<ScenarioInfo {ctx} showPlays headerCards={[TFA_CARD.ichtaca]}>
	{#snippet stats()}
		<StatNumbers logOnly={ctx.logOnly} empty={m.campaign_tfa_wilds_empty()} {rows} />
	{/snippet}
</ScenarioInfo>
