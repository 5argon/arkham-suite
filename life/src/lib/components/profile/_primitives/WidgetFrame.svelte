<!--
@component
The default card frame for a profile widget — a bordered, rounded card that gives
every widget a clear visual boundary, with its own HEADER TAB: a distinct banded
strip across the top (its own fill + a "fold" edge below it), like the labelled
tab of a physical reference card — deliberately NOT the inline SectionSeparator
look. The tab optionally carries an artistic image from the static folder:
right-aligned, with a left-to-right scrim so the left title stays legible over
ANY image. A missing image degrades to the plain tab.

A placed widget ALWAYS shows its frame, even with no data (an empty body) — placing
a widget is a deliberate choice, so it stays visible as a blank to fill in rather than
silently disappearing.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { FaIcon, FaIconType, Modal } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import Doc from '$lib/docs/Doc.svelte';

	let {
		title = null,
		image = null,
		noteDoc = null,
		children
	}: {
		/** The card's header-tab title. When null, the card has no tab (just the boundary). */
		title?: string | null;
		/** Static-root image path (e.g. `/image/widget/...webp`) shown right-aligned in the tab. */
		image?: string | null;
		/** Optional doc path (under src/lib/docs) explaining this widget's data caveats. When set
		 *  (and the card has a title), a clickable info icon in the header opens a modal rendering
		 *  the doc. The generic "this widget's data has caveats" hook. */
		noteDoc?: string | null;
		children: Snippet;
	} = $props();

	// Hide a broken image gracefully so a missing asset degrades to the plain tab.
	let imageFailed = $state(false);
	const showImage = $derived(!!image && !imageFailed);

	let noteOpen = $state(false);
</script>

<section
	class="widget-frame border-primary-200 dark:border-primary-700 bg-primary-50/40 dark:bg-primary-900/20 relative overflow-hidden rounded-lg border"
>
	{#if title}
		<div
			class="border-primary-200 dark:border-primary-700 bg-primary-100 dark:bg-primary-800/70 relative flex items-center overflow-hidden border-b px-4 py-2.5"
		>
			{#if showImage}
				<!-- The image fills the right of the tab; its left edge is a crisp DIAGONAL
				     cut (clip-path), so the header colour behind shows through as a slanted
				     "tab fold" — a real slant, not a soft near-vertical fade. The slant size
				     is set in % of width, so it stays visible regardless of header height. -->
				<img
					src={image}
					alt=""
					aria-hidden="true"
					onerror={() => (imageFailed = true)}
					class="widget-frame__tab-img pointer-events-none absolute inset-y-0 right-0 h-full w-2/3 max-w-md object-cover object-right"
				/>
			{/if}
			<h3
				class="text-secondary-900 dark:text-secondary-100 dark:text-shadow-primary-900/50 relative z-10 text-lg leading-tight font-semibold"
			>
				<div class="bg-primary-100/90 dark:bg-primary-800/80 rounded px-2">
					{title}
				</div>
			</h3>
			{#if noteDoc}
				<button
					type="button"
					onclick={() => (noteOpen = true)}
					aria-label={m.framework_widget_note_label()}
					title={m.framework_widget_note_label()}
					class="bg-primary-100/90 dark:bg-primary-800/80 text-secondary-700 dark:text-secondary-200 hover:text-secondary-900 dark:hover:text-secondary-50 relative z-10 ml-auto shrink-0 cursor-pointer rounded-full p-1 leading-none transition"
				>
					<FaIcon icon={FaIconType.NoticeInfo} />
				</button>
			{/if}
		</div>
	{/if}
	<div class="widget-frame__body dark:bg-primary-950/20 bg-primary-50/40 relative p-4">
		{@render children()}
	</div>
</section>

{#if noteDoc}
	<Modal isOpen={noteOpen} onClose={() => (noteOpen = false)} title={title ?? ''} maxWidth="md">
		<div class="py-2">
			<Doc path={noteDoc} />
		</div>
	</Modal>
{/if}

<style>
	/* A placed but data-less widget keeps a visible, uniform blank body to fill in
	   (rather than hiding) — placing a widget is a deliberate choice. */
	.widget-frame__body:empty {
		min-height: 3rem;
	}

	/* Crisp diagonal left edge on the header image — the slanted "tab fold". The
	   top-left corner is inset (22% of the image's own width) while the bottom-left
	   sits flush, so the header colour behind shows through as a clean slant. */
	.widget-frame__tab-img {
		clip-path: polygon(4% 0, 100% 0, 100% 100%, 0 100%);
	}
</style>
