<!--
@component
TCU bespoke widget — "The Wages of Sin". The campaign log records only HOW MANY Heretics you
unleashed (never which), so this keeps a highscore + a distribution: the most Heretics released in a
play, how often you survived the Watcher's embrace, and a table of "released N → in how many plays".
Built on StatNumbers + WidgetTable, inside the scenario passport.
-->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tcu,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tcu: CampaignTcu | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const w = $derived(tcu?.wagesOfSin);
	const hasData = $derived(!!w && (w.hereticsReleasedMax !== null || w.survivedWatcher > 0));
	const rows = $derived<Stat[][]>(
		hasData && w
			? [
					[
						{ value: w.hereticsReleasedMax, label: m.campaign_tcu_wages_heretics() },
						{ value: w.survivedWatcher, label: m.campaign_tcu_wages_watcher() }
					]
				]
			: []
	);
	// Distribution: released count → plays, ascending by count.
	const dist = $derived(
		Object.entries(w?.hereticsReleased ?? {})
			.map(([count, plays]) => ({ count: Number(count), plays }))
			.sort((a, b) => a.count - b.count)
	);
	const columns = [
		{ label: m.campaign_tcu_wages_dist_count() },
		{ label: m.campaign_tcu_wages_dist_plays(), align: 'right' as const }
	];
</script>

<ScenarioInfo scenarioId="the_wages_of_sin" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
			{#if dist.length}
				<div class="mt-4">
					<SectionLabel>{m.campaign_tcu_wages_dist_heading()}</SectionLabel>
					<WidgetTable {columns} rows={dist} key={(d) => d.count}>
						{#snippet row(d)}
							<td class="{widgetTableCell} tabular-nums text-black dark:text-white">×{d.count}</td>
							<td
								class="{widgetTableCell} text-secondary-700 dark:text-secondary-300 text-right font-semibold tabular-nums"
								>×{d.plays}</td
							>
						{/snippet}
					</WidgetTable>
				</div>
			{/if}
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tcu_wages_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
