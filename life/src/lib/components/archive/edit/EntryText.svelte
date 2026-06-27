<!--
@component
Renders a campaign-data log entry's localized text with full Arkham inline markup
(`[skull]`, `**bold**`, `*italic*`), capitalizing the first letter (the `-en` text
is intentionally lowercase so it can splice into sentences). Rendered as plain
text with no spoiler blurring: fuzzy search narrows entries to one fast enough
that spoiler protection only makes input harder.
-->
<script lang="ts">
	import type { EnEntry } from '@5argon/arkham-campaign-data';
	import { parseArkhamMarkup } from '@5argon/arkham-life-ui';
	import { capitalizeFirst } from '$lib/campaign/utils/entry-text';

	interface Props {
		en: EnEntry;
		/** Optional already-substituted text (e.g. `#X#` replaced); defaults to `en.text`. */
		text?: string;
		class?: string;
	}

	let { en, text, class: className = '' }: Props = $props();
	const display = $derived(capitalizeFirst(text !== undefined ? text : en.text));
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<span class={className}>{@html parseArkhamMarkup(display)}</span>
