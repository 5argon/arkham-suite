<!-- @component The optional side-quest stops: Special Delivery, Strange Architecture, Quid Pro Quo, Ruses and Reclamation. -->
<script lang="ts">
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk/profile';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { SectionLabel, StatNumbers, WidgetEmpty, type Stat } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: tsk }: CampaignWidgetProps<CampaignTsk> = $props();

	const blocks = $derived.by((): { title: string; sub: string; shown: boolean; stats: Stat[] }[] => {
		const sq = tsk?.sideQuests;
		if (!sq) return [];
		return [
			{
				title: m.campaign_tsk_sq_delivery_title(),
				sub: m.campaign_tsk_sq_delivery_sub(),
				shown: sq.delivery.pickedUp > 0,
				stats: [
					{ value: sq.delivery.pickedUp, label: m.campaign_tsk_sq_delivery_pickedup() },
					{ tally: sq.delivery.delivered, label: m.campaign_tsk_sq_delivery_delivered() }
				]
			},
			{
				title: m.campaign_tsk_sq_arch_title(),
				sub: m.campaign_tsk_sq_arch_sub(),
				shown: sq.architecture.noticed > 0,
				stats: [
					{ value: sq.architecture.noticed, label: m.campaign_tsk_sq_arch_noticed() },
					{ tally: sq.architecture.completed, label: m.campaign_tsk_sq_arch_completed() }
				]
			},
			{
				title: m.campaign_tsk_sq_qpq_title(),
				sub: m.campaign_tsk_sq_qpq_sub(),
				shown: sq.quidProQuo.amaranth + sq.quidProQuo.desi > 0,
				stats: [
					{ value: sq.quidProQuo.amaranth, label: m.campaign_tsk_sq_qpq_amaranth() },
					{ value: sq.quidProQuo.desi, label: m.campaign_tsk_sq_qpq_desi() }
				]
			},
			{
				title: m.campaign_tsk_sq_ruses_title(),
				sub: m.campaign_tsk_sq_ruses_sub(),
				shown: sq.ruses.wrongLeadsTotal > 0,
				stats: [
					{ value: sq.ruses.wrongLeadsTotal, label: m.campaign_tsk_sq_ruses_total() },
					{ value: sq.ruses.wrongLeadsMax, label: m.campaign_tsk_sq_ruses_max() }
				]
			}
		].filter((b) => b.shown);
	});
</script>

{#if blocks.length}
	<div class="flex flex-col gap-4">
		{#each blocks as b (b.title)}
			<div class="border-primary-100 dark:border-primary-800/60 border-b pb-4 last:border-0 last:pb-0">
				<SectionLabel variant="heading">
					{b.title} <span class="text-primary-400 text-xs font-normal">· {b.sub}</span>
				</SectionLabel>
				<StatNumbers rows={[b.stats]} />
			</div>
		{/each}
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tsk_sq_empty()}</WidgetEmpty>
{/if}
