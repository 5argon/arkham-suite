<!-- @component The Longest Night: the captives' fate, who stood by you or sacrificed themselves, and how the farm was held. -->
<script lang="ts">
	import { FHV_DANCERS, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		SectionLabel,
		StatNumbers,
		type StatGroup
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import FhvOutcomeScenario from './FhvOutcomeScenario.svelte';
	import { fhvOptionLabel } from './fhv-labels';
	import { fhvVillagerTiles } from './fhv-tiles';

	let { blob: fhv, ctx }: CampaignWidgetProps<CampaignFhv> = $props();

	const night = $derived(fhv?.longestNight);
	const stance = (side: 'confront' | 'hide') => ({
		tally: night?.rachel[side],
		label: fhvOptionLabel('the_longest_night.rachel_stance', side)
	});
	const extraRows = $derived<StatGroup[]>([
		{
			heading: m.campaign_fhv_fe_rachel_heading(),
			nonLog: true,
			stats: [stance('confront'), stance('hide')]
		},
		{
			nonLog: true,
			keepEmpty: night?.damageBest != null,
			stats: [{ value: night?.damageBest, label: m.campaign_fhv_ln_damage_best() }]
		}
	]);
	const hasExtra = $derived(
		!ctx.logOnly &&
			(!!night?.rachel.confront.total || !!night?.rachel.hide.total || night?.damageBest != null)
	);

	const stood = $derived(
		fhvVillagerTiles(
			FHV_DANCERS,
			(v) => fhv?.villagers[v]?.stood,
			(name, times) => m.campaign_fhv_ln_stood_tile({ name, times }),
			() => m.campaign_fhv_ln_stood_none()
		)
	);
	const sacrificed = $derived(
		fhvVillagerTiles(
			FHV_DANCERS,
			(v) => fhv?.villagers[v]?.sacrificed,
			(name, times) => m.campaign_fhv_ln_sacrificed_tile({ name, times }),
			() => m.campaign_fhv_ln_sacrificed_none()
		)
	);
	const walls = $derived(
		[
			{ id: 'stood', heading: m.campaign_fhv_ln_stood_heading(), tiles: stood },
			{ id: 'sacrificed', heading: m.campaign_fhv_ln_sacrificed_heading(), tiles: sacrificed }
		].filter((w) => w.tiles.some((t) => t.count > 0))
	);
</script>

<FhvOutcomeScenario blob={fhv} {ctx} hasMore={hasExtra || walls.length > 0}>
	<StatNumbers logOnly={ctx.logOnly} rows={extraRows} />
	{#each walls as w (w.id)}
		<div>
			<SectionLabel variant="heading" align="center">{w.heading}</SectionLabel>
			<LitTileGrid tiles={w.tiles} layout="flex" objectTop />
		</div>
	{/each}
</FhvOutcomeScenario>
