<!--
@component
TCU bespoke widget — "Mementos". The collectibles you've ever discovered (base 8 +
rttcu's 2), each with how many plays you found it. Built on StatNumbers.
-->
<script lang="ts">
	import { TCU_MEMENTOS, type CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
	const cells = $derived<Stat[]>(
		tcu
			? TCU_MEMENTOS.filter((id) => (tcu.mementos[id] ?? 0) > 0).map((id) => ({
					value: tcu.mementos[id],
					label: (NAME[id] ?? (() => id))()
				}))
			: []
	);
	const hasData = $derived(cells.length > 0);
</script>

{#if hasData}
	<StatNumbers rows={[cells]} />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tcu_mementos_empty()}</p>
{/if}
