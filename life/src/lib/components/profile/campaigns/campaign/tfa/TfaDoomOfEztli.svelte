<!-- @component The Doom of Eztli: who recovered the Relic, the Harbinger's first wounds, the replays and Poisoned gained. -->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers, type StatGroup } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { poisonedStat, TFA_CARD } from './tfa-shared';

	let { blob: tfa, ctx }: CampaignWidgetProps<CampaignTfa> = $props();

	const e = $derived(tfa?.doomOfEztli);
	const rows = $derived<StatGroup[]>([
		{
			heading: m.campaign_tfa_eztli_relic_heading(),
			stats: [
				{ value: e?.investigatorsRelic, label: m.campaign_tfa_eztli_investigators_relic() },
				{ value: e?.alejandroRelic, label: m.campaign_tfa_eztli_alejandro_relic() }
			]
		},
		// Harbinger damage, replays and Poisoned are Extra inputs.
		{
			nonLog: true,
			stats: [
				{ value: tfa?.harbinger.eztli.max, label: m.campaign_tfa_eztli_harbinger() },
				{ value: e?.retriesMax, label: m.campaign_tfa_eztli_retries() },
				poisonedStat(tfa, 'the_doom_of_eztli')
			]
		}
	]);
</script>

<ScenarioInfo {ctx} showPlays headerCards={[TFA_CARD.harbinger]}>
	{#snippet stats()}
		<StatNumbers logOnly={ctx.logOnly} empty={m.campaign_tfa_eztli_empty()} {rows} />
	{/snippet}
</ScenarioInfo>
