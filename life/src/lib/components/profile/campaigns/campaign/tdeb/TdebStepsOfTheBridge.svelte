<!-- @component Steps of the Bridge: plays per Weaver of the Cosmos doom band, with the most and average Steps. -->
<script lang="ts">
	import type { CampaignTdeb, StepsBand } from '$lib/campaign/campaigns/tdeb';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		IconTrack,
		SectionLabel,
		StatNumbers,
		WidgetEmpty,
		type IconTrackItem
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: tdeb }: CampaignWidgetProps<CampaignTdeb> = $props();

	const s = $derived(tdeb?.stepsOfTheBridge);

	// Safest (0 doom) to direst.
	const TINT = [
		'text-green-600 dark:text-green-400',
		'text-lime-600 dark:text-lime-400',
		'text-amber-600 dark:text-amber-400',
		'text-orange-600 dark:text-orange-400',
		'text-red-600 dark:text-red-400'
	];
	const range = (b: StepsBand) => (b.to === null ? `${b.from}+` : `${b.from}–${b.to}`);
	const bands = $derived<(IconTrackItem & StepsBand)[]>(
		(s?.bands ?? []).map((b) => ({
			...b,
			tooltip: m.campaign_tdeb_steps_band({ doom: b.doom, range: range(b) }),
			dim: b.plays === 0,
			tint: TINT[b.doom]
		}))
	);
</script>

{#if s?.plays}
	<div class="space-y-4">
		<div>
			<SectionLabel variant="heading" align="center"
				>{m.campaign_tdeb_steps_band_heading()}</SectionLabel
			>
			<div class="flex justify-center">
				<IconTrack items={bands} size="1.3rem" cellWidth="2.6em" gap="0.4em">
					{#snippet icon(it)}<span class="font-bold tabular-nums">{it.doom}</span>{/snippet}
					{#snippet sub(it)}<span class="text-[0.55em] tabular-nums"
							>{it.plays > 0 ? `×${it.plays}` : '—'}</span
						>{/snippet}
				</IconTrack>
			</div>
		</div>
		<StatNumbers
			rows={[
				{
					keepEmpty: true,
					stats: [
						{ value: s.max, label: m.campaign_tdeb_steps_max() },
						{ value: s.avg, label: m.campaign_tdeb_steps_avg() }
					]
				}
			]}
		/>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tdeb_steps_empty()}</WidgetEmpty>
{/if}
