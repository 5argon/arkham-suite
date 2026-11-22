<!-- @component How a standalone scenario was played: as its own archive or as a side story inside a campaign, and which campaigns it was played inside most. -->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { ProductIcon } from '@5argon/arkham-icon';
	import type { StandaloneArchiveStat } from '$lib/campaign/outcomes/standalone-archives';
	import {
		campaignCodeForFamily,
		campaignProduct
	} from '$lib/components/campaign/campaign-identity';
	import { SectionLabel, StatNumbers, WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { stat }: { stat: StandaloneArchiveStat | null } = $props();

	const insertions = $derived(stat?.insertions ?? []);
	const inserted = $derived(insertions.reduce((n, i) => n + i.plays, 0));
	const rows = $derived(
		insertions.map((i) => ({
			...i,
			name: getCampaignLog(i.family)?.db.name ?? i.family,
			product: campaignProduct(campaignCodeForFamily(i.family))
		}))
	);
</script>

{#if stat}
	<div class="space-y-4">
		<StatNumbers
			rows={[
				{
					keepEmpty: true,
					stats: [
						{ value: stat.archivePlays ?? 0, label: m.standalones_sources_archive() },
						{ value: inserted, label: m.standalones_sources_inserted() }
					]
				}
			]}
		/>
		{#if rows.length}
			<div>
				<SectionLabel variant="heading" align="center"
					>{m.standalones_sources_campaigns_heading()}</SectionLabel
				>
				<ul class="mx-auto max-w-sm space-y-1">
					{#each rows as r (r.family)}
						<li
							class="border-primary-100 dark:border-primary-800 flex items-center gap-2 border-b py-1 text-sm last:border-0"
						>
							{#if r.product}<span class="text-primary-600 dark:text-primary-300"
									><ProductIcon product={r.product} /></span
								>{/if}
							<span class="min-w-0 flex-1 truncate text-black dark:text-white">{r.name}</span>
							<span
								class="text-secondary-600 dark:text-secondary-400 shrink-0 font-semibold tabular-nums"
								>×{r.plays}</span
							>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{:else}
	<WidgetEmpty>{m.standalones_detail_unknown()}</WidgetEmpty>
{/if}
