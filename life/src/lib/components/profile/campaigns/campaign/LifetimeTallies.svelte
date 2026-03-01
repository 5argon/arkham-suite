<!--
@component
Bespoke per-campaign widget for the life-local "lifetime tally" custom
achievements — running totals nothing official tracks, aggregated across every
play of one campaign family. Edge of the Earth surfaces "Memories Banished" /
"Memories Discovered"; The Forgotten Age surfaces "Yig's Fury". These used to
ride inside the generic Achievements widget; they are now their own
campaign-specific widget so they only show on the campaign they belong to.

`custom` is already sliced to the campaign's family by the widget renderer.
-->
<script lang="ts">
	import type { CustomAchievement } from '$lib/campaign/custom-achievements';

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
