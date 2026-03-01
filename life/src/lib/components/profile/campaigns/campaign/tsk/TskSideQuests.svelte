<!--
@component
TSK bespoke widget — Side Quests. The optional mini-quest stops, every fact derived purely from the
campaign log (a recorded note, its crossed-off status, or a count):
  • Special Delivery (Lagos ↔ Tokyo) — picked up the intel, and whether it was delivered (the note is
    crossed off; +1 to a chaos token).
  • Strange Architecture (Bombay ↔ Stockholm) — noticed the first building, and the second-building
    déjà vu (crossed off; +2 XP).
  • Quid Pro Quo (Foundation offices) — the Amaranth / Desi intel taken.
  • Ruses and Reclamation — only its persistent trace, the wrong leads chased (the theft + recovery
    are hidden "Remember that…" notes, so nothing more is log-derivable).
Each block appears only when it has data. Completion counts hover to a per-difficulty breakdown.
-->
<script lang="ts">
	import type { CampaignTsk } from '$lib/campaign/tsk-profile';
	import * as m from '$lib/paraglide/messages.js';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';

	let { tsk }: { tsk: CampaignTsk | null } = $props();

	const sq = $derived(tsk?.sideQuests ?? null);

	interface Block {
		title: string;
		sub: string;
		stats: Stat[];
	}
	const blocks = $derived.by((): Block[] => {
		if (!sq) return [];
		const out: Block[] = [];
		if (sq.delivery.pickedUp > 0)
			out.push({
				title: m.campaign_tsk_sq_delivery_title(),
				sub: m.campaign_tsk_sq_delivery_sub(),
				stats: [
					{ value: sq.delivery.pickedUp, label: m.campaign_tsk_sq_delivery_pickedup() },
					{
						value: sq.delivery.delivered.total,
						label: m.campaign_tsk_sq_delivery_delivered(),
						byTier: sq.delivery.delivered.byTier
					}
				]
			});
		if (sq.architecture.noticed > 0)
			out.push({
				title: m.campaign_tsk_sq_arch_title(),
				sub: m.campaign_tsk_sq_arch_sub(),
				stats: [
					{ value: sq.architecture.noticed, label: m.campaign_tsk_sq_arch_noticed() },
					{
						value: sq.architecture.completed.total,
						label: m.campaign_tsk_sq_arch_completed(),
						byTier: sq.architecture.completed.byTier
					}
				]
			});
		if (sq.quidProQuo.amaranth > 0 || sq.quidProQuo.desi > 0)
			out.push({
				title: m.campaign_tsk_sq_qpq_title(),
				sub: m.campaign_tsk_sq_qpq_sub(),
				stats: [
					{ value: sq.quidProQuo.amaranth, label: m.campaign_tsk_sq_qpq_amaranth() },
					{ value: sq.quidProQuo.desi, label: m.campaign_tsk_sq_qpq_desi() }
				]
			});
		if (sq.ruses.wrongLeadsTotal > 0)
			out.push({
				title: m.campaign_tsk_sq_ruses_title(),
				sub: m.campaign_tsk_sq_ruses_sub(),
				stats: [
					{ value: sq.ruses.wrongLeadsTotal, label: m.campaign_tsk_sq_ruses_total() },
					{ value: sq.ruses.wrongLeadsMax, label: m.campaign_tsk_sq_ruses_max() }
				]
			});
		return out;
	});
</script>

{#if blocks.length}
	<div class="flex flex-col gap-4">
		{#each blocks as b (b.title)}
			<div
				class="border-primary-100 dark:border-primary-800/60 border-b pb-4 last:border-0 last:pb-0"
			>
				<div class="mb-2 flex flex-wrap items-baseline gap-x-2">
					<span class="font-heading text-primary-900 dark:text-primary-100">{b.title}</span>
					<span class="text-primary-400 text-xs">· {b.sub}</span>
				</div>
				<StatNumbers rows={[b.stats]} />
			</div>
		{/each}
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tsk_sq_empty()}</p>
{/if}
