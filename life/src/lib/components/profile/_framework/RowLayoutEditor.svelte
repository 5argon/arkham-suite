<!--
@component
The row-positioning editor for one list of layout rows (a shared pane, or a
campaign's detail page). Rows are reordered WITHOUT drag-and-drop:

  • Every GAP between rows — and before the first / after the last — carries a
    small "+" button that opens a modal to insert a full-width or split row there.
  • Each row has a MOVE button. Pressing it highlights the row and enters
    "choose a destination" mode, where every gap turns into a "Move here" target;
    clicking one drops the row at that gap (or Cancel to abort).

Each slot shows its widget label + a clear button + optional inline config, or an
empty "Select widget" placeholder that opens the WidgetPickerModal.

Controlled component: it never mutates `rows`; every change is emitted as a fresh
array via `onChange`, which the owner stores. Rows are keyed by a stable transient
uid so moving/deleting never mis-associates config inputs.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { BorderedContainer, Button, FaIcon, FaIconType, Modal } from '@5argon/arkham-life-ui';
	import { widgetLabel } from '$lib/campaign/profile-widgets';
	import type { WidgetSlot } from '$lib/campaign/profile-settings';
	import WidgetPickerModal from '$lib/components/profile/_framework/WidgetPickerModal.svelte';
	import {
		deleteRow,
		insertRowAt,
		moveRowTo,
		placedIds,
		setSlot,
		swapSplit,
		type EditorRow,
		type SlotSide
	} from '$lib/components/profile/_framework/row-layout';

	let {
		rows,
		allowedIds,
		onChange,
		renderConfig
	}: {
		rows: EditorRow[];
		/** Widget ids the picker may offer for this list. */
		allowedIds: string[];
		onChange: (rows: EditorRow[]) => void;
		/** Optional per-slot inline config (count selector, investigator filters, …). */
		renderConfig?: Snippet<[{ rowIndex: number; side: SlotSide; slot: WidgetSlot }]>;
	} = $props();

	const placed = $derived(placedIds(rows));

	let pickerTarget = $state<{ rowIndex: number; side: SlotSide } | null>(null);
	/** Gap index the "add a row" modal is targeting (null = closed). */
	let addGap = $state<number | null>(null);
	/** Row index being moved (null = not in move mode). */
	let moveFrom = $state<number | null>(null);

	function selectWidget(id: string) {
		if (pickerTarget) onChange(setSlot(rows, pickerTarget.rowIndex, pickerTarget.side, { id }));
	}
	function addRow(kind: 'full' | 'split') {
		if (addGap !== null) onChange(insertRowAt(rows, addGap, kind));
		addGap = null;
	}
	function dropAt(gap: number) {
		if (moveFrom !== null) onChange(moveRowTo(rows, moveFrom, gap));
		moveFrom = null;
	}
</script>

{#snippet slotView(rowIndex: number, side: SlotSide, slot: WidgetSlot | null)}
	{#if slot}
		<div
			class="border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-800 rounded border p-2"
		>
			<div class="flex items-center justify-between gap-2">
				<span class="truncate font-medium text-black dark:text-white">{widgetLabel(slot.id)}</span>
				<Button
					label={m.framework_remove_widget()}
					hideLabel
					danger
					icon={FaIconType.Delete}
					onClick={() => onChange(setSlot(rows, rowIndex, side, null))}
				/>
			</div>
			{#if renderConfig}{@render renderConfig({ rowIndex, side, slot })}{/if}
		</div>
	{:else}
		<button
			type="button"
			class="border-primary-300 dark:border-primary-600 text-primary-500 hover:border-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-400 flex w-full items-center justify-center gap-2 rounded border border-dashed px-3 py-4 text-sm transition"
			onclick={() => (pickerTarget = { rowIndex, side })}
		>
			<FaIcon icon={FaIconType.Plus} />
			{m.framework_select_widget()}
		</button>
	{/if}
{/snippet}

{#snippet gap(index: number)}
	{#if moveFrom !== null}
		<!-- destination targets while moving a row (the row's own two gaps are no-ops) -->
		<div class="py-1.5">
			<button
				type="button"
				disabled={index === moveFrom || index === moveFrom + 1}
				class="border-secondary-400 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-500/10 disabled:border-primary-300 disabled:text-primary-400 dark:disabled:border-primary-600 flex w-full items-center justify-center gap-2 rounded border border-dashed py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
				onclick={() => dropAt(index)}
			>
				{#if index === moveFrom || index === moveFrom + 1}
					{m.framework_current_position()}
				{:else}
					<FaIcon icon={FaIconType.ArrowDownAdd} />
					{m.framework_move_here()}
				{/if}
			</button>
		</div>
	{:else}
		<div class="flex justify-center py-1.5">
			<button
				type="button"
				aria-label={m.framework_add_row_here()}
				class="text-primary-400 hover:text-secondary-600 dark:hover:text-secondary-400 hover:border-secondary-400 border-primary-200 dark:border-primary-700 flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1 text-xs font-medium transition"
				onclick={() => (addGap = index)}
			>
				<FaIcon icon={FaIconType.Plus} />
				{m.framework_add_row()}
			</button>
		</div>
	{/if}
{/snippet}

{#if moveFrom !== null}
	<div
		class="border-secondary-400 bg-secondary-500/10 mb-3 flex items-center justify-between gap-3 rounded border px-3 py-2"
	>
		<span class="text-secondary-800 dark:text-secondary-200 text-sm font-medium">
			{m.framework_moving_row_hint()}
		</span>
		<Button label={m.framework_cancel()} onClick={() => (moveFrom = null)} />
	</div>
{/if}

{#if rows.length === 0}
	<p class="text-primary-500 mb-1 text-sm">
		{m.framework_no_rows_yet()}
	</p>
{/if}

<div>
	{@render gap(0)}
	{#each rows as row, i (row._uid)}
		<div class={i === moveFrom ? 'ring-secondary-500 rounded-lg ring-2' : ''}>
			<BorderedContainer>
				<div class="p-3">
					<div class="mb-2 flex items-center justify-between gap-2">
						<span class="text-primary-500 text-xs font-semibold tracking-wide uppercase">
							{row.kind === 'full' ? m.framework_full_width_row() : m.framework_split_row()}
						</span>
						{#if moveFrom === null}
							<div class="flex gap-1">
								<Button
									label={m.framework_move_row()}
									hideLabel
									icon={FaIconType.Grip}
									onClick={() => (moveFrom = i)}
								/>
								{#if row.kind === 'split'}
									<Button
										label={m.framework_swap_sides()}
										hideLabel
										icon={FaIconType.Swap}
										onClick={() => onChange(swapSplit(rows, i))}
									/>
								{/if}
								<Button
									label={m.framework_delete_row()}
									hideLabel
									danger
									icon={FaIconType.Delete}
									onClick={() => onChange(deleteRow(rows, i))}
								/>
							</div>
						{/if}
					</div>
					<div class={moveFrom !== null ? 'pointer-events-none opacity-60' : ''}>
						{#if row.kind === 'full'}
							{@render slotView(i, 'full', row.slot)}
						{:else}
							<div class="grid grid-cols-2 gap-3">
								{@render slotView(i, 'left', row.left)}
								{@render slotView(i, 'right', row.right)}
							</div>
						{/if}
					</div>
				</div>
			</BorderedContainer>
		</div>
		{@render gap(i + 1)}
	{/each}
</div>

<WidgetPickerModal
	isOpen={pickerTarget !== null}
	onClose={() => (pickerTarget = null)}
	candidateIds={allowedIds}
	placedIds={placed}
	target={pickerTarget}
	onSelect={selectWidget}
/>

<Modal isOpen={addGap !== null} onClose={() => (addGap = null)} maxWidth="sm" title={m.framework_add_a_row()}>
	<div class="flex flex-col gap-2 pb-4">
		<button
			type="button"
			class="border-primary-300 dark:border-primary-600 hover:border-secondary-500 dark:bg-primary-800 flex flex-col gap-0.5 rounded border px-3 py-2.5 text-left transition"
			onclick={() => addRow('full')}
		>
			<span class="font-medium text-black dark:text-white">{m.framework_full_width_row()}</span>
			<span class="text-primary-500 text-xs">{m.framework_full_width_row_desc()}</span>
		</button>
		<button
			type="button"
			class="border-primary-300 dark:border-primary-600 hover:border-secondary-500 dark:bg-primary-800 flex flex-col gap-0.5 rounded border px-3 py-2.5 text-left transition"
			onclick={() => addRow('split')}
		>
			<span class="font-medium text-black dark:text-white">{m.framework_split_row()}</span>
			<span class="text-primary-500 text-xs">{m.framework_split_row_desc()}</span>
		</button>
	</div>
</Modal>
