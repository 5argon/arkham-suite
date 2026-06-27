<!--
@component
TFA bespoke widget — "The Doom of Eztli". Who recovered the relic (you vs Alejandro),
and how many times you had to replay the temple (an Extra-tab counter — the log never
records replays). Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tfa,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tfa: CampaignTfa | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const e = $derived(tfa?.doomOfEztli);
	const retriesMax = $derived(e && e.retries.length ? Math.max(...e.retries) : null);
	const hasData = $derived(
		!!e && (e.investigatorsRelic > 0 || e.alejandroRelic > 0 || e.retries.length > 0)
	);
	const rows = $derived<Stat[][]>(
		hasData && e
			? [
					[
						{ value: e.investigatorsRelic, label: m.campaign_tfa_eztli_investigators_relic() },
						{ value: e.alejandroRelic, label: m.campaign_tfa_eztli_alejandro_relic() }
					],
					retriesMax !== null ? [{ value: retriesMax, label: m.campaign_tfa_eztli_retries() }] : []
				].filter((r) => r.length)
			: []
	);
</script>

<ScenarioInfo scenarioId="the_doom_of_eztli" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_eztli_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
