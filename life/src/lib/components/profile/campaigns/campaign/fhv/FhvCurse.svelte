<!-- @component The Hemlock curse: how many of the subject's investigators finished their meal. -->
<script lang="ts">
	import type { CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: fhv }: CampaignWidgetProps<CampaignFhv> = $props();
</script>

<StatNumbers
	empty={m.campaign_fhv_curse_empty()}
	rows={[
		[
			{ value: fhv?.curse.maxCursed, label: m.campaign_fhv_curse_max() },
			{ tally: fhv?.curse.plays, label: m.campaign_fhv_curse_plays() }
		]
	]}
/>
