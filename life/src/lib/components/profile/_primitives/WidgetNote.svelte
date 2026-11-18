<!-- @component A centred, muted footnote under a widget's content. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<p class="text-primary-500 mt-3 text-center text-xs">{@render children()}</p>
