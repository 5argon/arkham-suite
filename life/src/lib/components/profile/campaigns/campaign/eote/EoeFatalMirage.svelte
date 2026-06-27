<!--
@component
EotE per-scenario widget — "Fatal Mirage", wrapped in the shared `ScenarioInfo` passport
(identity heading + scenario achievements). How many of your runs played Fatal Mirage
once / twice / thrice (from the count of recorded `fatal_mirage` / `_2` / `_3`
resolutions), plus the most / fewest memories banished in a single run — shown via the
shared StatNumbers in the passport's stat-numbers section. The generic slice (resolutions
reached + best victory display) shows above; there's no Succeed/Failed corner stat — Fatal
Mirage has no win/loss split (both `no_resolution` and `R1` are wins).
-->
<script lang="ts">
	import type { CampaignEoe } from '$lib/campaign/campaigns/eoe';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		eoe,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		eoe: CampaignEoe | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const plays = $derived(eoe?.fatalMiragePlays ?? []);
	// Play distribution is precomputed on the eoe blob (see compiled-profile.ts).
	const dist = $derived(eoe?.fatalMiragePlayCounts ?? { once: 0, twice: 0, thrice: 0 });
	const rows = $derived<Stat[][]>(
		plays.length
			? [
					[
						{ value: dist.once, label: m.campaign_eote_fatal_played_once() },
						{ value: dist.twice, label: m.campaign_eote_fatal_played_twice() },
						{ value: dist.thrice, label: m.campaign_eote_fatal_played_thrice() }
					],
					[
						{ value: eoe?.memBanishedMost ?? '—', label: m.campaign_eote_fatal_most_banished() },
						{ value: eoe?.memBanishedLeast ?? '—', label: m.campaign_eote_fatal_fewest_banished() }
					]
				]
			: []
	);
</script>

<ScenarioInfo
	scenarioId="fatal_mirage"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet stats()}
		<StatNumbers {rows} />
	{/snippet}
</ScenarioInfo>
