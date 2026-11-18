<!--
@component
Standalone Archive filters: source, difficulty and Standalone Mode result, each shown when the
archive holds more than one value. Selections stay drafts until Apply.
-->
<script module lang="ts">
	export const STANDALONE_FACETS = ['src', 'diff', 'verdict'] as const;
	export type StandaloneFacet = (typeof STANDALONE_FACETS)[number];
</script>

<script lang="ts">
	import { Button, FaIconType, Modal } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import type { StandaloneFilterOptions } from '$lib/database/standalone-list';
	import FacetCheckboxes from './FacetCheckboxes.svelte';
	import type { FilterDrafts } from './list-url';
	import { standaloneSourceLabel, standaloneVerdictLabel } from './standalone-labels';

	interface Props {
		isOpen: boolean;
		options: StandaloneFilterOptions;
		drafts: FilterDrafts<StandaloneFacet>;
		onToggle: (facet: StandaloneFacet, value: string) => void;
		onClear: () => void;
		onApply: () => void;
		onClose: () => void;
	}
	let { isOpen, options, drafts, onToggle, onClear, onApply, onClose }: Props = $props();

	const facets = $derived(
		[
			{
				key: 'src' as const,
				title: m.archive_filter_source(),
				options: options.sources.map((s) => ({ value: s, label: standaloneSourceLabel(s) }))
			},
			{
				key: 'diff' as const,
				title: m.archive_difficulty(),
				options: options.difficulties.map((d) => ({ value: d, label: difficultyLabel(d) }))
			},
			{
				key: 'verdict' as const,
				title: m.archive_filter_result(),
				options: options.verdicts.map((v) => ({ value: v, label: standaloneVerdictLabel(v) }))
			}
		].filter((f) => f.options.length > 1)
	);
</script>

<Modal {isOpen} {onClose} title={m.archive_filter_title_standalone()} maxWidth="lg">
	<div class="space-y-4">
		{#each facets as f (f.key)}
			<FacetCheckboxes
				title={f.title}
				options={f.options}
				selected={drafts[f.key]}
				onToggle={(v) => onToggle(f.key, v)}
			/>
		{/each}
	</div>

	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<Button label={m.archive_filter_clear()} icon={FaIconType.Clear} onClick={onClear} />
			<Button label={m.archive_filter_apply()} highlighted onClick={onApply} />
		</div>
	{/snippet}
</Modal>
