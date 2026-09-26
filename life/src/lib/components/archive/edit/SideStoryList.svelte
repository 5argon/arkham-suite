<!--
@component
The side stories played somewhere inside the campaign, in order (what was played, not where), each
with its resolution, victory display and its own Extra choices.
-->
<script lang="ts">
	import { standaloneScenarios } from '@5argon/arkham-campaign-data';
	import { Dropdown } from '@5argon/arkham-life-ui';
	import { untrack } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import {
		RESERVED,
		replaceSection,
		standaloneDraftsFromLogs,
		standalonesToEntries,
		type LocalLog,
		type StandaloneEntry
	} from '$lib/campaign/records/recorded-state';
	import { choicesForStandalone } from '$lib/campaign/stats/scenario-extras';
	import type { InvestigatorRef } from '$lib/campaign/utils/investigators';
	import { resolutionLabel } from '$lib/campaign/utils/resolutions';
	import { rewardKindLabel } from '$lib/campaign/utils/scenario-reward';
	import ExtraChoiceControl from './ExtraChoiceControl.svelte';
	import NumberField from './NumberField.svelte';

	interface Props {
		logs: LocalLog[];
		investigators: InvestigatorRef[];
		onLogsChange: (next: LocalLog[]) => void;
	}
	let { logs, investigators, onLogsChange }: Props = $props();

	const catalog = standaloneScenarios();
	const byId = new Map(catalog.map((s) => [s.scenario, s]));
	const standaloneOptions = [
		{ value: '', label: m.archive_side_story_pick() },
		...catalog.map((s) => ({ value: s.scenario, label: s.name }))
	];
	const resolutionOptions = (id: string) => [
		{ value: '', label: '—' },
		...(byId.get(id)?.resolutions ?? []).map((r) => ({ value: r, label: resolutionLabel(r) }))
	];

	const rows = $derived(standaloneDraftsFromLogs(logs));

	// Row identities for keyed rendering: the stored rows are positional, and re-encoded on every edit.
	let nextRowId = 0;
	let rowIds = $state(untrack(() => rows.map(() => nextRowId++)));

	function write(list: StandaloneEntry[]) {
		onLogsChange(replaceSection(logs, RESERVED.standalones, standalonesToEntries(list)));
	}
	const update = (i: number, patch: (e: StandaloneEntry) => StandaloneEntry) =>
		write(rows.map((e, j) => (j === i ? patch(e) : e)));

	function add() {
		rowIds = [...rowIds, nextRowId++];
		write([...rows, { standalone: '' }]);
	}
	function remove(i: number) {
		rowIds = rowIds.filter((_, j) => j !== i);
		write(rows.filter((_, j) => j !== i));
	}
	function setChoice(i: number, choiceId: string, value: string) {
		update(i, (e) => {
			const choices = { ...e.choices, [choiceId]: value };
			if (!value) delete choices[choiceId];
			return { ...e, choices: Object.keys(choices).length ? choices : undefined };
		});
	}
</script>

<div class="border-primary-200 dark:border-primary-700 mt-6 border-t pt-4">
	<p class="mb-1 font-medium text-black dark:text-white">{m.archive_side_story_title()}</p>
	<p class="text-primary-500 mb-3 text-sm">{m.archive_side_story_help()}</p>

	{#if rows.length}
		<div class="space-y-2">
			{#each rows as st, i (rowIds[i] ?? `new-${i}`)}
				<div class="border-primary-100 dark:border-primary-800 flex flex-col gap-3 rounded border p-2">
					<div class="flex flex-wrap items-end gap-3">
						<div class="min-w-0 flex-1">
							<Dropdown
								label={m.archive_side_story_scenario()}
								value={st.standalone}
								options={standaloneOptions}
								onchange={(v) => update(i, () => ({ standalone: v }))}
							/>
						</div>
						<div class="w-40 shrink-0">
							<Dropdown
								label={m.archive_extra_resolution()}
								value={st.resolution ?? ''}
								options={resolutionOptions(st.standalone)}
								onchange={(v) => update(i, (e) => ({ ...e, resolution: v || undefined }))}
							/>
						</div>
						<div class="-mb-2 w-24 shrink-0">
							<NumberField
								label={rewardKindLabel(byId.get(st.standalone)?.victoryDisplay ?? true)}
								value={st.victoryDisplay ?? null}
								onCommit={(n) => update(i, (e) => ({ ...e, victoryDisplay: n ?? undefined }))}
							/>
						</div>
						<button
							type="button"
							class="text-primary-400 shrink-0 px-2 py-1.5 text-sm hover:text-red-500"
							title={m.archive_side_story_remove()}
							aria-label={m.archive_side_story_remove()}
							onclick={() => remove(i)}
						>
							✕
						</button>
					</div>

					{#if st.standalone}
						{#each choicesForStandalone(st.standalone) as choice (choice.id)}
							<ExtraChoiceControl
								{choice}
								{investigators}
								value={st.choices?.[choice.id] ?? ''}
								onChange={(v) => setChoice(i, choice.id, v)}
							/>
						{/each}
						<p
							class="text-primary-400 border-primary-100 dark:border-primary-800 border-t pt-2 text-xs italic"
						>
							{m.archive_side_story_logs_hint()}
						</p>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-primary-400 text-sm">{m.archive_side_story_empty()}</p>
	{/if}

	<button
		type="button"
		class="text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 mt-3 text-sm font-medium"
		onclick={add}
	>
		+ {m.archive_side_story_add()}
	</button>
</div>
