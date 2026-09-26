<!--
@component
A widget's card: a header tab with the title (plus the scenario's icon, optional right-aligned art,
and an info button opening `noteDoc`) above the body. A placed widget keeps its frame even when
empty, as a visible blank to fill in.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { EncounterSetIcon, FaIcon, FaIconType, Modal } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import Doc from '$lib/docs/Doc.svelte';
	import { scenarioIconSet } from './ScenarioSetIcon.svelte';

	let {
		title = null,
		image = null,
		noteDoc = null,
		scenario = null,
		children
	}: {
		/** No title, no tab. */
		title?: string | null;
		/** Static path of the tab art. */
		image?: string | null;
		/** Doc path under src/lib/docs. */
		noteDoc?: string | null;
		scenario?: string | null;
		children: Snippet;
	} = $props();

	let imageFailed = $state(false);
	const showImage = $derived(!!image && !imageFailed);

	const iconSet = $derived(scenario ? scenarioIconSet(scenario) : null);

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
				<span class="bg-primary-100/90 dark:bg-primary-800/80 flex items-center gap-1.5 rounded px-2">
					{#if iconSet}
						<span class="leading-none">
							<EncounterSetIcon encounterSet={iconSet} />
						</span>
					{/if}
					<span>{title}</span>
				</span>
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
	.widget-frame__body:empty {
		min-height: 3rem;
	}

	/* The image's left edge slants: the top-left corner is inset, the bottom-left is flush. */
	.widget-frame__tab-img {
		clip-path: polygon(4% 0, 100% 0, 100% 100%, 0 100%);
	}
</style>
