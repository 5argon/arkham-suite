<!-- @component Echoes of the Past: the onyx clasp, the Oathspeaker, and the outcome by player count. -->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import { versionFromLog } from '$lib/campaign/stats/version-stats';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import VersionBreakdown from '../VersionBreakdown.svelte';
	import PtcScenarioInfo from './PtcScenarioInfo.svelte';
	import { hasVersionTable, versionRows } from './ptc-spine';

	let { blob: ptc, ctx }: CampaignWidgetProps<CampaignPtc> = $props();
	const e = $derived(ptc?.echoes);
	const rows = $derived([
		[
			{ value: e?.tookOnyx, label: m.campaign_ptc_echoes_took_onyx() },
			{ value: e?.leftOnyx, label: m.campaign_ptc_echoes_left_onyx() }
		],
		[
			{ value: e?.destroyedOathspeaker, label: m.campaign_ptc_echoes_oathspeaker() },
			{ value: e?.followersFoundWay, label: m.campaign_ptc_echoes_followers() }
		]
	]);
	const byPlayers = $derived(
		versionRows(ctx, { label: (n) => m.campaign_ptc_echoes_players_n({ count: Number(n) }) })
	);
	const hasData = $derived(rows.flat().some((s) => s.value) || hasVersionTable(ctx));
</script>

<PtcScenarioInfo {ptc} {ctx} empty={hasData ? null : m.campaign_ptc_echoes_empty()}>
	{#snippet stats()}
		<div class="flex flex-col gap-4">
			<StatNumbers {rows} />
			{#if byPlayers.length}
				<VersionBreakdown
					rows={byPlayers}
					title={m.campaign_ptc_echoes_table_title()}
					versionLabel={m.campaign_ptc_echoes_col_players()}
					showSucceedFailed
					logOnly={ctx.logOnly}
					versionFromLog={versionFromLog('echoes_of_the_past')}
				/>
			{/if}
		</div>
	{/snippet}
</PtcScenarioInfo>
