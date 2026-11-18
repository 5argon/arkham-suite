<!-- @component Where Doom Awaits: the Ascending the Hill version faced, and whether Yog-Sothoth escaped. -->
<script lang="ts">
	import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import { scenarioVersions } from '$lib/campaign/stats/version-stats';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import ScenarioVersionTable from '../ScenarioVersionTable.svelte';

	let { blob: dwl, ctx }: CampaignWidgetProps<CampaignDwl> = $props();

	const labels: Record<string, () => string> = {
		v1: m.campaign_dwl_hill_v1,
		v2: m.campaign_dwl_hill_v2,
		v3: m.campaign_dwl_hill_v3
	};
	const wda = $derived(dwl?.wda);
	const played = $derived(
		scenarioVersions(ctx.scenarios, ctx.scenario ?? '').hasPlays ||
			!!wda?.enteredGate ||
			!!wda?.yogEscaped
	);
</script>

<ScenarioInfo {ctx} empty={played ? null : m.campaign_dwl_hill_empty()}>
	{#snippet stats()}
		<ScenarioVersionTable {ctx} label={(v) => labels[v]?.() ?? v} showSucceedFailed showXp />
		<StatNumbers
			rows={[
				[
					{ value: wda?.enteredGate, label: m.campaign_dwl_wda_entered() },
					{ value: wda?.yogEscaped, label: m.campaign_dwl_wda_escaped() }
				]
			]}
		/>
	{/snippet}
</ScenarioInfo>
