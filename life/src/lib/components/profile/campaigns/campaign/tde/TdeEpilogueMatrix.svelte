<!--
@component
TDE shared widget — "The Epilogue" interconnected matrix. The official 4×4 grid mirrored:
rows = the Dream-Quest's final outcome, columns = the Web of Dreams' final outcome → Epilogue
1–16, coloured by verdict (full win / partial "averted one form of destruction, but not the
other" ≈ loss / total loss). Each interconnected play lights its cell. This is the combined
win/loss TRUTH for interconnected play — distinct from each side's single-sided endings.
Needs BOTH axes (own outcome + the linked sibling outcome from the Linked Campaign Log).
-->
<script lang="ts">
	import {
		epilogueNumber,
		epilogueVerdict,
		TDE_MATRIX_ROWS,
		TDE_MATRIX_COLS,
		type CampaignTdeShared
	} from '$lib/campaign/campaigns/tde-shared';
	import { HoverTooltip } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';

	let { shared }: { shared: CampaignTdeShared | null } = $props();
	const mx = $derived(shared?.matrix);
	const hasData = $derived(!!mx && mx.resolved + mx.awaitingLinked > 0);

	const ROW_LABEL: Record<string, () => string> = {
		nyarlathoteps_invasion_has_begun: m.campaign_tde_matrix_row_invasion,
		dreamers_awoke: m.campaign_tde_matrix_row_awoke,
		dreamers_stayed_in_dreamlands_forever: m.campaign_tde_matrix_row_stayed,
		dreamers_traveled_beneath_the_monastery: m.campaign_tde_matrix_row_monastery
	};
	const COL_LABEL: Record<string, () => string> = {
		bridge_was_completed: m.campaign_tde_matrix_col_completed,
		returned_to_reality: m.campaign_tde_matrix_col_returned,
		never_escaped: m.campaign_tde_matrix_col_never,
		still_in_the_dreamlands: m.campaign_tde_matrix_col_still
	};
	const VERDICT_CLS: Record<string, string> = {
		win: 'bg-rogue-100 text-rogue-800 ring-rogue-400 dark:bg-rogue-900/50 dark:text-rogue-200',
		partial: 'bg-amber-100 text-amber-800 ring-amber-400 dark:bg-amber-900/50 dark:text-amber-200',
		loss: 'bg-survivor-100 text-survivor-800 ring-survivor-400 dark:bg-survivor-900/50 dark:text-survivor-200'
	};
	const VERDICT_LABEL: Record<string, () => string> = {
		win: m.campaign_tde_matrix_win,
		partial: m.campaign_tde_matrix_partial,
		loss: m.campaign_tde_matrix_loss
	};

	// ── one shared tooltip for every cell ────────────────────────────────────
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipTitle = $state('');
	let tipDetail = $state('');
	function showTip(title: string, detail: string, e: MouseEvent) {
		tipTitle = title;
		tipDetail = detail;
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideTip = () => (tipVisible = false);
</script>

{#if hasData && mx}
	<div class="@container">
		<div class="mx-auto grid w-fit grid-cols-[auto_repeat(4,minmax(0,1fr))] gap-1 text-center">
			<!-- header row: empty corner + column labels -->
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
				{#each TDE_MATRIX_COLS as _col, ci (ci)}
					{@const n = epilogueNumber(ri, ci)}
					{@const verdict = epilogueVerdict(n)}
					{@const count = mx.cells[n] ?? 0}
					<div
						role="img"
						aria-label="Epilogue {n} — {VERDICT_LABEL[verdict]()}{count > 0
							? ` ×${count}`
							: ''}"
						class="relative flex aspect-square cursor-default items-center justify-center rounded text-sm font-bold tabular-nums {VERDICT_CLS[
							verdict
						]} {count > 0 ? 'ring-2' : 'opacity-30'}"
						onmouseenter={(e) =>
							showTip(
								m.campaign_tde_matrix_cell({ n }),
								`${VERDICT_LABEL[verdict]()}${count > 0 ? ` · ×${count}` : ''}`,
								e
							)}
						onmouseleave={hideTip}
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
		<p class="text-primary-500 mt-3 text-center text-xs">{m.campaign_tde_matrix_note()}</p>
		{#if mx.awaitingLinked > 0}
			<p class="mt-1 text-center text-xs text-amber-600 dark:text-amber-400">
				{m.campaign_tde_matrix_awaiting({ count: mx.awaitingLinked })}
			</p>
		{/if}
		{#if mx.killedByCats > 0}
			<p class="text-primary-500 mt-1 text-center text-xs">
				{m.campaign_tde_matrix_cats({ count: mx.killedByCats })}
			</p>
		{/if}
	</div>

	<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
		<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">
			<span class="font-semibold">{tipTitle}</span>
			{#if tipDetail}
				<br />
				<span class="text-neutral-600 dark:text-neutral-300">{tipDetail}</span>
			{/if}
		</span>
	</HoverTooltip>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tde_matrix_empty()}</p>
{/if}
