<!--
@component
EotE bespoke widget — "Frost Tokens". Edge of the Earth piles Frost tokens into
the chaos bag (and lets you clear them). This shows the RANGE recorded across your
WINNING plays: the most Frost the bag held on a win, and the fewest — drawn as
Frost-token coins (the shared <TokenCoinRow>, same art as the Campaign Archive's
chaos-bag editor). Fed by the shared `eoe` aggregate (`frostMax` / `frostMin`, null
until a winning play recorded a final chaos bag).
-->
<script lang="ts">
	import { ChaosToken } from '@5argon/arkham-kohaku';
	import type { CampaignEoe } from '$lib/campaign/eoe';
	import TokenCoinRow from '$lib/components/profile/_primitives/TokenCoinRow.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { eoe }: { eoe: CampaignEoe | null } = $props();
	const hasData = $derived(eoe != null && eoe.frostMax != null);
</script>

{#if hasData && eoe}
	<div class="space-y-3">
		<TokenCoinRow
			token={ChaosToken.TokenFrost}
			label={m.campaign_eote_frost_max_winning()}
			count={eoe.frostMax ?? 0}
		/>
		<TokenCoinRow
			token={ChaosToken.TokenFrost}
			label={m.campaign_eote_frost_min_winning()}
			count={eoe.frostMin ?? 0}
		/>
	</div>
{/if}
