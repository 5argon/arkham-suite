<!--
@component
An FHV `relationship` section (one per NPC: Mother Rachel, Leah Atwood, …). Each
NPC carries BOTH a relationship level (a 0..max counter) AND that NPC's own
scoped list of valid log entries. The level is stored under the bare section id;
the ticked notes under their composite `"section.id"` keys.
-->
<script lang="ts">
	import { sectionEntries, type CampaignLog, type LogSectionDef } from '@5argon/arkham-campaign-data';
	import { Button, Checkbox } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { itemLabel, portraitUrl } from '$lib/campaign/campaign-log-source';
	import { makeEntry, type LocalLog } from '$lib/campaign/recorded-state';
	import SpoilerEntryText from '../SpoilerEntryText.svelte';

	interface Props {
		log: CampaignLog;
		section: LogSectionDef;
		entries: LocalLog[];
		canEdit: boolean;
		onChange: (next: LocalLog[]) => void;
	}

	let { log, section, entries, canEdit, onChange }: Props = $props();

	const notes = $derived(sectionEntries(log, section.id).filter((e) => !e.def.hidden));
	const min = $derived(section.min ?? 0);
	const max = $derived(section.max ?? 0);
	let photoFailed = $state(false);

	const levelEntry = $derived(entries.find((e) => e.key === section.id));
	const noteEntries = $derived(entries.filter((e) => e.key !== section.id));
	const recorded = $derived(new Set(noteEntries.map((e) => e.key)));
	const level = $derived.by(() => {
		const raw = levelEntry?.args.find((a) => a.type === 'number')?.value;
		const n = raw !== undefined ? Number(raw) : min;
		return Number.isFinite(n) ? n : min;
	});

	function commit(nextLevel: number, nextNotes: LocalLog[]) {
		const clamped = Math.max(min, Math.min(max, nextLevel));
		const levelSlice =
			clamped > 0 ? [makeEntry(section.id, section.id, [{ type: 'number', value: String(clamped) }])] : [];
		onChange([...levelSlice, ...nextNotes]);
	}

	function setLevel(v: number) {
		commit(v, noteEntries);
	}
	function toggleNote(key: string) {
		if (!canEdit) return;
		const next = recorded.has(key)
			? noteEntries.filter((e) => e.key !== key)
			: [...noteEntries, makeEntry(section.id, key)];
		commit(level, next);
	}
</script>

<div class="flex gap-3">
	{#if !photoFailed}
		<!-- NPC photo cropped from the official FHV campaign-log sheet. -->
		<img
			src={portraitUrl(log.db.code, section.id)}
			alt={itemLabel(log, section.id)}
			class="border-primary-200 dark:border-primary-700 h-28 w-24 shrink-0 rounded border object-cover"
			onerror={() => (photoFailed = true)}
		/>
	{/if}
	<div class="flex-1 space-y-3">
	<div class="flex items-center gap-3">
		<span class="text-primary-600 dark:text-primary-300 text-xs uppercase tracking-wide"
			>{m.archive_relationship_level()}</span
		>
		{#if canEdit}
			<Button label="−" onClick={() => setLevel(level - 1)} />
		{/if}
		<span class="min-w-8 text-center text-lg font-bold text-black tabular-nums dark:text-white"
			>{level}{#if max}<span class="text-primary-400 text-sm"> / {max}</span>{/if}</span
		>
		{#if canEdit}
			<Button label="+" onClick={() => setLevel(level + 1)} />
		{/if}
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
					<SpoilerEntryText class="text-primary-500 ml-6 text-xs" en={note.en} reveal />
				{/if}
			{/each}
		</div>
	{/if}
	</div>
</div>
