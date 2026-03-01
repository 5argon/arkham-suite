<!--
@component
Customize body for a card-taxonomy inner page — resolves the sub-page from its
`slug` and hands its pane + display name to the generic `CustomizePane`.
-->
<script lang="ts">
	import { resolveCardSubpageSlug, type CardSubpageSlug } from '$lib/campaign/profile-card-subpages';
	import CustomizePane from '$lib/components/profile/_framework/CustomizePane.svelte';

	let { slug }: { slug: CardSubpageSlug } = $props();

	const sub = $derived(resolveCardSubpageSlug(slug));
</script>

{#if sub}
	<CustomizePane pane={sub.pane} title={`Player Cards — ${sub.name()}`} />
{/if}
