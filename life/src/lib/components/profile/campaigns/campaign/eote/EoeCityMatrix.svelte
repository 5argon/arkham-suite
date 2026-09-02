<!--
@component
EotE per-scenario widget — "City of the Elder Things", wrapped in the shared `ScenarioInfo`
passport. Which version (I/II/III) you faced is recorded manually in the Extra tab (the
`city_version` choice — it depends on who is still alive, not derivable from the log), so the
per-version Succeed / Failed / Resolutions / XP table renders through the shared `VersionBreakdown`;
the framework swaps the whole widget for the log-only placeholder (the version axis isn't log-known).
-->
<script lang="ts">
	import { scenarioMeta, scenarioVerdicts } from '$lib/campaign/utils/scenario-meta';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import { scenarioVersions, toVersionRow } from '$lib/campaign/stats/version-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import VersionBreakdown from '$lib/components/profile/campaigns/campaign/VersionBreakdown.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		family = null,
		achievements = [],
		scenarios = null
	}: {
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
	} = $props();

	const SID = 'city_of_the_elder_things';
	const meta = scenarioMeta('eoe', SID);
	const resolutionIds = (meta?.resolutions ?? []).filter((r) => r !== 'no_resolution');
	const verdicts = scenarioVerdicts(meta);
	const versions = $derived(scenarioVersions(scenarios, SID));
	const versionRows = $derived(
		versions.stats.map((vs) =>
			toVersionRow(vs, {
				label: m.campaign_eote_city_version_label({ version: vs.value }),
				resolutionIds,
				verdicts
			})
		)
	);
</script>

<ScenarioInfo scenarioId="city_of_the_elder_things" {family} {achievements} {scenarios}>
	{#snippet stats()}
		{#if versions.stats.length}
			{#if !versions.hasPlays}
				<p class="text-primary-500 mb-3 text-sm">{m.campaign_eote_city_empty()}</p>
			{/if}
			<VersionBreakdown
				rows={versionRows}
				showSucceedFailed
				showXp
				victoryDisplay={meta?.victoryDisplay ?? true}
			/>
		{/if}
	{/snippet}
</ScenarioInfo>
