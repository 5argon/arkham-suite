<!--
@component
Pre-built teams browsed by player count: 2 / 3 / 4 Players tabs (with the
count of matching teams), a tag filter, paginated team cards. Bind `sizeIndex`
and `activeTags` to share them with the rest of the page. With `randomSlugs`
bound it also offers picking one team at random from those matching, which
replaces the list until the reader exits. `nothingPicked` means the reader has
not narrowed anything yet, so only the random pick is on offer.
-->
<script lang="ts">
	import { snapshot } from '$app/navigation';
	import { Button, FaIconType, Pagination, Tabs, TagFilter } from '@5argon/arkham-life-ui';

	import * as m from '$lib/paraglide/messages.js';
	import type { PrebuiltTeamSummary } from '$lib/starter-content';
	import {
		pickRandom,
		tagChoices,
		TEAM_SIZES,
		teamHasTags,
		teamSize
	} from '$lib/tool/starter/filter';

	import PrebuiltTeamCard from './PrebuiltTeamCard.svelte';

	interface Prop {
		/**
		 * Filtered by everything but tags; this component handles those and splits
		 * by player count.
		 */
		entries: PrebuiltTeamSummary[];
		activeTags?: string[];
		nothingPicked?: boolean;
		/**
		 * The random pick of each player count, by slug. Leave out to not offer it.
		 */
		randomSlugs?: (string | null)[];
		/**
		 * Index into the player counts; 3 players by default.
		 */
		sizeIndex?: number;
	}
	let {
		entries,
		activeTags = $bindable([]),
		sizeIndex = $bindable(1),
		nothingPicked = false,
		randomSlugs = $bindable()
	}: Prop = $props();

	const anyTagBySize = $derived(
		TEAM_SIZES.map((size) => entries.filter((team) => teamSize(team) === size))
	);
	const bySize = $derived(
		anyTagBySize.map((teams) => teams.filter((x) => teamHasTags(x, activeTags)))
	);
	const PAGE_SIZE = 20;
	let page = $state(1);
	let tabsEl = $state<HTMLElement | null>(null);
	const current = $derived(bySize[sizeIndex]);
	// A pick the filters no longer allow simply ends random mode.
	const randomTeam = $derived(
		randomSlugs === undefined
			? undefined
			: current.find((team) => team.slug === randomSlugs?.[sizeIndex])
	);
	// Repeating a random pick keeps at least the height it had, so a shorter team
	// can't shrink the page and pull the reader away from the button.
	let resultsEl = $state<HTMLElement | null>(null);
	let randomHeight = $state<number | null>(null);
	function setRandom(slug: string | null) {
		if (randomSlugs === undefined) return;
		randomHeight = randomTeam === undefined ? null : (resultsEl?.offsetHeight ?? null);
		randomSlugs = randomSlugs.map((previous, i) => (i === sizeIndex ? slug : previous));
	}
	const pageCount = $derived(Math.max(1, Math.ceil(current.length / PAGE_SIZE)));
	const paged = $derived(
		current.slice(
			(Math.min(page, pageCount) - 1) * PAGE_SIZE,
			Math.min(page, pageCount) * PAGE_SIZE
		)
	);
	snapshot({
		id: 'prebuilt-team-list',
		capture: () => ({ sizeIndex, page }),
		restore: (value) => {
			sizeIndex = value.sizeIndex;
			page = value.page;
		}
	});
	function changePage(next: number) {
		page = next;
		tabsEl?.scrollIntoView({ block: 'start', behavior: 'smooth' });
	}
	function changeTags(next: string[]) {
		activeTags = next;
		page = 1;
	}
</script>

<div bind:this={tabsEl} class="scroll-mt-2"></div>
<Tabs
	direction="horizontal"
	activeTabIndex={sizeIndex}
	onTabChange={(index) => {
		sizeIndex = index;
		page = 1;
	}}
	tabs={TEAM_SIZES.map((size, i) => ({
		label: nothingPicked
			? m.team_players_tab_plain({ count: size })
			: m.team_players_tab({ count: size, teams: bySize[i].length })
	}))}
/>
{#if !nothingPicked}
	<div class="mt-3">
		<TagFilter
			tags={tagChoices(anyTagBySize[sizeIndex], activeTags)}
			active={activeTags}
			onAdd={(tag) => changeTags([...activeTags, tag])}
			onRemove={(tag) => changeTags(activeTags.filter((t) => t !== tag))}
		/>
	</div>
{/if}
<div
	bind:this={resultsEl}
	class="mt-4 flex flex-col gap-4"
	style:min-height={randomTeam !== undefined && randomHeight !== null
		? `${randomHeight}px`
		: undefined}
>
	{#if current.length === 0}
		<p class="text-primary-700 dark:text-primary-300 text-center">{m.team_none_match()}</p>
	{:else}
		{#if randomSlugs !== undefined}
			<div class="flex flex-wrap justify-center gap-2">
				<Button
					highlighted
					icon={FaIconType.Randomize}
					label={nothingPicked
						? m.team_randomize({ count: TEAM_SIZES[sizeIndex] })
						: m.team_randomize_filtered({ count: TEAM_SIZES[sizeIndex] })}
					onClick={() => setRandom(pickRandom(current, randomTeam ?? null)?.slug ?? null)}
				/>
				{#if randomTeam !== undefined}
					<Button
						icon={FaIconType.Collapse}
						label={m.team_randomize_exit()}
						onClick={() => setRandom(null)}
					/>
				{/if}
			</div>
		{/if}
		{#if randomTeam !== undefined}
			<PrebuiltTeamCard team={randomTeam} />
		{:else if !nothingPicked}
			<div class="flex justify-center">
				<Pagination page={Math.min(page, pageCount)} {pageCount} onChange={changePage} />
			</div>
			{#each paged as team (team.slug)}
				<PrebuiltTeamCard {team} />
			{/each}
			<div class="flex justify-center">
				<Pagination page={Math.min(page, pageCount)} {pageCount} onChange={changePage} />
			</div>
		{/if}
	{/if}
</div>
