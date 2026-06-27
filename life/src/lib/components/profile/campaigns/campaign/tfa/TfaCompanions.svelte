<!--
@component
TFA bespoke widget — "Ichtaca & Alejandro". Your two expedition companions, each lit
by your standing with them (Ichtaca's trust/bond; Alejandro rescued/trusted), with a
hover for the full tally. Portraits are their Ally story cards. Built on LitTileGrid.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { TFA_ICHTACA_CODE, TFA_ALEJANDRO_CODE, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tfa }: { tfa: CampaignTfa | null } = $props();

	const tiles = $derived<LitTile[]>(
		tfa
			? [
					{
						id: 'ichtaca',
						image: getCardImagePath(TFA_ICHTACA_CODE, 'square'),
						label: m.campaign_tfa_companion_ichtaca(),
						count: tfa.ichtaca.trust + tfa.ichtaca.bond,
						detail:
							tfa.ichtaca.trust + tfa.ichtaca.bond + tfa.ichtaca.wary > 0
								? m.campaign_tfa_ichtaca_detail({
										trust: tfa.ichtaca.trust,
										bond: tfa.ichtaca.bond,
										wary: tfa.ichtaca.wary
									})
								: m.campaign_tfa_companion_none()
					},
					{
						id: 'alejandro',
						image: getCardImagePath(TFA_ALEJANDRO_CODE, 'square'),
						label: m.campaign_tfa_companion_alejandro(),
						count: tfa.alejandro.trust + tfa.alejandro.rescued,
						detail:
							tfa.alejandro.trust + tfa.alejandro.rescued + tfa.alejandro.missing > 0
								? m.campaign_tfa_alejandro_detail({
										trust: tfa.alejandro.trust,
										rescued: tfa.alejandro.rescued,
										missing: tfa.alejandro.missing
									})
								: m.campaign_tfa_companion_none()
					}
				]
			: []
	);
	const hasData = $derived(
		!!tfa &&
			(tfa.ichtaca.trust + tfa.ichtaca.bond + tfa.ichtaca.wary + tfa.ichtaca.inTheDark > 0 ||
				tfa.alejandro.trust +
					tfa.alejandro.rescued +
					tfa.alejandro.missing +
					tfa.alejandro.followed +
					tfa.alejandro.remained >
					0)
	);
</script>

{#if hasData}
	<LitTileGrid {tiles} colsClass="grid-cols-2" />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tfa_companions_empty()}</p>
{/if}
