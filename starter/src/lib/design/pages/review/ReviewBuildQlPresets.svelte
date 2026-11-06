<!--
@component
Searches on arkham.build made for the card, a row for each: what it finds, then a square for the
search without an investigator and one for each investigator who can take the card. When each
search has only one way to run, like on an investigator's own page, they're a grid of buttons
named by what they find instead. Hovering shows the investigator and the query it runs.
-->
<script lang="ts">
	import { CardLine, CardSquare, FaIcon, FaIconType, HoverTooltip } from '@5argon/arkham-life-ui';

	import { buildQlSearchUrl } from '$lib/review/buildql';
	import { parseArkhamDbText } from '$lib/utility/arkham-markup';
	import type { BuildQlSearch, BuildQlTopic } from '$lib/server/card-users';

	import BuildQlQuery from './BuildQlQuery.svelte';

	interface Prop {
		topics: BuildQlTopic[];
	}
	const { topics }: Prop = $props();

	// The last search stays after leaving, so the tooltip can animate out with its query.
	let shown = $state<{ search: BuildQlSearch; query: string; element: HTMLElement } | null>(null);
	let visible = $state(false);

	function show(search: BuildQlSearch, query: string, event: Event) {
		shown = { search, query, element: event.currentTarget as HTMLElement };
		visible = true;
	}

	function hide() {
		visible = false;
	}

	/**
	 * A label may hold icons like `[intellect]` and traits like `[[Ally]]`, shown the way card text
	 * shows them and read out as the word.
	 */
	const labelText = (label: string) =>
		label.replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/\[(\w+)\]/g, '$1');

	/**
	 * As many squares as fit on one line stay on one line.
	 */
	const oneLine = 6;

	/**
	 * Squares in their rows, one product per row after the first, when there are too many for a line.
	 */
	function rowsOf(searches: BuildQlSearch[]): BuildQlSearch[][] {
		if (searches.length <= oneLine) return [searches];
		const rows: BuildQlSearch[][] = [];
		for (const search of searches) (rows[search.row] ??= []).push(search);
		return rows.filter((row) => row.length > 0);
	}

	const asButtons = $derived(topics.every((topic) => topic.searches.length === 1));
</script>

{#snippet searchLink(topic: BuildQlTopic, search: BuildQlSearch, asButton: boolean)}
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		aria-label={search.card && !asButton
			? `${labelText(topic.label)}: ${search.card.name}`
			: labelText(topic.label)}
		class={asButton
			? 'border-primary-300 bg-primary-100/60 text-primary-900 hover:bg-primary-200/60 dark:border-primary-700 dark:bg-primary-900/40 dark:text-primary-100 dark:hover:bg-primary-800/60 flex items-center gap-2 rounded-md border px-3 py-2'
			: 'block rounded-sm'}
		href={buildQlSearchUrl(`${search.prefix} ${search.query ?? topic.query}`)}
		onblur={hide}
		onfocus={(event) => show(search, search.query ?? topic.query, event)}
		onmouseenter={(event) => show(search, search.query ?? topic.query, event)}
		onmouseleave={hide}
		rel="noopener"
		target="_blank"
	>
		{#if asButton}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<span class="min-w-0 flex-1">{@html parseArkhamDbText(topic.label)}</span>
			<FaIcon icon={FaIconType.ExternalLink} />
		{:else if search.card}
			<CardSquare card={search.card} />
		{:else}
			<span
				class="border-primary-500/60 text-primary-700 dark:text-primary-300 flex h-[40px] w-[44px] items-center justify-center rounded-sm border border-dashed"
			>
				<FaIcon duotone icon={FaIconType.Investigator} />
			</span>
		{/if}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{/snippet}

{#if asButtons}
	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
		{#each topics as topic (topic.label)}
			{@render searchLink(topic, topic.searches[0], true)}
		{/each}
	</div>
{:else}
	<div class="flex flex-col gap-3">
		{#each topics as topic (topic.label)}
			<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
				<span class="text-primary-900 dark:text-primary-100 sm:w-64 sm:shrink-0">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html parseArkhamDbText(topic.label)}
				</span>
				<div class="flex flex-col gap-1.5">
					{#each rowsOf(topic.searches) as row, i (i)}
						<div class="flex flex-wrap gap-1.5">
							{#each row as search (search.card?.code ?? '')}
								{@render searchLink(topic, search, false)}
							{/each}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}

<HoverTooltip referenceElement={shown?.element} {visible}>
	{#if shown}
		{#if shown.search.card}
			<div class="pt-2">
				<CardLine card={shown.search.card} hideStrip noReserveCardTypeIcon />
			</div>
		{/if}
		<BuildQlQuery prefix={shown.search.prefix} query={shown.query} />
	{/if}
</HoverTooltip>
