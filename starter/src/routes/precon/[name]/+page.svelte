<script lang="ts">
	import PreconPage from '../PreconPage.svelte';

	const { data } = $props();
</script>

<PreconPage slug={data.slug} />
