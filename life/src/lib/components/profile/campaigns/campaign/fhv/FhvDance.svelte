<!-- @component The Second Evening: who shared a dance, the best night's spread and Mother Rachel's doubts. -->
<script lang="ts">
	import { FHV_DANCERS, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, StatNumbers, WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { fhvVillagerTiles } from './fhv-tiles';

	let { blob: fhv }: CampaignWidgetProps<CampaignFhv> = $props();

	const dance = $derived(fhv?.dance);
	const lit = (_: string, times: string) => m.campaign_fhv_dance_partner({ times });
	const none = () => m.campaign_fhv_dance_never();
	const tiles = $derived([
		...fhvVillagerTiles(FHV_DANCERS, (v) => fhv?.villagers[v]?.danced, lit, none),
		{
			...fhvVillagerTiles(['helen'], () => dance?.helen, lit, none)[0],
			label: m.campaign_fhv_dance_helen_name()
		}
	]);
</script>

{#if dance?.plays.total}
	<div class="space-y-4">
		<LitTileGrid {tiles} layout="flex" objectTop />
		{#if dance.best >= 4}
			<p class="text-secondary-600 dark:text-secondary-400 text-center text-xs font-semibold">
				{m.campaign_fhv_dance_queen()}
			</p>
		{/if}
		<StatNumbers
			rows={[
				[
					{ value: dance.best, label: m.campaign_fhv_dance_best() },
					{ tally: dance.rachelDoubts, label: m.campaign_fhv_dance_rachel_doubts() },
					{ tally: dance.plays, label: m.campaign_fhv_dance_plays() }
				]
			]}
		/>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_fhv_dance_empty()}</WidgetEmpty>
{/if}
