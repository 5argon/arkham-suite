<script lang="ts">
	import type { ResolvedAchievement } from '@5argon/arkham-campaign-data';
	import { getCampaignLog, achievementsFor } from '@5argon/arkham-campaign-data';
	import { Campaign as KohakuCampaign } from '@5argon/arkham-kohaku';
	import { Checkbox, FaIcon, FaIconType, SectionSeparator } from '@5argon/arkham-life-ui';

	import { type Campaign } from '$lib/core/campaign';
	import { findUniqueScenarios, makeLongScenarioName } from './campaign-analyze';
	import AchievementListItem from './AchievementListItem.svelte';

	let { campaign, kohakuCampaign }: { campaign: Campaign; kohakuCampaign: KohakuCampaign } =
		$props();

	// Off (default): show in the order copied from the campaign (data order).
	// On: categorize by the scenario each achievement is earned in.
	let groupByScenario = $state(false);

	function humanize(code: string): string {
		return code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	interface Group {
		key: string;
		title: string;
		items: ResolvedAchievement[];
	}

	// All achievements for the campaign (including shared ones inherited from a
	// Return-to box), in the data file's order.
	const log = $derived(getCampaignLog(kohakuCampaign));
	const all = $derived.by((): ResolvedAchievement[] => (log ? achievementsFor(log) : []));

	// Grouped by the scenario they're earned in — scenarios in play order first,
	// then anything campaign-wide.
	const groups = $derived.by((): Group[] => {
		const byScenario = new Map<string, ResolvedAchievement[]>();
		const wide: ResolvedAchievement[] = [];
		for (const a of all) {
			const s = a.def.scenario;
			if (s) {
				const arr = byScenario.get(s) ?? [];
				arr.push(a);
				byScenario.set(s, arr);
			} else {
				wide.push(a);
			}
		}
		const out: Group[] = [];
		for (const s of findUniqueScenarios(campaign)) {
			const code = s.kohakuScenario as string;
			const items = byScenario.get(code);
			if (items) {
				out.push({ key: code, title: makeLongScenarioName(s), items });
				byScenario.delete(code);
			}
		}
		for (const [code, items] of byScenario) out.push({ key: code, title: humanize(code), items });
		if (wide.length) out.push({ key: '__wide', title: 'Throughout the campaign', items: wide });
		return out;
	});
</script>

<div class="mx-auto max-w-2xl">
	{#if all.length > 0}
		<div
			class="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-primary-600 dark:text-primary-400"
		>
			<span>{all.length} achievements</span>
			<Checkbox bind:checked={groupByScenario} label="Group by scenario" />
		</div>

		{#if groupByScenario}
			{#each groups as g (g.key)}
				<SectionSeparator title={g.title} />
				<ul class="mt-3 mb-6 space-y-3">
					{#each g.items as a (a.def.id)}
						<AchievementListItem achievement={a} {log} />
					{/each}
				</ul>
			{/each}
		{:else}
			<ul class="space-y-3">
				{#each all as a (a.def.id)}
					<AchievementListItem achievement={a} {log} />
				{/each}
			</ul>
		{/if}
	{:else}
		<p class="text-center text-primary-600 dark:text-primary-400">
			This campaign has no recorded achievements.
		</p>
	{/if}
</div>
