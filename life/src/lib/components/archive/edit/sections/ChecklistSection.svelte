<!--
@component
A `checklist` section (FHV Areas Surveyed): every entry shown as a toggle, ticked straight off the
sheet.
-->
<script lang="ts">
	import { sectionEntries } from '@5argon/arkham-campaign-data';
	import { Checkbox } from '@5argon/arkham-life-ui';
	import { makeEntry } from '$lib/campaign/records/recorded-state';
	import type { SectionProps } from './types';

	let { log, section, entries, onChange }: SectionProps = $props();

	const items = $derived(sectionEntries(log, section.id).filter((e) => !e.def.hidden));
	const recorded = $derived(new Set(entries.map((e) => e.key)));

	function toggle(key: string) {
		onChange(
			recorded.has(key) ? entries.filter((e) => e.key !== key) : [...entries, makeEntry(section.id, key)]
		);
	}
</script>

<div class="flex flex-wrap gap-2">
	{#each items as item (item.key)}
		<Checkbox label={item.en.text} checked={recorded.has(item.key)} onChange={() => toggle(item.key)} />
	{/each}
</div>
