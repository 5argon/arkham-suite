<script lang="ts">
	import type { ResolvedAchievement } from '@5argon/arkham-campaign-data';
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import AchievementStatusIcon from './AchievementStatusIcon.svelte';

	let { achievement }: { achievement: ResolvedAchievement } = $props();

	const inferred = $derived(Boolean(achievement.def.infer || achievement.def.itemInfer));

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
			<AchievementStatusIcon {inferred} />
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
