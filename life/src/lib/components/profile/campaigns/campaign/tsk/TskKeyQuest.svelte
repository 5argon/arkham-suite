<!-- @component A Scarlet Key won on an interlude quest rather than at a scenario: The Bale Engine or The Ruinous Chime. -->
<script lang="ts">
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk/profile';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { CardThumb, StatNumbers, WidgetEmpty, type Stat } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: tsk, quest }: CampaignWidgetProps<CampaignTsk> & { quest: 'baleEngine' | 'ruinousChime' } = $props();

	const spec = $derived.by((): { card: string; empty: string; stats: Stat[] } => {
		if (quest === 'baleEngine') {
			const b = tsk?.baleEngine;
			return {
				card: '09769a',
				empty: m.campaign_tsk_bale_empty(),
				stats: b
					? [
							{ tally: b.obtained, label: m.campaign_tsk_bale_obtained() },
							{ value: b.nairobi, label: m.campaign_tsk_bale_nairobi() },
							{ value: b.bermuda, label: m.campaign_tsk_bale_bermuda() },
							{ value: b.fled, label: m.campaign_tsk_bale_fled() },
							{ value: b.lost, label: m.campaign_tsk_bale_lost() }
						]
					: []
			};
		}
		const c = tsk?.ruinousChime;
		return {
			card: '09770a',
			empty: m.campaign_tsk_chime_empty(),
			stats: c
				? [
						{ tally: c.obtained, label: m.campaign_tsk_chime_obtained() },
						{ value: c.met, label: m.campaign_tsk_chime_met() },
						{ value: c.newGuinea, label: m.campaign_tsk_chime_new_guinea() },
						{ value: c.vanished, label: m.campaign_tsk_chime_vanished() }
					]
				: []
		};
	});
	const anyData = $derived(spec.stats.some((s) => (s.value ?? s.tally?.total ?? 0) !== 0));
</script>

{#if anyData}
	<div class="flex items-start gap-4">
		<CardThumb code={spec.card} objectTop />
		<div class="flex-1"><StatNumbers rows={[spec.stats]} /></div>
	</div>
{:else}
	<WidgetEmpty>{spec.empty}</WidgetEmpty>
{/if}
