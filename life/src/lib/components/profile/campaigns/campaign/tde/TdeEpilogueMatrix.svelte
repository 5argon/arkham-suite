<!-- @component The interconnected epilogue: the Dream-Quest's outcome by the Web of Dreams' outcome, lit per play. -->
<script lang="ts">
	import {
		epilogueNumber,
		epilogueVerdict,
		TDE_MATRIX_COLS,
		TDE_MATRIX_ROWS,
		type EpilogueVerdict
	} from '$lib/campaign/campaigns/tde-shared';
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		HoverTip,
		HoverTipState,
		StatNumbers,
		WidgetEmpty
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob }: CampaignWidgetProps<CampaignTdea | CampaignTdeb> = $props();

	const mx = $derived(blob?.shared.matrix);

	const ROW_LABEL: Record<(typeof TDE_MATRIX_ROWS)[number], () => string> = {
		nyarlathoteps_invasion_has_begun: m.campaign_tde_matrix_row_invasion,
		dreamers_awoke: m.campaign_tde_matrix_row_awoke,
		dreamers_stayed_in_dreamlands_forever: m.campaign_tde_matrix_row_stayed,
		dreamers_traveled_beneath_the_monastery: m.campaign_tde_matrix_row_monastery
	};
	const COL_LABEL: Record<(typeof TDE_MATRIX_COLS)[number], () => string> = {
		bridge_was_completed: m.campaign_tde_matrix_col_completed,
		returned_to_reality: m.campaign_tde_matrix_col_returned,
		never_escaped: m.campaign_tde_matrix_col_never,
		still_in_the_dreamlands: m.campaign_tde_matrix_col_still
	};
	const VERDICT_CLS: Record<EpilogueVerdict, string> = {
		win: 'bg-rogue-100 text-rogue-800 ring-rogue-400 dark:bg-rogue-900/50 dark:text-rogue-200',
		partial: 'bg-amber-100 text-amber-800 ring-amber-400 dark:bg-amber-900/50 dark:text-amber-200',
		loss: 'bg-survivor-100 text-survivor-800 ring-survivor-400 dark:bg-survivor-900/50 dark:text-survivor-200'
	};
	const VERDICT_LABEL: Record<EpilogueVerdict, () => string> = {
		win: m.campaign_tde_matrix_win,
		partial: m.campaign_tde_matrix_partial,
		loss: m.campaign_tde_matrix_loss
	};

	const cellDetail = (verdict: EpilogueVerdict, count: number) =>
		`${VERDICT_LABEL[verdict]()}${count > 0 ? ` · ×${count}` : ''}`;

	const tip = new HoverTipState();
</script>

{#if mx && mx.resolved + mx.awaitingLinked > 0}
	<div class="@container space-y-4">
		<div class="mx-auto grid w-fit grid-cols-[auto_repeat(4,minmax(0,1fr))] gap-1 text-center">
			<div></div>
			{#each TDE_MATRIX_COLS as col (col)}
				<div class="text-primary-500 px-1 pb-1 text-[0.6rem] leading-tight font-medium @lg:text-xs">
					{COL_LABEL[col]()}
				</div>
			{/each}
			{#each TDE_MATRIX_ROWS as row, ri (row)}
				<div
					class="text-primary-500 flex items-center pr-1 text-right text-[0.6rem] leading-tight font-medium @lg:text-xs"
				>
					{ROW_LABEL[row]()}
				</div>
				{#each TDE_MATRIX_COLS as col, ci (col)}
					{@const n = epilogueNumber(ri, ci)}
					{@const verdict = epilogueVerdict(n)}
					{@const count = mx.cells[n] ?? 0}
					<div
						role="img"
						aria-label="{m.campaign_tde_matrix_cell({ n })} — {cellDetail(verdict, count)}"
						class="relative flex aspect-square cursor-default items-center justify-center rounded text-sm font-bold tabular-nums {VERDICT_CLS[
							verdict
						]} {count > 0 ? 'ring-2' : 'opacity-30'}"
						onmouseenter={(e) =>
							tip.show(m.campaign_tde_matrix_cell({ n }), cellDetail(verdict, count), e)}
						onmouseleave={tip.hide}
					>
						{n}
						{#if count > 0}
							<span
								class="bg-primary-700 absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold text-white"
								>{count}</span
							>
						{/if}
					</div>
				{/each}
			{/each}
		</div>
		<StatNumbers
			rows={[
				[
					{ value: mx.awaitingLinked, label: m.campaign_tde_matrix_awaiting() },
					{ value: mx.killedByCats, label: m.campaign_tde_matrix_cats() }
				]
			]}
		/>
	</div>
	<HoverTip {tip} />
{:else}
	<WidgetEmpty>{m.campaign_tde_matrix_empty()}</WidgetEmpty>
{/if}
