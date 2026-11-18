<!-- @component One scenario's Standalone Mode record: plays, win/loss, best score, resolutions reached and deck XP tiers. -->
<script lang="ts">
	import { page } from '$app/state';
	import { SectionSeparator } from '@5argon/arkham-life-ui';
	import { XP_TIERS } from '$lib/campaign/utils/deck-experience';
	import type { StandaloneArchiveStat } from '$lib/campaign/outcomes/standalone-archives';
	import { getProfileContext } from '$lib/components/profile/_framework/profile-context';
	import {
		ProfilePane,
		StatNumbers,
		WidgetEmpty,
		WidgetNote,
		type Stat
	} from '$lib/components/profile/_primitives';
	import ResolutionChips from '$lib/components/profile/campaigns/campaign/ResolutionChips.svelte';
	import * as m from '$lib/paraglide/messages.js';

	const ctx = getProfileContext();

	// /standalones/pack/[scenario] or /standalones/campaign/[campaign]/[scenario]
	const params = $derived(page.params as { scenario?: string; campaign?: string });
	const stat = $derived<StandaloneArchiveStat | null>(
		(ctx.payload?.standalones ?? []).find(
			(s) =>
				s.scenario === params.scenario &&
				(params.campaign ? s.catalogueCode === params.campaign : s.source === 'pack')
		) ?? null
	);

	function stats(s: StandaloneArchiveStat): Stat[] {
		const out: Stat[] = [{ value: s.plays, label: m.standalones_stat_plays() }];
		if (!s.unwinnable)
			out.push(
				{ value: s.won, label: m.standalones_stat_won() },
				{ value: s.lost, label: m.standalones_stat_lost() }
			);
		// An Experience scenario records its reward in the victory-display field too.
		if (s.victoryDisplay) {
			out.push({ value: s.bestVictoryDisplay, label: m.standalones_stat_best_vp() });
			if (s.bestEarnedXp != null) out.push({ value: s.bestEarnedXp, label: m.standalones_stat_best_xp() });
		} else {
			out.push({ value: s.bestEarnedXp ?? s.bestVictoryDisplay, label: m.standalones_stat_best_xp() });
		}
		return out;
	}

	const tierRows = (s: StandaloneArchiveStat) =>
		XP_TIERS.map((t) => ({ tier: t.tier, label: t.label, plays: s.xpTierPlays[t.tier] ?? 0 })).filter(
			(r) => r.plays > 0
		);
</script>

<ProfilePane
	title={stat ? m.standalones_detail_title({ name: stat.name }) : m.standalones_detail_title_fallback()}
	unknown={stat ? null : m.standalones_detail_unknown()}
>
	{#snippet children()}
		{#if stat}
			<div class="mt-4">
				<h1 class="text-xl font-bold text-black dark:text-white">{stat.name}</h1>
				<p class="text-primary-500 dark:text-primary-400 text-sm">
					{stat.source === 'pack' ? m.standalones_source_pack() : m.standalones_source_campaign()}
				</p>
			</div>

			<div class="mt-4">
				<StatNumbers rows={[{ stats: stats(stat), keepEmpty: true }]} />
				{#if stat.unwinnable}<WidgetNote>{m.standalones_unwinnable()}</WidgetNote>{/if}
			</div>

			{#if stat.resolutions.length}
				<div class="mt-6">
					<SectionSeparator
						title={m.standalones_resolutions({
							visited: stat.visited.length,
							total: stat.resolutions.length
						})}
					/>
					<ResolutionChips
						ids={stat.resolutions}
						visited={new Set(stat.visited)}
						tallies={stat.tallies}
					/>
				</div>
			{/if}

			<div class="mt-6">
				<SectionSeparator title={m.standalones_xp_range()} />
				{#each tierRows(stat) as row (row.tier)}
					<div class="flex items-center justify-between gap-3 text-sm">
						<span class="text-black dark:text-white">
							{row.label}
							{#if stat.bestWinTier === row.tier}
								<span class="text-green-600 dark:text-green-400">· {m.standalones_best_win()}</span>
							{/if}
						</span>
						<span class="text-primary-500 text-xs tabular-nums">
							{m.campaigns_plays({ count: row.plays })}
						</span>
					</div>
				{:else}
					<WidgetEmpty>{m.standalones_no_decks()}</WidgetEmpty>
				{/each}
			</div>
		{/if}
	{/snippet}
</ProfilePane>
