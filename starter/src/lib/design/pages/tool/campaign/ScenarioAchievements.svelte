<script lang="ts">
	import type { Campaign, Scenario } from '@5argon/arkham-kohaku';
	import { getCampaignLog, achievementsForScenario } from '@5argon/arkham-campaign-data';
	import { SectionSeparator } from '@5argon/arkham-life-ui';
	import AchievementListItem from './AchievementListItem.svelte';

	let { campaign, scenario }: { campaign: Campaign; scenario: Scenario } = $props();

	// The campaign-data library resolves a kohaku Campaign + Scenario into the
	// achievements tied to that specific scenario — proof that the exported data
	// and TypeScript symbols are adequate for a real consumer.
	const achievements = $derived.by(() => {
		const log = getCampaignLog(campaign);
		return log ? achievementsForScenario(log, scenario) : [];
	});
</script>

{#if achievements.length > 0}
	<div class="mx-auto mt-8 max-w-2xl">
		<SectionSeparator title="Achievements you can earn here" />
		<ul class="mt-3 space-y-3">
			{#each achievements as a (a.def.id)}
				<AchievementListItem achievement={a} />
			{/each}
		</ul>
	</div>
{/if}
