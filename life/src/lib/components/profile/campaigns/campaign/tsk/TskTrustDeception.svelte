<!-- @component The epilogue tally: Foundation Trust vs Cell Deception, its high scores, verdicts, and how often each entry was recorded. -->
<script lang="ts">
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk/profile';
	import { TSK_CELL_DECEPTION, TSK_FOUNDATION_TRUST, type TallyEntry } from '$lib/campaign/campaigns/tsk/rules';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers, WidgetEmpty, type Stat } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import TskCountList from './TskCountList.svelte';
	import { tskTallyLabel } from './tsk-labels';

	let { blob: tsk }: CampaignWidgetProps<CampaignTsk> = $props();

	const entries = (list: TallyEntry[], counts: Record<string, number> | undefined) =>
		list.map((e) => ({ id: e.id, label: tskTallyLabel(e), count: counts?.[e.id] ?? 0 }));
	const trustRows = $derived(entries(TSK_FOUNDATION_TRUST, tsk?.foundationTrustTally));
	const deceptionRows = $derived(entries(TSK_CELL_DECEPTION, tsk?.cellDeceptionTally));

	// A lead only counts when positive; otherwise a dash.
	const lead = (n: number) => (n > 0 ? n : null);
	const highs = $derived.by((): Stat[] => {
		const stat = (value: number | null | undefined, label: string, shown: (n: number) => number | null = (n) => n) =>
			value != null ? [{ value: shown(value), label }] : [];
		return [
			...stat(tsk?.foundationTrustMax, m.campaign_tsk_ft_highest()),
			...stat(tsk?.cellDeceptionMax, m.campaign_tsk_cd_highest()),
			...stat(tsk?.maxTrustMargin, m.campaign_tsk_trust_margin(), lead),
			...stat(tsk?.maxDeceptionMargin, m.campaign_tsk_deception_margin(), lead)
		];
	});
	const anyData = $derived(
		!!tsk &&
			(trustRows.some((r) => r.count > 0) ||
				deceptionRows.some((r) => r.count > 0) ||
				tsk.foundationTrustMax != null ||
				tsk.cellDeceptionMax != null ||
				tsk.epilogue.permanent > 0 ||
				tsk.epilogue.dismantled > 0)
	);
</script>

{#if tsk && anyData}
	<div class="flex flex-col gap-3">
		<StatNumbers
			rows={[
				highs,
				[
					{ value: tsk.epilogue.permanent, label: m.campaign_tsk_outcome_permanent() },
					{ value: tsk.epilogue.dismantled, label: m.campaign_tsk_outcome_dismantled() }
				]
			]}
		/>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<TskCountList rows={trustRows}>
				{#snippet heading()}{m.campaign_tsk_ft_heading()}{/snippet}
			</TskCountList>
			<TskCountList rows={deceptionRows}>
				{#snippet heading()}{m.campaign_tsk_cd_heading()}{/snippet}
			</TskCountList>
		</div>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tsk_ftcd_empty()}</WidgetEmpty>
{/if}
