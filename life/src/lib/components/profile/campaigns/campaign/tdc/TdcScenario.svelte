<!-- @component A TDC dive site: its logged forks under short labels, the artifact recovered there and its share of the glyphs. -->
<script lang="ts">
	import { TDC_GLYPHS_BY_SCENARIO, type CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers, type Stat } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { TDC_SCENARIO_VIEWS, type TdcStat } from './tdc-views';

	let { blob: tdc, ctx }: CampaignWidgetProps<CampaignTdc> = $props();

	const scenario = $derived(ctx.scenario ?? '');
	const view = $derived(TDC_SCENARIO_VIEWS[scenario]);
	const glyphTotal = $derived(
		TDC_GLYPHS_BY_SCENARIO.find((g) => g.scenario === scenario)?.ids.length ?? 0
	);
	const decrypted = $derived(tdc?.glyphs.byScenario[scenario] ?? 0);

	function stat(s: TdcStat): Stat {
		if ('glyphs' in s)
			return {
				value: decrypted ? `${decrypted} / ${glyphTotal}` : 0,
				label: m.campaign_tdc_scenario_glyphs_label()
			};
		return { value: tdc?.scenarios[scenario]?.[s.key] ?? 0, label: s.label() };
	}
	const rows = $derived(
		(view?.groups ?? []).map((g) => ({ heading: g.heading?.(), stats: g.stats.map(stat) }))
	);
</script>

<ScenarioInfo {ctx} showPlays headerCards={view ? [{ ...view.header, objectTop: true }] : []}>
	{#snippet stats()}
		<StatNumbers empty={m.campaign_tdc_scenario_empty()} {rows} />
	{/snippet}
</ScenarioInfo>
