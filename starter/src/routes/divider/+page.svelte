<script lang="ts">
	import SvelteMarkdown from 'svelte-marked';

	import MarkdownImage from '$lib/design/components/basic/MarkdownImage.svelte';
	import MarkdownParagraph from '$lib/design/components/basic/MarkdownParagraph.svelte';
	import MarkdownHeading from '$lib/design/components/basic/MarkdownHeading.svelte';
	import MarkdownList from '$lib/design/components/basic/MarkdownList.svelte';
	import MarkdownListItem from '$lib/design/components/basic/MarkdownListItem.svelte';
	import MarkdownLink from '$lib/design/components/basic/MarkdownLink.svelte';
	import { MarginFull, MarginText, PageLead } from '@5argon/arkham-life-ui';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import helpMd from '$lib/md/divider.md?raw';
	import * as m from '$lib/paraglide/messages.js';
</script>

<OpenGraph
	description="Minimal-style dividers that are only 3mm wider than the cards. It has many unique quirks such as fitting in the new campaign box, supporting both orientations in one design, sleevable, and available in multiple languages."
	image="image/resource/divider.webp"
	title="The 3mm Divider"
	url="/divider"
/>

<MarginFull>
	<PageLead title={m.divider_title()} />
</MarginFull>

<MarginText>
	<SvelteMarkdown
		renderers={{
			image: MarkdownImage,
			// @ts-expect-error - svelte-marked 0.8.0 expects Svelte 4 component types, but we're using Svelte 5
			paragraph: MarkdownParagraph,
			heading: MarkdownHeading,
			list: MarkdownList,
			listitem: MarkdownListItem,
			link: MarkdownLink
		}}
		source={helpMd}
	/>
</MarginText>
