<!--
@component
Compact banner for a team: name, author, description, and the team-wide card
pool summary. Shared by the team builder's view mode and the pre-built team
listing.
-->
<script lang="ts">
	import { BorderedContainer } from '@5argon/arkham-life-ui';

	import { createCardResolver, getAllCards } from '$lib/card-data';
	import * as m from '$lib/paraglide/messages.js';
	import type { PrebuiltTeamSource } from '$lib/starter-content';
	import { notableDeckCards } from '$lib/tool/evergreen-team/notable-cards';
	import { buildPool } from '$lib/tool/evergreen-team/pool';
	import type { EvergreenState, TeamInfo } from '$lib/tool/evergreen-team/types';

	import MemberHeader from './MemberHeader.svelte';
	import PoolSummary from './PoolSummary.svelte';
	import StarterDeckSourceBanner from './StarterDeckSourceBanner.svelte';

	interface Prop {
		info: TeamInfo;
		team: EvergreenState;
		/** Hosted starter sources parallel to team.decks. Omit to keep the banner compact. */
		sources?: (PrebuiltTeamSource | undefined)[];
		exclusive?: boolean;
	}
	const { info, team, sources, exclusive = false }: Prop = $props();

	const getFrozenSetup = () => team.setup;
	const pool = buildPool(getFrozenSetup(), getAllCards());
	const resolver = createCardResolver();
</script>

<div class="relative">
	{#if exclusive}
		<span
			class="bg-secondary-700 dark:bg-secondary-300 absolute top-2 right-2 z-10 rounded-full px-2 py-0.5 text-xs font-bold text-white dark:text-black lg:top-4 lg:right-4"
		>
			{m.team_exclusive()}
		</span>
	{/if}
	<BorderedContainer>
		<div class="flex flex-col items-center gap-1 text-center">
			<span class="team-name text-primary-900 dark:text-primary-100 text-xl" class:px-16={exclusive}
				>{info.name}</span
			>
			{#if info.author.length > 0}
				<span class="text-primary-700 dark:text-primary-300 text-sm">
					{m.tool_evergreen_team_by_author({ author: info.author })}
				</span>
			{/if}
			{#if info.description.length > 0}
				<p class="text-primary-800 dark:text-primary-200 max-w-2xl text-sm break-words">
					{info.description}
				</p>
			{/if}
			<div class="mt-1">
				<PoolSummary {team} {pool} />
			</div>
			<div class="mt-2 grid w-full grid-cols-1 gap-2 md:grid-cols-2">
				{#each team.decks as deck, deckIndex (deck.investigator)}
					{@const source = sources?.[deckIndex]}
					<div
						class="border-primary-300 dark:border-primary-700 rounded-lg border bg-white/50 dark:bg-black/30"
					>
						<MemberHeader
							{team}
							{deckIndex}
							{pool}
							{resolver}
							notableCards={notableDeckCards(deck, pool)}
						/>
						{#if source}
							<StarterDeckSourceBanner {source} />
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</BorderedContainer>
</div>

<style>
	.team-name {
		font-family: 'Heading';
	}
</style>
