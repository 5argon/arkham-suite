<!-- @component A PtC passport; where a dinner-party guest returns as an enemy, it heads with that VIP and their record here. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import { cardByCode } from '$lib/card-data';
	import type { WidgetContext } from '$lib/components/profile/_framework/widget-context';
	import { CountWithBreakdown, HoverTip, HoverTipState } from '$lib/components/profile/_primitives';
	import type { Tally } from '$lib/campaign/utils/tally';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let {
		ptc,
		ctx,
		empty = null,
		stats
	}: {
		ptc: CampaignPtc | null;
		ctx: WidgetContext;
		empty?: string | null;
		stats: Snippet;
	} = $props();

	const vip = $derived(ptc?.vipHelp[ctx.scenario ?? ''] ?? null);
	const name = $derived(vip ? (cardByCode(vip.asset)?.name ?? vip.asset) : '');
	const tip = new HoverTipState();
</script>

{#snippet record(label: string, hint: string, t: Tally, tone: string)}
	<span class="inline-flex items-center gap-1">
		<span
			role="note"
			class="text-primary-500 cursor-default"
			onmouseenter={(e) => tip.showText(hint, e)}
			onmouseleave={tip.hide}>{label}</span
		>
		<CountWithBreakdown value="×{t.total}" tally={t} class="{tone} font-semibold tabular-nums" />
	</span>
{/snippet}

<ScenarioInfo
	{ctx}
	{empty}
	{stats}
	headerCards={vip
		? [
				{ code: vip.asset, label: name, objectTop: true },
				{ code: vip.enemy, label: name, tone: 'danger', objectTop: true }
			]
		: []}
>
	{#snippet headerMeta()}
		{#if vip}
			<p class="text-sm font-semibold text-black dark:text-white">{name}</p>
			{#if !ctx.logOnly}
				<div class="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
					{@render record(
						m.campaign_ptc_vip_bonus_label(),
						m.campaign_ptc_vip_bonus_tip({ name }),
						vip.bonus,
						'text-secondary-700 dark:text-secondary-300'
					)}
					{@render record(
						m.campaign_ptc_vip_slain_here_label(),
						m.campaign_ptc_vip_slain_here_tip({ name }),
						vip.slainHere,
						'text-primary-700 dark:text-primary-300'
					)}
				</div>
			{/if}
		{/if}
	{/snippet}
</ScenarioInfo>
<HoverTip {tip} />
