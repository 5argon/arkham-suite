<script lang="ts">
	import type { CampaignLog, ResolvedAchievement } from '@5argon/arkham-campaign-data';
	import {
		achievementInferScope,
		describeAchievementInference
	} from '@5argon/arkham-campaign-data';
	import { FaIcon, FaIconType, Modal, parseArkhamMarkup } from '@5argon/arkham-life-ui';
	import AchievementStatusIcon from './AchievementStatusIcon.svelte';

	let { achievement, log }: { achievement: ResolvedAchievement; log: CampaignLog | undefined } =
		$props();

	const scope = $derived(achievementInferScope(achievement.def));
	const conditions = $derived(log ? describeAchievementInference(achievement.def, log) : []);
	let conditionsOpen = $state(false);

	// For `list` achievements (e.g. "The Gang's All Here"), the ordered sub-items
	// the player checks off, resolved to their display labels.
	const listItems = $derived.by(() => {
		const def = achievement.def;
		if (def.type !== 'list' || !def.items) return [];
		const labels = achievement.en.items ?? {};
		return def.items.map((id) => ({ id, label: labels[id] ?? id }));
	});

	// Strip ArkhamDB markup for a plain readable line.
	function clean(text: string): string {
		return text
			.replace(/<\/?[ib]>/g, '')
			.replace(/\[\[([^\]]+)\]\]/g, '$1')
			.replace(/\[[a-z_]+\]/g, '')
			.replace(/\s+/g, ' ')
			.trim();
	}
</script>

<li class="flex gap-3">
	<span class="mt-0.5 text-secondary-500 dark:text-secondary-400">
		<FaIcon icon={FaIconType.Achievement} />
	</span>
	<div class="min-w-0">
		<div class="flex items-center gap-2 font-bold text-secondary-900 dark:text-secondary-100">
			{achievement.en.title}
			<AchievementStatusIcon {scope} onClick={() => (conditionsOpen = true)} />
		</div>
		<div class="text-sm text-primary-700 dark:text-primary-300">
			{clean(achievement.en.text)}
		</div>
		{#if listItems.length > 0}
			<ul class="mt-1.5 space-y-1">
				{#each listItems as it (it.id)}
					<li class="flex items-center gap-2 text-sm text-primary-700 dark:text-primary-300">
						<span class="text-xs text-secondary-400 dark:text-secondary-500">
							<FaIcon icon={FaIconType.CheckBox} />
						</span>
						{it.label}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</li>

<Modal
	isOpen={conditionsOpen}
	onClose={() => (conditionsOpen = false)}
	title={achievement.en.title}
>
	<div class="space-y-3 py-2 text-sm">
		<p class="text-primary-600 dark:text-primary-300">
			This achievement is fully derivable later from just your campaign logs :
		</p>
		{#if conditions.length}
			<ul class="list-disc space-y-1 pl-5 text-primary-800 dark:text-primary-200">
				{#each conditions as c, i (i)}
					<li>{@html parseArkhamMarkup(c)}</li>
				{/each}
			</ul>
		{:else}
			<p class="text-primary-800 dark:text-primary-200">{clean(achievement.en.text)}</p>
		{/if}
	</div>
</Modal>
