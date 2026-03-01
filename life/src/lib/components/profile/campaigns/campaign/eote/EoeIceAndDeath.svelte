<!--
@component
EotE bespoke widget — "Ice and Death". Per-run tallies for the opening arc, in a
fixed three-row grouping: the Part II / III skips; the Shelter range + hunting
creatures; the two escape routes. The max / min Shelter come from a manual
Extra-tab count. Built on the shared StatNumbers.
-->
<script lang="ts">
	import type { CampaignEoe } from '$lib/campaign/eoe';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { eoe, logOnly = false }: { eoe: CampaignEoe | null; logOnly?: boolean } = $props();
	// Part II / III skips (Extra `scenarioSkipped`) and the Shelter max/min (a manual Extra-tab
	// count) hide under Log-only mode; the hunting / escape tallies (defeated creatures, fled,
	// escaped) are log-derived and always stay.
	const rows = $derived<Stat[][]>(
		eoe
			? [
					...(logOnly
						? []
						: [
								[
									{ value: eoe.iceDeathSkipped2 ?? 0, label: m.campaign_eote_ice_part2_skipped() },
									{ value: eoe.iceDeathSkipped3 ?? 0, label: m.campaign_eote_ice_part3_skipped() }
								]
							]),
					[
						...(logOnly
							? []
							: [
									{ value: eoe.shelterMax ?? '—', label: m.campaign_eote_ice_max_shelter() },
									{ value: eoe.shelterMin ?? '—', label: m.campaign_eote_ice_min_shelter() }
								]),
						{ value: eoe.iceDeathDefeated ?? 0, label: m.campaign_eote_ice_defeated_creatures() }
					],
					[
						{ value: eoe.iceDeathFled ?? 0, label: m.campaign_eote_ice_fled() },
						{ value: eoe.iceDeathEscaped ?? 0, label: m.campaign_eote_ice_escaped() }
					]
				]
			: []
	);
</script>

<StatNumbers {rows} />
