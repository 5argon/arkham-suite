<!--
@component
A picture and a page of markdown, explaining something a button on a page offers to explain.
-->
<script lang="ts">
	import { Modal } from '@5argon/arkham-life-ui';
	import SvelteMarkdown from 'svelte-marked';

	import MarkdownHeading from '$lib/design/components/basic/MarkdownHeading.svelte';
	import MarkdownLink from '$lib/design/components/basic/MarkdownLink.svelte';
	import MarkdownList from '$lib/design/components/basic/MarkdownList.svelte';
	import MarkdownListItem from '$lib/design/components/basic/MarkdownListItem.svelte';
	import MarkdownParagraph from '$lib/design/components/basic/MarkdownParagraph.svelte';
	import { markdownTokens } from '$lib/md/markdown-tokens';

	interface Prop {
		isOpen: boolean;
		onClose: () => void;
		title: string;
		/**
		 * A picture above the words, if it has one.
		 */
		image?: string;
		source: string;
	}
	const { isOpen, onClose, title, image, source }: Prop = $props();
</script>

<Modal {isOpen} {onClose} maxWidth="lg" {title}>
	<div class="flex flex-col items-center gap-4">
		{#if image}
			<img alt={title} class="w-full max-w-[500px] rounded" src={image} />
		{/if}
		<div class="w-full">
			<SvelteMarkdown
				renderers={{
					// @ts-expect-error - svelte-marked 0.8.0 expects Svelte 4 component types, but we're using Svelte 5
					paragraph: MarkdownParagraph,
					// @ts-expect-error - svelte-marked 0.8.0 expects Svelte 4 component types, but we're using Svelte 5
					heading: MarkdownHeading,
					list: MarkdownList,
					listitem: MarkdownListItem,
					link: MarkdownLink
				}}
				source={markdownTokens(source)}
			/>
		</div>
	</div>
</Modal>
