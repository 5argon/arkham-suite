<!--
@component
One pre-built team in the listing: its banner (name, author, description,
pool usage, members) linking to the team page.
-->
<script lang="ts">
	import { resolve } from '$app/paths';

	import TeamBanner from '$lib/design/components/team/TeamBanner.svelte';
	import { contributor, type PrebuiltTeamSummary } from '$lib/starter-content';

	interface Prop {
		team: PrebuiltTeamSummary;
	}
	const { team }: Prop = $props();
</script>

<a
	class="block rounded-lg transition-shadow hover:shadow-lg"
	href={resolve('/team/[slug]', { slug: team.slug })}
>
	<TeamBanner
		info={{ name: team.name, author: team.author, description: team.description }}
		display={team.display}
		tags={team.tags}
		exclusive={team.exclusive}
		authorAvatar={contributor(team.authorSlug)?.avatarCard}
	/>
</a>
