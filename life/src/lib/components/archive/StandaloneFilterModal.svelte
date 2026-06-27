<!--
@component
Standalone Archive filter modal — the standalone counterpart to FilterModal.
Presentational: draft selections live in the page (seeded from the URL on open).
Facets: source (pack / from-campaign), difficulty, and Standalone-Mode verdict.
-->
<script lang="ts">
	import { Modal, Button, Checkbox, FaIconType } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import type { StandaloneFilterOptions } from '$lib/database/repository';

	interface Props {
		isOpen: boolean;
		options: StandaloneFilterOptions;
		sources: Set<string>;
		difficulties: Set<string>;
		verdicts: Set<string>;
		onToggle: (cat: 'source' | 'difficulty' | 'verdict', value: string) => void;
		onClear: () => void;
		onApply: () => void;
		onClose: () => void;
	}
	let { isOpen, options, sources, difficulties, verdicts, onToggle, onClear, onApply, onClose }: Props =
		$props();

	const sourceLabel: Record<string, string> = {
		pack: 'Scenario Pack',
		campaign: 'From Campaign',
	};
	const verdictLabel: Record<string, string> = {
		won: 'Won',
		lost: 'Lost',
		unknown: 'No resolution recorded',
	};
</script>

<Modal {isOpen} {onClose} title={m.archive_filter_title()} maxWidth="lg">
	<div class="space-y-4">
		{#if options.sources.length > 1}
			<div>
				<h3 class="text-primary-800 dark:text-primary-200 mb-1 text-sm font-semibold">Source</h3>
				<div class="flex flex-wrap gap-3">
					{#each options.sources as s (s)}
						<Checkbox
							label={sourceLabel[s] ?? s}
							checked={sources.has(s)}
							onChange={() => onToggle('source', s)}
						/>
					{/each}
				</div>
			</div>
		{/if}

		{#if options.difficulties.length > 1}
			<div>
				<h3 class="text-primary-800 dark:text-primary-200 mb-1 text-sm font-semibold">Difficulty</h3>
				<div class="flex flex-wrap gap-3">
					{#each options.difficulties as d (d)}
						<Checkbox
							label={difficultyLabel(d)}
							checked={difficulties.has(d)}
							onChange={() => onToggle('difficulty', d)}
						/>
					{/each}
				</div>
			</div>
		{/if}

		{#if options.verdicts.length > 1}
			<div>
				<h3 class="text-primary-800 dark:text-primary-200 mb-1 text-sm font-semibold">Result</h3>
				<div class="flex flex-wrap gap-3">
					{#each options.verdicts as v (v)}
						<Checkbox
							label={verdictLabel[v] ?? v}
							checked={verdicts.has(v)}
							onChange={() => onToggle('verdict', v)}
						/>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<Button label={m.archive_filter_clear()} icon={FaIconType.Clear} onClick={onClear} />
			<Button label={m.archive_filter_apply()} highlighted onClick={onApply} />
		</div>
	{/snippet}
</Modal>
