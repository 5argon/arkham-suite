<!--
@component
Shared PtC VIP portrait grid — the 5 dinner-party guests in two rows, like EotE's member
roster: row 1 the interview (guest/asset) crop, row 2 the slain (enemy) crop. A VIP lights
up (ring + count badge) when interviewed / slain at least once, and is greyed out otherwise.
Counts arrive aligned to VIP_ROSTER, so the CALLER decides scope — campaign-wide for the VIPs
widget, this-scenario-only for The Last King's slain row. The optional `*ByTier` arrays add a
per-difficulty breakdown to each portrait's hover. The optional `mostSlain` adds a third,
count-less row (The Last King) lighting just the guests slain in your highest-slain single run.
Built on LitTileGrid.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { getAllCards } from '$lib/card-data';
	import { VIP_ROSTER } from '$lib/campaign/campaigns/ptc';
	import { difficultyBreakdown } from '$lib/campaign/utils/difficulty';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		interviewedCounts,
		slainCounts,
		slainRowLabel,
		interviewedByTier = null,
		slainByTier = null,
		mostSlain = null
	}: {
		interviewedCounts: number[];
		slainCounts: number[];
		slainRowLabel: string;
		/** Per-difficulty split for each interviewed portrait (aligned to VIP_ROSTER) — adds a hover breakdown. */
		interviewedByTier?: Record<string, number>[] | null;
		/** Per-difficulty split for each slain portrait (aligned to VIP_ROSTER) — adds a hover breakdown. */
		slainByTier?: Record<string, number>[] | null;
		/** The Last King's "most slain in a run" highlight: the highest single-run slain count + the guest
		 *  (asset) codes from that run — rendered as a count-less third row, those guests lit. */
		mostSlain?: { count: number; vips: string[] } | null;
	} = $props();

	const nameByCode = new Map(getAllCards().map((c) => [c.code, c.name]));
	const vipName = (code: string) => nameByCode.get(code) ?? code;

	// Append the per-difficulty breakdown only when more than one difficulty contributed (a single tier's
	// breakdown just restates the total). e.g. "Interviewed ×3 · Standard ×2 · Hard ×1".
	const withTiers = (base: string, byTier: Record<string, number> | undefined): string =>
		byTier && Object.keys(byTier).length > 1
			? `${base} · ${difficultyBreakdown(byTier, (n) => `×${n}`, ' · ')}`
			: base;

	const interviewTiles = $derived<LitTile[]>(
		VIP_ROSTER.map((v, i) => {
			const n = interviewedCounts[i] ?? 0;
			return {
				id: `int-${v.asset}`,
				image: getCardImagePath(v.asset, 'square'),
				label: vipName(v.asset),
				count: n,
				detail:
					n > 0
						? withTiers(m.campaign_ptc_vips_tile_interviewed({ count: n }), interviewedByTier?.[i])
						: m.campaign_ptc_vips_tile_never_interviewed()
			};
		})
	);
	const slainTiles = $derived<LitTile[]>(
		VIP_ROSTER.map((v, i) => {
			const n = slainCounts[i] ?? 0;
			return {
				id: `sln-${v.enemy}`,
				image: getCardImagePath(v.enemy, 'square'),
				label: vipName(v.asset),
				count: n,
				detail:
					n > 0
						? withTiers(m.campaign_ptc_vips_tile_slain({ count: n }), slainByTier?.[i])
						: m.campaign_ptc_vips_tile_never_slain()
			};
		})
	);
	// "Most slain in a run" — light just the guests slain in that one run (enemy crop), no count badge.
	const mostSlainTiles = $derived<LitTile[]>(
		VIP_ROSTER.map((v) => ({
			id: `most-${v.enemy}`,
			image: getCardImagePath(v.enemy, 'square'),
			label: vipName(v.asset),
			count: mostSlain?.vips.includes(v.asset) ? 1 : 0,
			detail: ''
		}))
	);
</script>

<div class="space-y-3">
	<div>
		<SectionLabel variant="heading" align="center">{m.campaign_ptc_vips_interview_row()}</SectionLabel>
		<LitTileGrid rows={[interviewTiles]} />
	</div>
	<div>
		<SectionLabel variant="heading" align="center">{slainRowLabel}</SectionLabel>
		<LitTileGrid rows={[slainTiles]} />
	</div>
	{#if mostSlain && mostSlain.count > 0}
		<div>
			<SectionLabel variant="heading" align="center"
				>{m.campaign_ptc_lastking_most_slain_run({ count: mostSlain.count })}</SectionLabel
			>
			<LitTileGrid rows={[mostSlainTiles]} showCount={false} />
		</div>
	{/if}
</div>
