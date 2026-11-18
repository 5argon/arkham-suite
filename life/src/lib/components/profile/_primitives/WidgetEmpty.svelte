<!-- @component The muted line a widget shows when there is nothing recorded yet. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<p class="text-primary-500 text-sm">{@render children()}</p>
