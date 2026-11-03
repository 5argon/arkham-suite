<!--
@component
One pre-built team in the listing: its banner (name, author, description,
pool usage, members) linking to the team page.
-->
<script lang="ts">
	import { resolve } from '$app/paths';

	import TeamBanner from '$lib/design/components/team/TeamBanner.svelte';
	import { createCardResolver } from '$lib/card-data';
	import { contributor, type PrebuiltTeamSummary } from '$lib/starter-content';
	import { type StarterFilterValue, teamCardMatches } from '$lib/tool/starter/filter';

	import { cardMatchNotes } from '../starter/card-match-notes';

	interface Prop {
		team: PrebuiltTeamSummary;
		/**
		 * When looking for cards, shows how each member plays them.
		 */
		filter?: StarterFilterValue;
	}
	const { team, filter }: Prop = $props();

	const resolver = createCardResolver();
	const memberNotes = $derived(
		filter === undefined
			? undefined
			: teamCardMatches(team, filter).map((matches) => cardMatchNotes(matches, resolver))
	);
</script>

<a
	class="block rounded-lg transition-shadow hover:shadow-lg"
	href={resolve('/team/[slug]', { slug: team.slug })}
>
	<TeamBanner
		info={{ name: team.name, author: team.author, description: team.description }}
		display={team.display}
		{memberNotes}
		tags={team.tags}
		exclusive={team.exclusive}
		authorAvatar={contributor(team.authorSlug)?.avatarCard}
	/>
</a>
