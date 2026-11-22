<!-- @component Ichtaca and Alejandro through the campaign: trust earned, a bond forged or wariness for Ichtaca, rescue or loss for Alejandro. -->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { CardThumb, StatNumbers, WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { TFA_CARD } from './tfa-shared';

	let { blob: tfa }: CampaignWidgetProps<CampaignTfa> = $props();

	const ich = $derived(tfa?.ichtaca);
	const alj = $derived(tfa?.alejandro);
</script>

{#if (ich?.recorded ?? 0) + (alj?.recorded ?? 0) > 0}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<div class="space-y-2">
			<div class="flex justify-center"><CardThumb code={TFA_CARD.ichtaca.code} objectTop /></div>
			<StatNumbers
				rows={[
					{
						keepEmpty: true,
						stats: [
							{ value: ich?.trust, label: m.campaign_tfa_companion_trust() },
							{ value: ich?.bond, label: m.campaign_tfa_companion_bond() }
						]
					},
					[
						{ value: ich?.wary, label: m.campaign_tfa_companion_wary() },
						{ value: ich?.inTheDark, label: m.campaign_tfa_companion_in_the_dark() }
					]
				]}
			/>
		</div>
		<div class="space-y-2">
			<div class="flex justify-center"><CardThumb code={TFA_CARD.alejandro.code} objectTop /></div>
			<StatNumbers
				rows={[
					{
						keepEmpty: true,
						stats: [
							{ value: alj?.trust, label: m.campaign_tfa_companion_trust() },
							{ value: alj?.rescued, label: m.campaign_tfa_companion_rescued() }
						]
					},
					[{ value: alj?.missing, label: m.campaign_tfa_companion_missing() }]
				]}
			/>
		</div>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tfa_companions_empty()}</WidgetEmpty>
{/if}
