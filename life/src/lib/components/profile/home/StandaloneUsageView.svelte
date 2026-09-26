<!-- @component How often each standalone scenario was played inside a campaign, with the resolutions reached. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { StandaloneUsageRow } from '$lib/campaign/outcomes/standalone-usage';
	import { WidgetEmpty } from '$lib/components/profile/_primitives';
	import ResolutionChips from '$lib/components/profile/campaigns/campaign/ResolutionChips.svelte';

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
						<div class="ml-auto">
							<ResolutionChips ids={r.resolutions} visited={new Set(r.resolutions)} />
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{:else}
	<WidgetEmpty>{m.home_standalone_empty()}</WidgetEmpty>
{/if}
