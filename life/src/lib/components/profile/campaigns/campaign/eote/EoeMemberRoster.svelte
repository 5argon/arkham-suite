<!--
@component
EotE bespoke widget — a portrait roster of the nine expedition members, each lit
by a per-member lifetime tally (count badge + hover). One component, three metrics:
  • killed   — "Killed in the Plane Crash"
  • demons   — "Confronted Their Demons"
  • survived — "The Survivors of the Expedition"
Portraits reuse the expedition-team partner cards' square crops (codes from the
campaign-log roster items). 3×3 when narrow, 1×9 when wide. Built on LitTileGrid.
-->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { itemLabel } from '$lib/campaign/campaign-log-source';
	import type { CampaignEoe } from '$lib/campaign/eoe';
	import { times } from '$lib/profile/plural';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';

	type Metric = 'killed' | 'demons' | 'survived' | 'rescued';
	let { eoe, metric }: { eoe: CampaignEoe | null; metric: Metric } = $props();

	const log = getCampaignLog('eoe');
	const teamItems = $derived(log?.db.sections.find((s) => s.id === 'expedition_team')?.items ?? []);
	const counts = $derived<Record<string, number>>(eoe ? eoe[metric] : {});

	// Per-metric copy (lit = the event happened at least once).
	const PHRASE: Record<Metric, { lit: (n: number) => string; none: string }> = {
		killed: {
			lit: (n) => m.campaign_eote_roster_killed({ count: n }),
			none: m.campaign_eote_roster_killed_none()
		},
		demons: {
			lit: (n) => m.campaign_eote_roster_demons({ times: times(n) }),
			none: m.campaign_eote_roster_demons_none()
		},
		survived: {
			lit: (n) => m.campaign_eote_roster_survived({ count: n }),
			none: m.campaign_eote_roster_survived_none()
		},
		rescued: {
			lit: (n) => m.campaign_eote_roster_rescued({ times: times(n) }),
			none: m.campaign_eote_roster_rescued_none()
		}
	};

	const tiles = $derived<LitTile[]>(
		eoe
			? eoe.roster.map((id) => {
					const n = counts[id] ?? 0;
					return {
						id,
						image: getCardImagePath(teamItems.find((it) => it.id === id)?.code ?? '', 'square'),
						label: log ? itemLabel(log, id) : id,
						count: n,
						detail: n > 0 ? PHRASE[metric].lit(n) : PHRASE[metric].none
					};
				})
			: []
	);
</script>

{#if eoe}
	<LitTileGrid {tiles} colsClass="grid-cols-3 @3xl:grid-cols-9" />
{/if}
