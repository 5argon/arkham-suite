<!--
@component
A standard text paragraph for normal content.
-->
<script module lang="ts">
	interface Props {
		children: import('svelte').Snippet;
	}
</script>

<script lang="ts">
	const { children }: Props = $props();
</script>

<p class="text-base text-secondary-900 dark:text-secondary-100 my-4">
	{@render children()}
</p>
