<!--
@component
Optional captioned image for docs. Authors usually just write markdown `![alt](./shot.webp)` (the
doc layout styles bare <img>, and remark-doc-images rewrites the relative path); reach for <Figure>
only when a caption is wanted. NOTE: remark-doc-images only rewrites markdown `![]()` image nodes,
NOT component attributes — so pass `src` as the ALREADY-SERVED path, e.g.
`src="/docs/<docPath>/shot.webp"`, not a bare `./shot.webp` (which would 404).
-->
<script lang="ts">
	let { src, alt = '', caption = '' }: { src: string; alt?: string; caption?: string } = $props();
</script>

<figure class="my-4 text-center">
	<img
		{src}
		{alt}
		loading="lazy"
		class="border-primary-200 dark:border-primary-700 mx-auto block max-w-full rounded-lg border"
	/>
	{#if caption}
		<figcaption class="text-primary-500 mt-1 text-xs">{caption}</figcaption>
	{/if}
</figure>
