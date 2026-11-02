<!--
@component
Narrows a list by tags: each tag with how many items it would leave, and the
ones in effect on their own row with a way to remove each.
-->
<script lang="ts">
	import TagChip from './TagChip.svelte';
	import * as m from '../paraglide/messages.js';

	interface Prop {
		/**
		 * Tags not in effect, in the order to show them.
		 */
		tags: { label: string; count: number }[];
		active: string[];
		onAdd: (tag: string) => void;
		onRemove: (tag: string) => void;
	}
	const { tags, active, onAdd, onRemove }: Prop = $props();
</script>

<div class="flex flex-col items-center gap-1.5">
	{#if active.length > 0}
		<div class="flex flex-wrap items-center justify-center gap-1.5">
			<span class="text-primary-700 dark:text-primary-300 text-xs font-semibold">
				{m.form_tag_filter_active()}
			</span>
			{#each active as tag (tag)}
				<TagChip label={tag} onRemove={() => onRemove(tag)} />
			{/each}
		</div>
	{/if}
	{#if tags.length > 0}
		<div class="flex flex-wrap justify-center gap-1.5">
			{#each tags as { label, count } (label)}
				<TagChip {label} {count} onClick={() => onAdd(label)} />
			{/each}
		</div>
	{/if}
</div>
