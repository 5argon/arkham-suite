<!-- @component A Phantom of Truth: how the search for Nigel ended and its Act 1 versions. -->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioVersionTable from '../ScenarioVersionTable.svelte';
	import PtcScenarioInfo from './PtcScenarioInfo.svelte';
	import { DC_TINT, hasVersionTable, versionResolutions } from './ptc-spine';

	let { blob: ptc, ctx }: CampaignWidgetProps<CampaignPtc> = $props();
	const p = $derived(ptc?.phantom);
	const LABEL: Record<string, () => string> = {
		I: m.campaign_ptc_phantom_version_1,
		II: m.campaign_ptc_phantom_version_2
	};
	const rows = $derived([
		[
			{ value: p?.foundNigel, label: m.campaign_ptc_phantom_found() },
			{ value: p?.foundNigelsHome, label: m.campaign_ptc_phantom_found_home() }
		],
		[
			{ value: p?.unableToFind, label: m.campaign_ptc_phantom_unable() },
			{ value: p?.didNotEscapeGaze, label: m.campaign_ptc_phantom_gaze() }
		]
	]);
	const hasData = $derived(rows.flat().some((s) => s.value) || hasVersionTable(ctx));
</script>

<PtcScenarioInfo {ptc} {ctx} empty={hasData ? null : m.campaign_ptc_phantom_empty()}>
	{#snippet stats()}
		<div class="space-y-4">
			<StatNumbers {rows} />
			<ScenarioVersionTable
				{ctx}
				title={m.campaign_ptc_phantom_versions_title()}
				label={(v) => LABEL[v]?.() ?? v}
				accent={(v) => DC_TINT[v === 'II' ? 'conviction' : 'doubt']}
				resolutionIds={versionResolutions(ctx)}
				showSucceedFailed
				showXp
			/>
		</div>
	{/snippet}
</PtcScenarioInfo>
