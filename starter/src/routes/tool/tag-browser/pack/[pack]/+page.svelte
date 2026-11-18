<script lang="ts">
	import { MarginFull, PageLead } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { cardsToItems, packCards } from '$lib/tag-browser';
	import TagCardResults from '../../TagCardResults.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const items = $derived(cardsToItems(packCards(data.pack.product)));
</script>

<svelte:head>
	<title>{m.tool_tag_browser_page_title()} | {data.pack.name}</title>
</svelte:head>

<PageLead title={data.pack.name} description={m.tool_tag_browser_pack_hint()} />

<MarginFull>
	<TagCardResults {items} />
</MarginFull>
