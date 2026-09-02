<!--
@component
PtC Doubt/Conviction per-source breakdown — one row per decision point in book order, with how
many plays earned Conviction / Doubt / went Neutral there (reached the decision but took no mark).
Lost Soul and Black Stars Rise always hand out a mark, so their Neutral column is a dash.
-->
<script lang="ts">
	import type { DcSourceTally } from '$lib/campaign/campaigns/ptc';
	import TwoSidedSourceTable, {
		type SourceRow
	} from '$lib/components/profile/campaigns/campaign/TwoSidedSourceTable.svelte';
	import { DC_TINT, dcIconSet, ptcScenarioName } from './ptc-dc-labels';
	import * as m from '$lib/paraglide/messages.js';

	let { sources }: { sources: DcSourceTally[] } = $props();

	const rows = $derived<SourceRow[]>(
		sources.map((s) => ({
			scenario: s.scenario,
			a: s.conviction,
			b: s.doubt,
			neutral: s.neutral,
			canNeutral: s.canNeutral
		}))
	);
</script>

<TwoSidedSourceTable
	sources={rows}
	decisionLabel={m.campaign_ptc_dc_src_col_change()}
	sides={[
		{ label: m.campaign_ptc_dc_conviction_full(), tint: DC_TINT.conviction },
		{ label: m.campaign_ptc_dc_doubt_full(), tint: DC_TINT.doubt }
	]}
	neutralLabel={m.campaign_ptc_dc_neutral_short()}
	neutralUnavailable={m.campaign_ptc_dc_neutral_na()}
	iconSet={dcIconSet}
	scenarioName={ptcScenarioName}
/>
