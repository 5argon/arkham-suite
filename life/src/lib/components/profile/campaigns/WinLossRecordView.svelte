<!-- @component Per campaign, most played first: plays, wins / losses / special endings / unfinished, and plays per difficulty. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import { CappedList, HoverTip, HoverTipState } from '$lib/components/profile/_primitives';
	import { getProfileContext } from '$lib/components/profile/_framework/profile-context';
	import { slugForFamily } from '$lib/campaign/profile/profile-slugs';
	import { difficultyAbbr, orderedDifficulties } from '$lib/campaign/utils/difficulty';
	import type { WinLossRecord } from '$lib/campaign/outcomes/clear-status';
	import CampaignBadge from '$lib/components/campaign/CampaignBadge.svelte';
	import {
		campaignCodeForFamily,
		campaignPaletteStyle
	} from '$lib/components/campaign/campaign-identity';

	let { records, showFamilyName = true }: { records: WinLossRecord[]; showFamilyName?: boolean } =
		$props();

	const profile = getProfileContext();
	const withPlays = $derived(records.filter((r) => r.plays > 0).sort((a, b) => b.plays - a.plays));

	function tierPlays(r: WinLossRecord): string {
		const plays = Object.fromEntries(Object.entries(r.byTier).map(([t, v]) => [t, v.plays]));
		return orderedDifficulties(plays)
			.map((t) => `${plays[t]}× ${difficultyAbbr(t)}`)
			.join(', ');
	}

	const tip = new HoverTipState();
</script>

{#snippet rowsOf(list: WinLossRecord[])}
	<div
		class="border-primary-200 dark:border-primary-700 divide-primary-100 dark:divide-primary-800 divide-y rounded border"
	>
		{#each list as r (r.family)}
			{@const code = campaignCodeForFamily(r.family)}
			{@const style = campaignPaletteStyle(code)}
			<!-- The counts drop under the name when the row can't keep 12rem for it. -->
			<div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 px-3 py-1.5 text-sm" {style}>
				{#if showFamilyName}
					<span class="flex min-w-0 flex-1 basis-48 items-center gap-2">
						<CampaignBadge campaignCode={code} size="sm" />
						<a
							href="{profile?.base ?? ''}/campaigns/{slugForFamily(r.family)}"
							class="truncate font-semibold hover:underline {style
								? 'text-(--campaign-text-light) dark:text-(--campaign-text-dark)'
								: 'text-black dark:text-white'}">{r.name}</a
						>
					</span>
				{/if}
				<div class="ml-auto flex shrink-0 items-center gap-3 tabular-nums">
					<span class="text-primary-500">{m.campaigns_plays({ count: r.plays })}</span>
					<span class="flex items-center gap-2">
						{#if r.wins}<span class="text-secondary-600 dark:text-secondary-400">{r.wins}W</span>{/if}
						{#if r.losses}<span class="text-amber-600 dark:text-amber-400">{r.losses}L</span>{/if}
						{#if r.special}
							<span
								role="img"
								aria-label={m.archive_outcome_special()}
								onmouseenter={(e) => tip.showText(m.archive_outcome_special(), e)}
								onmouseleave={tip.hide}
								class="inline-flex items-center gap-0.5 text-purple-500"
								>{r.special}<FaIcon icon={FaIconType.EndingSpecial} /></span
							>
						{/if}
						{#if r.inProgress}<span class="text-primary-400">{r.inProgress}?</span>{/if}
					</span>
					<span class="text-primary-400 hidden text-xs lg:inline">{tierPlays(r)}</span>
				</div>
			</div>
		{/each}
	</div>
{/snippet}

{#if withPlays.length}
	<CappedList items={withPlays} limit={8} modalTitle={m.framework_label_win_loss()} list={rowsOf} />
{/if}

<HoverTip {tip} />
