<!-- @component Traces to Nowhere: which Husserl-family suspect was behind the abductions, and how each case ended. -->
<script lang="ts">
	import { TTN_CULPRITS, type StandaloneTtn } from '$lib/campaign/standalones/ttn';
	import { tallyDetail } from '$lib/campaign/utils/difficulty';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		SectionLabel,
		WidgetEmpty,
		WidgetNote,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import EndingsGrid from '$lib/components/profile/campaigns/campaign/EndingsGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: ttn }: CampaignWidgetProps<StandaloneTtn> = $props();

	const tiles = $derived<LitTile[]>(
		TTN_CULPRITS.map((c) => {
			const t = ttn?.culprits[c.id];
			return {
				id: c.id,
				code: c.code,
				count: t?.total ?? 0,
				detail: tallyDetail(t, m.standalone_ttn_culprit_never, (times) =>
					m.standalone_ttn_culprit_times({ times })
				)
			};
		})
	);
	const endings = $derived(
		ttn
			? [
					{
						kind: 'win' as const,
						label: m.standalone_ttn_ending_saved_lina(),
						resolution: 'R1',
						tally: ttn.endings.savedLina
					},
					{
						kind: 'win' as const,
						label: m.standalone_ttn_ending_stopped_eugene(),
						resolution: 'R2',
						tally: ttn.endings.stoppedEugene
					},
					{
						kind: 'win' as const,
						label: m.standalone_ttn_ending_stopped_albrecht(),
						resolution: 'R3',
						tally: ttn.endings.stoppedAlbrecht
					},
					{
						kind: 'special' as const,
						label: m.standalone_ttn_ending_at_large(),
						resolution: 'R4',
						tally: ttn.endings.stillAtLarge
					},
					{
						kind: 'loss' as const,
						label: m.standalone_ttn_ending_failed(),
						resolution: 'no_resolution',
						tally: ttn.endings.failed
					}
				]
			: []
	);
	const reached = $derived(
		endings.some((e) => e.tally.total > 0) || tiles.some((t) => t.count > 0)
	);
</script>

{#if reached}
	<div class="space-y-5">
		<div>
			<SectionLabel variant="heading" align="center"
				>{m.standalone_ttn_unmasked_heading()}</SectionLabel
			>
			<LitTileGrid {tiles} />
		</div>
		<EndingsGrid {endings} heading={m.standalone_ttn_endings_heading()} />
		<WidgetNote>{m.standalone_ttn_note()}</WidgetNote>
	</div>
{:else}
	<WidgetEmpty>{m.standalone_ttn_empty()}</WidgetEmpty>
{/if}
