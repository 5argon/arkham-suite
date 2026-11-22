<!-- @component The cards a standalone scenario can add to a deck, lit by how many plays earned each, with how many of them were ever earned. -->
<script lang="ts">
	import type { StandaloneRules } from '$lib/campaign/standalones/rules';
	import { tallyDetail } from '$lib/campaign/utils/difficulty';
	import type { Tally } from '$lib/campaign/utils/tally';
	import { cardByCode } from '$lib/card-data';
	import { LitTileGrid, StatNumbers, type LitTile } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { rules, tallies }: { rules: StandaloneRules | null; tallies: Record<string, Tally> | null } =
		$props();

	const tiles = $derived<LitTile[]>(
		(rules?.cards ?? []).map((r) => {
			const t = tallies?.[r.code];
			const earned = tallyDetail(t, m.standalones_cards_never, (times) =>
				m.standalones_cards_times({ times })
			);
			const from = r.from ? cardByCode(r.from)?.name : undefined;
			return {
				id: r.code,
				code: r.code,
				count: t?.total ?? 0,
				detail: from ? `${from} · ${earned}` : earned
			};
		})
	);
	const earned = $derived(tiles.filter((t) => t.count > 0).length);
	const cols = $derived(
		tiles.length <= 3
			? 'grid-cols-3'
			: tiles.length === 4
				? 'grid-cols-4'
				: 'grid-cols-3 @lg:grid-cols-5'
	);
</script>

<div class="space-y-4">
	<StatNumbers
		rows={[
			{
				keepEmpty: true,
				stats: [{ value: `${earned} / ${tiles.length}`, label: m.standalones_cards_earned() }]
			}
		]}
	/>
	<LitTileGrid {tiles} colsClass={cols} />
</div>
