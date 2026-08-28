<!--
@component
Read-only rendering of an Upgrade Planner plan: the same table the planner
shows in its view mode. Used by the planner itself (with an Edit button) and
anywhere a saved plan string is displayed, such as starter deck pages.
-->
<script lang="ts">
	import { BorderedContainer, Button, FaIconType } from '@5argon/arkham-life-ui';
	import { type Card, CardResolver, type TabooLists } from '@5argon/arkham-kohaku';

	import { GlobalSettings_PipStyle } from '$lib/proto/generated/global_settings';
	import type { RestoreResult } from '$lib/tool/script/export/proto-string-restore';
	import { getLatestTaboo } from '$lib/tool/upgrade/taboo-helper';
	import type {
		TableRowActionEvents,
		TableRowEditEvents
	} from '$lib/tool/upgrade/upgrade-table/row-events';

	import UpgradeTable from '../upgrade-table/UpgradeTable.svelte';

	interface Prop {
		plan: RestoreResult;
		cards: Card[];
		tabooLists: TabooLists;
		/**
		 * Shows an Edit button that hands control back to the planner.
		 */
		onEdit?: () => void;
	}
	const { plan, cards, tabooLists, onEdit }: Prop = $props();

	const globalSettings = $derived({
		pipStyle: GlobalSettings_PipStyle.Pips,
		taboo: plan.exportOptions.globalSettings?.taboo ?? true
	});
	const cardResolver = $derived.by(() => {
		const latestTaboo = getLatestTaboo(tabooLists);
		return new CardResolver(cards, globalSettings.taboo && latestTaboo ? latestTaboo : null);
	});

	// The table is read-only here; it still expects its full event surface.
	const noop = () => {};
	const rowActionEvents: TableRowActionEvents = {
		onDelete: noop,
		onDeleteLeft: noop,
		onDeleteRight: noop,
		onMoveDown: noop,
		onMoveUp: noop,
		onMoveDownLeft: noop,
		onMoveDownRight: noop,
		onMoveUpLeft: noop,
		onMoveUpRight: noop
	};
	const rowEditEvents: TableRowEditEvents = {
		onCarryoverXpChanged: noop,
		onDividerChanged: noop,
		onDividerTextChanged: noop,
		onLeftChanged: noop,
		onRightChanged: noop,
		onLoseFocus: noop,
		onMarkChanged: noop,
		onXpChanged: noop,
		onXpCumulativeLockChanged: noop,
		onXpLockChanged: noop,
		onDropSwap: noop,
		onCustomizationCycle: noop
	};
</script>

{#if onEdit}
	<div class="mb-4 flex justify-center">
		<Button icon={FaIconType.Edit} label="Edit Plan" onClick={onEdit} />
	</div>
{/if}
<div class="plan-outer mx-auto">
	<BorderedContainer>
		<UpgradeTable
			viewMode
			{cardResolver}
			gs={globalSettings}
			rows={plan.rows}
			{rowActionEvents}
			{rowEditEvents}
			onRowDragMove={noop}
		/>
	</BorderedContainer>
</div>

<style>
	.plan-outer {
		width: 1000px;
		max-width: 100%;
	}
</style>
