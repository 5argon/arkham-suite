<script lang="ts">
	import { page } from '$app/state';
	import { u as stringUtils } from '@5argon/arkham-string';
	import { CardClass } from '@5argon/arkham-kohaku';
	import { resolveCardSubpageSlug } from '$lib/campaign/profile/profile-card-subpages';
	import CardSubpageCustomize from '$lib/components/profile/cards/CardSubpageCustomize.svelte';
	import CustomizePane from '$lib/components/profile/_framework/CustomizePane.svelte';

	const section = $derived((page.params as { section: string }).section);
	const sub = $derived(resolveCardSubpageSlug(section));
	const classTitle = $derived(
		(Object.values(CardClass) as string[]).includes(section) ? stringUtils.cardClass(section as CardClass) : section,
	);
</script>

{#if sub}
	<CardSubpageCustomize slug={sub.slug} />
{:else}
	<CustomizePane pane="cardClassDetail" title={`Player Cards — ${classTitle}`} />
{/if}
