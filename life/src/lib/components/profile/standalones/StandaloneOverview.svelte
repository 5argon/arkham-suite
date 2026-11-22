<!-- @component A standalone scenario's record: plays, wins and losses, best score and the resolutions reached. -->
<script lang="ts">
	import type { StandaloneArchiveStat } from '$lib/campaign/outcomes/standalone-archives';
	import {
		SectionLabel,
		StatNumbers,
		WidgetEmpty,
		WidgetNote,
		type Stat
	} from '$lib/components/profile/_primitives';
	import ResolutionChips from '$lib/components/profile/campaigns/campaign/ResolutionChips.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { stat }: { stat: StandaloneArchiveStat | null } = $props();

	const tally = (byTier: Record<string, number>) => ({
		total: Object.values(byTier).reduce((a, b) => a + b, 0),
		byTier
	});

	function stats(s: StandaloneArchiveStat): Stat[] {
		const out: Stat[] = [{ tally: tally(s.playsByTier), label: m.standalones_stat_plays() }];
		if (!s.unwinnable)
			out.push(
				{ value: s.won, label: m.standalones_stat_won() },
				{ value: s.lost, label: m.standalones_stat_lost() }
			);
		// An Experience scenario records its reward in the victory-display field too.
		if (s.victoryDisplay) {
			out.push({ value: s.bestVictoryDisplay ?? '—', label: m.standalones_stat_best_vp() });
			if (s.bestEarnedXp != null)
				out.push({ value: s.bestEarnedXp, label: m.standalones_stat_best_xp() });
		} else {
			out.push({
				value: s.bestEarnedXp ?? s.bestVictoryDisplay ?? '—',
				label: m.standalones_stat_best_xp()
			});
		}
		return out;
	}
</script>

{#if stat}
	<div class="space-y-4">
		<StatNumbers rows={[{ stats: stats(stat), keepEmpty: true }]} />
		{#if stat.resolutions.length}
			<div>
				<SectionLabel variant="heading" align="center"
					>{m.standalones_resolutions({
						visited: stat.visited.length,
						total: stat.resolutions.length
					})}</SectionLabel
				>
				<div class="flex justify-center">
					<ResolutionChips
						ids={stat.resolutions}
						visited={new Set(stat.visited)}
						tallies={stat.tallies}
					/>
				</div>
			</div>
		{/if}
		{#if stat.unwinnable}<WidgetNote>{m.standalones_unwinnable()}</WidgetNote>{/if}
	</div>
{:else}
	<WidgetEmpty>{m.standalones_detail_unknown()}</WidgetEmpty>
{/if}
