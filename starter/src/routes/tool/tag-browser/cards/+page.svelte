<script lang="ts">
	import {
		Button,
		CardFormSingle,
		HelpParagraph,
		MarginFull,
		MarginText,
		SectionSeparator
	} from '@5argon/arkham-life-ui';
	import { card as cardUtil, type Card } from '@5argon/arkham-kohaku';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllCards } from '$lib/card-data';
	import { packHref, taggedPacks } from '$lib/tag-browser';
	import TagBrowserHeader from '../TagBrowserHeader.svelte';

	const allCards = getAllCards();
	const packList = taggedPacks();
</script>

<TagBrowserHeader active="cards" />

<MarginText>
	<HelpParagraph>{m.tool_tag_browser_card_help()}</HelpParagraph>
</MarginText>
<MarginFull>
	<div class="mb-6">
		<CardFormSingle
			label={m.tool_tag_browser_jump_label()}
			placeholder={m.tool_tag_browser_jump_placeholder()}
			cards={allCards}
			filter={cardUtil.playerCardsNonCampaignFilter}
			onSelect={(card: Card) => goto(resolve('/tool/tag-browser/card/[code]', { code: card.code }))}
		/>
	</div>

	<SectionSeparator title={m.tool_tag_browser_browse_pack()} />
	<div class="mt-2 flex flex-wrap gap-2">
		{#each packList as p (p.code)}
			<Button label={`${p.name} (${p.count})`} onClick={packHref(p.code)} />
		{/each}
	</div>
</MarginFull>
