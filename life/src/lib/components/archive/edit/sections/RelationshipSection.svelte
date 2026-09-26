<!--
@component
An FHV `relationship` section (one per villager): a 0..max relationship level, stored under the
bare section id, plus that villager's own notes.
-->
<script lang="ts">
	import { sectionEntries } from '@5argon/arkham-campaign-data';
	import { Checkbox } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { itemLabel, portraitUrl } from '$lib/campaign/records/campaign-log-source';
	import { firstNumber, makeEntry, type LocalLog } from '$lib/campaign/records/recorded-state';
	import EntryText from '../EntryText.svelte';
	import Stepper from '../Stepper.svelte';
	import type { SectionProps } from './types';

	let { log, section, entries, onChange }: SectionProps = $props();

	const notes = $derived(sectionEntries(log, section.id).filter((e) => !e.def.hidden));
	const min = $derived(section.min ?? 0);
	const max = $derived(section.max ?? 0);
	let photoFailed = $state(false);

	const levelEntry = $derived(entries.find((e) => e.key === section.id));
	const noteEntries = $derived(entries.filter((e) => e.key !== section.id));
	const recorded = $derived(new Set(noteEntries.map((e) => e.key)));
	const level = $derived((levelEntry && firstNumber(levelEntry.args)) ?? min);

	function commit(nextLevel: number, nextNotes: LocalLog[]) {
		const clamped = Math.max(min, Math.min(max, nextLevel));
		const levelSlice =
			clamped > 0 ? [makeEntry(section.id, section.id, [{ type: 'number', value: String(clamped) }])] : [];
		onChange([...levelSlice, ...nextNotes]);
	}

	function toggleNote(key: string) {
		const next = recorded.has(key)
			? noteEntries.filter((e) => e.key !== key)
			: [...noteEntries, makeEntry(section.id, key)];
		commit(level, next);
	}
</script>

<div class="flex gap-3">
	{#if !photoFailed}
		<img
			src={portraitUrl(log.db.code, section.id)}
			alt={itemLabel(log, section.id)}
			class="border-primary-200 dark:border-primary-700 h-28 w-24 shrink-0 rounded border object-cover"
			onerror={() => (photoFailed = true)}
		/>
	{/if}
	<div class="flex-1 space-y-3">
		<div class="flex items-center gap-3">
			<span class="text-primary-600 dark:text-primary-300 text-xs tracking-wide uppercase"
				>{m.archive_relationship_level()}</span
			>
			<Stepper value={level} {min} max={max || undefined} onChange={(v) => commit(v, noteEntries)} />
		</div>

		{#if notes.length}
			<div class="flex flex-col gap-1.5">
				{#each notes as note (note.key)}
					<Checkbox
						label={note.en.text}
						checked={recorded.has(note.key)}
						onChange={() => toggleNote(note.key)}
					/>
					{#if recorded.has(note.key)}
						<EntryText class="text-primary-500 ml-6 text-xs" en={note.en} />
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>
