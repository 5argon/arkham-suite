<!--
@component
mdsvex layout wrapped around every doc (`src/lib/docs/**`). Wraps content in `.doc-body`; the
element typography (incl. `##` → SectionSeparator look) lives in the global `app.css` `.doc-body`
block (so @apply is Tailwind-processed and svelte-check doesn't flag it). Embedded Svelte
components in a doc (DocButton, Figure, links) render as-is.
-->
<script lang="ts">
	let { children } = $props();
</script>

<div class="doc-body">
	{@render children()}
</div>
