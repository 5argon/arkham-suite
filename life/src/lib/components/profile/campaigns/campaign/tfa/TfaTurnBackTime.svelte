<!-- @component Turn Back Time: the plays that sealed the Relic of Ages forever. -->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { TFA_CARD } from './tfa-shared';

	let { blob: tfa, ctx }: CampaignWidgetProps<CampaignTfa> = $props();
</script>

<ScenarioInfo {ctx} plays={tfa?.turnBackTime.reached ?? null} headerCards={[TFA_CARD.relic]}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tfa_turn_back_time_empty()}
			rows={[[{ tally: tfa?.turnBackTime.sealedForever, label: m.campaign_tfa_aeons_sealed() }]]}
		/>
	{/snippet}
</ScenarioInfo>
