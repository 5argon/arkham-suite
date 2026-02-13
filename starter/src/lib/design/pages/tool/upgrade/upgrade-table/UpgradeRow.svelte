<script lang="ts" module>
	export const rowDragPrefix = 'row';
</script>

<script lang="ts">
	import { placeholderCard, type Row } from '$lib/tool/upgrade/interface';
	import type { RowActionEvents, RowEditEvents } from '$lib/tool/upgrade/upgrade-table/row-events';
	import { type CardResolver } from '@5argon/arkham-kohaku';
	import { CardLine, FaIcon, FaIconType } from '@5argon/arkham-life-ui';

	import CardBlockUpDown from './CardBlockUpDown.svelte';
	import EditableNumberCell from './EditableNumberCell.svelte';
	import EditableSmallCell from './EditableSmallCell.svelte';
	import GreyEmpty from './GreyEmpty.svelte';
	import HeaderRow from './HeaderRow.svelte';
	import RowActionBack from './RowActionBack.svelte';
	import RowActionFront from './RowActionFront.svelte';
	import UpgradeDivider from './UpgradeDivider.svelte';

	interface Props {
		index: number;
		cardResolver: CardResolver;
		row: Row;
		calculatedXp: number;
		calculatedCumulativeXp: number;
		rowActionEvents: RowActionEvents;
		rowEditEvents: RowEditEvents;
		rowDragging?: boolean;
		onRowDraggingChanged: (dragging: boolean) => void;
		viewMode: boolean;
	}

	let {
		index,
		cardResolver,
		row,
		calculatedXp,
		calculatedCumulativeXp,
		rowActionEvents,
		rowEditEvents,
		rowDragging = false,
		onRowDraggingChanged,
		viewMode
	}: Props = $props();

	let leftCard = $derived(
		row.left !== null
			? (() => {
					try {
						return cardResolver.resolve(row.left);
					} catch {
						return null;
					}
				})()
			: null
	);
	let rightCard = $derived(
		row.right !== null
			? (() => {
					try {
						return cardResolver.resolve(row.right);
					} catch {
						return null;
					}
				})()
			: null
	);

	let boldArrow = $derived(
		leftCard !== null &&
			rightCard !== null &&
			leftCard.name === rightCard.name &&
			(leftCard.xp ?? 0) < (rightCard.xp ?? 0)
	);

	let onlyRightCard = $derived(rightCard !== null && leftCard === null);
	let transitionIcon = $derived(
		onlyRightCard ? FaIconType.UpgradePlannerAdd : FaIconType.UpgradePlannerUpgradeTo
	);

	let customizationBoxes = $derived.by(() => {
		if (row.custom && rightCard !== null && rightCard.customizationOptions) {
			const removedZero = rightCard.customizationOptions.filter((x) => x.xp > 0);
			if (row.customizationChoice < removedZero.length) {
				return removedZero[row.customizationChoice].xp;
			}
		}
		return 0;
	});

	// This gives a ghost image of an entire row.
	let rowDraggable = $state(false);

	function dragStartHandler(e: DragEvent & { currentTarget: HTMLTableRowElement }) {
		// This drag start can override the individual card dragging EVEN THOUGH
		// "draggable" is on/off dynamically. We must on/off this one as well.
		if (e.dataTransfer !== null) {
			e.dataTransfer.setData('text/plain', rowDragPrefix + ',' + index);
		}
		onRowDraggingChanged(true);
	}

	function dragEndHander() {
		onRowDraggingChanged(false);
	}
</script>

