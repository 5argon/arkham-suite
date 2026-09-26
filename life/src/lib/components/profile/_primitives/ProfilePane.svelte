<!-- @component A profile page body: once the payload is ready, the page, or the notice that replaces it. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { BorderedContainer, HelpParagraph } from '@5argon/arkham-life-ui';
	import type { ProfilePayload } from '$lib/profile/profile-types';
	import { getProfileContext } from '../_framework/profile-context';
	import CategoryHiddenNotice from './CategoryHiddenNotice.svelte';

	let {
		title,
		deckDerived = false,
		unknown = null,
		children
	}: {
		title: string;
		/** Replaced by a notice when the profile shows campaign categories only. */
		deckDerived?: boolean;
		/** Shown instead of the page, e.g. for a slug that resolves to nothing. */
		unknown?: string | null;
		/** Gets the payload and the profile's URL prefix. */
		children: Snippet<[ProfilePayload, string]>;
	} = $props();

	const ctx = getProfileContext();
</script>

<svelte:head><title>{title}</title></svelte:head>

{#if ctx.payload}
	{#if deckDerived && ctx.payload.settings.campaignCategoriesOnly}
		<CategoryHiddenNotice />
	{:else if unknown}
		<BorderedContainer><div class="p-8"><HelpParagraph>{unknown}</HelpParagraph></div></BorderedContainer>
	{:else}
		{@render children(ctx.payload, ctx.base)}
	{/if}
{/if}
