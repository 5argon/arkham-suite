<!-- @component The Ghoul Priest's fate in each play: defeated in The Gathering, in The Midnight Masks, or still alive for The Devourer Below. -->
<script lang="ts">
	import { NOTZ_GHOUL_PRIEST_CODE, type CampaignNotz } from '$lib/campaign/campaigns/notz';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { CardThumb, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: notz }: CampaignWidgetProps<CampaignNotz> = $props();

	const g = $derived(notz?.ghoulPriest);
</script>

<div class="space-y-3">
	<div class="flex justify-center">
		<CardThumb code={NOTZ_GHOUL_PRIEST_CODE} tone="danger" objectTop />
	</div>
	<StatNumbers
		empty={m.campaign_notz_ghoul_empty()}
		rows={[
			[
				{ tally: g?.defeatedInGathering, label: m.campaign_notz_ghoul_defeated_gathering() },
				{ tally: g?.defeatedInMidnightMasks, label: m.campaign_notz_ghoul_defeated_masks() },
				{ tally: g?.aliveInDevourerBelow, label: m.campaign_notz_ghoul_alive_devourer() }
			]
		]}
	/>
</div>