{#if row.divider}
	<HeaderRow />
{/if}
<!-- Must not have preventDefault on the dragstart below, otherwise it disables dragging of the individual card
nested inside this table row. -->
<tr
	class={viewMode
		? 'border-b border-primary-200 dark:border-primary-700'
		: 'bg-primary-100 dark:bg-primary-900 rounded'}
	class:divider-row={row.divider}
	draggable={rowDraggable ? 'true' : false}
	ondragend={rowDraggable ? dragEndHander : undefined}
	ondragstart={rowDraggable ? dragStartHandler : undefined}
	tabindex={index}
>
	{#if !viewMode}
		<RowActionFront
			onDelete={rowActionEvents.onDelete}
			hoveringOnGrip={(hovering) => {
				rowDraggable = hovering;
			}}
		/>
	{/if}
	{#if row.divider}
		<td class="divider-cell" colspan={5}>
			<UpgradeDivider
				{viewMode}
				text={row.dividerText}
				onTextChanged={(t) => {
					rowEditEvents.onDividerTextChanged(t);
				}}
			/>
		</td>
		<td class="xp-cell col-xp-total">
			<EditableNumberCell
				currentNumber={row.dividerXpCumulativeUnlock ? row.carryoverXp : calculatedCumulativeXp}
				editingLevel={viewMode
					? 'just-text'
					: row.dividerXpCumulativeUnlock
						? 'editable'
						: 'greyed-out'}
				onEndEdit={rowEditEvents.onCarryoverXpChanged}
				suffixText="XP"
			/>
		</td>
	{:else}
		<td class="mark-cell col-mark">
			{#if viewMode}
				<EditableSmallCell
					justText={true}
					currentText={row.mark}
					onChange={rowEditEvents.onMarkChanged}
				/>
			{:else}
				<EditableSmallCell
					justText={false}
					currentText={row.mark}
					onChange={rowEditEvents.onMarkChanged}
				/>
			{/if}
		</td>
		<td class="card-cell col-left-card">
			{#if leftCard !== null}
				{#if viewMode}
					<CardLine card={leftCard} />
				{:else}
					<CardBlockUpDown
						card={leftCard}
						cardId={leftCard.code}
						customizable={leftCard.customizationOptions !== undefined}
						onClickDelete={rowActionEvents.onDeleteLeft}
						showDeleteButtons={true}
						onDropSwap={(fi, fr, fc) => {
							rowEditEvents.onDropSwap(fi, fr, fc, false);
						}}
						{index}
						right={false}
						disableHoverEffects={rowDragging}
					/>
				{/if}
			{:else if !viewMode}
				{#if row.left === placeholderCard}
					<CardBlockUpDown
						card={null}
						cardId={placeholderCard}
						onClickDelete={rowActionEvents.onDeleteLeft}
						showDeleteButtons={true}
						{index}
						right={false}
						onDropSwap={(fi, fr, fc) => {
							rowEditEvents.onDropSwap(fi, fr, fc, false);
						}}
						disableHoverEffects={rowDragging}
					/>
				{:else}
					<GreyEmpty
						onDropSwap={(fi, fr, fc) => {
							rowEditEvents.onDropSwap(fi, fr, fc, false);
						}}
						disableHoverEffects={rowDragging}
					/>
				{/if}
			{/if}
		</td>
		<td class="arrow-cell col-arrow">
			<div
				class={boldArrow
					? 'text-survivor-600 dark:text-survivor-300'
					: 'text-primary-600 dark:text-primary-300'}
				class:bold-arrow={boldArrow}
			>
				<FaIcon icon={transitionIcon} />
			</div>
		</td>
		<td class="card-cell col-right-card">
			{#if rightCard !== null}
				{#if viewMode}
					<CardLine card={rightCard} />
				{:else}
					<CardBlockUpDown
						card={rightCard}
						cardId={rightCard.code}
						{viewMode}
						customizable={rightCard.customizationOptions !== undefined}
						checkedBoxes={row.custom ? customizationBoxes : 0}
						isCustomActive={row.custom}
						customizationChoice={row.customizationChoice}
						customizationCount={rightCard.customizationOptions?.filter((x) => x.xp > 0).length ?? 0}
						customizationText={rightCard.customizationOptions?.filter((x) => x.xp > 0)[
							row.customizationChoice
						]?.text}
						onClickDelete={rowActionEvents.onDeleteRight}
						showDeleteButtons={!viewMode}
						{index}
						right={true}
						onDropSwap={(fi, fr, fc) => {
							rowEditEvents.onDropSwap(fi, fr, fc, true);
						}}
						onCustomizableCycle={() => {
							rowEditEvents.onCustomizableCycle(cardResolver);
						}}
						disableHoverEffects={rowDragging}
					/>
				{/if}
			{:else if !viewMode}
				{#if row.right === placeholderCard}
					<CardBlockUpDown
						card={null}
						cardId={placeholderCard}
						onClickDelete={rowActionEvents.onDeleteRight}
						showDeleteButtons={true}
						{index}
						right={true}
						onDropSwap={(fi, fr, fc) => {
							rowEditEvents.onDropSwap(fi, fr, fc, true);
						}}
						disableHoverEffects={rowDragging}
					/>
				{:else}
					<GreyEmpty
						onDropSwap={(fi, fr, fc) => {
							rowEditEvents.onDropSwap(fi, fr, fc, true);
						}}
						disableHoverEffects={rowDragging}
					/>
				{/if}
			{/if}
		</td>
		<td class="xp-cell col-xp-cost">
			<EditableNumberCell
				currentNumber={row.xpUnlock ? row.xp : calculatedXp}
				editingLevel={viewMode ? 'just-text' : row.xpUnlock ? 'editable' : 'greyed-out'}
				onEndEdit={rowEditEvents.onXpChanged}
				suffixText="XP"
			/>
		</td>
		<td class="xp-cell col-xp-total">
			<EditableNumberCell
				currentNumber={calculatedCumulativeXp}
				editingLevel={viewMode ? 'just-text' : 'greyed-out'}
				suffixText="XP"
			/>
		</td>
	{/if}
	{#if !viewMode}
		{#if row.divider}
			<RowActionBack
				xpLock={row.dividerXpCumulativeUnlock}
				onXpLockChanged={(e) => rowEditEvents.onXpCumulativeLockChanged(e, calculatedCumulativeXp)}
			/>
		{:else}
			<RowActionBack
				xpLock={row.xpUnlock}
				onXpLockChanged={(e) => rowEditEvents.onXpLockChanged(e, calculatedXp)}
			/>
		{/if}
	{/if}
</tr>

<style>
	.mark-cell {
		vertical-align: middle;
		padding: 2px 4px;
		white-space: nowrap;
	}

	.arrow-cell {
		vertical-align: middle;
		text-align: center;
		padding: 2px 4px;
		user-select: none;
		white-space: nowrap;
	}

	.xp-cell {
		vertical-align: middle;
		padding: 2px 4px;
		white-space: nowrap;
	}

	.bold-arrow {
		font-weight: bold;
	}
</style>
