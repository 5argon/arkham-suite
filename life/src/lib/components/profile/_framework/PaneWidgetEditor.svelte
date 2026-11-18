<!-- @component Edits one page's row layout: a shared pane, or a campaign's own detail page. -->
<script lang="ts">
	import { untrack } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import {
		freshDefaultPanes,
		type PaneId,
		type ProfileSettings,
		type SharedPaneId,
		type WidgetSlot
	} from '$lib/campaign/profile/profile-settings';
	import {
		campaignDetailWidgetIds,
		defaultCampaignLayout,
		sharedWidgetsForPane,
		WIDGET_BY_ID
	} from '$lib/campaign/profile/profile-widgets';
	import type { WidgetConfigOption } from '$lib/campaign/profile/widget-def';
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

	/** The full settings with this page's layout replaced, as JSON. */
	export function currentPayload(): string {
		return payload;
	}
</script>

{#snippet toggle(rowIndex: number, side: SlotSide, slot: WidgetSlot, key: string, label: string)}
	<Checkbox
		{label}
		checked={slot.config?.[key] === true}
		onChange={() => (rows = patchConfig(rows, rowIndex, side, { [key]: slot.config?.[key] !== true }))}
	/>
{/snippet}

{#snippet options(rowIndex: number, side: SlotSide, slot: WidgetSlot, config: WidgetConfigOption[])}
	<div class="mt-2 flex flex-wrap items-center gap-2">
		{#each config as option, i (i)}
			{#if option.kind === 'count'}
				<RadioButtons
					label={m.framework_top()}
					selectedValue={typeof slot.config?.count === 'number' ? slot.config.count : option.fallback}
					onChange={(v) => (rows = patchConfig(rows, rowIndex, side, { count: v }))}
					choices={option.choices.map((n) => ({ value: n, label: String(n) }))}
				/>
			{:else}
				{@render toggle(rowIndex, side, slot, option.key, option.label())}
			{/if}
		{/each}
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
	{@const def = WIDGET_BY_ID[slot.id]}
	{#if def?.config}
		{@render options(rowIndex, side, slot, def.config)}
	{/if}
	{#if def?.nonLog === 'partial'}
		<div class="mt-2">
			{@render toggle(rowIndex, side, slot, 'ignoreNonLog', m.framework_ignore_non_log())}
		</div>
	{/if}
{/snippet}

<!-- The global switch already covers every campaign. -->
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
