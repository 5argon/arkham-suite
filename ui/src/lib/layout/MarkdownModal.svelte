<!--
@component
A modal that renders markdown content with styled headings, paragraphs and lists.

### Usage
```svelte
import mdText from '$lib/md/my-doc.md?raw';
import { MarkdownModal } from '@5argon/arkham-life-ui';

<MarkdownModal
  source={mdText}
  isOpen={modalOpen}
  onClose={() => (modalOpen = false)}
  title="Documentation"
/>
```
-->
<script lang="ts">
	import SvelteMarkdown from 'svelte-marked';
	import Modal from './Modal.svelte';
	import MdHeading from './md/MdHeading.svelte';
	import MdParagraph from './md/MdParagraph.svelte';
	import MdList from './md/MdList.svelte';
	import MdListItem from './md/MdListItem.svelte';

	interface Props {
		/** Raw markdown string to render. Import with `?raw` in Vite. */
		source: string;
		isOpen: boolean;
		onClose: () => void;
		title?: string;
		maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
	}

	const { source, isOpen, onClose, title, maxWidth = 'lg' }: Props = $props();
</script>

<Modal {isOpen} {onClose} {title} {maxWidth}>
	<div class="prose-sm max-h-[70vh] overflow-y-auto pb-4">
		<!-- @ts-expect-error – svelte-marked 0.8.0 expects Svelte 4 component types, but we're using Svelte 5 -->
		<SvelteMarkdown
			{source}
			renderers={{
				heading: MdHeading,
				paragraph: MdParagraph,
				list: MdList,
				listitem: MdListItem,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any}
		/>
	</div>
</Modal>
