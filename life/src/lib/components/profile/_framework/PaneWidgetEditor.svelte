<!--
@component
Edits the ROW LAYOUT of ONE profile page: either a shared pane (home, cards, …)
or a SINGLE campaign's detail page. A campaign's page has its OWN complete layout
(shared campaign-detail widgets AND that campaign's own widgets, interleaved as
the user likes) — there is no shared campaign layout, and campaign-specific
widgets are chosen from the same picker as the rest (no separate section).

It snapshots `initialSettings`, edits only this page's rows, and `currentPayload()`
returns the FULL settings JSON with that slice replaced — every other page and all
globals preserved. Thin orchestrator; positioning UI lives in <RowLayoutEditor>.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import {
		defaultCampaignLayout,
		freshDefaultPanes,
		type PaneId,
		type ProfileSettings,
		type SharedPaneId,
		type WidgetSlot
	} from '$lib/campaign/profile-settings';
	import {
		campaignDetailWidgetIds,
		sharedWidgetsForPane,
		WIDGET_BY_ID
	} from '$lib/campaign/profile-widgets';
	import { Checkbox, RadioButtons } from '@5argon/arkham-life-ui';
	import RowLayoutEditor from '$lib/components/profile/_framework/RowLayoutEditor.svelte';
	import {
		patchConfig,
		toEditorRows,
		toStoredRows,
		type EditorRow,
		type SlotSide
	} from '$lib/components/profile/_framework/row-layout';

	let {
		initialSettings,
		pane,
		campaign = null
	}: {
		initialSettings: ProfileSettings;
		pane: PaneId;
		/** A campaign slug → edit that campaign's own detail-page layout. */
		campaign?: string | null;
	} = $props();

	// A campaign slug edits that campaign's own per-campaign layout; otherwise a
	// shared pane. (`campaign != null` is checked inline so it both narrows the type
	// and stays reactive — the editor is remounted when the campaign/pane changes.)

	let rows = $state<EditorRow[]>(
		untrack(() =>
			toEditorRows(
				campaign != null
					? (initialSettings.campaigns[campaign] ?? defaultCampaignLayout(campaign))
					: (initialSettings.panes[pane as SharedPaneId] ??
							freshDefaultPanes()[pane as SharedPaneId])
			)
		)
	);

	const allowedIds = $derived(
		campaign != null
			? campaignDetailWidgetIds(campaign)
			: sharedWidgetsForPane(pane).map((w) => w.id)
	);

	/** Per-slot configured item count, else the family default. */
	const widgetCount = (slot: WidgetSlot, fallback: number): number =>
		typeof slot.config?.count === 'number' ? slot.config.count : fallback;

	// Per-campaign "Log-only mode" (campaign detail page only). The global `logOnly` overrides it,
	// so the checkbox renders checked + disabled when that's on.
	let campaignLogOnly = $state(
		untrack(() => campaign != null && initialSettings.campaignLogOnly?.[campaign] === true)
	);

	function resetActive() {
		rows = toEditorRows(
			campaign != null ? defaultCampaignLayout(campaign) : freshDefaultPanes()[pane as SharedPaneId]
		);
	}

	const payload = $derived.by((): string => {
		const next: ProfileSettings =
			campaign != null
				? {
						...initialSettings,
						v: 4,
						campaigns: { ...initialSettings.campaigns, [campaign]: toStoredRows(rows) },
						campaignLogOnly: { ...initialSettings.campaignLogOnly, [campaign]: campaignLogOnly }
					}
				: {
						...initialSettings,
						v: 4,
						panes: { ...initialSettings.panes, [pane as SharedPaneId]: toStoredRows(rows) }
					};
		return JSON.stringify(next);
	});

	/** The full settings as a JSON string (this page updated) — read by the page on save. */
	export function currentPayload(): string {
		return payload;
	}
</script>

