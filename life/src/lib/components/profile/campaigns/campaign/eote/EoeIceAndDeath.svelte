<!-- @component Ice and Death: parts skipped, the Shelter reached, and how the team got away. -->
<script lang="ts">
	import type { CampaignEoe } from '$lib/campaign/campaigns/eoe';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: eoe, ctx }: CampaignWidgetProps<CampaignEoe> = $props();

	const ice = $derived(eoe?.iceAndDeath);
</script>

<StatNumbers
	logOnly={ctx.logOnly}
	empty={m.campaign_eote_ice_empty()}
	rows={[
		{
			nonLog: true,
			stats: [
				{ value: ice?.skippedPart2, label: m.campaign_eote_ice_part2_skipped() },
				{ value: ice?.skippedPart3, label: m.campaign_eote_ice_part3_skipped() }
			]
		},
		[
			{ value: eoe?.shelter.max, label: m.campaign_eote_ice_max_shelter() },
			{ value: eoe?.shelter.min, label: m.campaign_eote_ice_min_shelter() },
			{ value: ice?.defeated, label: m.campaign_eote_ice_defeated_creatures() }
		],
		[
			{ value: ice?.fled, label: m.campaign_eote_ice_fled() },
			{ value: ice?.escaped, label: m.campaign_eote_ice_escaped() }
		]
	]}
/>
