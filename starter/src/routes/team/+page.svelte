<script lang="ts">
	import { snapshot } from '$app/navigation';
	import {
		Button,
		FaIconType,
		MarginFull,
		MarginText,
		PageLead,
		Tabs,
		TextParagraph
	} from '@5argon/arkham-life-ui';

	import { getAllCards } from '$lib/card-data';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import StarterFilter from '$lib/design/pages/starter/StarterFilter.svelte';
	import PrebuiltTeamCard from '$lib/design/pages/team/PrebuiltTeamCard.svelte';
	import PrebuiltTeamList from '$lib/design/pages/team/PrebuiltTeamList.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { allPrebuiltTeams } from '$lib/starter-content';
	import {
		decodeTeams,
		pickRandom,
		type PrebuiltTeamEntry,
		type StarterFilterValue,
		TEAM_SIZES,
		teamMatches,
		teamMatchesProducts,
		teamSize
	} from '$lib/tool/starter/filter';

	const teams = decodeTeams(allPrebuiltTeams(), getAllCards());
	const teamsOfSize = (size: number) => teams.filter((entry) => teamSize(entry) === size).length;
	let filter = $state<StarterFilterValue>({
		products: new Set(),
		investigators: new Set(),
		mustIncludeAll: false
	});
	const visible = $derived(teams.filter((entry) => teamMatches(entry, filter)));
	// Shared by the random picks and the list, so the player count chosen
	// before picking anyone carries over.
	let sizeIndex = $state(1);
	// Nobody picked yet: the page asks the reader to choose, or offers a
	// random team of the chosen player count they can build with what they
	// own. Each player count keeps its own pick.
	const nonePicked = $derived(filter.investigators.size === 0);
	const poolBySize = $derived(
		TEAM_SIZES.map((size) =>
			teams.filter((entry) => teamSize(entry) === size && teamMatchesProducts(entry, filter))
		)
	);
	const randomSlugs = $state<(string | null)[]>(TEAM_SIZES.map(() => null));
	const randomTeam = $derived<PrebuiltTeamEntry | null>(
		teams.find((entry) => entry.team.slug === randomSlugs[sizeIndex]) ?? null
	);
	function randomize() {
		randomSlugs[sizeIndex] = pickRandom(poolBySize[sizeIndex], randomTeam)?.team.slug ?? null;
	}
	snapshot({
		id: 'team-random',
		capture: () => ({ sizeIndex, randomSlugs: [...randomSlugs] }),
		restore: (value) => {
			sizeIndex = value.sizeIndex;
			value.randomSlugs.forEach((slug, i) => (randomSlugs[i] = slug));
		}
	});
</script>

<OpenGraph
	description={m.team_intro()}
	image="image/resource/team.webp"
	title={m.team_title()}
	url="/team"
/>

<svelte:head>
	<title>{m.team_page_title()}</title>
</svelte:head>

<PageLead title={m.team_title()} />

<MarginText>
	<TextParagraph>{m.team_intro()}</TextParagraph>
	<StarterFilter showMustIncludeAll onChange={(f) => (filter = f)} />
	{#if nonePicked}
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
		{#if !nonePicked}
			<PrebuiltTeamList entries={visible} bind:sizeIndex />
		{:else}
			<Tabs
				direction="horizontal"
				activeTabIndex={sizeIndex}
				onTabChange={(index) => (sizeIndex = index)}
				tabs={TEAM_SIZES.map((size, i) => ({
					label: m.team_players_tab({ count: size, teams: poolBySize[i].length })
				}))}
			/>
			<div class="mt-4 flex flex-col gap-4">
				{#if poolBySize[sizeIndex].length === 0}
					<p class="text-primary-700 dark:text-primary-300 text-center">{m.team_none_match()}</p>
				{:else}
					<div class="flex justify-center">
						<Button
							highlighted
							icon={FaIconType.Randomize}
							label={randomTeam === null
								? m.team_randomize({ count: TEAM_SIZES[sizeIndex] })
								: m.team_randomize_again({ count: TEAM_SIZES[sizeIndex] })}
							onClick={randomize}
						/>
					</div>
					{#if randomTeam !== null}
						<!-- TeamBanner builds its pool once, so each pick mounts a fresh card. -->
						{#key randomTeam.team.slug}
							<PrebuiltTeamCard team={randomTeam.team} builderState={randomTeam.builderState} />
						{/key}
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</MarginFull>
