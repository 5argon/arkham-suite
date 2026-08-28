<!--
@component
One pre-built team in the listing: its banner (name, author, description,
pool usage, members) linking to the team page.
-->
<script lang="ts">
	import { resolve } from '$app/paths';

	import TeamBanner from '$lib/design/components/team/TeamBanner.svelte';
	import { type PrebuiltTeam, prebuiltTeamHref } from '$lib/starter-content';
	import type { EvergreenState } from '$lib/tool/evergreen-team/types';

	interface Prop {
		team: PrebuiltTeam;
		builderState: EvergreenState;
	}
	const { team, builderState }: Prop = $props();
</script>

<a
	class="block rounded-lg transition-shadow hover:shadow-lg"
	href={resolve(prebuiltTeamHref(team) as '/team/[slug]', {})}
>
	<TeamBanner
		info={{ name: team.name, author: team.author, description: team.description }}
		team={builderState}
		exclusive={team.exclusive}
	/>
</a>
