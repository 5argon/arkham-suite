<!-- @component Supplies still held, or the camps reached in their ascent tiers, lit by how many plays. -->
<script lang="ts">
	import { EOE_CAMP_ROWS, EOE_SUPPLIES, type CampaignEoe } from '$lib/campaign/campaigns/eoe';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { entryText, litTiles, timesDetail } from './eote-tiles';

	let { blob: eoe, kind }: CampaignWidgetProps<CampaignEoe> & { kind: 'supplies' | 'camped' } =
		$props();

	const recovered = timesDetail(
		m.campaign_eote_item_recovered,
		m.campaign_eote_item_never_recovered
	);
	const camped = timesDetail(m.campaign_eote_item_camped, m.campaign_eote_item_never_camped);

	const rows = $derived(
		kind === 'supplies'
			? [litTiles(EOE_SUPPLIES, eoe?.supplies, recovered, entryText('supplies_recovered'))]
			: EOE_CAMP_ROWS.map((row) => litTiles(row, eoe?.camped, camped))
	);
</script>

<LitTileGrid {rows} />
