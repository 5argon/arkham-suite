<!--
@component
A help text paragraph styled for informational content.
-->
<script module lang="ts">
	interface Props {
		children: import('svelte').Snippet;
	}
</script>

<script lang="ts">
	const { children }: Props = $props();
</script>

<p class="text-sm text-primary-800 dark:text-primary-200 my-4">
	{@render children()}
</p>
