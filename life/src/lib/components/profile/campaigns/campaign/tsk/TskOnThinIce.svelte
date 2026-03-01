<!--
@component
TSK — On Thin Ice. The shared scenario passport, with a bespoke stat row folded into the passport
(beside Succeed/Failed): how the cell handled Thorne's offer — Made a deal / Refused, from the
recorded `raw_deal` Extra choice (accept / reject) — plus two campaign-log outcomes: Thorne
disappeared, and the scenario never happening ("there is nothing of note in Anchorage").
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import TskScenarioInfo from '$lib/components/profile/campaigns/campaign/tsk/TskScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import type { TskScenarioWidgetProps } from '$lib/components/profile/campaigns/campaign/tsk/tsk-scenario';

	let props: TskScenarioWidgetProps = $props();

	const SCENARIO = 'on_thin_ice';

	// Made a deal / Refused — counted from the recorded `raw_deal` Extra choice (accept / reject).
	const rawDeal = $derived.by(() => {
		const stat = props.scenarioXp.flatMap((c) => c.scenarios).find((s) => s.scenario === SCENARIO);
		const byValue = new Map(
			(stat?.choices?.find((c) => c.id === 'raw_deal')?.values ?? []).map((v) => [v.value, v.played])
		);
		return { deal: byValue.get('accept') ?? 0, refused: byValue.get('reject') ?? 0 };
	});
	// Thorne disappeared / scenario never happened — campaign-log notes, counted across plays.
	const thorneDisappeared = $derived(props.tsk?.logCounts['thorne_disappeared'] ?? 0);
	const neverHappened = $derived(props.tsk?.logCounts['nothing_of_note_in_anchorage'] ?? 0);

	const statRow = $derived<Stat[]>([
		// `raw_deal` (Made a deal / Refused) is an Extra-tab choice — dropped under Log-only mode;
		// the two log-note outcomes (Thorne disappeared / scenario never happened) always stay.
		...(props.logOnly
			? []
			: [
					{ value: rawDeal.deal, label: m.campaign_tsk_onthinice_deal() },
					{ value: rawDeal.refused, label: m.campaign_tsk_onthinice_refused() }
				]),
		{ value: thorneDisappeared, label: m.campaign_tsk_onthinice_disappeared() },
		{ value: neverHappened, label: m.campaign_tsk_onthinice_never() }
	]);
	const hasData = $derived(statRow.some((s) => Number(s.value) > 0));
</script>

<TskScenarioInfo scenarioId={SCENARIO} {...props}>
	{#snippet extraStats()}
		<!-- Thorne's offer (raw_deal Extra choice) + two log outcomes, grouped with Succeed/Failed. -->
		{#if hasData}
			<StatNumbers rows={[statRow]} />
		{/if}
	{/snippet}
</TskScenarioInfo>
