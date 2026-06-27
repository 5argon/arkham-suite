<!--
@component
TFA bespoke widget — "The Untamed Wilds". Cleared the path to the temple, and the
opening standing decided here: Ichtaca's trust vs wariness, Alejandro following vs
staying at camp. Built on StatNumbers.
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
	const w = $derived(tfa?.untamedWilds);
	const i = $derived(tfa?.ichtaca);
	const a = $derived(tfa?.alejandro);
	const hasData = $derived(
		!!tfa && ((w?.clearedPath ?? 0) > 0 || (i?.trust ?? 0) + (i?.wary ?? 0) + (a?.followed ?? 0) + (a?.remained ?? 0) > 0)
	);
	const rows = $derived<Stat[][]>(
		hasData && w && i && a
			? [
					[{ value: w.clearedPath, label: m.campaign_tfa_wilds_cleared() }],
					[
						{ value: i.trust, label: m.campaign_tfa_wilds_ichtaca_trust() },
						{ value: i.wary, label: m.campaign_tfa_wilds_ichtaca_wary() }
					],
					[
						{ value: a.followed, label: m.campaign_tfa_wilds_alejandro_followed() },
						{ value: a.remained, label: m.campaign_tfa_wilds_alejandro_remained() }
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="the_untamed_wilds" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_wilds_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
