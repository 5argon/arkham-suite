<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Prop {
		children: Snippet;
	}
	const { children }: Prop = $props();
</script>

<main class="flex-grow px-1 py-6 sm:px-6 md:px-8 lg:px-12 xl:px-16">
	{@render children()}
</main>
