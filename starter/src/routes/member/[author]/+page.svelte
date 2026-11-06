<script lang="ts">
	import { snapshot } from '$app/navigation';
	import {
		Button,
		CardCircle,
		Foldout,
		MarginFull,
		MarginText,
		PageLead,
		SectionSeparator,
		Tabs
	} from '@5argon/arkham-life-ui';
	import { tick } from 'svelte';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import ContributorIntro from '$lib/design/pages/contributor/ContributorIntro.svelte';
	import StarterFilter from '$lib/design/pages/starter/StarterFilter.svelte';
	import StarterSeriesSection from '$lib/design/pages/starter/StarterSeriesSection.svelte';
	import StarterTeamBar from '$lib/design/pages/starter/StarterTeamBar.svelte';
	import PrebuiltTeamList from '$lib/design/pages/team/PrebuiltTeamList.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { reviewerHref } from '$lib/review/paths';
	import { contributorHref } from '$lib/starter-content';
	import { contributorJsonLd } from '$lib/starter-content/seo';
	import {
		deckMatches,
		type StarterFilterValue,
		teamHasTags,
		teamMatches
	} from '$lib/tool/starter/filter';

	const { data } = $props();
	const teams = $derived(data.teams);
	const hasDecks = $derived(data.series.length > 0 || teams.length > 0);
	const title = $derived(
		hasDecks
			? m.starter_decks_author_title({ author: data.author.name })
			: m.starter_decks_contributor_title({ name: data.author.name })
	);
	const fallbackDescription = $derived(
		hasDecks
			? m.starter_decks_author_description({ author: data.author.name })
			: m.starter_decks_contributor_description({ name: data.author.name })
	);

	let deckFilter = $state<StarterFilterValue>({ products: new Set(), investigators: new Set() });
	let teamFilter = $state<StarterFilterValue>({ products: new Set(), investigators: new Set() });
	let deckFilterPanel = $state<StarterFilter>();
	const deckCount = $derived(
		data.series.reduce(
			(sum, series) => sum + series.entries.filter((e) => deckMatches(e, deckFilter)).length,
			0
		)
	);
	const visibleTeams = $derived(teams.filter((entry) => teamMatches(entry, teamFilter)));
	let activeTags = $state<string[]>([]);
	const taggedTeamCount = $derived(
		visibleTeams.filter((entry) => teamHasTags(entry, activeTags)).length
	);
	snapshot({
		id: 'starter-author-team-tags',
		capture: () => [...activeTags],
		restore: (value) => (activeTags = value)
	});
	const tabIds = ['decks', 'teams'] as const;
	let tab = $state<'decks' | 'teams'>('decks');
	snapshot({
		id: 'member-tab',
		capture: () => tab,
		restore: (value) => (tab = value)
	});

	/**
	 * The contents link to series anchors on the Decks tab; from the Teams tab
	 * the anchor only exists after switching back.
	 */
	async function jumpToSeries(event: MouseEvent, slug: string) {
		if (tab === 'decks') return;
		event.preventDefault();
		tab = 'decks';
		await tick();
		document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

<OpenGraph
	description={fallbackDescription}
	image="image/resource/starter.webp"
	{title}
	url={contributorHref(data.author)}
	canonical
	author={data.author.name}
	jsonLd={contributorJsonLd(data.author)}
/>

{#if hasDecks}
	<MarginText>
		<div class="mt-4">
			<StarterTeamBar />
		</div>
	</MarginText>
{/if}

<PageLead {title} />

<MarginText>
	<ContributorIntro person={data.author}>
		{#if data.hasReviews}
			<Button
				label={m.review_member_reviews({ name: data.author.name })}
				onClick={reviewerHref(data.author.slug)}
			/>
		{/if}
	</ContributorIntro>
	{#if hasDecks}
		<SectionSeparator title={m.starter_decks_series_heading()} />
		<ul class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
			{#each data.series as series (series.slug)}
				<li>
					<a
						class="bg-primary-200 dark:bg-primary-900 hover:bg-primary-300 dark:hover:bg-primary-800 flex items-center gap-3 rounded-md px-2 py-1.5"
						href="#{series.slug}"
						onclick={(event) => jumpToSeries(event, series.slug)}
					>
						{#if series.iconCard}
							<CardCircle card={series.iconCard} shape="rounded" size="md" />
						{/if}
						<span class="flex min-w-0 flex-col">
							<span class="text-primary-900 dark:text-primary-100 font-semibold">{series.name}</span
							>
							<span class="text-primary-700 dark:text-primary-300 text-xs">
								{m.starter_decks_deck_count({ count: series.entries.length })}
							</span>
						</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</MarginText>
{#if hasDecks}
	<MarginFull>
		<div class="mt-4">
			<Tabs
				direction="horizontal"
				activeTabIndex={tabIds.indexOf(tab)}
				onTabChange={(index) => (tab = tabIds[index])}
				tabs={tabIds.map((id) => ({
					label:
						id === 'decks'
							? m.starter_decks_tab_decks({ count: deckCount })
							: m.starter_decks_tab_teams({ count: taggedTeamCount })
				}))}
			/>
		</div>
	</MarginFull>
{/if}
{#if hasDecks}
	<!-- Both stay mounted: the tab labels count what each filter matches. -->
	<MarginText>
		<div class="mt-4" class:hidden={tab !== 'decks'}>
			<Foldout title={m.starter_decks_filter()} keepMounted>
				<div class="p-3">
					<StarterFilter
						bind:this={deckFilterPanel}
						initiallyAll
						withChapterTwo
						hideProductsHelp
						onChange={(f) => (deckFilter = f)}
					/>
				</div>
			</Foldout>
		</div>
		<div class="mt-4" class:hidden={tab !== 'teams'}>
			<Foldout title={m.starter_decks_filter()} keepMounted>
				<div class="p-3">
					<StarterFilter
						initiallyAll
						withChapterTwo
						hideProductsHelp
						showMustIncludeAll
						snapshotId="starter-author-team-filter"
						onChange={(f) => (teamFilter = f)}
					/>
				</div>
			</Foldout>
		</div>
	</MarginText>
{/if}
<MarginFull>
	{#if tab === 'decks' && hasDecks}
		<div class="mt-4">
			{#each data.series as series (series.slug)}
				<div class="mb-8">
					<StarterSeriesSection
						{series}
						filter={deckFilter}
						onRemoveFilter={() => deckFilterPanel?.reset()}
					/>
				</div>
			{/each}
		</div>
	{:else if tab === 'teams' && hasDecks}
		<div class="mt-4">
			<PrebuiltTeamList entries={visibleTeams} filter={teamFilter} bind:activeTags />
		</div>
	{/if}
</MarginFull>
