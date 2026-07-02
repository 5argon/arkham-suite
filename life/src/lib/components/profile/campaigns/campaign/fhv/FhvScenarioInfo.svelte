<!--
@component
FHV per-scenario passport — a thin wrapper over the shared `ScenarioInfo` that injects the
resident portrait(s) this scenario centres on as its header reference art (like TSK's Key art
or PtC's VIP cards). Everything else (corner stats, resolutions, achievements, the `stats` /
`children` blocks) is the shared passport. `villagers` names the residents to picture; omit it
for a plain passport.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import FhvPortrait from './FhvPortrait.svelte';

	let {
		scenarioId,
		villagers = [],
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false,
		showPlays = false,
		stats,
		children
	}: {
		scenarioId: string;
		/** Resident ids to picture as the passport's header reference art. */
		villagers?: string[];
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
		showPlays?: boolean;
		/** The standardised stat-numbers section (forwarded verbatim to the passport). */
		stats?: Snippet;
		/** Final bespoke content below the passport (forwarded verbatim). */
		children?: Snippet;
	} = $props();
</script>

<ScenarioInfo {scenarioId} {family} {achievements} {scenarios} {logOnly} {showPlays} {stats}>
	{#snippet headerArt()}
		{#if villagers.length}
			<div class="flex shrink-0 gap-1.5">
				{#each villagers as v (v)}
					<FhvPortrait villager={v} size="h-16 w-12" />
				{/each}
			</div>
		{/if}
	{/snippet}

	{@render children?.()}
</ScenarioInfo>
