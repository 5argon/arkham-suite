<!--
@component
TFA scenario — "The Untamed Wilds". The expedition's first fork: your standing with Ichtaca (trust vs
wary), whether Alejandro followed you to the ruins or stayed at camp, whether you cleared the path to
the temple, and who Yig's venom first struck. Wrapped in the shared TFA passport (Ichtaca header art).
-->
<script lang="ts">
	import { TFA_ICHTACA_CODE, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import TfaScenarioInfo from './TfaScenarioInfo.svelte';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import StatNumbers, { type Stat, type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
	const ich = $derived(tfa?.ichtaca);
	const alj = $derived(tfa?.alejandro);
	const poisoned = $derived(tfa?.poison.byScenario['the_untamed_wilds'] ?? 0);
	const hasData = $derived(
		(ich?.trust ?? 0) + (ich?.wary ?? 0) + (alj?.followed ?? 0) + (alj?.remained ?? 0) + (w?.clearedPath ?? 0) + (logOnly ? 0 : poisoned) > 0
	);

	const bottom = $derived<Stat[]>(
		(() => {
			const out: Stat[] = [];
			if (w && w.clearedPath > 0) out.push({ value: w.clearedPath, label: m.campaign_tfa_wilds_cleared() });
			// Venom is an Extra-tab value — hidden in Log-only mode.
			if (!logOnly && poisoned > 0) out.push({ value: poisoned, label: m.campaign_tfa_poisoned_gained() });
			return out;
		})()
	);
	const rows = $derived<(Stat[] | StatGroup)[]>([
		{
			heading: m.campaign_tfa_wilds_ichtaca_heading(),
			stats: [
				{ value: ich?.trust ?? 0, label: m.campaign_tfa_wilds_ichtaca_trust() },
				{ value: ich?.wary ?? 0, label: m.campaign_tfa_wilds_ichtaca_wary() }
			]
		},
		{
			heading: m.campaign_tfa_wilds_alejandro_heading(),
			stats: [
				{ value: alj?.followed ?? 0, label: m.campaign_tfa_wilds_alejandro_followed() },
				{ value: alj?.remained ?? 0, label: m.campaign_tfa_wilds_alejandro_remained() }
			]
		},
		bottom
	]);
</script>

<TfaScenarioInfo scenarioId="the_untamed_wilds" {family} {achievements} {scenarios} {logOnly}>
	{#snippet headerArt()}
		<CardThumb code={TFA_ICHTACA_CODE} alt={m.campaign_tfa_companion_ichtaca()} objectTop />
	{/snippet}
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_wilds_empty()}</p>
		{/if}
	{/snippet}
</TfaScenarioInfo>
