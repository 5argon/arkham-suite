<!--
@component
TFA flagship — "The City of Archives". The Yithian body-swap drawn as a graded ladder: how the
process went, worst → best (backfired spectacularly · backfired · successful · perfected), each rung
lit by how often you reached it. Below: captivity (cooperated vs resisted), memories expunged (the
loss), and how many of your investigators suffered the body-swap aftermath. Built on IconTrack +
StatNumbers, wrapped in the shared TFA passport (Alejandro header art — the memories at stake).
-->
<script lang="ts">
	import { TFA_ALEJANDRO_CODE, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import TfaScenarioInfo from './TfaScenarioInfo.svelte';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import IconTrack, { type IconTrackItem } from '$lib/components/profile/_primitives/IconTrack.svelte';
	import StatNumbers, { type Stat, type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
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

	const c = $derived(tfa?.cityOfArchives);
	const hasData = $derived(
		!!c &&
			c.cooperated +
				c.resisted +
				c.memoriesExpunged +
				c.perfected +
				c.successful +
				c.backfired +
				c.backfiredSpectacularly +
				(logOnly ? 0 : c.yithianAftermath) >
				0
	);

	interface Rung extends IconTrackItem {
		count: number;
		label: string;
	}
	const rungs = $derived<Rung[]>(
		c
			? [
					{ count: c.backfiredSpectacularly, label: m.campaign_tfa_archives_tier_spectacular(), tip: m.campaign_tfa_archives_tip_spectacular({ n: c.backfiredSpectacularly }), tint: 'text-error-600 dark:text-error-400' },
					{ count: c.backfired, label: m.campaign_tfa_archives_tier_backfired(), tip: m.campaign_tfa_archives_tip_backfired({ n: c.backfired }), tint: 'text-amber-600 dark:text-amber-400' },
					{ count: c.successful, label: m.campaign_tfa_archives_tier_successful(), tip: m.campaign_tfa_archives_tip_successful({ n: c.successful }), tint: 'text-lime-600 dark:text-lime-400' },
					{ count: c.perfected, label: m.campaign_tfa_archives_tier_perfected(), tip: m.campaign_tfa_archives_tip_perfected({ n: c.perfected }), tint: 'text-emerald-600 dark:text-emerald-400' }
				].map((r) => ({
					count: r.count,
					label: r.label,
					tooltip: r.tip,
					dim: r.count === 0,
					tint: r.count === 0 ? 'text-primary-300 dark:text-primary-600' : r.tint
				}))
			: []
	);

	const rows = $derived<(Stat[] | StatGroup)[]>(
		c
			? [
					{
						heading: m.campaign_tfa_archives_captivity_heading(),
						stats: [
							{ value: c.cooperated, label: m.campaign_tfa_archives_cooperated() },
							{ value: c.resisted, label: m.campaign_tfa_archives_resisted() },
							{ value: c.memoriesExpunged, label: m.campaign_tfa_archives_expunged() }
						]
					},
					!logOnly && c.yithianAftermath > 0
						? [{ value: c.yithianAftermath, label: m.campaign_tfa_archives_aftermath() }]
						: []
				]
			: []
	);
</script>

<TfaScenarioInfo scenarioId="the_city_of_archives" {family} {achievements} {scenarios} {logOnly}>
	{#snippet headerArt()}
		<CardThumb code={TFA_ALEJANDRO_CODE} alt={m.campaign_tfa_companion_alejandro()} objectTop />
	{/snippet}
	{#snippet stats()}
		{#if hasData && c}
			<div class="space-y-4">
				<div>
					<SectionLabel align="center">{m.campaign_tfa_archives_ladder_label()}</SectionLabel>
					<div class="flex justify-center">
						<IconTrack items={rungs} size="1.4rem" cellWidth="5em" wrap>
							{#snippet icon(it)}
								<span class="text-2xl leading-none font-bold tabular-nums">{it.count}</span>
							{/snippet}
							{#snippet sub(it)}
								<span class="text-[0.7rem]">{it.label}</span>
							{/snippet}
						</IconTrack>
					</div>
				</div>
				<StatNumbers {rows} />
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_archives_empty()}</p>
		{/if}
	{/snippet}
</TfaScenarioInfo>
