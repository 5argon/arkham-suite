<!-- @component One campaign's lifetime running totals that no official achievement tracks (EotE's Memories Banished, TFA's Yig's Fury). -->
<script lang="ts">
	import type { CustomAchievement } from '$lib/campaign/achievements/custom-achievements';

	let { custom }: { custom: CustomAchievement[] } = $props();
</script>

{#if custom.length}
	<div class="border-primary-200 dark:border-primary-700 rounded border p-4">
		<ul class="space-y-2">
			{#each custom as c (c.id)}
				<li class="flex items-baseline justify-between gap-3 text-sm">
					<span>
						<span class="font-medium text-black dark:text-white">{c.title}</span>
						<span class="text-primary-500"> — {c.description}</span>
					</span>
					<span class="text-secondary-600 dark:text-secondary-400 shrink-0 font-bold tabular-nums">
						{c.value}{#if c.goal}<span class="text-primary-400"> / {c.goal}</span>{/if}
					</span>
				</li>
			{/each}
		</ul>
	</div>
{/if}
