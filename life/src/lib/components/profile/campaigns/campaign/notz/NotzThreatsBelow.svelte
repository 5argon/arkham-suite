<!-- @component What followed you into the finale: a surviving Ghoul Priest and the cultists who got away. -->
<script lang="ts">
	import { NOTZ_GHOUL_PRIEST_CODE, type CampaignNotz } from '$lib/campaign/campaigns/notz';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		CardThumb,
		StatNumbers,
		WidgetEmpty,
		WidgetNote
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: notz }: CampaignWidgetProps<CampaignNotz> = $props();

	const ghoul = $derived(notz?.gathering.ghoulPriestSurvived);
	const escaped = $derived(notz?.midnightMasks.totalEscaped ?? 0);
</script>

{#if ghoul?.total || escaped}
	<div class="space-y-3">
		<div class="flex justify-center">
			<CardThumb code={NOTZ_GHOUL_PRIEST_CODE} tone="danger" objectTop />
		</div>
		<StatNumbers
			rows={[
				[
					{ tally: ghoul, label: m.campaign_notz_threat_ghoul() },
					{ value: escaped, label: m.campaign_notz_threat_cultists() }
				]
			]}
		/>
		<WidgetNote>{m.campaign_notz_threats_note()}</WidgetNote>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_notz_threats_empty()}</WidgetEmpty>
{/if}
