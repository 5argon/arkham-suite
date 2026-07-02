<!--
@component
TIC bespoke widget — "The Seven Keys". The finale (Into the Maelstrom) places its keys at
SETUP from earlier accomplishments; the 4 OBTAINABLE keys (blue/red/green/yellow) are the
controllable gate — securing ALL 4 makes the secret-ending branch (Agent Harper's-a-thief →
the better endings) reachable; miss one and it's impossible. Keys are NOT carried (they're a
per-scenario mechanic) — this measures whether you set yourself up. Built on LitTileGrid +
StatNumbers (the all-4 highscore carries the per-difficulty hover).
-->
<script lang="ts">
	import { TIC_KEYS, type CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { ResolutionTally } from '$lib/campaign/outcomes/resolution-coverage';
	import { tallyDetail } from '$lib/campaign/utils/difficulty';
	import LitTileGrid, {
		type LitTile
	} from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tic }: { tic: CampaignTic | null } = $props();

	const LABEL: Record<string, () => string> = {
		blue: m.campaign_tic_key_blue,
		red: m.campaign_tic_key_red,
		green: m.campaign_tic_key_green,
		yellow: m.campaign_tic_key_yellow
	};
	const detailOf = (t: ResolutionTally | undefined): string =>
		tallyDetail(t, m.campaign_tic_key_not_yet, (times) =>
			m.campaign_tic_key_secured({ times })
		);
	const tiles = $derived<LitTile[]>(
		tic
			? TIC_KEYS.map((key): LitTile => {
					const t = tic.sevenKeys.obtainable[key.id];
					return {
						id: key.id,
						image: '',
						label: (LABEL[key.id] ?? (() => key.id))(),
						count: t?.total ?? 0,
						detail: detailOf(t)
					};
				})
			: []
	);
	const allFour = $derived(tic?.sevenKeys.allFour ?? null);
	const reachableRow = $derived<Stat[][]>(
		allFour && allFour.total > 0
			? [
					[
						{
							value: allFour.total,
							label: m.campaign_tic_keys_reachable_label(),
							byTier: allFour.byTier
						}
					]
				]
			: []
	);
	const hasData = $derived(
		!!tic && TIC_KEYS.some((key) => (tic.sevenKeys.obtainable[key.id]?.total ?? 0) > 0)
	);
</script>

{#if hasData && tic}
	<div class="space-y-3">
		<LitTileGrid {tiles} colsClass="grid-cols-2 @3xl:grid-cols-4" />
		{#if reachableRow.length}
			<StatNumbers rows={reachableRow} />
		{:else}
			<p class="text-primary-500 text-center text-xs">{m.campaign_tic_keys_unreachable()}</p>
		{/if}
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tic_keys_empty()}</p>
{/if}
