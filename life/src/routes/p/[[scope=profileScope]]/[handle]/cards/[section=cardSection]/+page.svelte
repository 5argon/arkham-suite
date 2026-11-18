<script lang="ts">
	import { page } from '$app/state';
	import { resolveCardSubpageSlug } from '$lib/campaign/profile/profile-card-subpages';
	import CardSubpageSection from '$lib/components/profile/cards/CardSubpageSection.svelte';
	import CardsClassSection from '$lib/components/profile/cards/class/CardsClassSection.svelte';

	// `[section]` (matcher-validated) is EITHER a card-type sub-page slug or a CardClass.
	const sub = $derived(resolveCardSubpageSlug((page.params as { section: string }).section));
</script>

{#if sub}
	<CardSubpageSection slug={sub.slug} />
{:else}
	<CardsClassSection />
{/if}
