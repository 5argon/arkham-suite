<!-- @component Dim Carcosa: the endings, the Hastur faced, the doom the Stranger's marks set, and who ended possessed. -->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import { versionFromLog } from '$lib/campaign/stats/version-stats';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { SectionLabel, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import VersionBreakdown from '../VersionBreakdown.svelte';
	import PtcCardCountList from './PtcCardCountList.svelte';
	import { hasVersionTable, versionResolutions, versionRows } from './ptc-spine';

	let { blob: ptc, ctx }: CampaignWidgetProps<CampaignPtc> = $props();
	const d = $derived(ptc?.dimCarcosa);
	const possessed = $derived(d?.possessedInvestigators ?? []);
	const endings = $derived([
		{ value: d?.preventedEscape, label: m.campaign_ptc_dim_prevented() },
		{ value: d?.possessed, label: m.campaign_ptc_dim_possessed() },
		{ value: d?.hasturHasYou, label: m.campaign_ptc_dim_hastur_has_you() },
		...(ctx.logOnly ? [] : [{ value: d?.carcosaMerged, label: m.campaign_ptc_dim_merged() }])
	]);

	/** The arrival-doom axis's values; the rest are the Hastur versions. */
	const DOOM: Record<string, () => string> = {
		'3': m.campaign_ptc_dim_doom_row3,
		'2': m.campaign_ptc_dim_doom_row2,
		'1': m.campaign_ptc_dim_doom_row1,
		'0': m.campaign_ptc_dim_doom_row0
	};
	const hasturs = $derived(
		versionRows(ctx, {
			label: (v) => m.campaign_ptc_hasturs_version_label({ version: v }),
			resolutionIds: versionResolutions(ctx),
			only: (v) => !DOOM[v]
		})
	);
	const doom = $derived(versionRows(ctx, { label: (v) => DOOM[v](), only: (v) => !!DOOM[v] }));
	const logFree = versionFromLog('dim_carcosa');
	const hasData = $derived(
		endings.some((s) => s.value) || hasVersionTable(ctx) || possessed.length > 0
	);
</script>

<ScenarioInfo {ctx} empty={hasData ? null : m.campaign_ptc_dim_empty()}>
	{#snippet stats()}
		<div class="space-y-4">
			<StatNumbers rows={[endings]} />
			{#if hasturs.length}
				<VersionBreakdown
					rows={hasturs}
					showSucceedFailed
					showXp
					logOnly={ctx.logOnly}
					versionFromLog={logFree}
				/>
			{/if}
			{#if doom.some((r) => r.plays?.total)}
				<VersionBreakdown
					rows={doom}
					title={m.campaign_ptc_dim_stranger_arrival_heading()}
					versionLabel={m.campaign_ptc_dim_doom_col_marks()}
					showSucceedFailed
					logOnly={ctx.logOnly}
					versionFromLog={logFree}
				/>
			{/if}
			{#if possessed.length}
				<div>
					<SectionLabel variant="heading">{m.campaign_ptc_dim_possessed_heading()}</SectionLabel>
					<PtcCardCountList items={possessed} />
				</div>
			{/if}
		</div>
	{/snippet}
</ScenarioInfo>
