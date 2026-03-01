<!--
@component
A `checklist` section (FHV "Areas Surveyed"): every valid entry is visible at
once as a toggle, since there is no spoiler concern and the player ticks boxes
directly off the sheet. Each ticked item is a recorded entry keyed by its
composite `"section.id"`.
-->
<script lang="ts">
	import { sectionEntries, type CampaignLog, type LogSectionDef } from '@5argon/arkham-campaign-data';
	import { Checkbox } from '@5argon/arkham-life-ui';
	import { makeEntry, type LocalLog } from '$lib/campaign/recorded-state';

	interface Props {
		log: CampaignLog;
		section: LogSectionDef;
		entries: LocalLog[];
		canEdit: boolean;
		onChange: (next: LocalLog[]) => void;
	}

	let { log, section, entries, canEdit, onChange }: Props = $props();

	const items = $derived(sectionEntries(log, section.id).filter((e) => !e.def.hidden));
	const recorded = $derived(new Set(entries.map((e) => e.key)));

	function toggle(key: string) {
		if (!canEdit) return;
		if (recorded.has(key)) {
			onChange(entries.filter((e) => e.key !== key));
		} else {
			onChange([...entries, makeEntry(section.id, key)]);
		}
	}
</script>

<div class="flex flex-wrap gap-2">
	{#each items as item (item.key)}
		<Checkbox
			label={item.en.text}
			checked={recorded.has(item.key)}
			onChange={() => toggle(item.key)}
		/>
	{/each}
</div>
