<!--
@component
A single campaign-wide tally for a `count` section (Yig's Fury, Time Passed,
Evidence of Kadath, Steps of the Bridge, Doubt, Conviction). Stored as one entry
keyed by the section id, carrying the number. The player types the value directly;
it is clamped to the section's min/max when committed (on blur / Enter).
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { CampaignLog, LogSectionDef } from '@5argon/arkham-campaign-data';
	import { TextInput } from '@5argon/arkham-life-ui';
	import { makeEntry, type LocalLog } from '$lib/campaign/recorded-state';

	interface Props {
		log: CampaignLog;
		section: LogSectionDef;
		entries: LocalLog[];
		canEdit: boolean;
		onChange: (next: LocalLog[]) => void;
	}

	let { section, entries, canEdit, onChange }: Props = $props();

	const min = $derived(section.min ?? 0);
	const max = $derived(section.max ?? Number.POSITIVE_INFINITY);
	const value = $derived.by(() => {
		const raw = entries[0]?.args.find((a) => a.type === 'number')?.value;
		const n = raw !== undefined ? Number(raw) : min;
		return Number.isFinite(n) ? n : min;
	});

	// Free-typed text. Seeded from the recorded value and re-synced from it only
	// inside the commit handler (never from an $effect watcher) so editing is fluid.
	let text = $state(
		untrack(() => (value === 0 && (section.min ?? 0) === 0 ? '' : String(value))),
	);

	function commit() {
		const trimmed = text.trim();
		const parsed = trimmed === '' ? min : Number(trimmed);
		const clamped = Math.max(min, Math.min(max, Number.isFinite(parsed) ? parsed : min));
		// Reflect the clamped result back into the field.
		text = clamped === 0 && min === 0 ? '' : String(clamped);
		// Omit the row entirely when it sits at the zero default (keeps the payload tidy).
		if (clamped === 0 && min === 0) {
			onChange([]);
			return;
		}
		onChange([makeEntry(section.id, section.id, [{ type: 'number', value: String(clamped) }])]);
	}
</script>

{#if canEdit}
	<div class="flex max-w-28 items-center gap-2">
		<TextInput
			label={Number.isFinite(max) ? `${min}–${max}` : `min ${min}`}
			value={text}
			placeholder={String(min)}
			oninput={(v) => (text = v)}
			onblur={commit}
		/>
	</div>
{:else}
	<span class="min-w-8 text-center text-lg font-bold text-black tabular-nums dark:text-white"
		>{value}</span
	>
{/if}
