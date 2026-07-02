<!--
@component
TFA per-scenario "passport" — a thin wrapper over the shared `ScenarioInfo` that opts every TFA
scenario into the generic played count and lets each scenario widget inject its own bespoke header
card-art (the Harbinger, the Relic of Ages, Ichtaca / Alejandro, Yig — via the `headerArt` snippet)
and stat block, so every TFA scenario shares one passport look. The per-scenario `.webp` art slot is
left for later; header art comes from in-app card thumbs for now.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';

	let {
		scenarioId,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false,
		headerArt,
		headerMeta,
		stats,
		children
	}: {
		scenarioId: string;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
		/** Bespoke campaign reference art (card thumbs), left of the passport header. */
		headerArt?: Snippet;
		/** Reference text under the header art. */
		headerMeta?: Snippet;
		/** The standardised stat-numbers section. */
		stats?: Snippet;
		/** Final bespoke content below the passport. */
		children?: Snippet;
	} = $props();
</script>

<ScenarioInfo
	{scenarioId}
	{family}
	{achievements}
	{scenarios}
	{logOnly}
	showPlays
	{headerArt}
	{headerMeta}
	{stats}
	{children}
/>
