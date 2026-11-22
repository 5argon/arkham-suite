<!-- @component The most and fewest [blood] tokens left in the chaos bag at the end of the campaign. -->
<script lang="ts">
	import { ChaosToken } from '@5argon/arkham-kohaku';
	import type { CampaignCob } from '$lib/campaign/campaigns/cob';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { TokenCoinRow, WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: cob }: CampaignWidgetProps<CampaignCob> = $props();

	const blood = $derived(cob?.blood);
</script>

{#if blood?.max != null}
	<div class="space-y-3">
		<TokenCoinRow
			token={ChaosToken.TokenBlood}
			label={m.campaign_cob_blood_most()}
			count={blood.max}
		/>
		<TokenCoinRow
			token={ChaosToken.TokenBlood}
			label={m.campaign_cob_blood_fewest()}
			count={blood.min ?? 0}
		/>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_cob_blood_empty()}</WidgetEmpty>
{/if}
