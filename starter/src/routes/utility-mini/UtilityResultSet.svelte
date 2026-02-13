<script lang="ts">
	import Foldout from '$lib/design/components/basic/Foldout.svelte';
	import type { ResultSet } from './result';
	import UtilityResultItem from './UtilityResultItem.svelte';

	let {
		resultSet,
		expanded,
		onToggle
	}: { resultSet: ResultSet; expanded: boolean; onToggle: () => void } = $props();
</script>

<Foldout {expanded} {onToggle} title={resultSet.setName}>
	<svelte:fragment slot="default">
		{#each resultSet.items as item, i (i)}
			<UtilityResultItem {item} />
		{/each}
	</svelte:fragment>
	<svelte:fragment slot="right">
		<span class="text-sm text-secondary-700 dark:text-secondary-300">
			Items: {resultSet.itemCount}, Printed Count: {resultSet.printedQuantity}
		</span>
	</svelte:fragment>
</Foldout>
