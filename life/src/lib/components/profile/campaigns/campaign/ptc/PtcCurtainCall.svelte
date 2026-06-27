<!--
@component
PtC bespoke widget — "Curtain Call". The opening night: did you warn the police
(conviction) or not (doubt), whether the Stranger is already on to you, and which
version of Act 2b advanced (the mid-game chaos-token mix — Extra-supplied, since the
log only records the tokens). Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, {
		type Stat,
		type StatGroup
	} from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		ptc,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		ptc: CampaignPtc | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const c = $derived(ptc?.curtainCall);

	// version id → display label (base 3 + Return-to-PtC's 3).
	const ACT2B_LABEL: Record<string, () => string> = {
		a_city_aflame: m.campaign_ptc_curtain_act2b_a_city_aflame,
		the_path_is_mine: m.campaign_ptc_curtain_act2b_the_path_is_mine,
		the_shores_of_hali: m.campaign_ptc_curtain_act2b_the_shores_of_hali,
		alaran_mists: m.campaign_ptc_curtain_act2b_alaran_mists,
		under_the_city: m.campaign_ptc_curtain_act2b_under_the_city,
		here_is_my_reply: m.campaign_ptc_curtain_act2b_here_is_my_reply
	};
	const act2bLabel = (id: string) => ACT2B_LABEL[id]?.() ?? id;

	// Every Act 2b version, not just the ones played: the base three always (shown at ×0 so you see
	// the whole set), plus the three Return-to-PtC versions when this profile has actually played one
	// — they're only possible in Return to The Path to Carcosa, so base-only profiles aren't padded
	// with them. Order is fixed (book order), not by play count, so the option list reads stably.
	const BASE_ACT2B = ['a_city_aflame', 'the_path_is_mine', 'the_shores_of_hali'];
	const RT_ACT2B = ['alaran_mists', 'under_the_city', 'here_is_my_reply'];
	const playedRt = $derived(RT_ACT2B.some((id) => (c?.act2b?.[id] ?? 0) > 0));
	const act2bIds = $derived(playedRt ? [...BASE_ACT2B, ...RT_ACT2B] : BASE_ACT2B);
	const act2bStats = $derived<Stat[]>(
		act2bIds.map((id) => ({ value: c?.act2b?.[id] ?? 0, label: act2bLabel(id) }))
	);
	const hasAct2b = $derived(act2bIds.some((id) => (c?.act2b?.[id] ?? 0) > 0));

	const hasNight = $derived(!!c && (c.warnedPolice > 0 || c.didNotWarn > 0));
	const hasData = $derived(hasNight || hasAct2b);
	const rows = $derived<(Stat[] | StatGroup)[]>(
		c
			? [
					[
						{ value: c.warnedPolice, label: m.campaign_ptc_curtain_warned() },
						{ value: c.didNotWarn, label: m.campaign_ptc_curtain_not_warned() }
					],
					{ heading: m.campaign_ptc_curtain_act2b_heading(), stats: act2bStats } satisfies StatGroup
				]
			: []
	);
</script>

<ScenarioInfo
	scenarioId="curtain_call"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_ptc_curtain_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
