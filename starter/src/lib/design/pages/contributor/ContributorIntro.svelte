<!--
@component
Who someone is, at the top of each page about them. Buttons in `children` go beside the links to
their own places.
-->
<script lang="ts">
	import { Button, CardCircle, FaIconType, TextParagraph } from '@5argon/arkham-life-ui';
	import type { Snippet } from 'svelte';

	import * as m from '$lib/paraglide/messages.js';
	import type { Contributor } from '$lib/starter-content';

	interface Prop {
		person: Contributor;
		children?: Snippet;
	}
	const { person, children }: Prop = $props();

	/**
	 * The capture group makes split() place each URL at an odd index.
	 */
	const profileUrl = /(https?:\/\/[^\s)]+)/;
</script>

{#if person.avatarCard}
	<div class="mb-3 flex justify-center">
		<CardCircle card={person.avatarCard} size="xl" />
	</div>
{/if}
{#if person.profile}
	<TextParagraph>
		{#each person.profile.split(profileUrl) as part, i (i)}
			{#if i % 2 === 1}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={part} rel="noopener noreferrer" target="_blank">{part}</a>
			{:else}
				{part}
			{/if}
		{/each}
	</TextParagraph>
{/if}
<div class="mb-4 flex flex-wrap justify-center gap-2">
	{#if person.arkhamdbUrl}
		<Button
			icon={FaIconType.ExternalLink}
			label={m.starter_decks_author_profile()}
			onClick={person.arkhamdbUrl}
		/>
	{/if}
	{#if person.url}
		<Button
			icon={FaIconType.ExternalLink}
			label={m.review_visit_site({ name: person.name })}
			newTab
			onClick={person.url}
		/>
	{/if}
	{@render children?.()}
</div>
