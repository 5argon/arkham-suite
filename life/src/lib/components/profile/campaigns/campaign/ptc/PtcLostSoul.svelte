<!-- @component Lost Soul: whether Daniel's warning was heeded, and his fate. -->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: ptc, ctx }: CampaignWidgetProps<CampaignPtc> = $props();
	const o = $derived(ptc?.unspeakableOath);
</script>

<StatNumbers
	logOnly={ctx.logOnly}
	empty={m.campaign_ptc_lost_soul_empty()}
	rows={[
		{
			stats: [
				{ value: o?.danielHeeded, label: m.campaign_ptc_oath_daniel_heeded() },
				{ value: o?.danielIgnored, label: m.campaign_ptc_oath_daniel_ignored() }
			]
		},
		{
			nonLog: true,
			stats: [
				{ value: o?.danielSurvived, label: m.campaign_ptc_oath_daniel_survived() },
				{ value: o?.danielPossessed, label: m.campaign_ptc_oath_daniel_possessed() }
			]
		}
	]}
/>
