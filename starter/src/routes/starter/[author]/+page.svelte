<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		Button,
		FaIconType,
		MarginFull,
		MarginText,
		PageLead,
		Tabs
	} from '@5argon/arkham-life-ui';

	import { getAllCards } from '$lib/card-data';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import StarterFilter from '$lib/design/pages/starter/StarterFilter.svelte';
	import StarterSeriesSection from '$lib/design/pages/starter/StarterSeriesSection.svelte';
	import PrebuiltTeamList from '$lib/design/pages/team/PrebuiltTeamList.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { prebuiltTeamsOf } from '$lib/starter-content';
	import {
		deckMatches,
		decodeTeams,
		type StarterFilterValue,
		teamMatches
	} from '$lib/tool/starter/filter';

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
</script>

<OpenGraph
	description={m.starter_decks_all_series({ author: data.author.name })}
	image="image/resource/starter.webp"
	title={data.author.name}
	url={resolve(`/starter/${data.author.slug}`, {})}
/>

<svelte:head>
	<title>{m.starter_decks_page_title()} | {data.author.name}</title>
</svelte:head>

<PageLead {title} />

<MarginText>
	<div class="mb-4 flex flex-wrap justify-center gap-2">
		<Button icon={FaIconType.Back} label={m.starter_decks_back()} onClick="/starter" />
		{#if data.author.arkhamdbUrl}
			<Button
				icon={FaIconType.ExternalLink}
				label={m.starter_decks_author_profile()}
				onClick={data.author.arkhamdbUrl}
			/>
		{/if}
	</div>
	<StarterFilter onChange={(f) => (filter = f)} />
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
