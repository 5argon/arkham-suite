<script lang="ts">
	import { snapshot } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		MarginFull,
		MarginText,
		PageLead,
		TextParagraph
	} from '@5argon/arkham-life-ui';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import StarterFilter from '$lib/design/pages/starter/StarterFilter.svelte';
	import PrebuiltTeamList from '$lib/design/pages/team/PrebuiltTeamList.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import {
		pickedNothing,
		type StarterFilterValue,
		TEAM_SIZES,
		teamMatches,
		teamMatchesProducts,
		teamSize
	} from '$lib/tool/starter/filter';

	const { data } = $props();
	const teams = $derived(data.teams);
	const teamsOfSize = (size: number) => teams.filter((entry) => teamSize(entry) === size).length;
	let activeTags = $state<string[]>([]);
	let filter = $state<StarterFilterValue>({
		products: new Set(),
		investigators: new Set(),
		mustIncludeAll: false
	});
	const nothingPicked = $derived(pickedNothing(filter));
	// Nothing picked yet: the page asks the reader to choose, or offers a random
	// team of the chosen player count they can build with what they own.
	const listed = $derived(
		teams.filter((team) =>
			nothingPicked ? teamMatchesProducts(team, filter) : teamMatches(team, filter)
		)
	);
	// Shared by the random picks and the list, so the player count chosen
	// before picking anyone carries over.
	let sizeIndex = $state(1);
	const noRandomPicks = () => TEAM_SIZES.map(() => null);
	let randomSlugs = $state<(string | null)[]>(noRandomPicks());

	function changeFilter(next: StarterFilterValue) {
		// Going back to nothing picked starts over, and tags are not on offer there.
		if (pickedNothing(next) && !pickedNothing(filter)) {
			randomSlugs = noRandomPicks();
			activeTags = [];
		}
		filter = next;
	}
	snapshot({
		id: 'team-random',
		capture: () => ({ sizeIndex, randomSlugs: [...randomSlugs], activeTags: [...activeTags] }),
		restore: (value) => {
			sizeIndex = value.sizeIndex;
			randomSlugs = value.randomSlugs;
			activeTags = value.activeTags ?? [];
		}
	});
</script>

<OpenGraph
	description={m.team_intro()}
	image="image/resource/team.webp"
	title={m.team_title()}
	url="/team"
	canonical
/>

<svelte:head>
	<title>{m.team_page_title()}</title>
</svelte:head>

<PageLead title={m.team_title()} />

<MarginText>
	<TextParagraph>{m.team_intro()}</TextParagraph>
	<TextParagraph>
		{m.team_starter_note_before()}
		<a href={resolve('/starter')}>{m.team_starter_note_link()}</a>
		{m.team_starter_note_after()}
	</TextParagraph>
	<StarterFilter showMustIncludeAll onChange={changeFilter} />
	{#if nothingPicked}
		<div class="mt-3 mb-4 flex flex-col items-center gap-2">
			<p class="text-primary-700 dark:text-primary-300 text-center text-sm">
				{m.team_total({
					total: teams.length,
					two: teamsOfSize(2),
					three: teamsOfSize(3),
					four: teamsOfSize(4)
				})}
				{m.team_pick_prompt()}
			</p>
		</div>
	{/if}
</MarginText>

<MarginFull>
	<div class="mt-4">
		<PrebuiltTeamList
			entries={listed}
			{filter}
			{nothingPicked}
			bind:activeTags
			bind:randomSlugs
			bind:sizeIndex
		/>
	</div>
</MarginFull>
