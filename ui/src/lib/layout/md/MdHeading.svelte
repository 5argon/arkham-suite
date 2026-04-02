<!--
@component
Internal renderer for markdown headings used by MarkdownModal.
H1 → large section heading, H2 → subheading, H3+ → smaller
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		depth?: number;
		children: Snippet;
	}

	const { depth = 1, children }: Props = $props();
</script>

{#if depth === 1}
	<h2 class="text-secondary-900 dark:text-secondary-100 mt-6 mb-2 text-xl font-bold font-['Heading']">
		{@render children()}
	</h2>
	<hr class="dark:border-secondary-400/20 border-secondary-800/30 mb-3" />
{:else if depth === 2}
	<h3 class="text-secondary-900 dark:text-secondary-100 mt-5 mb-2 text-base font-bold">
		{@render children()}
	</h3>
{:else}
	<h4 class="text-secondary-700 dark:text-secondary-300 mt-4 mb-1 text-sm font-semibold">
		{@render children()}
	</h4>
{/if}
