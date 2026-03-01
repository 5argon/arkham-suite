<!--
@component
"Standalone Usage" — how many times each standalone scenario (the ArkhamCards Side
Scenarios collection) was played inside a campaign. On the profile home it tallies
every campaign together; on a campaign's page it is sliced to that family. Fed by
the precomputed standalone usage recorded in the editor's Extra tab.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { resolutionLabel, resolutionShort } from '$lib/campaign/resolutions';
	import type { StandaloneUsageRow } from '$lib/campaign/standalone-usage';

	let { rows, family = null }: { rows: StandaloneUsageRow[]; family?: string | null } = $props();

	const totalPlays = $derived(rows.reduce((n, r) => n + r.count, 0));
</script>

{#if rows.length}
	<div class="border-primary-200 dark:border-primary-700 rounded border p-4">
		<p class="text-primary-700 dark:text-primary-300 mb-3 text-sm">
			<b class="text-black dark:text-white">{rows.length}</b>
			{m.home_standalone_count({ count: rows.length })}
			{m.home_standalone_played()}
			<b class="text-black dark:text-white">{totalPlays}</b>×
			{family ? m.home_standalone_scope_campaign() : m.home_standalone_scope_all()}.
		</p>
		<div class="space-y-1.5">
			{#each rows as r (r.scenario)}
				<div
					class="border-primary-100 dark:border-primary-800 flex flex-wrap items-center gap-x-3 gap-y-1 border-b py-1.5 text-sm last:border-0"
				>
					<span class="font-medium text-black dark:text-white">{r.name}</span>
					<span class="text-primary-500 tabular-nums">×{r.count}</span>
					{#if r.resolutions.length}
						<div class="ml-auto flex flex-wrap gap-1">
							{#each r.resolutions as res (res)}
								<span
									title={resolutionLabel(res)}
									class="bg-secondary-500 rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums text-white"
								>
									{resolutionShort(res)}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{:else}
	<p class="text-primary-500 text-sm">
		{m.home_standalone_empty()}
	</p>
{/if}
