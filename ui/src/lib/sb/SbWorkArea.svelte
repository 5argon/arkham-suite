<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}
	let { children }: Props = $props();
</script>

<div class="pt-4 px-2 sm:px-8 lg:px-32">{@render children()}</div>
