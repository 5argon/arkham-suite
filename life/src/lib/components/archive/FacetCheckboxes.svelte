<!--
@component
One filter facet: a titled row of checkboxes.
-->
<script lang="ts">
	import { Checkbox } from '@5argon/arkham-life-ui';

	interface Props {
		title: string;
		options: { value: string; label: string }[];
		selected: Set<string>;
		onToggle: (value: string) => void;
	}
	let { title, options, selected, onToggle }: Props = $props();
</script>

<section>
	<h3 class="text-primary-800 dark:text-primary-200 mb-1 text-sm font-semibold">{title}</h3>
	<div class="flex flex-wrap gap-2">
		{#each options as o (o.value)}
			<Checkbox label={o.label} checked={selected.has(o.value)} onChange={() => onToggle(o.value)} />
		{/each}
	</div>
</section>