{#snippet countConfig(rowIndex: number, side: SlotSide, current: number)}
	<div class="mt-2">
		<RadioButtons
			label={m.framework_top()}
			selectedValue={current}
			onChange={(v) => (rows = patchConfig(rows, rowIndex, side, { count: v }))}
			choices={[
				{ value: 5, label: '5' },
				{ value: 10, label: '10' },
				{ value: 15, label: '15' }
			]}
		/>
	</div>
{/snippet}

{#snippet investigatorFilters(rowIndex: number, side: SlotSide, slot: WidgetSlot)}
	<div class="mt-2 flex flex-wrap items-center gap-2">
		<Checkbox
			label={m.framework_ignore_parallel_investigators()}
			checked={slot.config?.ignoreParallel === true}
			onChange={() =>
				(rows = patchConfig(rows, rowIndex, side, {
					ignoreParallel: !(slot.config?.ignoreParallel === true)
				}))}
		/>
		<Checkbox
			label={m.framework_ignore_subject_5u21()}
			checked={slot.config?.ignore5u21 === true}
			onChange={() =>
				(rows = patchConfig(rows, rowIndex, side, {
					ignore5u21: !(slot.config?.ignore5u21 === true)
				}))}
		/>
	</div>
{/snippet}

{#snippet keysWallConfig(rowIndex: number, side: SlotSide, slot: WidgetSlot)}
	<div class="mt-2">
		<Checkbox
			label={m.framework_hide_wellspring()}
			checked={slot.config?.hideWellspring === true}
			onChange={() =>
				(rows = patchConfig(rows, rowIndex, side, {
					hideWellspring: !(slot.config?.hideWellspring === true)
				}))}
		/>
	</div>
{/snippet}

{#snippet scenarioConfig(rowIndex: number, side: SlotSide, slot: WidgetSlot)}
	<div class="mt-2 space-y-1">
		<Checkbox
			label={m.framework_hide_variant_breakdown()}
			checked={slot.config?.hideVariants === true}
			onChange={() =>
				(rows = patchConfig(rows, rowIndex, side, {
					hideVariants: !(slot.config?.hideVariants === true)
				}))}
		/>
		<Checkbox
			label={m.framework_hide_achievements()}
			checked={slot.config?.hideAchievements === true}
			onChange={() =>
				(rows = patchConfig(rows, rowIndex, side, {
					hideAchievements: !(slot.config?.hideAchievements === true)
				}))}
		/>
	</div>
{/snippet}

{#snippet routesConfig(rowIndex: number, side: SlotSide, slot: WidgetSlot)}
	<div class="mt-2">
		<Checkbox
			label={m.framework_hide_achievement_routes()}
			checked={slot.config?.hideAchievements === true}
			onChange={() =>
				(rows = patchConfig(rows, rowIndex, side, {
					hideAchievements: !(slot.config?.hideAchievements === true)
				}))}
		/>
	</div>
{/snippet}

{#snippet nonLogConfig(rowIndex: number, side: SlotSide, slot: WidgetSlot)}
	<div class="mt-2">
		<Checkbox
			label={m.framework_ignore_non_log()}
			checked={slot.config?.ignoreNonLog === true}
			onChange={() =>
				(rows = patchConfig(rows, rowIndex, side, {
					ignoreNonLog: !(slot.config?.ignoreNonLog === true)
				}))}
		/>
	</div>
{/snippet}

{#snippet renderConfig({
	rowIndex,
	side,
	slot
}: {
	rowIndex: number;
	side: SlotSide;
	slot: WidgetSlot;
})}
	{#if slot.id === 'favoriteCard' || slot.id.startsWith('favoriteCard_')}
		{@render countConfig(rowIndex, side, widgetCount(slot, 10))}
	{:else if slot.id === 'deckStats' || slot.id.startsWith('deckStats_')}
		{@render countConfig(rowIndex, side, widgetCount(slot, 5))}
	{:else if slot.id === 'investigatorInsights'}
		{@render investigatorFilters(rowIndex, side, slot)}
	{:else if slot.id === 'tskKeysObtained' || slot.id === 'tskKeysBearer'}
		{@render keysWallConfig(rowIndex, side, slot)}
	{:else if slot.id === 'tskRoutes'}
		{@render routesConfig(rowIndex, side, slot)}
	{:else if slot.id.startsWith('tskScenario_')}
		{@render scenarioConfig(rowIndex, side, slot)}
	{/if}
	<!-- Auto-generated for any `nonLog: 'partial'` widget — hide its Extra/deck-derived sections. -->
	{#if WIDGET_BY_ID[slot.id]?.nonLog === 'partial'}
		{@render nonLogConfig(rowIndex, side, slot)}
	{/if}
{/snippet}

<!-- Per-campaign Log-only toggle. Hidden when the global `logOnly` is on (it already covers
     every campaign, so a per-campaign switch would be moot). -->
{#if campaign != null && initialSettings.logOnly !== true}
	<div class="mb-2">
		<Checkbox
			label={m.framework_campaign_log_only()}
			checked={campaignLogOnly}
			onChange={() => (campaignLogOnly = !campaignLogOnly)}
		/>
	</div>
{/if}
<div class="mb-2 flex items-center justify-end">
	<button
		type="button"
		class="text-secondary-600 dark:text-secondary-400 text-xs hover:underline"
		onclick={resetActive}
		>{campaign != null ? m.framework_reset_campaign() : m.framework_reset_page()}</button
	>
</div>
<RowLayoutEditor {rows} {allowedIds} onChange={(next) => (rows = next)} {renderConfig} />
