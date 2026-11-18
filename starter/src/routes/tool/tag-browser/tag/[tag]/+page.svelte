<script lang="ts">
	import {
		Button,
		CardTagChip,
		FaIconType,
		MarginFull,
		PageLead,
		SectionSeparator
	} from '@5argon/arkham-life-ui';
	import {
		compoundTagName,
		compoundTagsContaining,
		groupOfTagType,
		tagDescription,
		tagGroupName,
		tagName
	} from '@5argon/arkham-tags';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllCards } from '$lib/card-data';
	import {
		argsLabel,
		compoundHref,
		parseWhere,
		tagHref,
		tagMatchesWhere,
		tagRepo,
		toCardItems
	} from '$lib/tag-browser';
	import TagCardResults from '../../TagCardResults.svelte';
	import TagErrorReport from '../../TagErrorReport.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const allCards = getAllCards();
	const type = $derived(data.type);
	/** Narrows the cards to those whose tag arguments match, from a card's tag or a compound member. */
	const where = $derived(parseWhere(page.url.searchParams.get('where')));
	/** Every card carrying the tag, before the `where` filter. */
	const tagCards = $derived(tagRepo.cardsByTagType(type));
	const shownCards = $derived(
		toCardItems(
			where
				? tagCards.filter((c) => c.tags.some((t) => t.type === type && tagMatchesWhere(t, where)))
				: tagCards
		)
	);
	const relatedCompounds = $derived(compoundTagsContaining(type));
</script>

<svelte:head>
	<title>{m.tool_tag_browser_page_title()} | {tagName(type)}</title>
</svelte:head>

<PageLead title={tagName(type)} description={tagDescription(type)} />

<MarginFull>
	<p class="text-primary-500 dark:text-primary-400 mb-3 text-sm">
		{tagGroupName(groupOfTagType(type))} · {type}
	</p>

	{#if where}
		<div
			class="border-secondary-400 bg-secondary-50 dark:border-secondary-500 dark:bg-secondary-950 mb-4 flex flex-wrap items-center gap-3 rounded border px-3 py-2 text-sm"
		>
			<span class="text-primary-800 dark:text-primary-200">
				Filtered to <strong>{argsLabel(where)}</strong>
			</span>
			<Button label={`Show all ${tagName(type)} (${tagCards.length})`} onClick={tagHref(type)} />
		</div>
	{/if}

	{#if relatedCompounds.length > 0}
		<SectionSeparator title={m.tool_tag_browser_in_compound()} inner />
		<div class="mt-2 mb-4 flex flex-wrap gap-2">
			{#each relatedCompounds as c (c.type)}
				<CardTagChip
					label={compoundTagName(c.type)}
					count={tagRepo.compoundTagCount(c.type)}
					highlighted
					icon={FaIconType.Tags}
					onClick={compoundHref(c.type)}
				/>
			{/each}
		</div>
	{/if}

	<SectionSeparator title={`${m.tool_tag_browser_cards()} (${shownCards.length})`} />
	<TagCardResults items={shownCards} />
	{#key type}
		<TagErrorReport
			tagType={type}
			tagDisplayName={tagName(type)}
			{allCards}
			members={tagCards}
			kind="Tag"
		/>
	{/key}
</MarginFull>
