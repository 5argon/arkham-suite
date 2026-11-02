<script lang="ts">
	import { snapshot } from '$app/navigation';
	import {
		Button,
		FaIconType,
		MarginFull,
		MarginText,
		PageLead,
		Tabs,
		TagFilter,
		TextParagraph
	} from '@5argon/arkham-life-ui';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import StarterFilter from '$lib/design/pages/starter/StarterFilter.svelte';
	import PrebuiltTeamCard from '$lib/design/pages/team/PrebuiltTeamCard.svelte';
	import PrebuiltTeamList from '$lib/design/pages/team/PrebuiltTeamList.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { PrebuiltTeamSummary } from '$lib/starter-content';
	import {
		pickRandom,
		type StarterFilterValue,
		tagChoices,
		TEAM_SIZES,
		teamHasTags,
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
	const visible = $derived(teams.filter((entry) => teamMatches(entry, filter)));
	// Shared by the random picks and the list, so the player count chosen
	// before picking anyone carries over.
	let sizeIndex = $state(1);
	// Nobody picked yet: the page asks the reader to choose, or offers a
	// random team of the chosen player count they can build with what they
	// own. Each player count keeps its own pick.
	const nonePicked = $derived(filter.investigators.size === 0);
	const anyTagPoolBySize = $derived(
		TEAM_SIZES.map((size) =>
			teams.filter((entry) => teamSize(entry) === size && teamMatchesProducts(entry, filter))
		)
	);
	const poolBySize = $derived(
		anyTagPoolBySize.map((pool) => pool.filter((entry) => teamHasTags(entry, activeTags)))
	);
	const randomSlugs = $state<(string | null)[]>(TEAM_SIZES.map(() => null));
	const randomTeam = $derived<PrebuiltTeamSummary | null>(
		poolBySize[sizeIndex].find((team) => team.slug === randomSlugs[sizeIndex]) ?? null
	);
	function randomize() {
		randomSlugs[sizeIndex] = pickRandom(poolBySize[sizeIndex], randomTeam)?.slug ?? null;
	}
	snapshot({
		id: 'team-random',
		capture: () => ({ sizeIndex, randomSlugs: [...randomSlugs], activeTags: [...activeTags] }),
		restore: (value) => {
			sizeIndex = value.sizeIndex;
			value.randomSlugs.forEach((slug, i) => (randomSlugs[i] = slug));
			activeTags = value.activeTags ?? [];
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
			<PrebuiltTeamList entries={visible} bind:activeTags bind:sizeIndex />
		{:else}
			<Tabs
				direction="horizontal"
				activeTabIndex={sizeIndex}
				onTabChange={(index) => (sizeIndex = index)}
				tabs={TEAM_SIZES.map((size, i) => ({
					label: m.team_players_tab({ count: size, teams: poolBySize[i].length })
				}))}
			/>
			<div class="mt-3">
				<TagFilter
					tags={tagChoices(anyTagPoolBySize[sizeIndex], activeTags)}
					active={activeTags}
					onAdd={(tag) => (activeTags = [...activeTags, tag])}
					onRemove={(tag) => (activeTags = activeTags.filter((t) => t !== tag))}
				/>
			</div>
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
						{#key randomTeam.slug}
							<PrebuiltTeamCard team={randomTeam} />
						{/key}
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</MarginFull>
