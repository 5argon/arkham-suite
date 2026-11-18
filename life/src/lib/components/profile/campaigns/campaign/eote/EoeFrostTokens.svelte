<!-- @component The most and fewest Frost tokens left in the chaos bag at the end of a won campaign. -->
<script lang="ts">
	import { ChaosToken } from '@5argon/arkham-kohaku';
	import type { CampaignEoe } from '$lib/campaign/campaigns/eoe';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { TokenCoinRow, WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: eoe }: CampaignWidgetProps<CampaignEoe> = $props();

	const frost = $derived(eoe?.frost);
</script>

{#if frost?.max != null}
	<div class="space-y-3">
		<TokenCoinRow
			token={ChaosToken.TokenFrost}
			label={m.campaign_eote_frost_max_winning()}
			count={frost.max}
		/>
		<TokenCoinRow
			token={ChaosToken.TokenFrost}
			label={m.campaign_eote_frost_min_winning()}
			count={frost.min ?? 0}
		/>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_eote_frost_empty()}</WidgetEmpty>
{/if}
