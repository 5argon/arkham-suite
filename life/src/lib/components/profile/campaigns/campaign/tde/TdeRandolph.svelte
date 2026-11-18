<!-- @component Randolph Carter's fate across The Dream-Quest and The Web of Dreams. -->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		CardThumb,
		StatNumbers,
		WidgetEmpty,
		type StatGroup
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { RANDOLPH_CODES } from './tde-cards';

	let { blob }: CampaignWidgetProps<CampaignTdea | CampaignTdeb> = $props();

	const r = $derived(blob?.shared.randolph);
	const rows = $derived<StatGroup[]>([
		{
			heading: m.campaign_tde_randolph_quest(),
			stats: [
				{ value: r?.savedByCarter, label: m.campaign_tde_randolph_saved() },
				{ value: r?.eludedCapture, label: m.campaign_tde_randolph_eluded() },
				{ value: r?.captured, label: m.campaign_tde_randolph_captured() },
				{ value: r?.survivedVoyage, label: m.campaign_tde_randolph_survived_voyage() },
				{ value: r?.diedVoyage, label: m.campaign_tde_randolph_died_voyage() }
			]
		},
		{
			heading: m.campaign_tde_randolph_web(),
			stats: [
				{ value: r?.escapedAlone, label: m.campaign_tde_randolph_escaped_alone() },
				{ value: r?.escapedWithInvestigators, label: m.campaign_tde_randolph_escaped_with() },
				{ value: r?.survivedDescent, label: m.campaign_tde_randolph_survived_descent() },
				{ value: r?.diedDescent, label: m.campaign_tde_randolph_died_descent() }
			]
		}
	]);
	const hasData = $derived(!!r && Object.values(r).some((n) => n > 0));
</script>

{#if hasData}
	<div class="mb-4 flex items-center justify-center gap-2">
		{#each RANDOLPH_CODES as code (code)}
			<CardThumb {code} size="h-14 w-14" objectTop />
		{/each}
	</div>
	<StatNumbers {rows} />
{:else}
	<WidgetEmpty>{m.campaign_tde_randolph_empty()}</WidgetEmpty>
{/if}
