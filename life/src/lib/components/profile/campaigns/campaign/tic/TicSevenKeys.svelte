<!--
@component
TIC bespoke widget — "The Seven Keys". The finale (Into the Maelstrom) places its keys at
SETUP from earlier accomplishments; the 4 OBTAINABLE keys (blue/red/green/yellow) are the
controllable gate — securing ALL 4 makes the secret-ending branch (Agent Harper's-a-thief →
the better endings) reachable; miss one and it's impossible. Keys are NOT carried (they're a
per-scenario mechanic) — this measures whether you set yourself up. Built on LitTileGrid.
-->
<script lang="ts">
	import { TIC_KEYS, type CampaignTic } from '$lib/campaign/campaigns/tic';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';

	let { tic }: { tic: CampaignTic | null } = $props();

	const LABEL: Record<string, () => string> = {
		blue: m.campaign_tic_key_blue,
		red: m.campaign_tic_key_red,
		green: m.campaign_tic_key_green,
		yellow: m.campaign_tic_key_yellow
	};
	const tiles = $derived<LitTile[]>(
		tic
			? TIC_KEYS.map((key): LitTile => {
					const c = tic.sevenKeys.obtainable[key.id] ?? 0;
					return {
						id: key.id,
						image: '',
						label: (LABEL[key.id] ?? (() => key.id))(),
						count: c,
						detail: c > 0 ? m.campaign_tic_key_secured({ times: times(c) }) : m.campaign_tic_key_not_yet()
					};
				})
			: []
	);
	const hasData = $derived(!!tic && TIC_KEYS.some((key) => (tic.sevenKeys.obtainable[key.id] ?? 0) > 0));
</script>

{#if hasData && tic}
	<LitTileGrid {tiles} colsClass="grid-cols-2 @3xl:grid-cols-4" />
	<p class="text-primary-500 mt-3 text-center text-xs">
		{#if tic.sevenKeys.allFour > 0}
			{m.campaign_tic_keys_reachable({ count: tic.sevenKeys.allFour })}
		{:else}
			{m.campaign_tic_keys_unreachable()}
		{/if}
	</p>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tic_keys_empty()}</p>
{/if}
