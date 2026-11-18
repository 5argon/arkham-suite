<!-- @component Ichtaca and Alejandro, lit by the plays that earned their trust, bond or rescue. -->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, WidgetEmpty, type LitTile } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { TFA_CARD } from './tfa-shared';

	let { blob: tfa }: CampaignWidgetProps<CampaignTfa> = $props();

	const ich = $derived(tfa?.ichtaca);
	const alj = $derived(tfa?.alejandro);
	const tiles = $derived<LitTile[]>(
		ich && alj
			? [
					{
						id: 'ichtaca',
						code: TFA_CARD.ichtaca.code,
						count: ich.standing,
						detail: ich.recorded
							? m.campaign_tfa_ichtaca_detail({ trust: ich.trust, bond: ich.bond, wary: ich.wary })
							: m.campaign_tfa_companion_none()
					},
					{
						id: 'alejandro',
						code: TFA_CARD.alejandro.code,
						count: alj.standing,
						detail: alj.recorded
							? m.campaign_tfa_alejandro_detail({
									trust: alj.trust,
									rescued: alj.rescued,
									missing: alj.missing
								})
							: m.campaign_tfa_companion_none()
					}
				]
			: []
	);
</script>

{#if (ich?.recorded ?? 0) + (alj?.recorded ?? 0) > 0}
	<LitTileGrid {tiles} colsClass="grid-cols-2" />
{:else}
	<WidgetEmpty>{m.campaign_tfa_companions_empty()}</WidgetEmpty>
{/if}
