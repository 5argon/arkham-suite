<!--
@component
TFA scenario — "The Boundary Beyond". How many paths you'd charted (knowing all 6 skips Heart of the
Elders, Part 1 — the Scenario 5? achievement) and whether you restored Ichtaca's confidence (Hope for
Humanity). Wrapped in the shared TFA passport (Ichtaca header art).
-->
<script lang="ts">
	import { TFA_ICHTACA_CODE, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import TfaScenarioInfo from './TfaScenarioInfo.svelte';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
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

	const b = $derived(tfa?.boundaryBeyond);
	const hasData = $derived(!!b && (b.pathsKnownMax !== null || b.ichtacaConfidence > 0));
	const statList = $derived<Stat[]>(
		(() => {
			if (!b) return [];
			const out: Stat[] = [{ value: b.pathsKnownMax, label: m.campaign_tfa_boundary_paths() }];
			if (b.part1Skipped > 0) out.push({ value: b.part1Skipped, label: m.campaign_tfa_boundary_skip() });
			if (b.ichtacaConfidence > 0)
				out.push({ value: b.ichtacaConfidence, label: m.campaign_tfa_boundary_confidence() });
			return out;
		})()
	);
</script>

<TfaScenarioInfo scenarioId="the_boundary_beyond" {family} {achievements} {scenarios} {logOnly}>
	{#snippet headerArt()}
		<CardThumb code={TFA_ICHTACA_CODE} alt={m.campaign_tfa_companion_ichtaca()} objectTop />
	{/snippet}
	{#snippet stats()}
		{#if hasData}
			<StatNumbers rows={[statList]} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_boundary_empty()}</p>
		{/if}
	{/snippet}
</TfaScenarioInfo>
