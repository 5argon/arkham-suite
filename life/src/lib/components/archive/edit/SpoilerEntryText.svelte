<!--
@component
Renders a campaign-data log entry's localized text, splitting it into spoiler /
non-spoiler segments via `spoilerSegments()`. Non-spoiler segments are rendered
with full Arkham inline markup (`[skull]`, `**bold**`, `*italic*`); spoiler
segments are obscured as solid blocks (the text stays in the DOM for a11y /
search), exactly like the `ui` SpoilerText treatment — now generalized to every
campaign instead of the old hard-coded DWL demo.

Pass `reveal` to show spoilers unblurred (e.g. for an entry the player has
already recorded, so it is no longer a spoiler to them).
-->
<script lang="ts">
	import { spoilerSegments, type EnEntry } from '@5argon/arkham-campaign-data';
	import { parseArkhamMarkup } from '@5argon/arkham-life-ui';
	import { capitalizeFirst } from '$lib/campaign/entry-text';

	interface Props {
		en: EnEntry;
		/** Optional already-substituted text (e.g. `#X#` replaced); defaults to `en.text`. */
		text?: string;
		/** Reveal spoiler segments instead of blurring them. */
		reveal?: boolean;
		class?: string;
	}

	let { en, text, reveal = false, class: className = '' }: Props = $props();

	// campaign-data `-en` text is intentionally lowercase to splice into sentences;
	// for standalone display we capitalize the first letter of the first segment.
	const segments = $derived.by(() => {
		const segs = text !== undefined ? spoilerSegments({ ...en, text }) : spoilerSegments(en);
		return segs.length
			? [{ ...segs[0], text: capitalizeFirst(segs[0].text) }, ...segs.slice(1)]
			: segs;
	});
</script>

<span class={className}>
	{#each segments as seg, i (i)}
		{#if seg.spoiler && !reveal}
			<span
				class="bg-primary-900 text-primary-900 dark:bg-primary-100 dark:text-primary-100 cursor-default rounded select-none"
				aria-hidden="true">{seg.text}</span
			>
		{:else}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html parseArkhamMarkup(seg.text)}
		{/if}
	{/each}
</span>
