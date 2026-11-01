<script lang="ts">
	import { Foldout } from '@5argon/arkham-life-ui';

	import type { ResultSet } from './result';
	import UtilityResultItem from './UtilityResultItem.svelte';

	let {
		resultSet,
		expanded,
		onToggle
	}: { resultSet: ResultSet; expanded: boolean; onToggle: () => void } = $props();
</script>

<Foldout {expanded} {onToggle} title={resultSet.setName}>
	{#snippet right()}
		<span class="text-sm text-secondary-700 dark:text-secondary-300">
			Items: {resultSet.itemCount}, Printed Count: {resultSet.printedQuantity}
		</span>
	{/snippet}
	{#each resultSet.items as item, i (i)}
		<UtilityResultItem {item} />
	{/each}
</Foldout>
