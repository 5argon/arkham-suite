<!--
@component
TFA scenario — "The Doom of Eztli". Who recovered the Relic (you vs Alejandro), the Harbinger of
Valusia's first blood (the damage you left on it here, from the Extra tab), how many times you had to
replay the temple, and who Yig's venom struck. Wrapped in the shared TFA passport (Harbinger header
art — its first appearance).
-->
<script lang="ts">
	import { TFA_HARBINGER_CODE, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
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

	const e = $derived(tfa?.doomOfEztli);
	const eztliDmg = $derived(tfa?.harbinger.eztli ?? null);
	const poisoned = $derived(tfa?.poison.byScenario['the_doom_of_eztli'] ?? 0);
	const retriesMax = $derived(e && e.retries.length ? Math.max(...e.retries) : null);
	const hasData = $derived(
		!!e &&
			(e.investigatorsRelic > 0 ||
				e.alejandroRelic > 0 ||
				(!logOnly &&
					(e.retries.length > 0 || (eztliDmg?.recorded ?? 0) > 0 || poisoned > 0)))
	);

	// Harbinger damage / retries / venom are Extra-tab data — hidden in Log-only mode.
	const bottom = $derived<Stat[]>(
		logOnly
			? []
			: (() => {
					const out: Stat[] = [];
					if (eztliDmg && eztliDmg.recorded > 0)
						out.push({ value: eztliDmg.max, label: m.campaign_tfa_eztli_harbinger() });
					if (retriesMax !== null)
						out.push({ value: retriesMax, label: m.campaign_tfa_eztli_retries() });
					if (poisoned > 0) out.push({ value: poisoned, label: m.campaign_tfa_poisoned_gained() });
					return out;
				})()
	);
	const rows = $derived<(Stat[] | StatGroup)[]>(
		e
			? [
					{
						heading: m.campaign_tfa_eztli_relic_heading(),
						stats: [
							{ value: e.investigatorsRelic, label: m.campaign_tfa_eztli_investigators_relic() },
							{ value: e.alejandroRelic, label: m.campaign_tfa_eztli_alejandro_relic() }
						]
					},
					bottom
				]
			: []
	);
</script>

<TfaScenarioInfo scenarioId="the_doom_of_eztli" {family} {achievements} {scenarios} {logOnly}>
	{#snippet headerArt()}
		<CardThumb code={TFA_HARBINGER_CODE} alt={m.campaign_tfa_harbinger_name()} tone="danger" objectTop />
	{/snippet}
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_eztli_empty()}</p>
		{/if}
	{/snippet}
</TfaScenarioInfo>
