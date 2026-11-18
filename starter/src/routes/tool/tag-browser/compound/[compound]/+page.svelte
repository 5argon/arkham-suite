<script lang="ts">
	import {
		CardTagChip,
		FaIconType,
		MarginFull,
		PageLead,
		SectionSeparator
	} from '@5argon/arkham-life-ui';
	import { compoundTagDescription, compoundTagName } from '@5argon/arkham-tags';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllCards } from '$lib/card-data';
	import { tagHref, tagRepo, toCardItems, whereArgPairs } from '$lib/tag-browser';
	import TagCardResults from '../../TagCardResults.svelte';
	import TagErrorReport from '../../TagErrorReport.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const allCards = getAllCards();
	const type = $derived(data.type);
	const compoundCards = $derived(tagRepo.cardsByCompoundTag(type));
	const members = $derived(tagRepo.compoundTagMemberUsages(type));
</script>

<svelte:head>
	<title>{m.tool_tag_browser_page_title()} | {compoundTagName(type)}</title>
</svelte:head>

<PageLead title={compoundTagName(type)} description={compoundTagDescription(type)} />

<MarginFull>
	<SectionSeparator title={m.tool_tag_browser_members()} inner />
	<div class="mt-2 mb-4 flex flex-wrap gap-2">
		{#each members as member (member.type + JSON.stringify(member.where ?? {}))}
			<CardTagChip
				label={member.label}
				args={whereArgPairs(member.where)}
				count={member.count}
				icon={FaIconType.Tag}
				onClick={tagHref(member.type, member.where)}
			/>
		{/each}
	</div>

	<SectionSeparator title={`${m.tool_tag_browser_cards()} (${compoundCards.length})`} />
	<TagCardResults items={toCardItems(compoundCards)} />
	{#key type}
		<TagErrorReport
			tagType={type}
			tagDisplayName={compoundTagName(type)}
			{allCards}
			members={compoundCards}
			kind="Compound"
		/>
	{/key}
</MarginFull>
