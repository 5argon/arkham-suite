<script lang="ts">
	import {
		CardTagChip,
		FaIconType,
		HelpParagraph,
		MarginFull,
		MarginText,
		SectionSeparator,
		TextInput
	} from '@5argon/arkham-life-ui';
	import { tagGroupName, tagGroupDescription, type TagTypeUsage } from '@5argon/arkham-tags';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	import { tagRepo, withParams, tagHref, compoundHref } from '$lib/tag-browser';
	import TagBrowserHeader from './TagBrowserHeader.svelte';

	const searchQuery = $derived(page.url.searchParams.get('q') ?? '');

	// The search refines this page, so it replaces its history entry.
	function search(value: string) {
		goto(withParams(page.url, { q: value || null }), { replace: true, reset: false });
	}

	const groupedTags = $derived.by((): { group: string; tags: TagTypeUsage[] }[] => {
		const shown = tagRepo.searchTags(searchQuery);
		const byGroup = new Map<string, TagTypeUsage[]>();
		for (const t of shown) {
			const arr = byGroup.get(t.group) ?? [];
			arr.push(t);
			byGroup.set(t.group, arr);
		}
		return Array.from(byGroup.entries()).map(([group, tags]) => ({ group, tags }));
	});

	const shownCompounds = $derived(tagRepo.searchCompoundTags(searchQuery));
</script>

<TagBrowserHeader active="tags" />

<MarginText>
	<HelpParagraph>
		Cards are tagged by the game effects in their text box. Search or pick a tag to see every card
		with it, and jump between a tag and the compound tags (broader groupings) that contain it.
		Tags are a flat list — the <code>Group/Name</code> prefix (e.g. <code>Enemy/Elite Noneliteonly</code>)
		just clusters related tags for browsing; it is not a hierarchy, and tags have no parent/child
		relationships.
	</HelpParagraph>
</MarginText>
<MarginFull>
	<div class="mb-6">
		<TextInput
			value={searchQuery}
			label={m.tool_tag_browser_search_label()}
			placeholder={m.tool_tag_browser_search_placeholder()}
			oninput={search}
		/>
	</div>

	<SectionSeparator title={m.tool_tag_browser_tags()} />
	{#each groupedTags as group (group.group)}
		<div class="mb-5">
			<h3
				class="text-primary-600 dark:text-primary-300 text-sm font-semibold tracking-wide uppercase"
			>
				{tagGroupName(group.group)}
			</h3>
			{#if tagGroupDescription(group.group)}
				<p class="text-primary-500 dark:text-primary-400 mb-2 text-xs">
					{tagGroupDescription(group.group)}
				</p>
			{:else}
				<div class="mb-2"></div>
			{/if}
			<div class="flex flex-wrap gap-2">
				{#each group.tags as t (t.type)}
					<CardTagChip
						label={t.label}
						count={t.count}
						icon={FaIconType.Tag}
						onClick={tagHref(t.type)}
					/>
				{/each}
			</div>
		</div>
	{/each}
	{#if groupedTags.length === 0}
		<p class="text-primary-500 dark:text-primary-400 italic">No tags match “{searchQuery}”.</p>
	{/if}

	<div class="mt-8">
		<SectionSeparator title={m.tool_tag_browser_compound_tags()} />
		<div class="flex flex-wrap gap-2">
			{#each shownCompounds as c (c.type)}
				<CardTagChip
					label={c.label}
					count={c.count}
					highlighted
					icon={FaIconType.Tags}
					onClick={compoundHref(c.type)}
				/>
			{/each}
		</div>
		{#if shownCompounds.length === 0}
			<p class="text-primary-500 dark:text-primary-400 italic">
				No compound tags match “{searchQuery}”.
			</p>
		{/if}
	</div>
</MarginFull>
