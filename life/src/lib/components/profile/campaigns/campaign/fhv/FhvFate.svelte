<!-- @component Fate of the Vale: the Act 3a version played, the ending reached and the villagers saved. -->
<script lang="ts">
	import { FHV_FATE_VERSIONS, FHV_VILLAGERS, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import { logText } from '$lib/campaign/records/campaign-log-source';
	import { scenarioVersions } from '$lib/campaign/stats/version-stats';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, SectionLabel, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import ScenarioVersionTable from '../ScenarioVersionTable.svelte';
	import { fhvVillagerTiles } from './fhv-tiles';

	let { blob: fhv, ctx }: CampaignWidgetProps<CampaignFhv> = $props();

	const VERSION_LABELS: Record<string, () => string> = {
		v1: m.campaign_fhv_fate_v1,
		v2: m.campaign_fhv_fate_v2,
		v3: m.campaign_fhv_fate_v3,
		v4: m.campaign_fhv_fate_v4
	};
	const RESOLUTIONS = Object.fromEntries(
		FHV_FATE_VERSIONS.map((v) => [v.id, ['no_resolution', ...v.resolutions]])
	);

	const versioned = $derived(scenarioVersions(ctx.scenarios, ctx.scenario ?? '').hasPlays);
	const endings = $derived(
		(fhv?.fateEndings ?? []).map((e) => ({ tally: e.plays, label: logText('fhv', e.id) }))
	);
	const saved = $derived(
		fhvVillagerTiles(
			FHV_VILLAGERS.map((v) => v.id),
			(v) => fhv?.villagers[v]?.saved,
			(name, times) => m.campaign_fhv_fate_saved_tile({ name, times }),
			(name) => m.campaign_fhv_fate_lost_tile({ name })
		)
	);
	const anySaved = $derived(!!fhv?.valeSummary.saved);
	const reached = $derived(versioned || anySaved || endings.some((e) => e.tally.total > 0));
</script>

<ScenarioInfo {ctx} showPlays empty={reached ? null : m.campaign_fhv_fate_empty()}>
	{#snippet stats()}
		{#if versioned}
			<ScenarioVersionTable
				{ctx}
				title={m.campaign_fhv_fate_version_heading()}
				label={(v) => VERSION_LABELS[v]?.() ?? v}
				resolutionIds={(v) => RESOLUTIONS[v] ?? []}
				showPlays
				showXp
			/>
		{/if}
		<StatNumbers rows={[{ heading: m.campaign_fhv_fate_ending_heading(), stats: endings }]} />
	{/snippet}
	{#if anySaved}
		<div>
			<SectionLabel variant="heading" align="center"
				>{m.campaign_fhv_fate_saved_heading()}</SectionLabel
			>
			<LitTileGrid tiles={saved} layout="flex" objectTop />
		</div>
	{/if}
</ScenarioInfo>
