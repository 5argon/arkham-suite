<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Prop {
		children: Snippet;
	}
	const { children }: Prop = $props();
</script>

<!--
	A phone gets the page almost edge to edge, which suits boxes and rows but not text. Text and
	headings sitting on the page move in by --page-text-inset, which a box with its own padding resets.
-->
<main
	class="flex-grow px-1 py-6 [--page-text-inset:0.75rem] sm:px-6 sm:[--page-text-inset:0px] md:px-8 lg:px-12 xl:px-16"
>
	{@render children()}
</main>
