<!--
@component
TFA scenario — "Heart of the Elders". Whom you consulted to find the way (Ichtaca, Alejandro, or the
expedition journal — from the Extra tab, since the guide's choice is never written to the campaign
log) and who Yig's venom struck in the descent. Covers both parts; Part 1 stands as the representative
scenario. Wrapped in the shared TFA passport (Ichtaca & Alejandro header art).
-->
<script lang="ts">
	import { TFA_ICHTACA_CODE, TFA_ALEJANDRO_CODE, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
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

	const h = $derived(tfa?.heartOfElders);
	const poisoned = $derived(
		(tfa?.poison.byScenario['heart_of_the_elders_part_1'] ?? 0) +
			(tfa?.poison.byScenario['heart_of_the_elders_part_2'] ?? 0)
	);
	const hasData = $derived(
		!!h &&
			(h.consultIchtaca + h.consultAlejandro + h.consultJournal + h.consultNothing > 0 || poisoned > 0)
	);

	const consult = $derived<Stat[]>(
		(() => {
			if (!h) return [];
			const out: Stat[] = [
				{ value: h.consultIchtaca, label: m.campaign_tfa_hote_ichtaca() },
				{ value: h.consultAlejandro, label: m.campaign_tfa_hote_alejandro() },
				{ value: h.consultJournal, label: m.campaign_tfa_hote_journal() }
			];
			if (h.consultNothing > 0)
				out.push({ value: h.consultNothing, label: m.campaign_tfa_hote_nothing() });
			return out;
		})()
	);
	const rows = $derived<(Stat[] | StatGroup)[]>([
		consult.length ? { heading: m.campaign_tfa_hote_heading(), stats: consult } : { stats: [] },
		poisoned > 0 ? [{ value: poisoned, label: m.campaign_tfa_poisoned_gained() }] : []
	]);
</script>

<TfaScenarioInfo scenarioId="heart_of_the_elders_part_1" {family} {achievements} {scenarios} {logOnly}>
	{#snippet headerArt()}
		<div class="flex shrink-0 gap-2">
			<CardThumb code={TFA_ICHTACA_CODE} alt={m.campaign_tfa_companion_ichtaca()} objectTop />
			<CardThumb code={TFA_ALEJANDRO_CODE} alt={m.campaign_tfa_companion_alejandro()} objectTop />
		</div>
	{/snippet}
	{#snippet stats()}
		{#if !logOnly}
			{#if hasData}
				<StatNumbers {rows} />
			{:else}
				<p class="text-primary-500 text-sm">{m.campaign_tfa_hote_empty()}</p>
			{/if}
		{/if}
	{/snippet}
</TfaScenarioInfo>
