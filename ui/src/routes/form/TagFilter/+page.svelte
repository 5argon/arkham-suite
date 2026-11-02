<script lang="ts">
	import TagChip from '../../../lib/form/TagChip.svelte';
	import TagFilter from '../../../lib/form/TagFilter.svelte';

	const all = [
		{ label: 'Series A', count: 12 },
		{ label: 'Series B', count: 3 }
	];
	let active = $state<string[]>([]);
</script>

<div class="flex flex-col space-y-4">
	<div class="flex flex-wrap gap-1">
		<TagChip label="Plain" />
		<TagChip label="With Count" count={5} />
		<TagChip label="Clickable" count={5} onClick={() => {}} />
		<TagChip label="Removable" onRemove={() => {}} />
	</div>
	<TagFilter
		tags={all.filter((tag) => !active.includes(tag.label))}
		{active}
		onAdd={(tag) => (active = [...active, tag])}
		onRemove={(tag) => (active = active.filter((t) => t !== tag))}
	/>
</div>
