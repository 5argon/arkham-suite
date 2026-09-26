<!-- @component The five dinner-party guests: a row lit by interviews, a row lit by slayings, and optionally the guests of the bloodiest single play. -->
<script lang="ts">
	import { VIP_ROSTER } from '$lib/campaign/campaigns/ptc';
	import { tallyDetail } from '$lib/campaign/utils/difficulty';
	import type { Tally } from '$lib/campaign/utils/tally';
	import { LitTileGrid, SectionLabel, type LitTile } from '$lib/components/profile/_primitives';
	import { cardByCode } from '$lib/card-data';
	import * as m from '$lib/paraglide/messages.js';

	let {
		interviewed,
		slain,
		slainLabel,
		mostSlain = null
	}: {
		/** Keyed by guest card, like `slain`. */
		interviewed: Record<string, Tally>;
		/** Hidden when null. */
		slain: Record<string, Tally> | null;
		slainLabel: string;
		mostSlain?: { count: number; vips: string[] } | null;
	} = $props();

	const name = (code: string) => cardByCode(code)?.name ?? code;

	const interviewTiles = $derived<LitTile[]>(
		VIP_ROSTER.map((v) => ({
			id: `int-${v.asset}`,
			code: v.asset,
			count: interviewed[v.asset]?.total ?? 0,
			detail: tallyDetail(interviewed[v.asset], m.campaign_ptc_vips_tile_never_interviewed, () =>
				m.campaign_ptc_vips_tile_interviewed({ count: interviewed[v.asset].total })
			)
		}))
	);
	const slainTiles = $derived<LitTile[]>(
		VIP_ROSTER.map((v) => ({
			id: `sln-${v.enemy}`,
			code: v.enemy,
			label: name(v.asset),
			count: slain?.[v.asset]?.total ?? 0,
			detail: tallyDetail(slain?.[v.asset], m.campaign_ptc_vips_tile_never_slain, () =>
				m.campaign_ptc_vips_tile_slain({ count: slain![v.asset].total })
			)
		}))
	);
	const mostSlainTiles = $derived<LitTile[]>(
		VIP_ROSTER.map((v) => ({
			id: `most-${v.enemy}`,
			code: v.enemy,
			label: name(v.asset),
			count: mostSlain?.vips.includes(v.asset) ? 1 : 0,
			detail: ''
		}))
	);
</script>

<div class="space-y-3">
	<div>
		<SectionLabel variant="heading" align="center"
			>{m.campaign_ptc_vips_interview_row()}</SectionLabel
		>
		<LitTileGrid rows={[interviewTiles]} />
	</div>
	{#if slain}
		<div>
			<SectionLabel variant="heading" align="center">{slainLabel}</SectionLabel>
			<LitTileGrid rows={[slainTiles]} />
		</div>
		{#if mostSlain?.count}
			<div>
				<SectionLabel variant="heading" align="center"
					>{m.campaign_ptc_lastking_most_slain_run({ count: mostSlain.count })}</SectionLabel
				>
				<LitTileGrid rows={[mostSlainTiles]} showCount={false} />
			</div>
		{/if}
	{/if}
</div>
