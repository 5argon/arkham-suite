<!--
@component
The widget picker — a modal that opens when the user clicks an empty "select
widget" slot in the RowLayoutEditor. Lists EVERY widget allowed on this page; a
widget already placed somewhere on the page is shown GREYED OUT (with an "In use"
tag) rather than hidden, so the player can see the full catalogue at a glance.
When filling a SPLIT slot, `fullWidth` widgets are likewise shown but disabled
(they can't be halved). On a campaign page the list includes that campaign's
CAMPAIGN-SPECIFIC widgets (marked with a badge) right alongside the shared ones,
so they can be interleaved freely. Selecting an enabled widget fills the slot.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { FaIcon, FaIconType, HelpParagraph, Modal } from '@5argon/arkham-life-ui';
	import { WIDGET_BY_ID, isFullWidth, widgetLabel } from '$lib/campaign/profile-widgets';
	import type { SlotSide } from '$lib/components/profile/_framework/row-layout';

	let {
		isOpen,
		onClose,
		candidateIds,
		placedIds,
		target,
		onSelect
	}: {
		isOpen: boolean;
		onClose: () => void;
		/** Widget ids allowed on this page (shared + any campaign-specific). */
		candidateIds: string[];
		/** Widget ids already placed somewhere on this page (shown greyed, not selectable). */
		placedIds: string[];
		/** The slot being filled; a non-'full' side disables fullWidth widgets. */
		target: { rowIndex: number; side: SlotSide } | null;
		onSelect: (id: string) => void;
	} = $props();

	const splitSlot = $derived(!!target && target.side !== 'full');
	const entries = $derived(
		candidateIds.map((id) => {
			const placed = placedIds.includes(id);
			const tooWide = splitSlot && isFullWidth(id);
			const def = WIDGET_BY_ID[id];
			return {
				id,
				placed,
				tooWide,
				disabled: placed || tooWide,
				campaignSpecific: !!def?.perCampaignExtra,
				fullWidth: !!def?.fullWidth,
				requiresExtra: def?.nonLog === 'full',
			};
		})
	);

	const LEGEND: { icon: FaIconType; label: string }[] = [
		{ icon: FaIconType.Manual, label: m.framework_legend_campaign_specific() },
		{ icon: FaIconType.Expand, label: m.framework_legend_full_width_only() },
		{ icon: FaIconType.WidgetRequiresExtra, label: m.framework_legend_requires_extra() },
	];

	function choose(id: string, disabled: boolean) {
		if (disabled) return;
		onSelect(id);
		onClose();
	}
</script>

<Modal {isOpen} {onClose} maxWidth="lg" title={m.framework_picker_title()}>
	{#if entries.length === 0}
		<div class="pb-4">
			<HelpParagraph>{m.framework_no_widgets_available()}</HelpParagraph>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-2 pb-2 sm:grid-cols-2">
			{#each entries as e (e.id)}
				<button
					type="button"
					disabled={e.disabled}
					class="border-primary-300 dark:border-primary-600 dark:bg-primary-800 enabled:hover:border-secondary-500 flex items-center justify-between gap-2 rounded border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
					onclick={() => choose(e.id, e.disabled)}
				>
					<span class="truncate font-medium text-black dark:text-white">{widgetLabel(e.id)}</span>
					<span class="text-primary-400 dark:text-primary-500 flex shrink-0 items-center gap-2 text-sm">
						{#if e.campaignSpecific}
							<FaIcon icon={FaIconType.Manual} />
						{/if}
						{#if e.fullWidth}
							<FaIcon icon={FaIconType.Expand} />
						{/if}
						{#if e.requiresExtra}
							<FaIcon icon={FaIconType.WidgetRequiresExtra} class="text-amber-500 dark:text-amber-400" />
						{/if}
					</span>
				</button>
			{/each}
		</div>

		<!-- Legend -->
		<div class="border-primary-200 dark:border-primary-700 mt-2 border-t pt-3 pb-3">
			<div class="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
				{#each LEGEND as item (item.icon)}
					<div class="text-primary-500 dark:text-primary-400 flex items-center gap-2 text-xs">
						<FaIcon
							icon={item.icon}
							class={item.icon === FaIconType.WidgetRequiresExtra
								? 'text-amber-500 dark:text-amber-400'
								: 'text-primary-400 dark:text-primary-500'}
						/>
						<span>{item.label}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</Modal>
