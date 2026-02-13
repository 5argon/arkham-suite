<!--
@component
Padding for things intended to take full advantage of browser width.
It still has a little bit of responsive padding.
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}
</script>

<script lang="ts">
	const { children }: Props = $props();
</script>

<div class="md:mx-4 lg:mx-16">
	{@render children()}
</div>
