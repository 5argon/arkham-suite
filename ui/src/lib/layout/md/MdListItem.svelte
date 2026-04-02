<!--
@component
Internal renderer for markdown list items used by MarkdownModal.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
</script>

<li class="text-secondary-900 dark:text-secondary-100 leading-relaxed">
	{@render children()}
</li>
