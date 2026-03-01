<!--
@component
Compact per-campaign achievement summary for the campaigns home page: shows each
campaign family's name and earned/total count only — no individual achievement
details. Use the full `ProfileAchievements` on a campaign's own detail page.
-->
<script lang="ts">
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import type { ProfileFamily } from '$lib/campaign/achievement-aggregate';

	let { families }: { families: ProfileFamily[] } = $props();

	const visible = $derived(families.filter((f) => f.total > 0));
</script>

{#if visible.length}
	<ul class="space-y-2">
		{#each visible as fam (fam.family)}
			<li class="flex items-center gap-2 text-sm">
				<span class={fam.earned === fam.total ? 'text-yellow-500 dark:text-yellow-400' : 'text-primary-300 dark:text-primary-600'}>
					<FaIcon icon={FaIconType.Achievement} />
				</span>
				<span class="flex-1 font-medium text-black dark:text-white">{fam.name}</span>
				<span class="text-primary-500 tabular-nums">{fam.earned}/{fam.total}</span>
			</li>
		{/each}
	</ul>
{/if}
