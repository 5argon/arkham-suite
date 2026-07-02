<!--
@component
TCU bespoke widget — "Mementos". The collectibles you dig up across the campaign, as a wall of
uniform tiles lit by how many plays turned each one up (the base eight, plus the two Return-to
mementos once you've ever found them). A coverage caption tops the wall. Built on LitTileGrid.
-->
<script lang="ts">
	import { TCU_MEMENTOS, type CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';

	let { tcu }: { tcu: CampaignTcu | null } = $props();

	const NAME: Record<string, () => string> = {
		mesmerizing_flute: m.campaign_tcu_memento_mesmerizing_flute,
		ritual_components: m.campaign_tcu_memento_ritual_components,
		scrap_of_torn_shadow: m.campaign_tcu_memento_scrap_of_torn_shadow,
		gilmans_journal: m.campaign_tcu_memento_gilmans_journal,
		keziahs_formulae: m.campaign_tcu_memento_keziahs_formulae,
		worn_crucific: m.campaign_tcu_memento_worn_crucific,
		corn_husk_doll: m.campaign_tcu_memento_corn_husk_doll,
		wisp_of_spectral_mist: m.campaign_tcu_memento_wisp_of_spectral_mist,
		strange_incantation: m.campaign_tcu_memento_strange_incantation,
		bloody_tree_carvings: m.campaign_tcu_memento_bloody_tree_carvings
	};

	// The base eight always show; the two Return-to mementos (indices 8-9) appear only once found.
	const tiles = $derived<LitTile[]>(
		tcu
			? TCU_MEMENTOS.filter((id, i) => i < 8 || (tcu.mementos[id] ?? 0) > 0).map((id): LitTile => {
					const count = tcu.mementos[id] ?? 0;
					return {
						id,
						image: '',
						label: (NAME[id] ?? (() => id))(),
						count,
						detail:
							count > 0
								? m.campaign_tcu_memento_found({ times: times(count) })
								: m.campaign_tcu_memento_undiscovered()
					};
				})
			: []
	);
	const hasData = $derived((tcu?.mementosCount ?? 0) > 0);
</script>

{#if hasData && tcu}
	<div class="space-y-3">
		<SectionLabel variant="heading" align="center"
			>{m.campaign_tcu_mementos_coverage()} — {tcu.mementosCount}</SectionLabel
		>
		<LitTileGrid {tiles} colsClass="grid-cols-4 @3xl:grid-cols-8" countPosition="below" showLabel={false} />
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tcu_mementos_empty()}</p>
{/if}
