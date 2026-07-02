<!--
@component
TFA bespoke widget — "Expedition Kit". The eleven provisions you can buy in the prologue, as a wall lit
by how many times the profile subject packed each (the supply log keys by investigator, so this is the
player's own kit, not the team's). Plus how often you set out with nothing at all — Who Needs Any of
This Junk? Built on LitTileGrid.
-->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { itemLabel } from '$lib/campaign/records/campaign-log-source';
	import { TFA_PROVISIONS, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tfa }: { tfa: CampaignTfa | null } = $props();
	const log = getCampaignLog('tfa');
	const tiles = $derived<LitTile[]>(
		tfa
			? TFA_PROVISIONS.map((id) => {
					const count = tfa.supplies[id] ?? 0;
					return {
						id,
						image: '',
						label: log ? itemLabel(log, id) : id,
						count,
						detail:
							count > 0
								? m.campaign_tfa_supplies_took({ times: count })
								: m.campaign_tfa_supplies_never()
					};
				})
			: []
	);
	const hasData = $derived(
		!!tfa && (tfa.suppliesRuns > 0 || Object.values(tfa.supplies).some((v) => v > 0))
	);
</script>

{#if hasData && tfa}
	<div class="space-y-3">
		<LitTileGrid {tiles} layout="flex" countPosition="below" />
		{#if tfa.suppliesEmptyRuns > 0}
			<p class="text-center text-xs text-emerald-600 dark:text-emerald-400">
				{m.campaign_tfa_supplies_light({ n: tfa.suppliesEmptyRuns })}
			</p>
		{/if}
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tfa_supplies_empty()}</p>
{/if}
