<!--
@component
The muted one-line message a widget shows when it has nothing to render yet.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<p class="text-primary-500 text-sm">{@render children()}</p>
