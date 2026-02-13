<script lang="ts">
	import OpenGraph from '$lib/components/OpenGraph.svelte';

	import type { ExploreData } from './+page';
	import ExpansionSpread from '$lib/design/components/expansion/ExpansionSpread.svelte';

	export let data: ExploreData;
	$: q = data.q;
</script>

<OpenGraph
	description="View cards inside a particular product to help with purchasing decisions."
	image="image/resource/player.webp"
	title="Player Cards"
	url="/player"
/>

<ExpansionSpread />
