<script lang="ts">
	import { Modal } from '@5argon/arkham-life-ui';
	import SvelteMarkdown from 'svelte-marked';

	import MarkdownHeading from '$lib/design/components/basic/MarkdownHeading.svelte';
	import MarkdownLink from '$lib/design/components/basic/MarkdownLink.svelte';
	import MarkdownList from '$lib/design/components/basic/MarkdownList.svelte';
	import MarkdownListItem from '$lib/design/components/basic/MarkdownListItem.svelte';
	import MarkdownParagraph from '$lib/design/components/basic/MarkdownParagraph.svelte';
	import rulesMd from '$lib/md/starter-deck.md?raw';
	import * as m from '$lib/paraglide/messages.js';

	interface Prop {
		isOpen: boolean;
		onClose: () => void;
	}
	const { isOpen, onClose }: Prop = $props();
</script>

<Modal {isOpen} {onClose} maxWidth="lg" title={m.starter_decks_whats()}>
	<div class="flex flex-col items-center gap-4">
		<img
			alt={m.starter_decks_whats()}
			class="w-full max-w-[500px] rounded"
			src="/image/resource/starter.webp"
		/>
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
				source={rulesMd}
			/>
		</div>
	</div>
</Modal>
