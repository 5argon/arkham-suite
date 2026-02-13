<!--
@component
Modal for configuring grouping and sorting settings for card display.
-->
<script lang="ts">
	import type { Grouping, GroupingSortingSettings } from './card-item.js';
	import { areGroupingSortingSettingsEqual } from './card-item.js';
	import type { SortingType } from '@5argon/arkham-kohaku';
	import Modal from '../layout/Modal.svelte';
	import SequentialTags from '../form/SequentialTags.svelte';
	import { Button } from '../button/index.js';
	import * as m from '../paraglide/messages.js';

	interface Prop {
		isOpen: boolean;
		onClose: () => void;
		settings: GroupingSortingSettings;
		defaultSettings: GroupingSortingSettings;
		onApply: (settings: GroupingSortingSettings) => void;
	}

	const { isOpen, onClose, settings, defaultSettings, onApply }: Prop = $props();

	// svelte-ignore state_referenced_locally
	let localGrouping = $state<Grouping[]>([...settings.grouping]);
	// svelte-ignore state_referenced_locally
	let localSortingOrder = $state<SortingType[]>([...settings.sortingOrder]);

	// Sync local state when settings prop changes
	$effect(() => {
		localGrouping = [...settings.grouping];
		localSortingOrder = [...settings.sortingOrder];
	});

	const isDifferentFromDefault = $derived(
		!areGroupingSortingSettingsEqual(
			{ grouping: localGrouping, sortingOrder: localSortingOrder },
			defaultSettings
		)
	);

	const groupingChoices: { value: Grouping; label: string }[] = [
		{ value: 'default', label: m.form_grouping_default() },
		{ value: 'set', label: m.form_grouping_set() },
		{ value: 'cost', label: m.form_grouping_cost() },
		{ value: 'slot', label: m.form_grouping_slot() },
		{ value: 'level', label: m.form_grouping_level() },
		{ value: 'levelGrouped', label: m.form_grouping_level_grouped() },
		{ value: 'class', label: m.form_grouping_class() },
		{ value: 'commitPower', label: m.form_grouping_commit_power() }
	];

	const sortingChoices: { value: SortingType; label: string }[] = [
		{ value: 'class', label: m.form_sorting_class() },
		{ value: 'type', label: m.form_sorting_type() },
		{ value: 'name', label: m.form_sorting_name() },
		{ value: 'level', label: m.form_sorting_level() },
		{ value: 'cost', label: m.form_sorting_cost() },
		{ value: 'set', label: m.form_sorting_set() },
		{ value: 'slot', label: m.form_sorting_slot() },
		{ value: 'position', label: m.form_sorting_position() },
		{ value: 'commitPower', label: m.form_sorting_commit_power() }
	];

	function getGroupingLabel(value: Grouping): string {
		return groupingChoices.find((c) => c.value === value)?.label ?? value;
	}

	function getSortingLabel(value: SortingType): string {
		return sortingChoices.find((c) => c.value === value)?.label ?? value;
	}

	function handleApply() {
		onApply({ grouping: localGrouping, sortingOrder: localSortingOrder });
		onClose();
	}

	function handleReset() {
		localGrouping = [...defaultSettings.grouping];
		localSortingOrder = [...defaultSettings.sortingOrder];
	}

	// Sync with external settings changes
	$effect(() => {
		localGrouping = [...settings.grouping];
		localSortingOrder = [...settings.sortingOrder];
	});
</script>

<Modal {isOpen} {onClose} title={m.button_grouping_sorting()}>
	<div class="space-y-6">
		<SequentialTags
			label={m.form_grouping()}
			bind:sequence={localGrouping}
			choices={groupingChoices}
			getLabel={getGroupingLabel}
			emptyPlaceholder={m.form_grouping_placeholder()}
		/>

		<SequentialTags
			label={m.form_sorting()}
			bind:sequence={localSortingOrder}
			choices={sortingChoices}
			getLabel={getSortingLabel}
			emptyPlaceholder={m.form_sorting_placeholder()}
		/>
	</div>

	{#snippet footer()}
		<div class="flex justify-end gap-2">
			{#if isDifferentFromDefault}
				<Button label={m.button_reset()} onClick={handleReset} />
			{/if}
			<Button label={m.button_close()} onClick={onClose} />
			<Button label="Apply" onClick={handleApply} highlighted />
		</div>
	{/snippet}
</Modal>
