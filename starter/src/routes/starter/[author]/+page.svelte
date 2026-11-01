<script lang="ts">
	import { snapshot } from '$app/navigation';
	import {
		Button,
		CardCircle,
		FaIconType,
		Foldout,
		HelpParagraph,
		MarginFull,
		MarginText,
		PageLead,
		SectionSeparator,
		Tabs,
		TextParagraph
	} from '@5argon/arkham-life-ui';
	import { tick } from 'svelte';

	import { getAllCards } from '$lib/card-data';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import StarterFilter from '$lib/design/pages/starter/StarterFilter.svelte';
	import StarterSeriesSection from '$lib/design/pages/starter/StarterSeriesSection.svelte';
	import PrebuiltTeamList from '$lib/design/pages/team/PrebuiltTeamList.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { prebuiltTeamsOf, starterAuthorHref } from '$lib/starter-content';
	import { starterAuthorJsonLd } from '$lib/starter-content/seo';
	import {
		deckMatches,
		decodeTeams,
		type StarterFilterValue,
		teamMatches
	} from '$lib/tool/starter/filter';

	/**
	 * The capture group makes split() place each URL at an odd index.
	 */
	const profileUrl = /(https?:\/\/[^\s)]+)/;

	const { data } = $props();
	const title = $derived(m.starter_decks_author_title({ author: data.author.name }));
	const teams = $derived(decodeTeams(prebuiltTeamsOf(data.author.slug), getAllCards()));

	let filter = $state<StarterFilterValue>({ products: new Set(), investigators: new Set() });
	const deckCount = $derived(
		data.series.reduce(
			(sum, series) => sum + series.entries.filter((e) => deckMatches(e, filter)).length,
			0
		)
	);
	const visibleTeams = $derived(teams.filter((entry) => teamMatches(entry, filter)));
	let tab = $state(0);
	snapshot({
		id: 'starter-author-tab',
		capture: () => tab,
		restore: (value) => (tab = value)
	});

	/**
	 * The contents link to series anchors on the Decks tab; from the Teams tab
	 * the anchor only exists after switching back.
	 */
	async function jumpToSeries(event: MouseEvent, slug: string) {
		if (tab === 0) return;
		event.preventDefault();
		tab = 0;
		await tick();
		document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

<OpenGraph
	description={data.author.profile ??
		m.starter_decks_author_description({ author: data.author.name })}
	image="image/resource/starter.webp"
	{title}
	url={starterAuthorHref(data.author)}
	canonical
	author={data.author.name}
	jsonLd={starterAuthorJsonLd(data.author)}
/>

<PageLead {title} />

<MarginText>
	{#if data.author.avatarCard}
		<div class="mb-3 flex justify-center">
			<CardCircle card={data.author.avatarCard} size="xl" />
		</div>
	{/if}
	{#if data.author.profile}
		<TextParagraph>
			{#each data.author.profile.split(profileUrl) as part, i (i)}
				{#if i % 2 === 1}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={part} rel="noopener noreferrer" target="_blank">{part}</a>
				{:else}
					{part}
				{/if}
			{/each}
		</TextParagraph>
	{/if}
	<div class="mb-4 flex flex-wrap justify-center gap-2">
		{#if data.author.arkhamdbUrl}
			<Button
				icon={FaIconType.ExternalLink}
				label={m.starter_decks_author_profile()}
				onClick={data.author.arkhamdbUrl}
			/>
		{/if}
	</div>
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
						<span class="text-primary-900 dark:text-primary-100 font-semibold">{series.name}</span>
						<span class="text-primary-700 dark:text-primary-300 text-xs">
							{m.starter_decks_deck_count({ count: series.entries.length })}
						</span>
					</span>
				</a>
			</li>
		{/each}
	</ul>

	<div class="mt-4">
		<Foldout title={m.starter_decks_filter()} keepMounted>
			<div class="p-3">
				<HelpParagraph>{m.starter_decks_filter_help()}</HelpParagraph>
				<StarterFilter initiallyAll onChange={(f) => (filter = f)} />
			</div>
		</Foldout>
	</div>
</MarginText>
<MarginFull>
	<div class="mt-4">
		<Tabs
			direction="horizontal"
			activeTabIndex={tab}
			onTabChange={(index) => (tab = index)}
			tabs={[
				{ label: m.starter_decks_tab_decks({ count: deckCount }) },
				{ label: m.starter_decks_tab_teams({ count: visibleTeams.length }) }
			]}
		/>
	</div>
	{#if tab === 0}
		<div class="mt-4">
			{#each data.series as series (series.slug)}
				<div class="mb-8">
					<StarterSeriesSection {series} {filter} />
				</div>
			{/each}
		</div>
	{:else}
		<div class="mt-4">
			<PrebuiltTeamList entries={visibleTeams} />
		</div>
	{/if}
</MarginFull>
