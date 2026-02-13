<!--
@component
A bordered container with primary color theme, flex wrap layout, and gap spacing.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Prop {
		children: Snippet;
	}

	const { children }: Prop = $props();
</script>

<div
	class="border-primary-900/10 dark:border-primary-200/10 bg-primary-200/10 dark:bg-primary-950/10 rounded border p-2 lg:p-4"
>
	{@render children()}
</div>
