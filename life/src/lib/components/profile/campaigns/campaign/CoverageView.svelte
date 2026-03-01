<!--
@component
"What haven't I explored?" — per campaign, the mutually-exclusive decisions and
which branches the player has ever recorded across all their plays. Unexplored
branches are highlighted so the player can see paths still to take.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import type { CampaignCoverage } from '$lib/campaign/custom-achievements';
	import { capitalizeFirst } from '$lib/campaign/entry-text';

	let {
		coverage,
		showFamilyName = true
	}: { coverage: CampaignCoverage[]; showFamilyName?: boolean } = $props();

	const withData = $derived(coverage.filter((c) => c.totalBranches > 0));
</script>

{#if withData.length}
	<div class="space-y-4">
		{#each withData as cov (cov.campaignCode)}
			{@const pct = cov.exploredPct}
			<details class="border-primary-200 dark:border-primary-700 rounded border p-3">
				<summary class="flex cursor-pointer items-center justify-between gap-3">
					{#if showFamilyName}
						<span class="font-bold text-black dark:text-white">{cov.campaignName}</span>
					{/if}
					<span class="text-primary-500 text-sm tabular-nums"
						>{m.campaign_coverage_outcomes({
							explored: cov.exploredBranches,
							total: cov.totalBranches,
							pct,
						})}</span
					>
				</summary>
				<div class="mt-3 space-y-2">
					{#each cov.groups as group, i (i)}
						<div class="flex flex-wrap gap-1.5">
							{#each group.branches as branch (branch.key)}
								<span
									class={[
										'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
										branch.recorded
											? 'bg-secondary-500/15 text-secondary-800 dark:text-secondary-200'
											: 'bg-primary-100 dark:bg-primary-800 text-primary-400 dark:text-primary-500',
									]}
								>
									{#if branch.recorded}<FaIcon icon={FaIconType.CheckBox} />{/if}
									{#if branch.quality === 'better'}<span title={m.campaign_coverage_route_better()}>★</span>{:else if branch.quality === 'easier'}<span class="opacity-60" title={m.campaign_coverage_route_easier()}>○</span>{/if}
									{capitalizeFirst(branch.text)}
								</span>
							{/each}
						</div>
					{/each}
				</div>
			</details>
		{/each}
	</div>
{/if}
