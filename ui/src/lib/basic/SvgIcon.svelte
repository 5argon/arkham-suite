<!--
@component
Render SVG in standard w-4 h-4 size, i tag and inline-block, fill color with current text color.
-->
<script lang="ts">
	import type { Snippet } from "svelte";

	interface Prop {
		children: Snippet;
	}
    const { children }: Prop = $props();
</script>

<i class="inline-block h-4 w-4 fill-current">{@render children()}</i>
