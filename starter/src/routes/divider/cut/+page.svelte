<script lang="ts">
	import SvelteMarkdown from 'svelte-marked';

	import MarkdownImage from '$lib/design/components/basic/MarkdownImage.svelte';
	import helpMd from '$lib/md/divider-cut.md?raw';
	import { PageLead } from '@5argon/arkham-life-ui';
</script>

<svelte:head>
	<title>arkham-starter.com | The 3mm Divider : Cutting Tips</title>
</svelte:head>

<PageLead title="The 3mm Divider : Cutting Tips" />

<SvelteMarkdown renderers={{ image: MarkdownImage }} source={helpMd} />
