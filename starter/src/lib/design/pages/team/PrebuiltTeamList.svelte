<!--
@component
Pre-built teams browsed by player count: 2 / 3 / 4 Players tabs (with the
count of matching teams), paginated team cards.
-->
<script lang="ts">
	import { Pagination, Tabs } from '@5argon/arkham-life-ui';

	import * as m from '$lib/paraglide/messages.js';
	import type { PrebuiltTeam } from '$lib/starter-content';
	import type { EvergreenState } from '$lib/tool/evergreen-team/types';

	import PrebuiltTeamCard from './PrebuiltTeamCard.svelte';

	export interface PrebuiltTeamEntry {
		team: PrebuiltTeam;
		builderState: EvergreenState;
	}

	interface Prop {
		/**
		 * Already filtered; this component only splits by player count.
		 */
		entries: PrebuiltTeamEntry[];
	}
	const { entries }: Prop = $props();

	const SIZES = [2, 3, 4] as const;
	const bySize = $derived(
		SIZES.map((size) => entries.filter((x) => x.builderState.decks.length === size))
	);
	let sizeIndex = $state(1);
	const PAGE_SIZE = 20;
	let page = $state(1);
	let tabsEl = $state<HTMLElement | null>(null);
	const current = $derived(bySize[sizeIndex]);
	const pageCount = $derived(Math.max(1, Math.ceil(current.length / PAGE_SIZE)));
	const paged = $derived(
		current.slice(
			(Math.min(page, pageCount) - 1) * PAGE_SIZE,
			Math.min(page, pageCount) * PAGE_SIZE
		)
	);
	function changePage(next: number) {
		page = next;
		tabsEl?.scrollIntoView({ block: 'start', behavior: 'smooth' });
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
	tabs={SIZES.map((size, i) => ({
		label: m.team_players_tab({ count: size, teams: bySize[i].length })
	}))}
/>
<div class="mt-4 flex flex-col gap-4">
	{#if current.length === 0}
		<p class="text-primary-700 dark:text-primary-300 text-center">{m.team_none_match()}</p>
	{:else}
		<div class="flex justify-center">
			<Pagination page={Math.min(page, pageCount)} {pageCount} onChange={changePage} />
		</div>
		{#each paged as { team, builderState } (team.slug)}
			<PrebuiltTeamCard {team} {builderState} />
		{/each}
		<div class="flex justify-center">
			<Pagination page={Math.min(page, pageCount)} {pageCount} onChange={changePage} />
		</div>
	{/if}
</div>
