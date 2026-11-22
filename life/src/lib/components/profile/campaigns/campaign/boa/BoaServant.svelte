<!-- @component The Servant of Flame through the campaign: defeated in Spreading Flames, killed or escaped in Smoke and Mirrors, unmasked in Queen of Ash. -->
<script lang="ts">
	import { BOA_SERVANT_CODE, type CampaignBoa } from '$lib/campaign/campaigns/boa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { CardThumb, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: boa }: CampaignWidgetProps<CampaignBoa> = $props();

	const s = $derived(boa?.servant);
</script>

<div class="space-y-3">
	<div class="flex justify-center">
		<CardThumb code={BOA_SERVANT_CODE} tone="danger" objectTop />
	</div>
	<StatNumbers
		empty={m.campaign_boa_servant_empty()}
		rows={[
			[
				{ tally: s?.defeatedInSpreadingFlames, label: m.campaign_boa_servant_defeated_flames() },
				{ tally: s?.killed, label: m.campaign_boa_servant_killed() }
			],
			[
				{ tally: s?.escaped, label: m.campaign_boa_servant_escaped() },
				{ tally: s?.unmaskedInFinale, label: m.campaign_boa_servant_unmasked() }
			]
		]}
	/>
</div>
