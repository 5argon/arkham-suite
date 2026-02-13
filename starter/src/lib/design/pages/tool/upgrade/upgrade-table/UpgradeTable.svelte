<script lang="ts">
	import type { CardResolver } from '@5argon/arkham-kohaku';
	import type { GlobalSettings } from '$lib/proto/generated/global_settings';
	import type { Row } from '$lib/tool/upgrade/interface';
	import type {
		TableRowActionEvents,
		TableRowEditEvents
	} from '$lib/tool/upgrade/upgrade-table/row-events';
	import { calculateXps } from '$lib/tool/upgrade/upgrade-table/xp-calculate';

	import RowDropTarget from './RowDropTarget.svelte';
	import UpgradeRow from './UpgradeRow.svelte';

	interface Props {
		rows: Row[];
		rowActionEvents: TableRowActionEvents;
		rowEditEvents: TableRowEditEvents;
		cardResolver: CardResolver;
		gs: GlobalSettings;
		onRowDragMove: (from: number, to: number) => void;
		viewMode: boolean;
	}

	let { rows, rowActionEvents, rowEditEvents, cardResolver, gs, onRowDragMove, viewMode }: Props =
		$props();

	let rowDragging = $state(false);
	let cx = $derived(calculateXps(cardResolver, rows, gs));
</script>

<div>
	<table class="upgrade-table">
		<thead>
			<tr class="header-row">
				{#if !viewMode}
					<th class="header-cell col-grip"></th>
					<th class="header-cell col-delete"></th>
				{/if}
				<th class="header-cell col-mark"></th>
				<th class="header-cell col-card"></th>
				<th class="header-cell col-arrow"></th>
				<th class="header-cell col-card"></th>
				{#if rows.length > 0}
					<th class="header-cell col-xp xp-header">Cost</th>
					<th class="header-cell col-xp xp-header">Total</th>
				{/if}
				{#if !viewMode}
					<th class="header-cell col-actions"></th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#if rows.length > 0}
				<RowDropTarget
					showDropTarget={rowDragging}
					onDropSwap={(from) => {
						onRowDragMove(from, 0);
					}}
				/>
			{/if}
			{#each rows as r, i (r)}
				<UpgradeRow
					index={i}
					{viewMode}
					{rowDragging}
					onRowDraggingChanged={(d) => {
						rowDragging = d;
					}}
					{cardResolver}
					row={r}
					calculatedXp={cx.costs[i]}
					calculatedCumulativeXp={cx.cumulatives[i]}
					rowActionEvents={{
						onDelete: () => {
							rowActionEvents.onDelete(i);
						},
						onDeleteLeft: () => {
							rowActionEvents.onDeleteLeft(i);
						},
						onDeleteRight: () => {
							rowActionEvents.onDeleteRight(i);
						}
					}}
					rowEditEvents={{
						onMarkChanged: (n) => {
							rowEditEvents.onMarkChanged(i, n);
						},
						onLeftChanged: (n) => {
							rowEditEvents.onLeftChanged(i, n);
						},
						onRightChanged: (n) => {
							rowEditEvents.onRightChanged(i, n);
						},
						onXpChanged: (n) => {
							rowEditEvents.onXpChanged(i, n);
						},
						onCarryoverXpChanged: (n) => {
							rowEditEvents.onCarryoverXpChanged(i, n);
						},
						onXpLockChanged: (n, c) => {
							rowEditEvents.onXpLockChanged(i, n, c);
						},
						onLoseFocus: () => {
							rowEditEvents.onLoseFocus(i);
						},
						onDividerChanged: (n) => {
							rowEditEvents.onDividerChanged(i, n);
						},
						onDividerTextChanged: (n) => {
							rowEditEvents.onDividerTextChanged(i, n);
						},
						onXpCumulativeLockChanged: (n, c) => {
							rowEditEvents.onXpCumulativeLockChanged(i, n, c);
						},
						onDropSwap: (a, b, c, d) => {
							rowEditEvents.onDropSwap(a, b, c, i, d);
						},
						onCustomizableCycle: (pdb) => {
							rowEditEvents.onCustomizationCycle(i, pdb);
						}
					}}
				/>
				{#if !viewMode}
					<RowDropTarget
						showDropTarget={rowDragging}
						onDropSwap={(from) => {
							if (from > i) {
								onRowDragMove(from, i + 1);
							} else {
								onRowDragMove(from, i);
							}
						}}
					/>
				{/if}
			{/each}
		</tbody>
	</table>
</div>

<style>
	.upgrade-table {
		width: fit-content;
		border-collapse: collapse;
		table-layout: fixed;
		margin: 0 auto;
	}

	/* Fixed column widths using specific class names */
	.col-grip {
		width: 40px;
	}

	.col-delete {
		width: 40px;
	}

	.col-mark {
		width: 35px;
	}

	.col-card {
		width: 320px;
	}

	.col-arrow {
		width: 30px;
	}

	.col-xp {
		width: 55px;
	}

	.col-actions {
		width: 40px;
	}

	.header-row {
		border-bottom: 1px solid var(--color-primary-200);
	}

	:global(.dark) .header-row {
		border-bottom-color: var(--color-primary-700);
	}

	.header-cell {
		padding: 4px;
		text-align: center;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-primary-600);
	}

	:global(.dark) .header-cell {
		color: var(--color-primary-400);
	}

	.xp-header {
		white-space: nowrap;
	}
</style>
