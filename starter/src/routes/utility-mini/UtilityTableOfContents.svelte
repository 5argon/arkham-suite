<script lang="ts">
	import utilityMiniCardJsonImport from '$lib/data/util-mini-db.json';

	import type { ResultSet } from './result';
	import UtilityResultSet from './UtilityResultSet.svelte';

	const utilityMiniCardJson: ResultSet[] = utilityMiniCardJsonImport as ResultSet[];
	let openedIndex = $state(-1);
</script>

{#each utilityMiniCardJson as resultSet, i (i)}
	<UtilityResultSet
		{resultSet}
		expanded={openedIndex === i}
		onToggle={() => {
			openedIndex = openedIndex === i ? -1 : i;
		}}
	/>
{/each}
