<!--
@component
Frames `ReviewRow`s as one compact list.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Prop {
		children: Snippet;
	}
	const { children }: Prop = $props();
</script>

<div
	class="border-primary-300 divide-primary-300 bg-primary-200/60 dark:border-primary-700 dark:divide-primary-700 dark:bg-primary-900/60 divide-y overflow-hidden rounded-md border"
>
	{@render children()}
</div>
