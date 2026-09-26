<!-- @component Evidence of Kadath: the Signs of the Gods lit by the best run, with the most and average Evidence. -->
<script lang="ts">
	import { TDEA_ALL_SIGNS, type CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		IconTrack,
		SectionLabel,
		StatNumbers,
		WidgetEmpty,
		type IconTrackItem
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: tdea }: CampaignWidgetProps<CampaignTdea> = $props();

	const e = $derived(tdea?.evidenceOfKadath);
	const signs = $derived<(IconTrackItem & { lit: boolean })[]>(
		Array.from({ length: TDEA_ALL_SIGNS }, (_, i) => {
			const lit = i < (e?.bestSigns ?? 0);
			return {
				lit,
				dim: !lit,
				tint: lit ? 'text-amber-500 dark:text-amber-400' : '',
				tooltip: m.campaign_tdea_evidence_sign_tip({ n: i + 1, total: TDEA_ALL_SIGNS })
			};
		})
	);
</script>

{#if e?.plays}
	<div class="space-y-4">
		<div>
			<SectionLabel variant="heading" align="center"
				>{m.campaign_tdea_evidence_signs_heading()}</SectionLabel
			>
			<div class="flex justify-center">
				<IconTrack items={signs} size="1.1rem" cellWidth="1.2em" gap="0.15em" wrap>
					{#snippet icon(it)}<span>{it.lit ? '★' : '☆'}</span>{/snippet}
				</IconTrack>
			</div>
		</div>
		<StatNumbers
			rows={[
				{
					keepEmpty: true,
					stats: [
						{ value: e.max, label: m.campaign_tdea_evidence_max() },
						{ value: e.avg, label: m.campaign_tdea_evidence_avg() },
						{
							value: e.allSigns,
							label: m.campaign_tdea_evidence_all_signs({ total: TDEA_ALL_SIGNS })
						}
					]
				}
			]}
		/>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tdea_evidence_empty()}</WidgetEmpty>
{/if}
