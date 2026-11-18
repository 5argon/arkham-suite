<!-- @component A TDC expedition scenario: its logged forks and the share of its glyphs ever decrypted. -->
<script lang="ts">
	import { TDC_GLYPHS_BY_SCENARIO, type CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { OutcomeList, SectionLabel, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { tdcOutcomeGroups } from './tdc-outcomes';

	let { blob: tdc, ctx }: CampaignWidgetProps<CampaignTdc> = $props();

	const scenario = $derived(ctx.scenario ?? '');
	const groups = $derived(tdcOutcomeGroups(tdc, scenario));
	const glyphTotal = $derived(
		TDC_GLYPHS_BY_SCENARIO.find((g) => g.scenario === scenario)?.ids.length ?? 0
	);
	const decrypted = $derived(tdc?.glyphs.byScenario[scenario] ?? 0);
	const hasData = $derived(decrypted > 0 || groups.some((g) => g.outcomes.some((o) => o.plays)));
</script>

<ScenarioInfo {ctx} showPlays empty={hasData ? null : m.campaign_tdc_scenario_empty()}>
	{#snippet stats()}
		{#each groups as g, i (i)}
			<div>
				{#if g.heading}<SectionLabel>{g.heading}</SectionLabel>{/if}
				<OutcomeList
					items={g.outcomes.map((o) => ({ label: o.label, hit: o.plays > 0, count: o.plays }))}
				/>
			</div>
		{/each}
		{#if glyphTotal}
			<StatNumbers
				rows={[
					[{ value: `${decrypted} / ${glyphTotal}`, label: m.campaign_tdc_scenario_glyphs_label() }]
				]}
			/>
		{/if}
	{/snippet}
</ScenarioInfo>
