<!--
@component
TDC bespoke widget — "Eldritch Artifacts". The 6 story artifacts recovered across the expedition
(`artifacts_earned`); the hover notes how many plays each was carried into the finale (`hidden.kept_*`).
Carrying all 6 unlocks the strongest finale (the "repel" approach) and the `powers_combined`
achievement. A lit tile per artifact; counts = plays recovered. Built on LitTileGrid. Half-width.
-->
<script lang="ts">
	import { TDC_ARTIFACTS, tdcText, type CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';

	let { tdc }: { tdc: CampaignTdc | null } = $props();
	const tiles = $derived<LitTile[]>(
		tdc
			? TDC_ARTIFACTS.map((id): LitTile => {
					const c = tdc.artifacts.earned[id] ?? 0;
					const kept = tdc.artifacts.kept[id] ?? 0;
					const detail =
						c > 0
							? kept > 0
								? m.campaign_tdc_artifact_earned_kept({ times: times(c), kept: times(kept) })
								: m.campaign_tdc_artifact_earned({ times: times(c) })
							: m.campaign_tdc_artifact_not_yet();
					return { id, image: '', label: tdcText(`artifacts_earned.${id}`), count: c, detail };
				})
			: []
	);
	const hasData = $derived(!!tdc && tdc.artifacts.everEarned > 0);
</script>

{#if hasData && tdc}
	<LitTileGrid {tiles} colsClass="grid-cols-3 @3xl:grid-cols-6" />
	{#if tdc.artifacts.allSix > 0}
		<p class="text-primary-500 mt-3 text-center text-xs">
			{m.campaign_tdc_artifacts_all6({ count: tdc.artifacts.allSix })}
		</p>
	{/if}
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tdc_artifacts_empty()}</p>
{/if}
