<script lang="ts">
	import { fly } from 'svelte/transition';
	const { children } = $props();
</script>

<div transition:fly="{{ x: -50, duration: 200 }}" style="position: absolute; width: 100%;">
    {@render children?.()}
</div>

<style>
	div {
		/* Add any additional styling if needed */
	}
</style>