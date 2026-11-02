<!--
@component
One series of starter decks on an author's page: an anchored heading
("Series: ...") beside the series icon, the count of decks shown out of the
series' total with a way to remove the filter when it hides some, the
description, and the deck list.
-->
<script lang="ts">
	import { CardCircle, FaIcon, FaIconType, TextParagraph } from '@5argon/arkham-life-ui';

	import * as m from '$lib/paraglide/messages.js';
	import { sortByInvestigator, type StarterSeries } from '$lib/starter-content';
	import { deckMatches, type StarterFilterValue } from '$lib/tool/starter/filter';

	import StarterDeckList from './StarterDeckList.svelte';

	interface Prop {
		series: StarterSeries;
		/**
		 * Narrows the decks shown; the series stays listed even when nothing
		 * matches, so the reader knows it exists.
		 */
		filter?: StarterFilterValue;
		onRemoveFilter?: () => void;
	}
	const { series, filter, onRemoveFilter }: Prop = $props();

	const entries = $derived(
		sortByInvestigator(
			series.entries.filter((entry) => filter === undefined || deckMatches(entry, filter))
		)
	);
</script>

<!-- The series URL lands here: /starter/<author>#<series>. -->
<div id={series.slug} class="scroll-mt-4">
	<div class="mt-2 mb-2 flex items-center gap-3">
		{#if series.iconCard}
			<CardCircle card={series.iconCard} shape="rounded" size="lg" />
		{/if}
		<div class="min-w-0 flex-1">
			<h3 class="text-secondary-900 dark:text-secondary-100 text-xl">
				{m.starter_decks_series_label({ series: series.name })}
			</h3>
			<hr class="dark:border-secondary-400/20 border-secondary-800/40 mb-1" />
			{#if entries.length < series.entries.length}
				<p class="text-primary-700 dark:text-primary-300 flex items-center gap-1.5 text-sm">
					{m.starter_decks_showing({ shown: entries.length, total: series.entries.length })}
					{#if onRemoveFilter}
						<button
							type="button"
							class="hover:bg-primary-300 dark:hover:bg-primary-700 cursor-pointer rounded px-1"
							aria-label={m.starter_decks_remove_filter()}
							title={m.starter_decks_remove_filter()}
							onclick={onRemoveFilter}
						>
							<FaIcon icon={FaIconType.Delete} />
						</button>
					{/if}
				</p>
			{/if}
		</div>
	</div>
	<TextParagraph>{series.description}</TextParagraph>
	<div class="mt-3">
		{#if entries.length > 0}
			<StarterDeckList {entries} />
		{:else}
			<p class="text-primary-700 dark:text-primary-300 text-center text-sm">
				{m.starter_decks_none_match()}
			</p>
		{/if}
	</div>
</div>
