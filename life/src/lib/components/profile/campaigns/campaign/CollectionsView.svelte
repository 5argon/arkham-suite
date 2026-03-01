<!--
@component
Lifetime collection completion per campaign — the TDC alien-glyph wall, TSK
Scarlet Keys vault, FHV areas surveyed, … Collected items light up; the rest are
greyed targets still to find across future plays.
-->
<script lang="ts">
	import type { CampaignCollections } from '$lib/campaign/collections';

	let {
		collections,
		showFamilyName = true
	}: { collections: CampaignCollections[]; showFamilyName?: boolean } = $props();

	const withData = $derived(collections.filter((c) => c.collections.length > 0));
</script>

{#if withData.length}
	<div class="space-y-3">
		{#each withData as camp (camp.family)}
			{#each camp.collections as col (col.sectionId)}
				<div class="border-primary-200 dark:border-primary-700 rounded border p-3">
					<div class="mb-2 flex items-baseline justify-between gap-3">
						<h3 class="font-bold text-black dark:text-white">
							{showFamilyName ? `${camp.name} — ${col.title}` : col.title}
						</h3>
						<span class="text-primary-500 shrink-0 text-sm tabular-nums"
							>{col.collectedCount}/{col.items.length}</span
						>
					</div>
					<div class="flex flex-wrap gap-1.5">
						{#each col.items as item (item.id)}
							<span
								class={[
									'rounded px-2 py-0.5 text-xs',
									item.collected
										? 'bg-secondary-500/15 text-secondary-800 dark:text-secondary-200'
										: 'bg-primary-100 dark:bg-primary-800 text-primary-400 dark:text-primary-500',
								]}
								title={item.label}
							>
								{item.label}
							</span>
						{/each}
					</div>
				</div>
			{/each}
		{/each}
	</div>
{/if}
