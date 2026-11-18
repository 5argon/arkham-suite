<!-- @component The Harbinger of Valusia: the damage dealt at each appearance, and the plays that left it unharmed. -->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { CardThumb, StatNumbers, type StatGroup } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { TFA_CARD } from './tfa-shared';

	let { blob: tfa, ctx }: CampaignWidgetProps<CampaignTfa> = $props();

	const h = $derived(tfa?.harbinger);
	// The damage per appearance is Extra; the final damage and the unharmed plays come from the log.
	const rows = $derived<StatGroup[]>([
		{
			heading: m.campaign_tfa_harbinger_damage_heading(),
			nonLog: true,
			stats: [
				{ value: h?.eztli.max, label: m.campaign_tfa_harbinger_eztli() },
				{ value: h?.hote2.max, label: m.campaign_tfa_harbinger_hote() }
			]
		},
		{
			stats: [
				{ value: h?.final.max, label: m.campaign_tfa_harbinger_final() },
				{ value: h?.neverDamaged, label: m.campaign_tfa_harbinger_unharmed() }
			]
		}
	]);
</script>

<div class="flex items-start gap-3">
	<CardThumb {...TFA_CARD.harbinger} />
	<div class="min-w-0 flex-1">
		<StatNumbers logOnly={ctx.logOnly} empty={m.campaign_tfa_harbinger_empty()} {rows} />
	</div>
</div>
