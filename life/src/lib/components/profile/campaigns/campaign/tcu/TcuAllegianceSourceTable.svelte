<!--
@component
TCU Lodge/Coven per-decision breakdown — one row per allegiance decision point in book order, with
how many plays leaned to the Lodge / the Coven / stayed Neutral there. Only In the Clutches of
Chaos can resolve neutral (its Anette + Sanford picks can cancel); the others show a dash.
-->
<script lang="ts">
	import type { AllegianceSourceTally } from '$lib/campaign/campaigns/tcu';
	import TwoSidedSourceTable, {
		type SourceRow
	} from '$lib/components/profile/campaigns/campaign/TwoSidedSourceTable.svelte';
	import { ALLEGIANCE_TINT, allegianceIconSet, allegianceScenName } from './tcu-allegiance-labels';
	import * as m from '$lib/paraglide/messages.js';

	let { sources }: { sources: AllegianceSourceTally[] } = $props();

	const rows = $derived<SourceRow[]>(
		sources.map((s) => ({
			scenario: s.scenario,
			a: s.lodge,
			b: s.coven,
			neutral: s.neutral,
			canNeutral: s.canNeutral
		}))
	);
</script>

<TwoSidedSourceTable
	sources={rows}
	decisionLabel={m.campaign_tcu_alleg_src_col_decision()}
	sides={[
		{ label: m.campaign_tcu_alleg_lodge_full(), tint: ALLEGIANCE_TINT.lodge },
		{ label: m.campaign_tcu_alleg_coven_full(), tint: ALLEGIANCE_TINT.coven }
	]}
	neutralLabel={m.campaign_tcu_alleg_neutral_short()}
	neutralUnavailable={m.campaign_tcu_alleg_neutral_na()}
	iconSet={allegianceIconSet}
	scenarioName={allegianceScenName}
/>
