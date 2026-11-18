<!-- @component The Silver Key: times obtained, and times it ended with the Dream-Quest party. -->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { CardThumb, StatNumbers, WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { SILVER_KEY_CODE } from './tde-cards';

	let { blob }: CampaignWidgetProps<CampaignTdea | CampaignTdeb> = $props();

	const s = $derived(blob?.shared.silverKey);
</script>

{#if s?.obtained}
	<div class="flex items-center justify-center gap-4">
		<CardThumb code={SILVER_KEY_CODE} />
		<StatNumbers
			rows={[
				[
					{ value: s.obtained, label: m.campaign_tde_key_obtained() },
					{ value: s.withDreamQuest, label: m.campaign_tde_key_passed() }
				]
			]}
		/>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tde_key_empty()}</WidgetEmpty>
{/if}
