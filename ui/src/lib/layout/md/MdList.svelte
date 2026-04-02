<!--
@component
Internal renderer for markdown lists used by MarkdownModal.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		ordered?: boolean;
		children: Snippet;
	}

	const { ordered = false, children }: Props = $props();
</script>

{#if ordered}
	<ol class="text-secondary-900 dark:text-secondary-100 my-3 list-decimal space-y-1 pl-6 text-base">
		{@render children()}
	</ol>
{:else}
	<ul class="text-secondary-900 dark:text-secondary-100 my-3 list-disc space-y-1 pl-6 text-base">
		{@render children()}
	</ul>
{/if}
