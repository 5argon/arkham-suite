<!--
@component
Padding for text so user starts reading near the center of screen in big screens.
When screen gets smaller this gets more relaxed.
It also limits the max width so eye doesn't have to travel too far reading new lines.
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

<div class="md:px-16 lg:px-32 xl:px-48 2xl:px-64" >
	{@render children()}
</div>