<!-- @component Every owned campaign × the tracked difficulties, each cell the campaign's endings lit when reached there; a played campaign links to its page. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import {
		ENDING_KIND_ORDER,
		type CampaignEndings,
		type ClearGridRow,
		type EndingKind
	} from '$lib/campaign/outcomes/clear-status';
	import type { DifficultyTier } from '$lib/campaign/profile/profile-settings';
	import { trackedTierList } from '$lib/campaign/records/tracking';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import { capitalizeFirst } from '$lib/campaign/utils/entry-text';
	import { OutcomeFace, WidgetTable } from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import { getProfileContext } from '$lib/components/profile/_framework/profile-context';
	import { slugForFamily } from '$lib/campaign/profile/profile-slugs';
	import CampaignBadge from '$lib/components/campaign/CampaignBadge.svelte';
	import {
		campaignCodeForFamily,
		campaignPaletteStyle
	} from '$lib/components/campaign/campaign-identity';

	let {
		grid,
		trackedTiers,
		endings = [],
		playedFamilies = new Set()
	}: {
		grid: ClearGridRow[];
		trackedTiers: DifficultyTier[];
		endings?: CampaignEndings[];
		/** Families with a campaign page to link to. */
		playedFamilies?: ReadonlySet<string>;
	} = $props();

	const profile = getProfileContext();

	const tiers = $derived(trackedTierList(trackedTiers));
	const rows = $derived(grid.filter((r) => r.owned));
	const endingsByFamily = $derived(
		Object.fromEntries(
			endings.map((e) => [
				e.family,
				[...e.endings].sort(
					(a, b) => ENDING_KIND_ORDER.indexOf(a.kind) - ENDING_KIND_ORDER.indexOf(b.kind)
				)
			])
		)
	);

	const reachDetail = (n: number): string =>
		n > 0 ? m.home_cleargrid_reached({ count: n }) : m.home_cleargrid_not_reached();

	// A campaign without curated endings shows its clear state as one face.
	const stateFace: Record<string, { kind: EndingKind; label: () => string }> = {
		cleared: { kind: 'win', label: m.home_cleargrid_cleared },
		special: { kind: 'special', label: m.home_cleargrid_special_ending },
		attempted: { kind: 'loss', label: m.home_cleargrid_attempted_lost }
	};
</script>

{#if rows.length}
	<WidgetTable
		columns={[
			{ label: m.home_cleargrid_col_campaign() },
			...tiers.map((t) => ({ label: difficultyLabel(t), align: 'center' as const }))
		]}
		{rows}
		key={(r) => r.family}
	>
		{#snippet row(row)}
			{@const familyEndings = endingsByFamily[row.family] ?? []}
			{@const code = campaignCodeForFamily(row.family)}
			{@const style = campaignPaletteStyle(code)}
			{@const nameClass = style
				? 'font-semibold text-(--campaign-text-light) dark:text-(--campaign-text-dark)'
				: 'text-black dark:text-white'}
			<td class={widgetTableCell} {style}>
				<span class="flex items-center gap-2">
					<CampaignBadge campaignCode={code} size="sm" />
					{#if profile && playedFamilies.has(row.family)}
						<a href="{profile.base}/campaigns/{slugForFamily(row.family)}" class="{nameClass} hover:underline">
							{row.name}
						</a>
					{:else}
						<span class={nameClass}>{row.name}</span>
					{/if}
				</span>
			</td>
			{#each tiers as t (t)}
				{@const state = row.byTier[t]}
				<td class={widgetTableCell}>
					<div class="flex flex-wrap justify-center gap-1.5">
						{#if !state}
							<span class="text-primary-300 dark:text-primary-600">—</span>
						{:else if familyEndings.length}
							{#each familyEndings as e (e.key)}
								{@const n = e.byTier?.[t] ?? 0}
								<OutcomeFace
									kind={e.kind}
									reached={n > 0}
									label="{capitalizeFirst(e.text)} — {reachDetail(n)}"
								/>
							{/each}
						{:else if stateFace[state]}
							<OutcomeFace kind={stateFace[state].kind} label={stateFace[state].label()} size="text-xl" />
						{/if}
					</div>
				</td>
			{/each}
		{/snippet}
	</WidgetTable>
{/if}
