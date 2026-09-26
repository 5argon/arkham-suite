<!-- @component The Miasma: how many campaigns closed with Dr. Kensler's plan, and how many with the truth eluding you. -->
<script lang="ts">
	import type { CampaignEoe } from '$lib/campaign/campaigns/eoe';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: eoe }: CampaignWidgetProps<CampaignEoe> = $props();
</script>

<StatNumbers
	empty={m.campaign_eote_miasma_empty()}
	rows={[
		[
			{ value: eoe?.miasma.plan, label: m.campaign_eote_miasma_plan() },
			{ value: eoe?.miasma.eludes, label: m.campaign_eote_miasma_eludes() }
		]
	]}
/>
