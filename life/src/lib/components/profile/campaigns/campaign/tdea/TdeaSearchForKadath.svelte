<!-- @component The Search for Kadath: the Dreamlands region searched and what happened at the temple. -->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		SectionLabel,
		StatNumbers,
		WidgetEmpty,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tdea, ctx }: CampaignWidgetProps<CampaignTdea> = $props();

	const s = $derived(tdea?.searchForKadath);
	const REGIONS: { id: string; label: () => string }[] = [
		{ id: 'oriab', label: m.campaign_tdea_search_oriab },
		{ id: 'minar', label: m.campaign_tdea_search_minar },
		{ id: 'forbidden_lands', label: m.campaign_tdea_search_forbidden },
		{ id: 'timeless_realm', label: m.campaign_tdea_search_timeless }
	];
	const regionTiles = $derived<LitTile[]>(
		REGIONS.map((r) => {
			const count = s?.route[r.id] ?? 0;
			return { id: r.id, label: r.label(), count, detail: count ? times(count) : '' };
		})
	);
	const searched = $derived(regionTiles.some((t) => t.count > 0));
	const temple = $derived([
		{
			heading: m.campaign_tdea_search_temple_heading(),
			stats: [
				{ value: s?.captures.virgil, label: m.campaign_tdea_search_virgil() },
				{ value: s?.captures.someoneEscaped, label: m.campaign_tdea_search_escaped() },
				{ value: s?.captures.everyoneCaptured, label: m.campaign_tdea_search_all_captured() },
				{ value: s?.forcedIntoTemple, label: m.campaign_tdea_search_forced() },
				{ value: s?.brokeLawOfUlthar, label: m.campaign_tdea_search_ulthar() }
			]
		}
	]);
	const atTemple = $derived(temple[0].stats.some((st) => st.value));
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		{#if searched || atTemple}
			<div class="space-y-4">
				{#if searched}
					<div>
						<SectionLabel variant="heading" align="center"
							>{m.campaign_tdea_search_route_heading()}</SectionLabel
						>
						<LitTileGrid tiles={regionTiles} layout="flex" showLabel={false} />
					</div>
				{/if}
				<StatNumbers rows={temple} />
			</div>
		{:else}
			<WidgetEmpty>{m.campaign_tdea_search_empty()}</WidgetEmpty>
		{/if}
	{/snippet}
</ScenarioInfo>
