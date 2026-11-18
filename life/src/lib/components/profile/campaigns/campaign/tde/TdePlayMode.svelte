<!-- @component How the Dream-Eaters plays were run: interconnected eight-part or half campaign. -->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob }: CampaignWidgetProps<CampaignTdea | CampaignTdeb> = $props();

	const p = $derived(blob?.shared.playMode);
</script>

<StatNumbers
	empty={m.campaign_tde_mode_empty()}
	rows={[
		[
			{ value: p?.interconnected, label: m.campaign_tde_mode_interconnected() },
			{ value: p?.half, label: m.campaign_tde_mode_half() },
			...(p?.unspecified
				? [{ value: p.unspecified, label: m.campaign_tde_mode_unspecified() }]
				: [])
		]
	]}
/>
