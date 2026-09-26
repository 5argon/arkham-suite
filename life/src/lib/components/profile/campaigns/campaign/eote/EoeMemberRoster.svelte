<!-- @component The nine expedition members as portraits, each lit by how often one fate befell them. -->
<script lang="ts">
	import { eoeTeam, type CampaignEoe } from '$lib/campaign/campaigns/eoe';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { litTiles, teamLabel, timesDetail } from './eote-tiles';

	type Metric = 'killed' | 'demons' | 'survived' | 'rescued';
	let { blob: eoe, metric }: CampaignWidgetProps<CampaignEoe> & { metric: Metric } = $props();

	const detail: Record<Metric, (count: number) => string> = {
		killed: (count) =>
			count ? m.campaign_eote_roster_killed({ count }) : m.campaign_eote_roster_killed_none(),
		demons: timesDetail(m.campaign_eote_roster_demons, m.campaign_eote_roster_demons_none),
		survived: (count) =>
			count ? m.campaign_eote_roster_survived({ count }) : m.campaign_eote_roster_survived_none(),
		rescued: timesDetail(m.campaign_eote_roster_rescued, m.campaign_eote_roster_rescued_none)
	};

	const tiles = $derived(litTiles(eoeTeam(), eoe?.[metric], detail[metric], teamLabel));
</script>

<LitTileGrid {tiles} colsClass="grid-cols-3 @3xl:grid-cols-9" />
