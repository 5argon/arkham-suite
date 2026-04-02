<!--
@component
Internal renderer for markdown paragraphs used by MarkdownModal.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
</script>

<p class="text-secondary-900 dark:text-secondary-100 my-3 text-base leading-relaxed">
	{@render children()}
</p>
